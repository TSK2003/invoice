import React from 'react';
import { DocumentData } from '../../types/document';
import { formatCurrency } from '../../utils/currency';
import { numberToWords } from '../../utils/numberToWords';
import { LOGO_BASE64, SEAL_BASE64, SIGNATURE_BASE64 } from '../../constants/imageAssets';

interface PaymentReceiptDocumentProps {
  data: DocumentData;
  containerId?: string;
}

export const PaymentReceiptDocument: React.FC<PaymentReceiptDocumentProps> = ({
  data,
  containerId = 'payment-receipt-document-canvas',
}) => {
  const {
    documentNumber,
    date,
    client,
    company,
    tax,
    receiptDetails,
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

  const amountReceived = receiptDetails?.amountReceived ?? tax?.grandTotal ?? 0;
  const invoiceTotal = receiptDetails?.invoiceTotal ?? tax?.grandTotal ?? amountReceived;
  const balanceDue = receiptDetails?.balanceDue ?? Math.max(0, invoiceTotal - amountReceived);
  const paymentMethod = receiptDetails?.paymentMethod || 'UPI';
  const txnRef = receiptDetails?.transactionReference || '—';
  const invoiceRef = receiptDetails?.invoiceReference || data.documentNumber;
  const purpose = receiptDetails?.projectPurpose || 'Software & Web Application Development Services';
  const paymentStatus = receiptDetails?.paymentStatus || (balanceDue === 0 ? 'Paid in Full' : 'Partial Payment');
  const payerName = receiptDetails?.receivedFrom || client.companyName || '[Client / Payer Name]';

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
              PAYMENT RECEIPT
            </h1>
            <div className="mt-1.5 text-xs font-semibold text-primary">
              Receipt No:{' '}
              <span className="text-brand font-bold font-mono text-[12.5px]">{documentNumber}</span>
            </div>
            <div className="text-[11px] text-secondary mt-0.5 font-medium">
              Receipt Date: <span className="text-primary font-semibold">{date}</span>
            </div>
            <div className="text-[10.5px] text-brand font-semibold mt-0.5 tracking-wide">
              OFFICIAL PAYMENT ACKNOWLEDGEMENT
            </div>
          </div>
        </div>

        {/* PARTIES INFORMATION (TWO-COLUMN BLOCK) */}
        <div className="mt-2.5 grid grid-cols-2 gap-3 text-[11px] break-inside-avoid">
          {/* Issued By Box */}
          <div className="border border-line rounded-xs p-2 bg-white flex flex-col justify-between">
            <div>
              <div className="text-[9.5px] font-bold text-brand uppercase tracking-wider mb-0.5">
                Issued By / Payee
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
              <div>
                Email: <b className="text-primary">{company.email}</b> | Phone:{' '}
                <b className="text-primary">{company.phone}</b>
              </div>
            </div>
          </div>

          {/* Received From Box */}
          <div className="border border-line rounded-xs p-2 bg-white flex flex-col justify-between">
            <div>
              <div className="text-[9.5px] font-bold text-brand uppercase tracking-wider mb-0.5">
                Received With Thanks From
              </div>
              <div className="font-bold text-primary text-xs mb-0.5">{payerName}</div>
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
              {client.email && (
                <div>
                  Email: <b className="text-primary">{client.email}</b>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PROMINENT AMOUNT RECEIVED VOUCHER BOX */}
        <div className="mt-3 border-2 border-brand/20 bg-brand-tint/40 rounded-sm p-3.5 break-inside-avoid">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand/20 pb-2.5">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                Amount Received
              </div>
              <div className="text-2xl font-black text-brand font-mono mt-0.5">
                {formatCurrency(amountReceived)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-xs text-[11px] font-bold bg-brand text-white tracking-wide uppercase">
                {paymentStatus}
              </span>
            </div>
          </div>

          <div className="pt-2 text-[10.5px] text-secondary leading-relaxed">
            Amount in Words:{' '}
            <b className="text-primary font-semibold">{numberToWords(amountReceived)}</b>
          </div>
        </div>

        {/* TRANSACTION META DETAILS GRID */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[10.5px] break-inside-avoid">
          <div className="border border-line rounded-xs p-2 bg-page/40">
            <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">
              Payment Mode
            </div>
            <div className="font-bold text-primary text-xs mt-0.5">{paymentMethod}</div>
          </div>

          <div className="border border-line rounded-xs p-2 bg-page/40">
            <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">
              Transaction / UTR Ref
            </div>
            <div className="font-bold font-mono text-primary text-[11px] mt-0.5 truncate" title={txnRef}>
              {txnRef}
            </div>
          </div>

          <div className="border border-line rounded-xs p-2 bg-page/40">
            <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">
              Against Invoice Ref
            </div>
            <div className="font-bold font-mono text-brand text-[11px] mt-0.5 truncate" title={invoiceRef}>
              {invoiceRef}
            </div>
          </div>

          <div className="border border-line rounded-xs p-2 bg-page/40">
            <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">
              Payment Towards
            </div>
            <div className="font-semibold text-primary text-[10.5px] mt-0.5 truncate" title={purpose}>
              {purpose}
            </div>
          </div>
        </div>

        {/* FINANCIAL STATEMENT / BALANCE TABLE */}
        <div className="mt-3 break-inside-avoid">
          <table className="w-full text-left text-[11px] border-collapse border border-line">
            <thead>
              <tr className="bg-brand text-white text-[10px] uppercase font-bold tracking-wider">
                <th className="py-1.5 px-3 border-r border-brand-hover w-[50%]">Description</th>
                <th className="py-1.5 px-3 text-right w-[50%]">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-primary">
              <tr>
                <td className="py-2 px-3 border-r border-line font-medium text-secondary">
                  Total Invoice / Billed Value
                </td>
                <td className="py-2 px-3 text-right font-mono font-semibold text-primary">
                  {formatCurrency(invoiceTotal)}
                </td>
              </tr>
              <tr className="bg-brand-tint/20">
                <td className="py-2 px-3 border-r border-line font-bold text-brand">
                  Amount Received in this Receipt
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-brand text-xs">
                  {formatCurrency(amountReceived)}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 border-r border-line font-medium text-secondary">
                  Remaining Balance Due
                </td>
                <td className="py-2 px-3 text-right font-mono font-semibold text-primary">
                  {formatCurrency(balanceDue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BANK DETAILS & RECEIPT TERMS */}
        <div className="grid grid-cols-2 gap-3 mt-3 text-[10px] break-inside-avoid">
          {/* Left: Deposited Into Details */}
          <div>
            <div className="font-bold text-primary text-[9.5px] uppercase tracking-wider mb-0.5">
              Deposited Into / Account Details
            </div>
            <div className="border border-line rounded-xs p-2 bg-white space-y-0.5 text-secondary leading-tight text-[9.5px]">
              <div>
                Account Name: <b className="text-primary">{company.accountName}</b>
              </div>
              <div>
                Bank: <b className="text-primary">{company.bankName}</b>
              </div>
              <div>
                Account No: <b className="font-mono text-primary">{company.accountNumber}</b>
              </div>
              <div>
                IFSC Code: <b className="font-mono text-primary">{company.ifsc}</b>
              </div>
              <div>
                UPI ID: <b className="text-brand font-mono">{company.upiId}</b>
              </div>
            </div>
          </div>

          {/* Right: Receipt Terms */}
          <div>
            <div className="font-bold text-primary text-[9.5px] uppercase tracking-wider mb-0.5">
              Receipt Terms & Conditions
            </div>
            <div className="border border-line rounded-xs p-2 bg-white text-[9.5px] leading-relaxed text-secondary">
              <ul className="list-disc pl-3.5 space-y-0.5 m-0">
                {termsAndConditions && termsAndConditions.length > 0 ? (
                  termsAndConditions.slice(0, 3).map((term, i) => <li key={i}>{term}</li>)
                ) : (
                  <>
                    <li>This is an electronically generated receipt for payment received.</li>
                    <li>Subject to realization of funds in case of Cheque / Online Transfer.</li>
                    <li>Thank you for your business with AESCION EDTECH SOLUTIONS.</li>
                  </>
                )}
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
          {/* Verification Note */}
          <div className="text-[9.5px] text-secondary leading-tight pb-1">
            <p className="font-medium">Payment received and verified successfully.</p>
            <p className="text-[8.5px] text-muted mt-0.5">
              This is a computer-generated payment receipt.
            </p>
          </div>

          {/* Supplier Signatory & Seal: Much Bigger Seal with Signature positioned closely beside/over */}
          <div className="relative min-h-[95px] flex flex-col justify-end">
            <div className="relative flex items-center justify-end pr-1 pb-1 h-[85px]">
              {/* Significantly Bigger Official Round Seal */}
              {showSeal && (
                <div className="pointer-events-none z-10 flex items-center justify-center w-[190px] h-[190px] relative -bottom-2">
                  <img
                    src={sealSrc}
                    alt="Company Seal"
                    className="max-w-full max-h-full object-contain opacity-90 mix-blend-multiply"
                    loading="eager"
                  />
                </div>
              )}

              {/* Official Signature Image moved closer to Seal */}
              {showSignature && (
                <div className="pointer-events-none z-20 flex items-center justify-center h-[42px] w-auto relative bottom-0 -ml-6">
                  <img
                    src={signatureSrc}
                    alt="Signature"
                    className="h-full w-auto object-contain max-w-[145px]"
                    loading="eager"
                  />
                </div>
              )}
            </div>

            <div className="border-t border-line pt-1 text-[9.5px] text-secondary font-medium relative z-30 text-right">
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
