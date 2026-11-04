export interface ParcelMappingRow {
  oldParcelNumber: string;
  newParcelNumber: string;
  rowNumber: number;
}

export interface BulkUpdateOptions {
  dryRun?: boolean;
  tableName?: string;
  columnName?: string;
  batchSize?: number;
}

export interface BulkUpdateReport {
  success: boolean;
  dryRun: boolean;
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
  executionTimeMs: number;
  sampleMissingOldNumbers: string[];
  sampleConflictingNewNumbers: string[];
  sampleDuplicateOldNumbers: string[];
  sampleDuplicateNewNumbers: string[];
  message: string;
}
