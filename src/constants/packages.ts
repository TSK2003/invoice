import { ServicePackage, PackageAddon } from '../types/package';

export const STANDARD_PACKAGE_INCLUSIONS = [
  'Domain — 1 Year',
  'Hosting — 1 Year',
  'Deployment',
  'SSL / HTTPS',
  '3 Months Monitoring & Basic Technical Support'
];

export const AESCION_PACKAGES: ServicePackage[] = [
  {
    id: 'static-website',
    name: 'Static Website',
    basePrice: 10000,
    maxPagesText: 'Up to 8 pages',
    description: 'Clean, responsive static web presence for small business profile.',
    includedServices: STANDARD_PACKAGE_INCLUSIONS,
  },
  {
    id: 'business-website',
    name: 'Business Website',
    basePrice: 15000,
    maxPagesText: 'Up to 10 pages',
    description: 'Professional corporate website with contact forms & interactive sections.',
    includedServices: STANDARD_PACKAGE_INCLUSIONS,
  },
  {
    id: 'website-admin',
    name: 'Website + Admin Panel',
    basePrice: 25000,
    maxPagesText: 'Up to 10 website pages + 5 admin modules',
    description: 'Dynamic website powered by custom content management & admin controls.',
    includedServices: STANDARD_PACKAGE_INCLUSIONS,
  },
  {
    id: 'ecommerce-basic',
    name: 'E-Commerce Basic',
    basePrice: 35000,
    maxPagesText: 'Up to 10 customer screens + basic sales management',
    description: 'Online shop with product catalog, cart, checkout & sales dashboard.',
    includedServices: STANDARD_PACKAGE_INCLUSIONS,
  },
  {
    id: 'ecommerce-business',
    name: 'E-Commerce Business',
    basePrice: 45000,
    maxPagesText: 'Up to 10 customer screens + staff & sales management',
    description: 'Full-fledged store with multi-role staff access, inventory & sales analytics.',
    includedServices: STANDARD_PACKAGE_INCLUSIONS,
  },
  {
    id: 'erp-crm-starter',
    name: 'ERP / CRM Starter',
    basePrice: 60000,
    maxPagesText: 'Up to 5 selected modules',
    description: 'Custom enterprise software with inventory, invoicing, CRM & team management.',
    includedServices: STANDARD_PACKAGE_INCLUSIONS,
  },
];

export const PACKAGE_ADDONS: PackageAddon[] = [
  {
    id: 'addon-page',
    name: 'Additional Page',
    unitPrice: 1500,
    unitLabel: 'per page',
  },
  {
    id: 'addon-payment-gateway',
    name: 'Payment Gateway Integration',
    unitPrice: 5000,
    unitLabel: 'one-time',
  },
  {
    id: 'addon-whatsapp',
    name: 'WhatsApp Business API Integration',
    unitPrice: 4000,
    unitLabel: 'one-time',
  },
  {
    id: 'addon-admin-module',
    name: 'Additional Custom Module',
    unitPrice: 8000,
    unitLabel: 'per module',
  },
];
