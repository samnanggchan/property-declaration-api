export interface TransferApplicationItem {
  id: string;
  title?: string;
  parcel_and_property: {
    parcel_number: string;
    location: string;
    streetNo?: string;
    village?: string;
    sangkat?: string;
    khan?: string;
    city?: string;
    property_characteristics?: Record<string, any>;
    boundaries?: Record<string, any>;
    registration_date?: string;
  };
  purpose?: string;
  coOwnerName?: string;
  coOwnerNo?: string;
  cause?: string;
  causeOther?: string;
  causeDate?: string;
  newCoOwnerShare?: string;
  date?: string;
  attachments?: string;
  sellers?: any[];
  buyers?: any[];
  witnesses?: any[];
  createdAt: string;
  updatedAt: string;
}

