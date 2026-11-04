import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs';
import { Pool, PoolClient } from 'pg';
import * as ExcelJS from 'exceljs';
import {
  BulkUpdateReport,
  BulkUpdateOptions,
  ParcelMappingRow,
} from './parcels.types';

@Injectable()
export class ParcelsService {
  private readonly logger = new Logger(ParcelsService.name);
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30000,
    });
  }

  /**
   * Main bulk update handler for Excel files containing old -> new parcel numbers.
   * Efficiently handles 100,000+ rows using PostgreSQL TEMP TABLE and UNNEST batch inserts.
   */
  async processBulkUpdate(
    filePathOrBuffer: string | Buffer,
    originalName: string,
    options: BulkUpdateOptions = {},
  ): Promise<BulkUpdateReport> {
    const startTime = Date.now();
    const dryRun = Boolean(options.dryRun);
    const tableName = this.sanitizeIdentifier(options.tableName || 'parcels');
    const columnName = this.sanitizeIdentifier(
      options.columnName || 'parcel_number',
    );
    const batchSize = Math.max(500, Math.min(options.batchSize || 5000, 10000));

    this.logger.log(
      `Starting bulk parcel update (dryRun=${dryRun}, table=${tableName}, column=${columnName}, file=${originalName})`,
    );

    // 1. Parse Excel / CSV into memory mapping with deduplication
    const {
      validRows,
      totalRows,
      duplicateOldList,
      duplicateNewList,
    } = await this.parseSpreadsheet(filePathOrBuffer, originalName);

    if (validRows.length === 0) {
      throw new BadRequestException(
        'The uploaded file contains no valid parcel mapping rows. Please check file structure.',
      );
    }

    this.logger.log(
      `Parsed ${totalRows} spreadsheet rows: ${validRows.length} valid mappings, ` +
        `${duplicateOldList.length} duplicate old numbers, ${duplicateNewList.length} duplicate new numbers.`,
    );

    // 2. Connect to PostgreSQL and execute within a single dedicated connection
    let client: PoolClient | null = null;
    try {
      client = await this.pool.connect();
      await client.query('BEGIN');

      // Verify table and column exist
      await this.verifyTableAndColumn(client, tableName, columnName);

      // Create TEMP TABLE (scoped only to this session)
      await client.query(`
        CREATE TEMP TABLE parcel_mapping (
          old_parcel_number VARCHAR(120) NOT NULL,
          new_parcel_number VARCHAR(120) NOT NULL,
          PRIMARY KEY (old_parcel_number)
        ) ON COMMIT DROP;
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_temp_parcel_mapping_new 
        ON parcel_mapping(new_parcel_number);
      `);

      // 3. Batch insert using UNNEST for ultra-high speed (5,000 rows per query)
      for (let i = 0; i < validRows.length; i += batchSize) {
        const batch = validRows.slice(i, i + batchSize);
        const oldNumbers = batch.map((r) => r.oldParcelNumber);
        const newNumbers = batch.map((r) => r.newParcelNumber);

        await client.query(
          `
          INSERT INTO parcel_mapping (old_parcel_number, new_parcel_number)
          SELECT * FROM UNNEST($1::varchar[], $2::varchar[])
          ON CONFLICT (old_parcel_number) DO NOTHING;
          `,
          [oldNumbers, newNumbers],
        );
      }

      // 4. Run safety analysis queries
      // A. Existing matches in database
      const matchRes = await client.query(
        `
        SELECT COUNT(*)::int AS count
        FROM "${tableName}" p
        INNER JOIN parcel_mapping m ON p."${columnName}" = m.old_parcel_number;
        `,
      );
      const existingMatches = matchRes.rows[0]?.count || 0;

      // B. Missing old parcel numbers (in Excel but missing from DB)
      const missingCountRes = await client.query(
        `
        SELECT COUNT(*)::int AS count
        FROM parcel_mapping m
        LEFT JOIN "${tableName}" p ON p."${columnName}" = m.old_parcel_number
        WHERE p."${columnName}" IS NULL;
        `,
      );
      const missingCount = missingCountRes.rows[0]?.count || 0;

      const missingSampleRes = await client.query(
        `
        SELECT m.old_parcel_number
        FROM parcel_mapping m
        LEFT JOIN "${tableName}" p ON p."${columnName}" = m.old_parcel_number
        WHERE p."${columnName}" IS NULL
        LIMIT 20;
        `,
      );
      const sampleMissing = missingSampleRes.rows.map(
        (r) => r.old_parcel_number,
      );

      // C. Conflicting new parcel numbers (already present in database)
      const conflictCountRes = await client.query(
        `
        SELECT COUNT(*)::int AS count
        FROM "${tableName}" p
        INNER JOIN parcel_mapping m ON p."${columnName}" = m.new_parcel_number;
        `,
      );
      const conflictCount = conflictCountRes.rows[0]?.count || 0;

      const conflictSampleRes = await client.query(
        `
        SELECT DISTINCT m.new_parcel_number
        FROM "${tableName}" p
        INNER JOIN parcel_mapping m ON p."${columnName}" = m.new_parcel_number
        LIMIT 20;
        `,
      );
      const sampleConflicts = conflictSampleRes.rows.map(
        (r) => r.new_parcel_number,
      );

      // 5. Execute UPDATE or ROLLBACK (if dryRun)
      let updatedCount = 0;
      if (dryRun) {
        await client.query('ROLLBACK');
        this.logger.log(
          `[DRY RUN] Rolled back transaction. Would update: ${existingMatches} rows.`,
        );
      } else {
        const updateRes = await client.query(
          `
          UPDATE "${tableName}" AS p
          SET "${columnName}" = m.new_parcel_number
          FROM parcel_mapping AS m
          WHERE p."${columnName}" = m.old_parcel_number;
          `,
        );
        updatedCount = updateRes.rowCount || 0;
        await client.query('COMMIT');
        this.logger.log(
          `[LIVE UPDATE] Successfully updated ${updatedCount} records in ${tableName}.${columnName}.`,
        );
      }

      const executionTimeMs = Date.now() - startTime;

      return {
        success: true,
        dryRun,
        targetTable: tableName,
        targetColumn: columnName,
        totalRowsInExcel: totalRows,
        validMappingRows: validRows.length,
        duplicateOldNumbersInExcel: duplicateOldList.length,
        duplicateNewNumbersInExcel: duplicateNewList.length,
        existingMatchesInDb: existingMatches,
        missingOldNumbersInDb: missingCount,
        conflictingNewNumbersInDb: conflictCount,
        updatedCount,
        executionTimeMs,
        sampleMissingOldNumbers: sampleMissing,
        sampleConflictingNewNumbers: sampleConflicts,
        sampleDuplicateOldNumbers: duplicateOldList.slice(0, 20),
        sampleDuplicateNewNumbers: duplicateNewList.slice(0, 20),
        message: dryRun
          ? `Dry run complete in ${executionTimeMs}ms. ${existingMatches} matching records ready to update.`
          : `Bulk update complete in ${executionTimeMs}ms. ${updatedCount} records successfully updated.`,
      };
    } catch (error) {
      if (client) {
        try {
          await client.query('ROLLBACK');
        } catch {
          // Ignore rollback errors
        }
      }
      const errMessage = error instanceof Error ? error.message : String(error);
      const errStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error during bulk update: ${errMessage}`, errStack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to complete bulk update: ${errMessage}`,
      );
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  /**
   * Parse spreadsheet buffer or file using ExcelJS streaming or workbook loader.
   */
  private async parseSpreadsheet(
    filePathOrBuffer: string | Buffer,
    originalName: string,
  ): Promise<{
    validRows: ParcelMappingRow[];
    totalRows: number;
    duplicateOldList: string[];
    duplicateNewList: string[];
  }> {
    const workbook = new ExcelJS.Workbook();

    if (typeof filePathOrBuffer === 'string') {
      if (originalName.endsWith('.csv')) {
        await workbook.csv.readFile(filePathOrBuffer);
      } else {
        await workbook.xlsx.readFile(filePathOrBuffer);
      }
    } else {
      if (originalName.endsWith('.csv')) {
        await workbook.csv.read(fs.createReadStream(filePathOrBuffer as any));
      } else {
        await workbook.xlsx.load(filePathOrBuffer as any);
      }
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestException('No worksheets found in the uploaded file.');
    }

    let oldColIdx = 1;
    let newColIdx = 2;
    let startRow = 1;

    // Detect headers on row 1
    const row1 = worksheet.getRow(1);
    if (row1 && row1.cellCount > 0) {
      let foundHeader = false;
      row1.eachCell((cell, colNumber) => {
        const text = this.cellToString(cell.value).toLowerCase().trim();
        if (
          text.includes('old') ||
          text.includes('ចាស់') ||
          text.includes('previous')
        ) {
          oldColIdx = colNumber;
          foundHeader = true;
        } else if (
          text.includes('new') ||
          text.includes('ថ្មី') ||
          text.includes('next')
        ) {
          newColIdx = colNumber;
          foundHeader = true;
        }
      });
      if (foundHeader) {
        startRow = 2;
      }
    }

    const validRows: ParcelMappingRow[] = [];
    const seenOld = new Set<string>();
    const seenNew = new Set<string>();
    const duplicateOldList: string[] = [];
    const duplicateNewList: string[] = [];
    let totalRows = 0;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber < startRow) return;

      const oldVal = this.cellToString(row.getCell(oldColIdx).value).trim();
      const newVal = this.cellToString(row.getCell(newColIdx).value).trim();

      if (!oldVal && !newVal) return; // skip completely empty rows

      totalRows++;

      if (!oldVal || !newVal) {
        return; // incomplete row
      }

      if (seenOld.has(oldVal)) {
        duplicateOldList.push(oldVal);
        return; // keep first occurrence only
      }
      seenOld.add(oldVal);

      if (seenNew.has(newVal)) {
        duplicateNewList.push(newVal);
      } else {
        seenNew.add(newVal);
      }

      validRows.push({
        oldParcelNumber: oldVal,
        newParcelNumber: newVal,
        rowNumber,
      });
    });

    return {
      validRows,
      totalRows,
      duplicateOldList,
      duplicateNewList,
    };
  }

  /**
   * Helper to normalize any Excel cell value into a clean string.
   */
  private cellToString(val: ExcelJS.CellValue): string {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'object') {
      if ('text' in val && typeof (val as any).text === 'string') {
        return (val as any).text;
      }
      if ('result' in val && (val as any).result !== undefined) {
        return String((val as any).result);
      }
      if ('richText' in val && Array.isArray((val as any).richText)) {
        return (val as any).richText.map((t: any) => t.text || '').join('');
      }
    }
    return String(val);
  }

  /**
   * Strictly sanitize table/column names to prevent SQL injection.
   */
  private sanitizeIdentifier(name: string): string {
    const trimmed = name.trim();
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      throw new BadRequestException(
        `Invalid SQL identifier: "${name}". Only alphanumeric and underscore characters are allowed.`,
      );
    }
    return trimmed;
  }

  /**
   * Verify that the requested table and column exist in PostgreSQL.
   */
  private async verifyTableAndColumn(
    client: PoolClient,
    tableName: string,
    columnName: string,
  ): Promise<void> {
    const tableRes = await client.query(
      `
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = $1
      ) AS exists;
      `,
      [tableName],
    );

    if (!tableRes.rows[0]?.exists) {
      throw new BadRequestException(
        `Target table "${tableName}" does not exist in the database. Please create it or verify the table name.`,
      );
    }

    const colRes = await client.query(
      `
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
      ) AS exists;
      `,
      [tableName, columnName],
    );

    if (!colRes.rows[0]?.exists) {
      throw new BadRequestException(
        `Column "${columnName}" does not exist in table "${tableName}".`,
      );
    }
  }
}
