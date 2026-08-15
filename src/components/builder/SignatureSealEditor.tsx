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
    <div className="space-y-4 text-xs">
      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
          <input
            type="checkbox"
            checked={config.showSeal}
            onChange={e => onChange({ ...config, showSeal: e.target.checked })}
            className="w-4 h-4 text-blue-brand rounded focus:ring-blue-brand"
          />
          <div>
            <div className="font-bold text-slate-800">Show Company Seal</div>
            <div className="text-[10px] text-slate-500">Official stamp graphic on document</div>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
          <input
            type="checkbox"
            checked={config.showSignature}
            onChange={e => onChange({ ...config, showSignature: e.target.checked })}
            className="w-4 h-4 text-blue-brand rounded focus:ring-blue-brand"
          />
          <div>
            <div className="font-bold text-slate-800">Show Authorized Signature</div>
            <div className="text-[10px] text-slate-500">Signatory line & signature graphic</div>
          </div>
        </label>
      </div>

      {/* Image Uploader Fields with Clean Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Seal Upload */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1.5">
          <label className="block font-bold text-slate-700">Company Seal Image</label>
          {config.sealImageUrl ? (
            <div className="flex items-center justify-between bg-white p-2 border border-slate-200 rounded-lg">
              <img src={config.sealImageUrl} alt="Seal Preview" className="h-9 w-9 object-contain" />
              <button
                type="button"
                onClick={() => onChange({ ...config, sealImageUrl: undefined })}
                className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded text-[11px] font-bold transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 p-2 border-2 border-dashed border-slate-300 rounded-lg bg-white cursor-pointer hover:border-blue-brand text-slate-600 font-semibold text-[11px]">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Upload Custom Seal PNG</span>
              <input type="file" accept="image/*" onChange={handleSealImageUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Signature Upload */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1.5">
          <label className="block font-bold text-slate-700">Authorized Signature Image</label>
          {config.signatureImageUrl ? (
            <div className="flex items-center justify-between bg-white p-2 border border-slate-200 rounded-lg">
              <img src={config.signatureImageUrl} alt="Signature Preview" className="h-8 max-w-[120px] object-contain" />
              <button
                type="button"
                onClick={() => onChange({ ...config, signatureImageUrl: undefined })}
                className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded text-[11px] font-bold transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 p-2 border-2 border-dashed border-slate-300 rounded-lg bg-white cursor-pointer hover:border-blue-brand text-slate-600 font-semibold text-[11px]">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Upload Signature PNG</span>
              <input type="file" accept="image/*" onChange={handleSignatureImageUpload} className="hidden" />
            </label>
          )}
        </div>
      </div>

      {/* Signatory Titles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Company Signatory Title</label>
          <input
            type="text"
            value={config.signatoryTitle}
            onChange={e => onChange({ ...config, signatoryTitle: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-brand/30"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Customer Signatory Title</label>
          <input
            type="text"
            value={config.customerSignatoryTitle}
            onChange={e => onChange({ ...config, customerSignatoryTitle: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-brand/30"
          />
        </div>
      </div>
    </div>
  );
};
