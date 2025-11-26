import React, { useRef } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';

interface UploaderProps {
  onImageSelected: (base64: string, mimeType: string) => void;
}

export const Uploader: React.FC<UploaderProps> = ({ onImageSelected }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const mimeType = file.type;
      onImageSelected(result, mimeType);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div 
      className="w-full max-w-2xl mx-auto border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-12 text-center hover:bg-slate-100 hover:border-[#aa4dc8]/50 transition-all duration-300 cursor-pointer"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={inputRef} 
        accept="image/png, image/jpeg, image/webp" 
        onChange={handleFileChange}
      />
      
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-[#aa4dc8]/10 rounded-full flex items-center justify-center">
          <UploadCloud className="w-8 h-8 text-[#aa4dc8]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Upload your sofa photo</h3>
          <p className="text-slate-500 mt-1 text-sm">Drag and drop or click to browse</p>
        </div>
        <div className="flex gap-2 mt-2">
           <span className="inline-flex items-center px-2 py-1 rounded bg-slate-200 text-xs text-slate-600 font-medium">JPEG</span>
           <span className="inline-flex items-center px-2 py-1 rounded bg-slate-200 text-xs text-slate-600 font-medium">PNG</span>
           <span className="inline-flex items-center px-2 py-1 rounded bg-slate-200 text-xs text-slate-600 font-medium">WEBP</span>
        </div>
      </div>
    </div>
  );
};
