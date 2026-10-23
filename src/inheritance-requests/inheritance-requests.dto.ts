import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateInheritanceRequestDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  refNo?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  area?: string;

  @IsString()
  @IsOptional()
  propertyType?: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  deceasedSangkat?: string;

  @IsString()
  @IsOptional()
  titleDeedNo?: string;

  @IsString()
  @IsOptional()
  plotNo?: string;

  @IsString()
  @IsOptional()
  streetNo?: string;

  @IsString()
  @IsOptional()
  village?: string;

  @IsString()
  @IsOptional()
  sangkat?: string;

  @IsString()
  @IsOptional()
  khan?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  authorizedPerson?: string;

  @IsString()
  @IsOptional()
  authorizedRelationDeceased?: string;

  @IsString()
  @IsOptional()
  authorizedRelationHeirs?: string;

  @IsString()
  @IsOptional()
  communeChiefName?: string;

  @IsString()
  @IsOptional()
  heirCertNo?: string;

  @IsString()
  @IsOptional()
  letterRefNo?: string;

  @IsString()
  @IsOptional()
  letterRefDate?: string;

  @IsArray()
  @IsOptional()
  deceased?: any[];

  @IsArray()
  @IsOptional()
  applicants?: any[];

  @IsArray()
  @IsOptional()
  witnesses?: any[];

  @IsArray()
  @IsOptional()
  children?: any[];

  @IsArray()
  @IsOptional()
  relatives?: any[];
}

export class UpdateInheritanceRequestDto extends CreateInheritanceRequestDto {}
