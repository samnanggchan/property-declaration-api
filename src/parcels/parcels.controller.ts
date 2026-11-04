import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Query,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import type { Express } from 'express';
import { ParcelsService } from './parcels.service';
import { BulkUpdateDto } from './parcels.dto';
import { BulkUpdateReport } from './parcels.types';

@Controller('parcels')
export class ParcelsController {
  private readonly logger = new Logger(ParcelsController.name);

  constructor(private readonly parcelsService: ParcelsService) {}

  /**
   * POST /parcels/bulk-update
   * Accepts an Excel (.xlsx, .xls) or CSV file with 2 columns:
   * (old_parcel_number, new_parcel_number) and performs high-speed bulk update.
   */
  @Post('bulk-update')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const tempDir = os.tmpdir();
          cb(null, tempDir);
        },
        filename: (_req, file, cb) => {
          const uniqueId = randomUUID();
          const ext = extname(file.originalname).toLowerCase() || '.xlsx';
          cb(null, `parcels-bulk-${uniqueId}${ext}`);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB limit for up to 500,000 rows
      },
      fileFilter: (_req, file, cb) => {
        const allowedExtensions = ['.xlsx', '.xls', '.csv'];
        const ext = extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(ext)) {
          return cb(
            new BadRequestException(
              `Invalid file type "${ext}". Allowed types: .xlsx, .xls, .csv`,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async bulkUpdate(
    @UploadedFile() file: Express.Multer.File,
    @Query() queryDto: BulkUpdateDto,
    @Body() bodyDto: BulkUpdateDto,
  ): Promise<BulkUpdateReport> {
    if (!file) {
      throw new BadRequestException(
        'File is required. Please upload an Excel (.xlsx) or CSV file.',
      );
    }

    // Merge query params and body form fields (query takes precedence)
    const options: BulkUpdateDto = {
      dryRun:
        queryDto.dryRun !== undefined
          ? queryDto.dryRun
          : bodyDto.dryRun !== undefined
            ? bodyDto.dryRun
            : false,
      tableName: queryDto.tableName || bodyDto.tableName || 'parcels',
      columnName: queryDto.columnName || bodyDto.columnName || 'parcel_number',
      batchSize: queryDto.batchSize || bodyDto.batchSize || 5000,
    };

    let originalName = file.originalname;
    try {
      originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    } catch {}
    const filePath = file.path;

    try {
      return await this.parcelsService.processBulkUpdate(
        filePath,
        originalName,
        options,
      );
    } finally {
      // Always cleanup the temporary file on disk
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err: any) {
          this.logger.warn(`Failed to cleanup temp file ${filePath}: ${err?.message || err}`);
        }
      }
    }
  }

  /**
   * GET /parcels/template-info
   * Returns metadata and expected column structure for the bulk update file.
   */
  @Get('template-info')
  getTemplateInfo() {
    return {
      title: 'Bulk Parcel Number Update Template Guide',
      expectedColumns: [
        {
          name: 'old_parcel_number',
          type: 'Text',
          description: 'The existing parcel number currently in the database',
          example: '12010105-0181',
        },
        {
          name: 'new_parcel_number',
          type: 'Text',
          description: 'The replacement parcel number to assign',
          example: '12010107-0315',
        },
      ],
      supportedFormats: ['.xlsx', '.xls', '.csv'],
      features: {
        dryRun: 'Pass dryRun=true to preview updates without applying changes',
        customTable: 'Supports tableName parameter (default: parcels)',
        customColumn: 'Supports columnName parameter (default: parcel_number)',
        batchSize: 'Optimized UNNEST batch size (default: 5000)',
      },
    };
  }
}
