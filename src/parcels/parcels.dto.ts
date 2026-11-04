import { IsBoolean, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class BulkUpdateDto {
  /**
   * If true, validates all data and calculates matches/conflicts without committing changes.
   */
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    return false;
  })
  @IsBoolean()
  dryRun?: boolean = false;

  /**
   * Target database table to update (defaults to 'parcels')
   */
  @IsOptional()
  @IsString()
  tableName?: string = 'parcels';

  /**
   * Target parcel column name in the database (defaults to 'parcel_number')
   */
  @IsOptional()
  @IsString()
  columnName?: string = 'parcel_number';

  /**
   * Number of rows to insert per UNNEST query batch (defaults to 5000)
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(500)
  @Max(10000)
  batchSize?: number = 5000;
}