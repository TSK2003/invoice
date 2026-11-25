import React from 'react';
import { DocumentData } from '../../types/document';
import { formatCurrency } from '../../utils/currency';
import { numberToWords } from '../../utils/numberToWords';
import { LOGO_BASE64, SEAL_BASE64, SIGNATURE_BASE64 } from '../../constants/imageAssets';

interface TaxInvoiceDocumentProps {
  data: DocumentData;
  containerId?: string;
}

export const TaxInvoiceDocument: React.FC<TaxInvoiceDocumentProps> = ({
  data,
  containerId = 'tax-invoice-document-canvas',
}) => {
  const {
    documentNumber,
    date,
    validUntilOrDueDate,
    client,
    company,
    items,
    tax,
    notes,
    termsAndConditions,
    signatureSeal,
  } = data;

  const sigSeal = company.signatureSeal || signatureSeal;
  const logoSrc = company.logoUrl || LOGO_BASE64;
  const sealSrc = sigSeal?.sealImageUrl || SEAL_BASE64;
  const signatureSrc = sigSeal?.signatureImageUrl || SIGNATURE_BASE64;
  const showSeal = sigSeal?.showSeal ?? true;
  const showSignature = sigSeal?.showSignature ?? true;
  const signatoryTitle = sigSeal?.signatoryTitle || 'Authorized Signatory';

  return (
    <div
      id={containerId}
      className="a4-page bg-white text-[#1F2937] mx-auto relative shadow-a4 print:shadow-none box-border select-none flex flex-col justify-between"
      style={{
        width: '210mm',
        minHeight: '297mm',
        maxWidth: '210mm',
        padding: '8mm 12mm 8mm 12mm',
        boxSizing: 'border-box',
        position: 'relative',
        background: '#ffffff',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        letterSpacing: '0.01em',
      }}
    >
      {/* UPPER MAIN CONTENT AREA */}
      <div>
        {/* HEADER SECTION */}
        <div className="grid grid-cols-[1.2fr_1fr] gap-4 items-start border-b-2 border-brand pb-2">
          {/* Left: AESCION Logo graphic & Tagline */}
          <div>
            <img
              src={logoSrc}
              alt={company.companyName || 'AESCION Logo'}
              className="max-h-[46px] w-auto object-contain block"
              loading="eager"
            />
            {company.tagline && (
              <p className="text-[10px] text-secondary mt-1 font-medium tracking-wide">
                {company.tagline}
              </p>
            )}
          </div>

          {/* Right: Document Title & Metadata */}
          <div className="text-right">
            <h1 className="m-0 text-primary font-extrabold text-2xl tracking-wider uppercase leading-none">
              TAX INVOICE
            </h1>
            <div className="mt-1.5 text-xs font-semibold text-primary">
              Invoice No:{' '}
              <span className="text-brand font-bold font-mono text-[12.5px]">{documentNumber}</span>
            </div>
            <div className="text-[11px] text-secondary mt-0.5 font-medium">
              Invoice Date: <span className="text-primary font-semibold">{date}</span>
            </div>
            {validUntilOrDueDate && (
              <div className="text-[11px] text-secondary font-medium mt-0.5">
                Due Date: <span className="text-primary font-semibold">{validUntilOrDueDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* SUPPLIER & BUYER / CLIENT INFORMATION (TWO-COLUMN BLOCK) */}
        <div className="mt-2.5 grid grid-cols-2 gap-3 text-[11px] break-inside-avoid">
          {/* Supplier Box */}
          <div className="border border-line rounded-xs p-2 bg-white flex flex-col justify-between">
            <div>
              <div className="text-[9.5px] font-bold text-brand uppercase tracking-wider mb-0.5">
                Supplier / Billed By
              </div>
              <div className="font-bold text-primary text-xs mb-0.5">{company.companyName}</div>
              <div className="text-secondary leading-tight text-[10.5px]">{company.address}</div>
            </div>
            <div className="mt-1.5 pt-1 border-t border-line text-[10px] text-secondary space-y-0.5">
              {company.gstin && (
                <div>
                  GSTIN: <b className="text-primary font-mono">{company.gstin}</b>
                </div>
              )}
              {company.pan && (
                <div>
                  PAN: <b className="text-primary font-mono">{company.pan}</b>
                </div>
              )}
              <div>
                State: <b className="text-primary">Tamil Nadu (33)</b>
              </div>
              <div>
                Email: <b className="text-primary">{company.email}</b> | Phone:{' '}
                <b className="text-primary">{company.phone}</b>
              </div>
            </div>
          </div>

          {/* Buyer / Client Box */}
          <div className="border border-line rounded-xs p-2 bg-white flex flex-col justify-between">
            <div>
              <div className="text-[9.5px] font-bold text-brand uppercase tracking-wider mb-0.5">
                Billed To / Buyer
              </div>
              <div className="font-bold text-primary text-xs mb-0.5">
                {client.companyName || '[Client / Company Name]'}
              </div>
              {client.contactPerson && (
                <div className="text-secondary text-[10.5px] font-medium leading-tight">
                  Attn: {client.contactPerson}
                </div>
              )}
              <div className="text-secondary leading-tight text-[10.5px]">
                {client.billingAddress || '[Billing Address]'}
              </div>
              {client.city && (
                <div className="text-secondary leading-tight text-[10.5px]">
                  {client.city}
                  {client.state ? `, ${client.state}` : ''}
                  {client.pincode ? ` - ${client.pincode}` : ''}
                </div>
              )}
            </div>
            <div className="mt-1.5 pt-1 border-t border-line text-[10px] text-secondary space-y-0.5">
              {client.gstin && (
                <div>
                  GSTIN: <b className="text-primary font-mono">{client.gstin}</b>
                </div>
              )}
              {client.pan && (
                <div>
                  PAN: <b className="text-primary font-mono">{client.pan}</b>
                </div>
              )}
              {client.stateCode && (
                <div>
                  State Code: <b className="text-primary font-mono">{client.stateCode}</b>
                </div>
              )}
              {client.placeOfSupply && (
                <div>
                  Place of Supply: <b className="text-primary">{client.placeOfSupply}</b>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LINE ITEMS TABLE */}
        <div className="mt-2.5">
          <table className="w-full text-left text-[11px] border-collapse border border-line">
            <thead>
              <tr className="bg-brand text-white text-[10px] uppercase font-bold tracking-wider">
                <th className="py-1.5 px-2 text-center w-[6%] border-r border-brand-hover">S#</th>
                <th className="py-1.5 px-2.5 border-r border-brand-hover w-[46%]">Item Description</th>
                <th className="py-1.5 px-2 text-center w-[12%] border-r border-brand-hover">SAC/HSN</th>
                <th className="py-1.5 px-2 text-center w-[8%] border-r border-brand-hover">Qty</th>
                <th className="py-1.5 px-2.5 text-right w-[14%] border-r border-brand-hover">Rate</th>
                <th className="py-1.5 px-2.5 text-right w-[14%]">Taxable Value</th>
              </tr>
            </thead>
            <tbody className="text-primary">
              {items.map((item, idx) => (
                <tr key={item.id || idx} className="border-b border-line hover:bg-page/40 transition-colors">
                  <td className="py-1.5 px-2 text-center align-middle text-secondary border-r border-line font-medium text-[10.5px] tabular-nums">
                    {item.sNo || idx + 1}
                  </td>
                  <td className="py-1.5 px-2.5 align-middle border-r border-line">
                    <div className="font-semibold text-primary leading-tight text-[11px]">
                      {item.description}
                    </div>
                  </td>
                  <td className="py-1.5 px-2 text-center align-middle text-secondary font-mono border-r border-line text-[10px] tabular-nums">
                    {item.sacHsn || '—'}
                  </td>
                  <td className="py-1.5 px-2 text-center align-middle text-secondary border-r border-line text-[10.5px] tabular-nums">
                    {item.quantity || '1'}
                  </td>
                  <td className="py-1.5 px-2.5 text-right align-middle text-secondary border-r border-line text-[10.5px] font-mono tabular-nums">
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="py-1.5 px-2.5 text-right align-middle font-bold text-primary text-[10.5px] font-mono tabular-nums">
                    {formatCurrency(item.taxableValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS & TAX BREAKDOWN */}
        <div className="mt-2.5 flex justify-end break-inside-avoid">
          <table className="w-[45%] border-collapse text-xs">
            <tbody>
              <tr className="border-b border-line text-secondary">
                <td className="py-1.5 px-2 text-left">Taxable Subtotal</td>
                <td className="py-1.5 px-2 text-right font-semibold text-primary font-mono tabular-nums">
                  {formatCurrency(tax.taxableValueTotal)}
                </td>
              </tr>

              {tax.taxType === 'cgst_sgst' && (
                <>
                  <tr className="border-b border-line text-secondary text-[10.5px]">
                    <td className="py-1.5 px-2 text-left">CGST ({tax.cgstPercent}%)</td>
                    <td className="py-1.5 px-2 text-right font-mono tabular-nums">
                      {formatCurrency(tax.cgstAmount)}
                    </td>
                  </tr>
                  <tr className="border-b border-line text-secondary text-[10.5px]">
                    <td className="py-1.5 px-2 text-left">SGST ({tax.sgstPercent}%)</td>
                    <td className="py-1.5 px-2 text-right font-mono tabular-nums">
                      {formatCurrency(tax.sgstAmount)}
                    </td>
                  </tr>
                </>
              )}

              {tax.taxType === 'igst' && (
                <tr className="border-b border-line text-secondary text-[10.5px]">
                  <td className="py-1.5 px-2 text-left">IGST ({tax.igstPercent}%)</td>
                  <td className="py-1.5 px-2 text-right font-mono tabular-nums">
                    {formatCurrency(tax.igstAmount)}
                  </td>
                </tr>
              )}

              {tax.roundOff !== 0 && (
                <tr className="border-b border-line text-secondary text-[10.5px]">
                  <td className="py-1.5 px-2 text-left">Round Off</td>
                  <td className="py-1.5 px-2 text-right font-mono tabular-nums">
                    {formatCurrency(tax.roundOff)}
                  </td>
                </tr>
              )}

              <tr className="bg-brand/10 border-t-2 border-brand">
                <td className="py-1.5 px-2 text-left font-bold text-xs uppercase tracking-wider text-primary">
                  Total Invoice Amount
                </td>
                <td className="py-1.5 px-2 text-right font-bold text-sm text-brand font-mono tabular-nums">
                  {formatCurrency(tax.grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* AMOUNT IN WORDS */}
        <div className="mt-2 text-[10px] bg-page border-l-2 border-brand py-1 px-2.5 text-secondary break-inside-avoid">
          Amount in Words: <b className="text-primary font-medium">{numberToWords(tax.grandTotal)}</b>
        </div>

        {/* BANK DETAILS & TERMS */}
        <div className="grid grid-cols-2 gap-3 mt-2.5 text-[10px] items-stretch break-inside-avoid">
          {/* Left: Bank / Payment Info */}
          <div className="flex flex-col">
            <div className="font-bold text-primary text-[9.5px] uppercase tracking-wider mb-1">
              Settlement Details
            </div>
            <div className="flex-1 border border-line rounded-xs p-2.5 bg-white text-secondary leading-snug text-[9.5px] flex flex-col justify-start">
              <div className="grid grid-cols-[84px_1fr] gap-y-1.5 gap-x-2 items-baseline">
                <span>Account Name:</span>
                <b className="text-primary">{company.accountName}</b>
                <span>Bank:</span>
                <b className="text-primary">{company.bankName}</b>
                <span>Account No:</span>
                <b className="font-mono text-primary tabular-nums">{company.accountNumber}</b>
                <span>IFSC Code:</span>
                <b className="font-mono text-primary tabular-nums">{company.ifsc}</b>
                <span>UPI ID:</span>
                <b className="text-brand font-mono">{company.upiId || '—'}</b>
              </div>
            </div>
          </div>

          {/* Right: Terms & Conditions */}
          <div className="flex flex-col">
            <div className="font-bold text-primary text-[9.5px] uppercase tracking-wider mb-1">
              Terms & Conditions
            </div>
            <div className="flex-1 border border-line rounded-xs p-2.5 bg-white text-[9.5px] leading-relaxed text-secondary">
              <ul className="list-disc pl-3.5 space-y-1 m-0">
                {termsAndConditions.slice(0, 4).map((term, i) => (
                  <li key={i}>{term}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* NOTES (If present) */}
        {notes && (
          <div className="mt-1.5 text-[9.5px] text-secondary italic break-inside-avoid">
            <b>Note:</b> {notes}
          </div>
        )}
      </div>

      {/* BOTTOM AREA: SIGNATURE & PINNED FOOTER */}
      <div className="mt-4">
        {/* SIGNATURE & SEAL SECTION */}
        <div className="grid grid-cols-2 gap-8 items-end break-inside-avoid">
          {/* Statutory Declaration */}
          <div className="min-h-[120px] flex flex-col justify-end">
            <div className="text-[9.5px] text-secondary leading-tight pb-1.5">
              <p className="font-medium">
                Certified that the particulars given above are true and correct.
              </p>
              <p className="text-[8.5px] text-muted mt-0.5">
                This is a computer-generated tax invoice.
              </p>
            </div>
          </div>

          {/* Supplier Signatory & Seal */}
          <div className="relative min-h-[120px] flex flex-col justify-end">
            <div className="relative flex items-end justify-end pr-1 pb-1 h-[110px]">
              {showSeal && (
                <div className="pointer-events-none z-10 flex items-center justify-center w-[125px] h-[125px] shrink-0">
                  <img
                    src={sealSrc}
                    alt="Company Seal"
                    className="max-w-full max-h-full object-contain opacity-90 mix-blend-multiply"
                    loading="eager"
                  />
                </div>
              )}

              {showSignature && (
                <div className="pointer-events-none z-20 flex items-center justify-center h-[44px] w-auto mb-1 -ml-6 shrink-0">
                  <img
                    src={signatureSrc}
                    alt="Signature"
                    className="h-full w-auto object-contain max-w-[140px]"
                    loading="eager"
                  />
                </div>
              )}
            </div>

            <div className="border-t border-line pt-1.5 text-[9.5px] text-secondary font-medium relative z-30 text-right">
              For {company.companyName} — {signatoryTitle}
            </div>
          </div>
        </div>

        {/* FOOTER PINNED AT BOTTOM */}
        <div className="mt-3 border-t border-line pt-1.5 flex justify-between items-center text-[8.5px] text-secondary font-medium break-inside-avoid">
          <span>
            {company.email} · {company.phone}
          </span>
          <span className="font-semibold text-primary">{company.website}</span>
        </div>
      </div>
    </div>
  );
};
