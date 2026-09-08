export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  billingAddress: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  gstin: string;
  pan: string;
  placeOfSupply: string;
  website: string;
  notes: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomerInput = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;
