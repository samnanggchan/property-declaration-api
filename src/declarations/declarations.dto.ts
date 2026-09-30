import { IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
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

export class CadastralBoundariesDto {
  @IsString()
  @IsOptional()
  north?: string;

  @IsString()
  @IsOptional()
  east?: string;

  @IsString()
  @IsOptional()
  south?: string;

  @IsString()
  @IsOptional()
  west?: string;
}

export class CadastralDetailsDto {
  @IsString()
  @IsOptional()
  sheetNumber?: string;

  @IsString()
  @IsOptional()
  parcelNumber?: string;

  @IsString()
  @IsOptional()
  khan?: string;

  @IsString()
  @IsOptional()
  sangkat?: string;

  @IsString()
  @IsOptional()
  village?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  landUseNature?: string;

  @IsString()
  @IsOptional()
  landType?: string;

  @IsString()
  @IsOptional()
  transferType?: string;

  @IsString()
  @IsOptional()
  transferDeedNo?: string;

  @IsString()
  @IsOptional()
  transferDeedDate?: string;

  @IsString()
  @IsOptional()
  transferDetails?: string;

  @IsString()
  @IsOptional()
  encumbrance?: string;

  @IsString()
  @IsOptional()
  otherRemarks?: string;

  @IsString()
  @IsOptional()
  variant?: 'LMAP' | 'HOUSE';

  @IsString()
  @IsOptional()
  houseNo?: string;

  @IsString()
  @IsOptional()
  streetNo?: string;

  @IsString()
  @IsOptional()
  roadNo?: string;

  @IsString()
  @IsOptional()
  idCode?: string;

  @IsString()
  @IsOptional()
  houseType?: string;

  @IsString()
  @IsOptional()
  houseGrade?: string;

  @IsString()
  @IsOptional()
  usableArea?: string;

  @IsString()
  @IsOptional()
  builtArea?: string;

  @ValidateNested()
  @Type(() => CadastralBoundariesDto)
  @IsOptional()
  boundaries?: CadastralBoundariesDto;

  @IsString()
  @IsOptional()
  registrationDate?: string;
}

export class WitnessPersonDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  dob?: string;

  @IsString()
  @IsOptional()
  idNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

export class RepresentativePersonDto extends WitnessPersonDto {}

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

  @ValidateNested()
  @Type(() => PersonFieldsDto)
  @IsOptional()
  repPerson?: PersonFieldsDto;

  @ValidateNested()
  @Type(() => PersonFieldsDto)
  @IsOptional()
  representativePerson?: PersonFieldsDto;

  @ValidateNested()
  @Type(() => WitnessPersonDto)
  @IsOptional()
  witness1?: WitnessPersonDto;

  @ValidateNested()
  @Type(() => WitnessPersonDto)
  @IsOptional()
  witness2?: WitnessPersonDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WitnessPersonDto)
  @IsOptional()
  witnesses?: WitnessPersonDto[];

  @ValidateNested()
  @Type(() => RepresentativePersonDto)
  @IsOptional()
  rep1?: RepresentativePersonDto;

  @ValidateNested()
  @Type(() => RepresentativePersonDto)
  @IsOptional()
  rep2?: RepresentativePersonDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RepresentativePersonDto)
  @IsOptional()
  representatives?: RepresentativePersonDto[];

  @IsString()
  @IsOptional()
  boundaryNorth?: string;

  @IsString()
  @IsOptional()
  boundarySouth?: string;

  @IsString()
  @IsOptional()
  boundaryEast?: string;

  @IsString()
  @IsOptional()
  boundaryWest?: string;

  @IsString()
  @IsOptional()
  registrationDate?: string;

  @IsString()
  @IsOptional()
  registeredDate?: string;

  @ValidateNested()
  @Type(() => CadastralBoundariesDto)
  @IsOptional()
  boundaries?: CadastralBoundariesDto;

  @ValidateNested()
  @Type(() => CadastralDetailsDto)
  @IsOptional()
  cadastral?: CadastralDetailsDto;
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

  @ValidateNested()
  @Type(() => CadastralDetailsDto)
  @IsOptional()
  cadastral?: CadastralDetailsDto;
}

export class UpdateDeclarationDto extends CreateDeclarationDto {}
