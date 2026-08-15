import React from 'react';
import { SignatureSealConfig } from '../../types/document';
import { Upload, X } from 'lucide-react';

interface SignatureSealEditorProps {
  config: SignatureSealConfig;
  onChange: (config: SignatureSealConfig) => void;
}

export const SignatureSealEditor: React.FC<SignatureSealEditorProps> = ({
  config,
  onChange,
}) => {
  const handleSealImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange({
          ...config,
          sealImageUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange({
          ...config,
          signatureImageUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3.5 text-xs">
      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <label className="flex items-center gap-2.5 p-2.5 bg-surface border border-line rounded-sm cursor-pointer hover:bg-page transition-colors">
          <input
            type="checkbox"
            checked={config.showSeal}
            onChange={e => onChange({ ...config, showSeal: e.target.checked })}
            className="w-4 h-4 text-brand rounded-xs"
          />
          <div>
            <div className="font-semibold text-primary">Show Company Seal Stamp</div>
            <div className="text-[10px] text-secondary">Official stamp graphic on document</div>
          </div>
        </label>

        <label className="flex items-center gap-2.5 p-2.5 bg-surface border border-line rounded-sm cursor-pointer hover:bg-page transition-colors">
          <input
            type="checkbox"
            checked={config.showSignature}
            onChange={e => onChange({ ...config, showSignature: e.target.checked })}
            className="w-4 h-4 text-brand rounded-xs"
          />
          <div>
            <div className="font-semibold text-primary">Show Authorized Signature</div>
            <div className="text-[10px] text-secondary">Signatory line & signature graphic</div>
          </div>
        </label>
      </div>

      {/* Image Uploader Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Seal Upload */}
        <div className="bg-page border border-line p-2.5 rounded-md space-y-1.5">
          <label className="block text-[11px] font-semibold text-secondary">Company Seal Image</label>
          {config.sealImageUrl ? (
            <div className="flex items-center justify-between bg-surface p-2 border border-line rounded-sm">
              <img src={config.sealImageUrl} alt="Seal Preview" className="h-9 w-9 object-contain" />
              <button
                type="button"
                onClick={() => onChange({ ...config, sealImageUrl: undefined })}
                className="text-secondary hover:text-primary hover:bg-page px-2 py-1 rounded-xs text-[11px] font-medium transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-1.5 p-2 border border-dashed border-line rounded-sm bg-surface cursor-pointer hover:border-brand text-secondary font-medium text-[11px]">
              <Upload className="w-3.5 h-3.5 text-secondary" />
              <span>Upload Custom Seal PNG</span>
              <input type="file" accept="image/*" onChange={handleSealImageUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Signature Upload */}
        <div className="bg-page border border-line p-2.5 rounded-md space-y-1.5">
          <label className="block text-[11px] font-semibold text-secondary">Authorized Signature Image</label>
          {config.signatureImageUrl ? (
            <div className="flex items-center justify-between bg-surface p-2 border border-line rounded-sm">
              <img src={config.signatureImageUrl} alt="Signature Preview" className="h-8 max-w-[120px] object-contain" />
              <button
                type="button"
                onClick={() => onChange({ ...config, signatureImageUrl: undefined })}
                className="text-secondary hover:text-primary hover:bg-page px-2 py-1 rounded-xs text-[11px] font-medium transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-1.5 p-2 border border-dashed border-line rounded-sm bg-surface cursor-pointer hover:border-brand text-secondary font-medium text-[11px]">
              <Upload className="w-3.5 h-3.5 text-secondary" />
              <span>Upload Signature PNG</span>
              <input type="file" accept="image/*" onChange={handleSignatureImageUpload} className="hidden" />
            </label>
          )}
        </div>
      </div>

      {/* Signatory Titles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-secondary mb-1">Company Signatory Title</label>
          <input
            type="text"
            value={config.signatoryTitle}
            onChange={e => onChange({ ...config, signatoryTitle: e.target.value })}
            className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-secondary mb-1">Customer Signatory Title</label>
          <input
            type="text"
            value={config.customerSignatoryTitle}
            onChange={e => onChange({ ...config, customerSignatoryTitle: e.target.value })}
            className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
          />
        </div>
      </div>
    </div>
  );
};

