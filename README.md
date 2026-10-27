# AESCION Document Studio

<div align="center">

**A Professional, Production-Ready Enterprise Document Generation Application**

*Built for generating A4 Quotations, Tax Invoices, and Payment Receipts with Live Preview, Package Builder, GST Engine & PDF Export.*

</div>

---

## 👁️ Product Vision

**AESCION Document Studio** is designed as an internal SaaS tool for **AESCION EDTECH SOLUTIONS** to streamline business document workflows. 

Unlike traditional static document templates or basic forms, **AESCION Document Studio** is architected as a modular, scalable document creation suite featuring a **desktop split-screen layout**, **instant live A4 rendering**, **pre-configured pricing packages**, **automated standard inclusions**, **GST calculations**, and **1:1 fidelity PDF generation**.

---

## ✨ Key Features

### 1. 🔀 Multi-Document Suite
- **Quotation**: Package selection, scope breakdown, standard inclusions, package customization, 50/50 & 40/60 milestone splits, delivery timeline, and signature/seal.
- **Tax Invoice**: Supplier & Customer billing details, GSTIN, Place of Supply, SAC/HSN codes, Taxable Value, CGST/SGST/IGST breakdown, Round Off, Grand Total, and Amount in Words.
- **Payment Receipt**: Transaction reference, payment mode (UPI, Bank Transfer, Cheque, Cash, Card), invoice reference, amount received, and payment status tracking.

### 2. 📦 Pre-configured AESCION Packages & Automatic Inclusions
- **6 Standard Web & ERP Packages**:
  1. **Static Website** — ₹10,000 (Up to 8 pages)
  2. **Business Website** — ₹15,000 (Up to 10 pages)
  3. **Website + Admin Panel** — ₹25,000 (Up to 10 pages + 5 admin modules)
  4. **E-Commerce Basic** — ₹35,000 (Up to 10 customer screens + basic sales management)
  5. **E-Commerce Business** — ₹45,000 (Up to 10 customer screens + staff & sales management)
  6. **ERP / CRM Starter** — ₹60,000+ (Up to 5 selected modules)
- **Automated Standard Inclusions Rule**:
  Every package automatically appends the 5 standard non-chargeable inclusions:
  - *Domain — 1 Year*
  - *Hosting — 1 Year*
  - *Deployment*
  - *SSL / HTTPS*
  - *3-Month Technical Support & Basic Monitoring*
  These items appear directly as **`Included`** with no additional charge.

### 3. 🖼️ Split-Screen Desktop Builder & Live A4 Preview
- **Left Panel (~42% Width)**: Collapsible, organized form accordion for effortless data entry.
- **Right Panel (~58% Width)**: Real A4 ratio (210mm × 297mm) document preview with instant live updates as you type.
- **1:1 Fidelity (`Preview == PDF`)**: Uses a single authoritative `DocumentRenderer` component for both live preview and PDF generation.

### 4. 🧮 Configurable GST Engine & Indian Currency Support
- **Flexible Tax Modes**: No Tax (0%), CGST + SGST (Intra-state), or IGST (Inter-state).
- **Auto Calculations**: Subtotals, tax amounts, manual round-off adjustments, and Indian currency word conversion (e.g., *Rupees Fifteen Thousand Only*).

### 5. 🔏 Digital Signature & Seal Stamp System
- **Company Seal Stamp**: Toggle official stamp graphic with bottom-right positioning.
- **Authorized Signatory**: Toggle signatory line and upload custom signature PNG images.

### 6. 📊 Document Management & Dashboard
- **Financial Overview**: Real-time stats for Total Quotations, Invoices, Receipts, Paid Amount, Outstanding Balance, and Pending Payments.
- **Search & Filter**: Search documents by client name, document number, or project name; filter by document type and status.
- **Document Actions**: View/Edit, Duplicate (auto-generates next document number), Download PDF, and Delete.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Core Framework** | React 18 + TypeScript |
| **Build Tool & Bundler** | Vite 6 |
| **Styling** | Tailwind CSS + Custom CSS Variables & Typography (Inter Font) |
| **Icons** | Lucide React |
| **PDF Generation** | html2canvas + jsPDF / Native Print Stylesheets |
| **State & Storage** | Typed Service Abstraction (`IDocumentStorageService`) + LocalStorage & Draft Autosave |

---

## 💻 Getting Started & Commands

### Prerequisites
Make sure you have **Node.js (v18+)** and **npm** installed.

```bash
node -v
npm -v
```

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
Start the local development server with hot-reloading:
```bash
npm run dev
```
Navigates automatically to `http://localhost:3000`.

### 3. Build for Production
Type-check TypeScript and compile the production bundle:
```bash
npm run build
```
Output artifacts are placed in the `dist/` directory.

### 4. Preview Production Build
Preview the production build locally:
```bash
npm run preview
```

---

## 📂 Project Architecture

