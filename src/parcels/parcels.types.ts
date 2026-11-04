export interface ParcelMappingRow {
  oldParcelNumber: string;
  newParcelNumber: string;
  rowNumber: number;
}

export type ParcelOperation = 'update' | 'upsert' | 'seed_old' | 'insert_new';

export interface BulkUpdateOptions {
  dryRun?: boolean;
  tableName?: string;
  columnName?: string;
  batchSize?: number;
  operation?: ParcelOperation;
}

export interface BulkUpdateReport {
  success: boolean;
  dryRun: boolean;
  operation: ParcelOperation;
  targetTable: string;
  targetColumn: string;
  totalRowsInExcel: number;
  validMappingRows: number;
  duplicateOldNumbersInExcel: number;
  duplicateNewNumbersInExcel: number;
  existingMatchesInDb: number;
  missingOldNumbersInDb: number;
  conflictingNewNumbersInDb: number;
  updatedCount: number;
  insertedCount: number;
  executionTimeMs: number;
  sampleMissingOldNumbers: string[];
  sampleConflictingNewNumbers: string[];
  sampleDuplicateOldNumbers: string[];
  sampleDuplicateNewNumbers: string[];
  message: string;
}
