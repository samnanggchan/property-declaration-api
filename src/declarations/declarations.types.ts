export interface PersonFields {
  idNumber: string;
  name: string;
  dob: string;
  birthPlace: string;
  nationality: string;
  status: string;
  fatherName: string;
  motherName: string;
  address: string;
}

export interface CadastralBoundaries {
  north?: string;
  east?: string;
  south?: string;
  west?: string;
}

export interface CadastralDetails {
  sheetNumber?: string;
  parcelNumber?: string;
  khan?: string;
  sangkat?: string;
  village?: string;
  city?: string;
  landUseNature?: string;
  landType?: string;
  transferType?: string;
  transferDeedNo?: string;
  transferDeedDate?: string;
  transferDetails?: string;
  encumbrance?: string;
  otherRemarks?: string;
  variant?: 'LMAP' | 'HOUSE';
  houseNo?: string;
  streetNo?: string;
  roadNo?: string;
  idCode?: string;
  houseType?: string;
  houseGrade?: string;
  usableArea?: string;
  builtArea?: string;
  boundaries?: CadastralBoundaries;
}

export interface JointFields {
  propertyType: string;
  area: string;
  landUse: string;
  usageNature: string;
  possessionSource: string;
  date: string;
  charter: string;
  entity: string;
  officeAddress: string;
  repName: string;
  repRole: string;
  cadastral?: CadastralDetails;
}

export interface PartyFields {
  husband: PersonFields;
  wife: PersonFields;
}

export interface LandDeclaration {
  id: string;
  certNumber: string;
  location: string;
  seller: PartyFields;
  buyer: PartyFields;
  husband: PersonFields;
  wife: PersonFields;
  joint: JointFields;
  cadastral?: CadastralDetails;
  createdAt: string;
  updatedAt: string;
}

