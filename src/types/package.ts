export interface IncludedItem {
  id: string;
  name: string;
  description: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  basePrice: number;
  maxPagesText: string;
  description: string;
  includedServices: string[];
}

export interface PackageAddon {
  id: string;
  name: string;
  unitPrice: number;
  unitLabel: string;
}