```
Invoice/
├── README.md                              # Application documentation & guide
├── package.json                           # Project dependencies and scripts
├── vite.config.ts                         # Vite configuration & path aliases
├── tsconfig.json                          # TypeScript compiler settings
├── tailwind.config.js                     # Tailwind CSS brand color palette
├── postcss.config.js                      # PostCSS plugins
├── index.html                             # Root HTML document with Inter font
└── src/
    ├── main.tsx                           # Application entry point
    ├── App.tsx                            # Root App container & view router
    ├── index.css                          # Global styles & A4 print stylesheets
    ├── types/
    │   ├── document.ts                    # Document, Item, Tax & Client schemas
    │   ├── package.ts                     # Package & Add-on interfaces
    │   └── template.ts                    # Template styling settings
    ├── constants/
    │   ├── packages.ts                    # AESCION packages, pricing & inclusions
    │   ├── defaultCompany.ts              # Default AESCION company profile & logo
    │   ├── defaultTerms.ts                # Quotation, Invoice & Receipt terms
    │   └── initialTemplates.ts            # Default document template configs
    ├── utils/
    │   ├── currency.ts                    # Currency formatting & parser
    │   ├── numberToWords.ts               # Indian number to words conversion
    │   ├── taxCalculator.ts               # GST tax calculation engine
    │   └── validator.ts                   # Form validation rules (GSTIN, Email, Phone)
    ├── services/
    │   ├── storage/
    │   │   ├── IDocumentStorage.ts        # Storage service interface
    │   │   └── LocalStorageService.ts     # LocalStorage & seed data driver
    │   └── pdfExportService.ts            # High fidelity PDF & print generator
    └── components/
        ├── ui/
        │   ├── Header.tsx                 # Header navigation & quick actions
        │   ├── Badge.tsx                  # Status badge components
        │   └── Toast.tsx                  # Notification toast system
        ├── dashboard/
        │   ├── DocumentDashboard.tsx      # Dashboard container
        │   ├── StatsOverview.tsx          # Summary metric cards
        │   └── DocumentTable.tsx          # Searchable/Filterable documents table
        ├── preview/
        │   ├── DocumentRenderer.tsx       # Reusable 1:1 A4 document renderer
        │   └── LivePreview.tsx            # Sticky desktop live preview container
        └── builder/
            ├── DocumentBuilder.tsx        # Master split-screen document builder
            ├── DocumentTypeSelector.tsx   # Quotation/Invoice/Receipt toggle
            ├── PackageSelector.tsx        # Package selection & customization
            ├── ClientForm.tsx             # Client information form
            ├── CompanyForm.tsx            # Company profile manager
            ├── ItemEditor.tsx             # Dynamic item table editor
            ├── TaxEditor.tsx              # GST tax configuration
            ├── PaymentTermsEditor.tsx     # Payment milestone split editor
            ├── SignatureSealEditor.tsx    # Digital seal & signature uploader
            └── TemplateSettingsEditor.tsx # Document template settings editor
```

---

## 🎨 Customization Guide

### 1. Modifying Default Company Profile
Edit `src/constants/defaultCompany.ts` to update the default company name, address, GSTIN, bank account, IFSC, or UPI credentials for **AESCION EDTECH SOLUTIONS**.

### 2. Updating Package Pricing & Inclusions
Edit `src/constants/packages.ts` to adjust package prices, descriptions, page limits, or standard inclusion items.

### 3. Customizing Default Terms & Conditions
Edit `src/constants/defaultTerms.ts` to alter standard terms for Quotations, Invoices, or Receipts.

---

## 🔥 Firebase Hosting & Live Deployment

The project is pre-configured with **Firebase Hosting** and initialized with project `invoice-ebf0e`.

### Firebase Configuration

The Firebase SDK is initialized in `src/services/firebase.ts` with environment variables support (`.env`):

- **Project ID**: `invoice-ebf0e`
- **Hosting URL**: `https://invoice-ebf0e.web.app` / `https://invoice-ebf0e.firebaseapp.com`
- **Auth Domain**: `invoice-ebf0e.firebaseapp.com`
- **Storage Bucket**: `invoice-ebf0e.firebasestorage.app`

### 🚀 Direct CLI Deployment

To deploy directly to Firebase from your local machine:

1. Install Firebase CLI globally (if not installed):
   ```bash
   npm install -g firebase-tools
   ```
2. Login to your Google / Firebase account:
   ```bash
   firebase login
   ```
3. Build and deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## 🤖 Automated GitHub Actions CI/CD Pipeline

Continuous Integration & Continuous Deployment is pre-configured with two automated GitHub Actions workflows:

### 1. Production Deployment (`.github/workflows/firebase-hosting-merge.yml`)
- Triggers on every `push` or merge to the `main` branch.
- Installs dependencies (`npm ci`), runs TypeScript compiler check & Vite build (`npm run build`).
- Deploys the built `dist/` directory to the live Firebase Hosting channel.

### 2. Pull Request Preview Channel (`.github/workflows/firebase-hosting-pull-request.yml`)
- Triggers on pull requests to the `main` branch.
- Generates a temporary preview URL for testing before merging.

### ⚙️ Setting Up GitHub Secrets

To allow GitHub Actions to deploy to Firebase Hosting automatically:

#### Method A: Using CI Token (`firebase login:ci`) — Quickest
1. In your local terminal, run:
   ```bash
   firebase login:ci
   ```
2. Your browser will open for authentication. Sign in and grant access.
3. The terminal will print a token starting with `1//...`.
4. Open GitHub repo: **Settings** > **Secrets and variables** > **Actions** > **New repository secret**.
5. Name: `FIREBASE_TOKEN`, Value: `<paste your token>`.

#### Method B: Using Google Service Account Key
1. Go to Firebase Console > **Project Settings** > **Service Accounts**.
2. Click **Generate new private key** (downloads a `.json` key file).
3. Open GitHub repo: **Settings** > **Secrets and variables** > **Actions** > **New repository secret**.
4. Name: `FIREBASE_SERVICE_ACCOUNT_INVOICE_EBF0E`, Value: `<paste full json file content>`.

---

## 🔌 Future Backend Integration Roadmap

The storage architecture is built using clean TypeScript interfaces (`IDocumentStorageService`). To integrate Firebase Firestore or a REST backend:

1. Use the exported `db` Firestore instance from `src/services/firebase.ts`.
2. Implement `IDocumentStorageService` for Cloud Firestore.
3. Replace the exported `storageService` instance with Firestore storage service.

---

<div align="center">

Developed for **AESCION EDTECH SOLUTIONS** · All Rights Reserved

</div>
