import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class CreateTransferApplicationDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsObject()
  @IsOptional()
  parcel_and_property?: Record<string, any>;

  @IsString()
  @IsOptional()
  purpose?: string;

  @IsString()
  @IsOptional()
  coOwnerName?: string;

  @IsString()
  @IsOptional()
  coOwnerNo?: string;

  @IsString()
  @IsOptional()
  cause?: string;

  @IsString()
  @IsOptional()
  causeOther?: string;

  @IsString()
  @IsOptional()
  causeDate?: string;

  @IsString()
  @IsOptional()
  newCoOwnerShare?: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  attachments?: string;

  @IsArray()
  @IsOptional()
  sellers?: any[];

  @IsArray()
  @IsOptional()
  buyers?: any[];

  @IsArray()
  @IsOptional()
  witnesses?: any[];
}

export class UpdateTransferApplicationDto extends CreateTransferApplicationDto {}

