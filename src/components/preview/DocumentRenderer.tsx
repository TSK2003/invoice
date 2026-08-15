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
  const customerSignatoryTitle = sigSeal?.customerSignatoryTitle || 'Customer / Authorized Representative';
  const signatoryTitle = sigSeal?.signatoryTitle || 'Authorized Signatory';

  return (
    <div
      id={containerId}
      className="a4-page bg-white text-slate-900 mx-auto relative shadow-a4 print:shadow-none box-border font-sans transition-all"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '14mm 15mm 12mm 15mm',
        boxSizing: 'border-box',
        position: 'relative',
        background: '#ffffff',
      }}
    >
      {/* HEADER SECTION ALIGNMENT (No unwanted text under logo) */}
      <div className="grid grid-cols-[1.3fr_0.9fr] gap-4 items-start border-b-2 border-navy pb-3">
        {/* Left: Official AESCION Logo graphic ONLY */}
        <div>
          <img
            src={logoSrc}
            alt="AESCION Logo"
            className="max-h-[58px] w-auto object-contain block"
          />
        </div>

        {/* Right: Document Title & Metadata */}
        <div className="text-right">
          <h1 className="m-0 text-navy font-black text-2xl tracking-widest uppercase leading-none">
            {docTitle}
          </h1>
          <div className="mt-2 text-xs font-bold text-slate-900">
            {isQuotation ? 'Ref No: ' : isInvoice ? 'Invoice No: ' : 'Receipt No: '}
            <span className="text-blue-brand font-extrabold">{documentNumber}</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-1 font-medium">
            Date: <b className="text-slate-900">{date}</b>
          </div>
          {validUntilOrDueDate && !isReceipt && (
            <div className="text-[11px] text-slate-600 font-medium mt-0.5">
              {isQuotation ? 'Valid Until: ' : 'Due Date: '}
              <b className="text-slate-900">{validUntilOrDueDate}</b>
            </div>
          )}
        </div>
      </div>

      {/* COMPANY + CLIENT INFORMATION (TWO-COLUMN BLOCK) */}
      {!isReceipt && (
        <div className="mt-3.5 grid grid-cols-2 gap-3 text-[11px]">
          {/* Supplier Box */}
          <div className="border border-line rounded-lg p-2.5 bg-white flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-extrabold text-blue-brand uppercase tracking-wider mb-1">
                From / Supplier
              </div>
              <div className="font-bold text-navy text-xs mb-0.5">{company.companyName}</div>
              <div className="text-slate-700 leading-snug">{company.address}</div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-600 space-y-0.5">
              {company.gstin && <div>GSTIN: <b className="text-slate-900">{company.gstin}</b></div>}
              {company.pan && <div>PAN: <b className="text-slate-900">{company.pan}</b></div>}
              <div>Email: <b>{company.email}</b> | Phone: <b>{company.phone}</b></div>
            </div>
          </div>

          {/* Client Box */}
          <div className="border border-line rounded-lg p-2.5 bg-white flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-extrabold text-blue-brand uppercase tracking-wider mb-1">
                {isQuotation ? 'Quotation For' : 'Bill To'}
              </div>
              <div className="font-bold text-navy text-xs mb-0.5">
                {client.companyName || '[Client / Company Name]'}
              </div>
              {client.contactPerson && (
                <div className="text-[10.5px] font-semibold text-slate-700">
                  Attn: {client.contactPerson}
                </div>
              )}
              <div className="text-slate-700 leading-snug mt-0.5">
                {client.billingAddress ? `${client.billingAddress}, ${client.city} ${client.state}` : '[Billing Address]'}
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-600 space-y-0.5">
              {client.gstin && <div>GSTIN: <b className="text-slate-900">{client.gstin}</b></div>}
              {client.stateCode && <div>State Code: <b className="text-slate-900">{client.stateCode}</b></div>}
              {client.placeOfSupply && <div>Place of Supply: <b className="text-slate-900">{client.placeOfSupply}</b></div>}
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT RECEIPT SPECIFIC DESIGN */}
      {isReceipt && (
        <div className="mt-3.5 space-y-3">
          {/* Prominent Amount Received Card */}
          <div className="border border-blue-200 rounded-xl p-3.5 bg-blue-50/60 flex items-center justify-between shadow-2xs">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-blue-brand">
                Payment Status
              </div>
              <div className="text-sm font-black text-navy mt-0.5">
                {receiptDetails?.paymentStatus || 'Paid in Full'}
              </div>
              <div className="text-[11px] text-slate-600 mt-1">
                Payment Method: <b>{receiptDetails?.paymentMethod || 'UPI'}</b>
                {receiptDetails?.transactionReference && (
                  <span> | Txn Ref: <b>{receiptDetails.transactionReference}</b></span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                Amount Received
              </div>
              <div className="text-2xl font-black text-navy mt-0.5">
                {formatCurrency(receiptDetails?.amountReceived || tax.grandTotal)}
              </div>
            </div>
          </div>

          {/* Two-Column Address & Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="border border-line rounded-lg p-2.5 bg-white">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Received From</div>
              <div className="text-xs font-bold text-navy mt-1">{receiptDetails?.receivedFrom || client.companyName || '[Client Name]'}</div>
              <div className="text-slate-600 text-[11px] mt-0.5">{client.billingAddress}</div>
            </div>

            <div className="border border-line rounded-lg p-2.5 bg-white space-y-1 text-[11px]">
              <div><span className="text-slate-500">Invoice Ref:</span> <b>{receiptDetails?.invoiceReference || '—'}</b></div>
              <div><span className="text-slate-500">Payment Purpose:</span> <b>{receiptDetails?.projectPurpose || 'Software Development'}</b></div>
              <div><span className="text-slate-500">Invoice Total:</span> <b>{formatCurrency(receiptDetails?.invoiceTotal || tax.grandTotal)}</b></div>
              <div><span className="text-slate-500">Balance Due:</span> <b className="text-emerald-700">{formatCurrency(receiptDetails?.balanceDue || 0)}</b></div>
            </div>
          </div>
        </div>
      )}

      {/* ITEM TABLE FOR QUOTATION & INVOICE */}
      {!isReceipt && (
        <div className="mt-3.5 overflow-hidden border border-slate-300 rounded-lg">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-navy text-white text-left font-bold text-[11px]">
                <th className="py-2 px-2 text-center w-[6%] border-r border-navy-700">S.No</th>
                <th className="py-2 px-2 border-r border-navy-700">Description</th>
                {isInvoice && <th className="py-2 px-2 text-center w-[12%] border-r border-navy-700">SAC/HSN</th>}
                <th className="py-2 px-2 text-center w-[8%] border-r border-navy-700">Qty</th>
                <th className="py-2 px-2 text-right w-[16%] border-r border-navy-700">Rate</th>
                <th className="py-2 px-2 text-right w-[18%]">
                  {isInvoice ? 'Taxable Value' : 'Amount'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-[11px]">
              {items.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-slate-50/60 break-inside-avoid">
                  <td className="py-2 px-2 text-center align-top font-semibold text-slate-600 border-r border-line">
                    {index + 1}
                  </td>
                  <td className="py-2 px-2 align-top border-r border-line">
                    <div className="font-semibold text-slate-900 leading-snug">{item.description}</div>
                    {item.isIncluded && (
                      <span className="inline-block mt-0.5 text-[9.5px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        INCLUDED WITH PACKAGE
                      </span>
                    )}
                  </td>
                  {isInvoice && (
                    <td className="py-2 px-2 text-center align-top border-r border-line text-slate-600 font-mono">
                      {item.sacHsn || '—'}
                    </td>
                  )}
                  <td className="py-2 px-2 text-center align-top border-r border-line font-medium">
                    {item.isIncluded ? '—' : item.quantity}
                  </td>
                  <td className="py-2 px-2 text-right align-top border-r border-line font-medium">
                    {item.isIncluded ? '—' : formatCurrency(item.rate)}
                  </td>
                  <td className="py-2 px-2 text-right align-top font-bold text-slate-900">
                    {item.isIncluded ? (
                      <span className="text-emerald-700 font-extrabold">Included</span>
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
          <table className="w-[300px] text-xs border-collapse">
            <tbody className="text-[11px]">
              <tr>
                <td className="py-1 px-2 border-b border-line text-slate-600 font-medium">Taxable Subtotal</td>
                <td className="py-1 px-2 border-b border-line text-right font-bold text-slate-900">
                  {formatCurrency(tax.taxableValueTotal)}
                </td>
              </tr>

              {tax.taxType === 'cgst_sgst' && (
                <>
                  <tr>
                    <td className="py-1 px-2 border-b border-line text-slate-600 font-medium">
                      CGST ({tax.cgstPercent}%)
                    </td>
                    <td className="py-1 px-2 border-b border-line text-right font-bold text-slate-900">
                      {formatCurrency(tax.cgstAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 border-b border-line text-slate-600 font-medium">
                      SGST ({tax.sgstPercent}%)
                    </td>
                    <td className="py-1 px-2 border-b border-line text-right font-bold text-slate-900">
                      {formatCurrency(tax.sgstAmount)}
                    </td>
                  </tr>
                </>
              )}

              {tax.taxType === 'igst' && (
                <tr>
                  <td className="py-1 px-2 border-b border-line text-slate-600 font-medium">
                    IGST ({tax.igstPercent}%)
                  </td>
                  <td className="py-1 px-2 border-b border-line text-right font-bold text-slate-900">
                    {formatCurrency(tax.igstAmount)}
                  </td>
                </tr>
              )}

              {tax.roundOff !== 0 && (
                <tr>
                  <td className="py-1 px-2 border-b border-line text-slate-600 font-medium">Round Off</td>
                  <td className="py-1 px-2 border-b border-line text-right font-bold text-slate-900">
                    {formatCurrency(tax.roundOff)}
                  </td>
                </tr>
              )}

              <tr className="bg-blue-50 border-t-2 border-blue-brand font-black text-sm">
                <td className="py-1.5 px-2 text-navy">Grand Total</td>
                <td className="py-1.5 px-2 text-right text-navy font-black">
                  {formatCurrency(tax.grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* AMOUNT IN WORDS */}
      <div className="mt-3 p-2 bg-soft border-l-4 border-orange-brand text-[11px] rounded-r-md break-inside-avoid">
        <b>Amount in Words:</b>{' '}
        <span className="font-semibold text-slate-800">
          {numberToWords(isReceipt ? receiptDetails?.amountReceived || 0 : tax.grandTotal)}
        </span>
      </div>

      {/* PAYMENT SPLIT BREAKDOWN (FOR QUOTATION) */}
      {isQuotation && paymentTerms && (
        <div className="mt-3 p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-[11px] break-inside-avoid">
          <div className="font-extrabold text-navy uppercase text-[10px] tracking-wider mb-1">
            Payment Milestone Terms & Schedule
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-600">Advance ({paymentTerms.advancePercentage}%):</span>{' '}
              <b className="text-blue-brand">{formatCurrency(paymentTerms.advanceAmount)}</b>
            </div>
            <div>
              <span className="text-slate-600">Balance ({paymentTerms.balancePercentage}%):</span>{' '}
              <b className="text-navy">{formatCurrency(paymentTerms.balanceAmount)}</b>
            </div>
          </div>
          {paymentTerms.deliveryTimelineText && (
            <div className="mt-1 text-[10.5px] text-slate-600">
              <b>Timeline:</b> {paymentTerms.deliveryTimelineText}
            </div>
          )}
        </div>
      )}

      {/* BANK DETAILS & TERMS (FULLY VISIBLE TERMS WITHOUT CUT-OFFS) */}
      <div className="grid grid-cols-2 gap-3 mt-3.5 text-[11px] break-inside-avoid">
        {/* Left: Bank / Payment Info */}
        <div>
          <div className="font-extrabold text-navy text-[10px] uppercase tracking-wider mb-1">
            Payment Details
          </div>
          <div className="border border-line rounded-lg p-2.5 bg-white space-y-0.5 text-slate-700 leading-snug">
            <div>Account Name: <b>{company.accountName}</b></div>
            <div>Bank: <b>{company.bankName}</b></div>
            <div>Account No: <b className="font-mono">{company.accountNumber}</b></div>
            <div>IFSC Code: <b className="font-mono">{company.ifsc}</b></div>
            <div>UPI ID: <b className="text-blue-brand">{company.upiId}</b></div>
          </div>
        </div>

        {/* Right: Terms & Conditions (NO max-height or cut-off!) */}
        <div>
          <div className="font-extrabold text-navy text-[10px] uppercase tracking-wider mb-1">
            Terms & Conditions
          </div>
          <div className="border border-line rounded-lg p-2.5 bg-white text-[11px] leading-relaxed text-slate-700">
            <ul className="list-disc pl-4 space-y-1 m-0">
              {termsAndConditions.map((term, i) => (
                <li key={i}>{term}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* NOTES (If present) */}
      {notes && (
        <div className="mt-2.5 text-[10.5px] text-slate-600 italic">
          <b>Note:</b> {notes}
        </div>
      )}

      {/* SIGNATURE & SEAL SECTION (PERFECT ALIGNMENT, SMALL SIGNATURE, BIGGER SEAL) */}
      <div className="grid grid-cols-2 gap-8 mt-10 items-end break-inside-avoid">
        {/* Customer Signatory */}
        <div className="relative min-h-[90px] flex flex-col justify-end">
          <div className="border-t border-slate-800 pt-1.5 text-[10.5px] text-slate-700 font-semibold">
            {customerSignatoryTitle}
          </div>
        </div>

        {/* Supplier Signatory & Seal */}
        <div className="relative min-h-[90px] flex flex-col justify-end">
          {/* Official Round Seal Image (Bigger, Clean, Right-Aligned) */}
          {showSeal && (
            <div className="absolute right-0 bottom-2 w-32 h-32 pointer-events-none z-10 flex items-center justify-center">
              <img
                src={sealSrc}
                alt="Company Seal"
                className="max-w-full max-h-full object-contain drop-shadow-xs opacity-95"
              />
            </div>
          )}

          {/* Official Signature Image (Smaller, Neat, Above Line) */}
          {showSignature && (
            <div className="absolute left-0 bottom-5 h-9 max-h-10 pointer-events-none z-10">
              <img
                src={signatureSrc}
                alt="Signature"
                className="h-full w-auto object-contain"
              />
            </div>
          )}

          <div className="border-t border-slate-800 pt-1.5 text-[10.5px] text-slate-700 font-semibold relative z-20">
            For {company.companyName} — {signatoryTitle}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-6 border-t border-line pt-2 flex justify-between items-center text-[9px] text-slate-500 font-medium">
        <span>{company.email} · {company.phone}</span>
        <span className="font-bold text-navy">{company.website}</span>
      </div>
    </div>
  );
};
