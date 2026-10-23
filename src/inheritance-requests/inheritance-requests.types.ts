export interface Deceased {
  name: string;
  birthYear: string;
  deathDate: string;
  deathCertNo: string;
  deathCertDate: string;
}

export interface Applicant {
  name: string;
  dob: string;
  address: string;
  fatherName: string;
  motherName: string;
  relationDeceased: string;
  relationHeirs: string;
}

export interface Witness {
  name: string;
  dob: string;
  idNumber: string;
  address: string;
}

export interface Child {
  name: string;
  gender: '' | 'ប្រុស' | 'ស្រី';
  dob: string;
  birthCertDate: string;
  birthCertNo: string;
  commune: string;
  district: string;
  note: string;
}

export interface Relative {
  name: string;
  gender: '' | 'ប្រុស' | 'ស្រី';
  birthYear: string;
  address: string;
}

export interface InheritanceRequestItem {
  id: string;
  title: string;
  refNo: string;
  location: string;
  area: string;
  propertyType: string;
  date: string;
  deceasedSangkat: string;
  titleDeedNo: string;
  plotNo: string;
  streetNo: string;
  village: string;
  sangkat: string;
  khan: string;
  city: string;
  authorizedPerson: string;
  authorizedRelationDeceased: string;
  authorizedRelationHeirs: string;
  communeChiefName: string;
  heirCertNo: string;
  letterRefNo: string;
  letterRefDate: string;
  deceased: Deceased[];
  applicants: Applicant[];
  witnesses: Witness[];
  children: Child[];
  relatives: Relative[];
  createdAt: string;
  updatedAt: string;
}
