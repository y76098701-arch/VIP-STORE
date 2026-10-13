'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguageContext } from '@/contexts/LanguageContext';

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  preview?: string | null;
  error?: string | null;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = 'image/*',
  maxSizeMB = 5,
  preview,
  error,
  className,
}) => {
  const { t } = useLanguageContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const displayPreview = localPreview || preview;
  const displayError = error || internalError;

  const validateAndSelectFile = (file: File) => {
    setInternalError(null);

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setInternalError(`${t('fileTooLarge')} (Max ${maxSizeMB}MB)`);
      return;
    }

    // Validate type if accept is image/*
    if (accept === 'image/*' && !file.type.startsWith('image/')) {
      setInternalError(t('invalidFile'));
      return;
    }

    // Set preview
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const handleClearPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalPreview(null);
    setInternalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('w-full flex flex-col space-y-2', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {displayPreview ? (
        <div className="relative w-full rounded-xl border border-vip-border bg-vip-card overflow-hidden group">
          <div className="aspect-video w-full max-h-64 flex items-center justify-center bg-black/40 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayPreview}
              alt="Receipt preview"
              className="max-h-60 max-w-full rounded-lg object-contain shadow-lg"
            />
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearPreview}
              className="p-1.5 rounded-full bg-red-600/80 text-white hover:bg-red-600 transition-colors shadow-lg backdrop-blur-sm"
              title="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-vip-card/90 border-t border-vip-border flex justify-between items-center text-xs text-vip-text-secondary">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-vip-purple" />
              <span>{t('receiptUploaded')}</span>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-vip-purple-light hover:underline font-medium"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 bg-vip-card/40',
            isDragging
              ? 'border-vip-purple bg-vip-purple/10 scale-[1.01]'
              : 'border-vip-border hover:border-vip-purple/50 hover:bg-vip-card-hover',
            displayError && 'border-red-500/50 bg-red-950/10'
          )}
        >
          <div className="w-14 h-14 rounded-full bg-vip-purple/10 border border-vip-purple/20 flex items-center justify-center mb-4 text-vip-purple-light shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>

          <p className="text-sm font-semibold text-vip-text-primary mb-1 text-center">
            {t('uploadReceipt')}
          </p>
          <p className="text-xs text-vip-text-secondary text-center max-w-xs mb-3">
            {t('uploadReceiptDesc')}
          </p>

          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-medium bg-vip-bg border border-vip-border text-vip-text-muted">
            Max {maxSizeMB}MB (JPG, PNG, WebP)
          </span>
        </div>
      )}

      {displayError && (
        <p className="text-xs text-red-400 font-medium animate-fade-in">
          {displayError}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
