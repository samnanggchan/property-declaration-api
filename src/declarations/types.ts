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
  createdAt: string;
  updatedAt: string;
}
