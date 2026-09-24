import {
  IsString,
  IsOptional,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PersonFieldsDto {
  @IsString()
  @IsOptional()
  idNumber?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  dob?: string;

  @IsString()
  @IsOptional()
  birthPlace?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  fatherName?: string;

  @IsString()
  @IsOptional()
  motherName?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

export class JointFieldsDto {
  @IsString()
  @IsOptional()
  propertyType?: string;

  @IsString()
  @IsOptional()
  area?: string;

  @IsString()
  @IsOptional()
  landUse?: string;

  @IsString()
  @IsOptional()
  usageNature?: string;

  @IsString()
  @IsOptional()
  possessionSource?: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  charter?: string;

  @IsString()
  @IsOptional()
  entity?: string;

  @IsString()
  @IsOptional()
  officeAddress?: string;

  @IsString()
  @IsOptional()
  repName?: string;

  @IsString()
  @IsOptional()
  repRole?: string;
}

export class PartyFieldsDto {
  @ValidateNested()
  @Type(() => PersonFieldsDto)
  @IsOptional()
  husband?: PersonFieldsDto;

  @ValidateNested()
  @Type(() => PersonFieldsDto)
  @IsOptional()
  wife?: PersonFieldsDto;
}

export class CreateDeclarationDto {
  @IsString()
  @IsOptional()
  certNumber?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @ValidateNested()
  @Type(() => PartyFieldsDto)
  @IsOptional()
  seller?: PartyFieldsDto;

  @ValidateNested()
  @Type(() => PartyFieldsDto)
  @IsOptional()
  buyer?: PartyFieldsDto;

  @ValidateNested()
  @Type(() => PersonFieldsDto)
  @IsOptional()
  husband?: PersonFieldsDto;

  @ValidateNested()
  @Type(() => PersonFieldsDto)
  @IsOptional()
  wife?: PersonFieldsDto;

  @ValidateNested()
  @Type(() => JointFieldsDto)
  @IsOptional()
  joint?: JointFieldsDto;
}

export class UpdateDeclarationDto extends CreateDeclarationDto {}
