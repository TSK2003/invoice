import React from 'react';
import { DocumentData } from '../../types/document';
import { formatCurrency } from '../../utils/currency';
import { numberToWords } from '../../utils/numberToWords';
import { LOGO_BASE64, SEAL_BASE64, SIGNATURE_BASE64 } from '../../constants/imageAssets';

interface DocumentRendererProps {
  data: DocumentData;
  containerId?: string;
}

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  data,
  containerId = 'a4-document-render',
}) => {
  const {
    type,
    documentNumber,
    date,
    validUntilOrDueDate,
    client,
    company,
    items,
    tax,
    paymentTerms,
    receiptDetails,
    notes,
    termsAndConditions,
    signatureSeal,
  } = data;

  const isQuotation = type === 'quotation';
  const isInvoice = type === 'tax_invoice';
  const isReceipt = type === 'payment_receipt';

  const docTitle = isQuotation ? 'QUOTATION' : isInvoice ? 'TAX INVOICE' : 'PAYMENT RECEIPT';

  const sigSeal = company.signatureSeal || signatureSeal;

  // Fallback image assets
  const logoSrc = company.logoUrl || LOGO_BASE64;
  const sealSrc = sigSeal?.sealImageUrl || SEAL_BASE64;
  const signatureSrc = sigSeal?.signatureImageUrl || SIGNATURE_BASE64;
  const showSeal = sigSeal?.showSeal ?? true;
  const showSignature = sigSeal?.showSignature ?? true;
  const customerSignatoryTitle = sigSeal?.customerSignatoryTitle || 'Customer Representative';
  const signatoryTitle = sigSeal?.signatoryTitle || 'Authorized Signatory';

  return (
    <div
      id={containerId}
      className="a4-page bg-white text-[#1F2937] mx-auto relative shadow-a4 print:shadow-none box-border font-sans transition-all"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '14mm 15mm 12mm 15mm',
        boxSizing: 'border-box',
        position: 'relative',
        background: '#ffffff',
      }}
    >
      {/* HEADER SECTION ALIGNMENT */}
      <div className="grid grid-cols-[1.3fr_0.9fr] gap-4 items-start border-b-2 border-brand pb-3">
        {/* Left: AESCION Logo graphic */}
        <div>
          <img
            src={logoSrc}
            alt="AESCION Logo"
            className="max-h-[52px] w-auto object-contain block"
          />
        </div>

        {/* Right: Document Title & Metadata */}
        <div className="text-right">
          <h1 className="m-0 text-primary font-bold text-2xl tracking-wider uppercase leading-none">
            {docTitle}
          </h1>
          <div className="mt-2 text-xs font-semibold text-primary">
            {isQuotation ? 'Ref No: ' : isInvoice ? 'Invoice No: ' : 'Receipt No: '}
            <span className="text-brand font-bold font-mono">{documentNumber}</span>
          </div>
          <div className="text-[11px] text-secondary mt-1 font-medium">
            Date: <span className="text-primary font-semibold">{date}</span>
          </div>
          {validUntilOrDueDate && !isReceipt && (
            <div className="text-[11px] text-secondary font-medium mt-0.5">
              {isQuotation ? 'Valid Until: ' : 'Due Date: '}
              <span className="text-primary font-semibold">{validUntilOrDueDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* COMPANY + CLIENT INFORMATION (TWO-COLUMN BLOCK) */}
      {!isReceipt && (
        <div className="mt-3.5 grid grid-cols-2 gap-3 text-[11px]">
          {/* Supplier Box */}
          <div className="border border-line rounded-xs p-2.5 bg-white flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold text-brand uppercase tracking-wider mb-1">
                From / Supplier
              </div>
              <div className="font-bold text-primary text-xs mb-0.5">{company.companyName}</div>
              <div className="text-secondary leading-snug">{company.address}</div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-line text-[10px] text-secondary space-y-0.5">
              {company.gstin && <div>GSTIN: <b className="text-primary font-mono">{company.gstin}</b></div>}
              {company.pan && <div>PAN: <b className="text-primary font-mono">{company.pan}</b></div>}
              <div>Email: <b className="text-primary">{company.email}</b> | Phone: <b className="text-primary">{company.phone}</b></div>
            </div>
          </div>

          {/* Client Box */}
          <div className="border border-line rounded-xs p-2.5 bg-white flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold text-brand uppercase tracking-wider mb-1">
                {isQuotation ? 'Quotation For' : 'Bill To'}
              </div>
              <div className="font-bold text-primary text-xs mb-0.5">
                {client.companyName || '[Client / Company Name]'}
              </div>
              {client.contactPerson && (
                <div className="text-[10.5px] font-medium text-secondary">
                  Attn: {client.contactPerson}
                </div>
              )}
              <div className="text-secondary leading-snug mt-0.5">
                {client.billingAddress ? `${client.billingAddress}, ${client.city} ${client.state}` : '[Billing Address]'}
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-line text-[10px] text-secondary space-y-0.5">
              {client.gstin && <div>GSTIN: <b className="text-primary font-mono">{client.gstin}</b></div>}
              {client.stateCode && <div>State Code: <b className="text-primary font-mono">{client.stateCode}</b></div>}
              {client.placeOfSupply && <div>Place of Supply: <b className="text-primary">{client.placeOfSupply}</b></div>}
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT RECEIPT SPECIFIC DESIGN */}
      {isReceipt && (
        <div className="mt-3.5 space-y-3">
          {/* Prominent Amount Received Card */}
          <div className="border border-line rounded-xs p-3.5 bg-page flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-brand">
                Payment Status
              </div>
              <div className="text-sm font-bold text-primary mt-0.5">
                {receiptDetails?.paymentStatus || 'Paid in Full'}
              </div>
              <div className="text-[11px] text-secondary mt-1">
                Payment Mode: <b className="text-primary">{receiptDetails?.paymentMethod || 'UPI'}</b>
                {receiptDetails?.transactionReference && (
                  <span> | Txn Ref: <b className="text-primary font-mono">{receiptDetails.transactionReference}</b></span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider font-bold text-secondary">
                Amount Received
              </div>
              <div className="text-2xl font-bold text-brand mt-0.5">
                {formatCurrency(receiptDetails?.amountReceived || tax.grandTotal)}
              </div>
            </div>
          </div>

          {/* Two-Column Address & Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="border border-line rounded-xs p-2.5 bg-white">
              <div className="text-[10px] font-bold text-secondary uppercase tracking-wider">Received From</div>
              <div className="text-xs font-bold text-primary mt-1">{receiptDetails?.receivedFrom || client.companyName || '[Client Name]'}</div>
              <div className="text-secondary text-[11px] mt-0.5">{client.billingAddress}</div>
            </div>

            <div className="border border-line rounded-xs p-2.5 bg-white space-y-1 text-[11px]">
              <div><span className="text-secondary">Invoice Ref:</span> <b className="text-primary font-mono">{receiptDetails?.invoiceReference || '—'}</b></div>
              <div><span className="text-secondary">Payment Purpose:</span> <b className="text-primary">{receiptDetails?.projectPurpose || 'Software Development Services'}</b></div>
              <div><span className="text-secondary">Invoice Total:</span> <b className="text-primary">{formatCurrency(receiptDetails?.invoiceTotal || tax.grandTotal)}</b></div>
              <div><span className="text-secondary">Balance Due:</span> <b className="text-primary">{formatCurrency(receiptDetails?.balanceDue || 0)}</b></div>
            </div>
          </div>
        </div>
      )}

      {/* ITEM TABLE FOR QUOTATION & INVOICE */}
      {!isReceipt && (
        <div className="mt-3.5 overflow-hidden border border-line rounded-xs">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-brand text-white text-left font-semibold text-[11px]">
                <th className="py-2 px-2 text-center w-[6%] border-r border-brand-700">S#</th>
                <th className="py-2 px-2 border-r border-brand-700">Description</th>
                {isInvoice && <th className="py-2 px-2 text-center w-[12%] border-r border-brand-700">SAC/HSN</th>}
                <th className="py-2 px-2 text-center w-[8%] border-r border-brand-700">Qty</th>
                <th className="py-2 px-2 text-right w-[16%] border-r border-brand-700">Rate</th>
                <th className="py-2 px-2 text-right w-[18%]">
                  {isInvoice ? 'Taxable Value' : 'Amount'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-[11px]">
              {items.map((item, index) => (
                <tr key={item.id || index} className="break-inside-avoid">
                  <td className="py-2 px-2 text-center align-top font-medium text-secondary border-r border-line">
                    {index + 1}
                  </td>
                  <td className="py-2 px-2 align-top border-r border-line">
                    <div className="font-semibold text-primary leading-snug">{item.description}</div>
                    {item.isIncluded && (
                      <span className="text-[9.5px] text-secondary font-medium block mt-0.5">
                        Included with package
                      </span>
                    )}
                  </td>
                  {isInvoice && (
                    <td className="py-2 px-2 text-center align-top border-r border-line text-secondary font-mono">
                      {item.sacHsn || '—'}
                    </td>
                  )}
                  <td className="py-2 px-2 text-center align-top border-r border-line text-secondary">
                    {item.isIncluded ? '—' : item.quantity}
                  </td>
                  <td className="py-2 px-2 text-right align-top border-r border-line text-secondary">
                    {item.isIncluded ? '—' : formatCurrency(item.rate)}
                  </td>
                  <td className="py-2 px-2 text-right align-top font-semibold text-primary">
                    {item.isIncluded ? (
                      <span className="text-secondary font-normal">Included</span>
                    ) : (
                      formatCurrency(item.taxableValue || item.amount)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUMMARY TOTALS SECTION */}
      {!isReceipt && (
        <div className="flex justify-end mt-3 break-inside-avoid">
          <table className="w-[280px] text-xs border-collapse">
            <tbody className="text-[11px]">
              <tr>
                <td className="py-1 px-2 border-b border-line text-secondary font-medium">Taxable Subtotal</td>
                <td className="py-1 px-2 border-b border-line text-right font-semibold text-primary">
                  {formatCurrency(tax.taxableValueTotal)}
                </td>
              </tr>

              {tax.taxType === 'cgst_sgst' && (
                <>
                  <tr>
                    <td className="py-1 px-2 border-b border-line text-secondary font-medium">
                      CGST ({tax.cgstPercent}%)
                    </td>
                    <td className="py-1 px-2 border-b border-line text-right font-semibold text-primary">
                      {formatCurrency(tax.cgstAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 border-b border-line text-secondary font-medium">
                      SGST ({tax.sgstPercent}%)
                    </td>
                    <td className="py-1 px-2 border-b border-line text-right font-semibold text-primary">
                      {formatCurrency(tax.sgstAmount)}
                    </td>
                  </tr>
                </>
              )}

              {tax.taxType === 'igst' && (
                <tr>
                  <td className="py-1 px-2 border-b border-line text-secondary font-medium">
                    IGST ({tax.igstPercent}%)
                  </td>
                  <td className="py-1 px-2 border-b border-line text-right font-semibold text-primary">
                    {formatCurrency(tax.igstAmount)}
                  </td>
                </tr>
              )}

              {tax.roundOff !== 0 && (
                <tr>
                  <td className="py-1 px-2 border-b border-line text-secondary font-medium">Round Off</td>
                  <td className="py-1 px-2 border-b border-line text-right font-semibold text-primary">
                    {formatCurrency(tax.roundOff)}
                  </td>
                </tr>
              )}

              <tr className="border-t-2 border-b-2 border-brand font-bold text-xs">
                <td className="py-1.5 px-2 text-primary uppercase">Grand Total</td>
                <td className="py-1.5 px-2 text-right text-brand font-bold text-sm">
                  {formatCurrency(tax.grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* AMOUNT IN WORDS */}
      <div className="mt-3 p-2 bg-page border-l-2 border-brand text-[11px] rounded-r-xs break-inside-avoid">
        <span className="font-semibold text-secondary">Amount in Words:</span>{' '}
        <span className="font-semibold text-primary">
          {numberToWords(isReceipt ? receiptDetails?.amountReceived || 0 : tax.grandTotal)}
        </span>
      </div>

      {/* PAYMENT SPLIT BREAKDOWN (FOR QUOTATION) */}
      {isQuotation && paymentTerms && (
        <div className="mt-3 p-2.5 bg-page border border-line rounded-xs text-[11px] break-inside-avoid">
          <div className="font-bold text-primary uppercase text-[10px] tracking-wider mb-1">
            Payment Milestones
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-secondary">Advance ({paymentTerms.advancePercentage}%):</span>{' '}
              <b className="text-brand">{formatCurrency(paymentTerms.advanceAmount)}</b>
            </div>
            <div>
              <span className="text-secondary">Balance ({paymentTerms.balancePercentage}%):</span>{' '}
              <b className="text-primary">{formatCurrency(paymentTerms.balanceAmount)}</b>
            </div>
          </div>
          {paymentTerms.deliveryTimelineText && (
            <div className="mt-1 text-[10.5px] text-secondary">
              <span className="font-semibold text-primary">Timeline:</span> {paymentTerms.deliveryTimelineText}
            </div>
          )}
        </div>
      )}

      {/* BANK DETAILS & TERMS */}
      <div className="grid grid-cols-2 gap-3 mt-3.5 text-[11px] break-inside-avoid">
        {/* Left: Bank / Payment Info */}
        <div>
          <div className="font-bold text-primary text-[10px] uppercase tracking-wider mb-1">
            Settlement Details
          </div>
          <div className="border border-line rounded-xs p-2.5 bg-white space-y-0.5 text-secondary leading-snug">
            <div>Account Name: <b className="text-primary">{company.accountName}</b></div>
            <div>Bank: <b className="text-primary">{company.bankName}</b></div>
            <div>Account No: <b className="font-mono text-primary">{company.accountNumber}</b></div>
            <div>IFSC Code: <b className="font-mono text-primary">{company.ifsc}</b></div>
            <div>UPI ID: <b className="text-brand font-mono">{company.upiId}</b></div>
          </div>
        </div>

        {/* Right: Terms & Conditions */}
        <div>
          <div className="font-bold text-primary text-[10px] uppercase tracking-wider mb-1">
            Terms & Conditions
          </div>
          <div className="border border-line rounded-xs p-2.5 bg-white text-[10.5px] leading-relaxed text-secondary">
            <ul className="list-disc pl-4 space-y-0.5 m-0">
              {termsAndConditions.map((term, i) => (
                <li key={i}>{term}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* NOTES (If present) */}
      {notes && (
        <div className="mt-2.5 text-[10.5px] text-secondary italic">
          <b>Note:</b> {notes}
        </div>
      )}

      {/* SIGNATURE & SEAL SECTION */}
      <div className="grid grid-cols-2 gap-8 mt-10 items-end break-inside-avoid">
        {/* Customer Signatory */}
        <div className="relative min-h-[85px] flex flex-col justify-end">
          <div className="border-t border-line pt-1.5 text-[10.5px] text-secondary font-medium">
            {customerSignatoryTitle}
          </div>
        </div>

        {/* Supplier Signatory & Seal */}
        <div className="relative min-h-[95px] flex flex-col justify-end">
          {/* Official Round Seal Image (Left-aligned, bigger size) */}
          {showSeal && (
            <div className="absolute left-0 bottom-1 w-32 h-32 pointer-events-none z-10 flex items-center justify-center">
              <img
                src={sealSrc}
                alt="Company Seal"
                className="max-w-full max-h-full object-contain opacity-95"
              />
            </div>
          )}

          {/* Official Signature Image (Right-aligned, small size) */}
          {showSignature && (
            <div className="absolute right-0 bottom-4 h-6 max-h-6.5 pointer-events-none z-10 flex items-center justify-end">
              <img
                src={signatureSrc}
                alt="Signature"
                className="h-full w-auto object-contain"
              />
            </div>
          )}

          <div className="border-t border-line pt-1.5 text-[10.5px] text-secondary font-medium relative z-20">
            For {company.companyName} — {signatoryTitle}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-6 border-t border-line pt-2 flex justify-between items-center text-[9px] text-secondary font-medium">
        <span>{company.email} · {company.phone}</span>
        <span className="font-semibold text-primary">{company.website}</span>
      </div>
    </div>
  );
};

