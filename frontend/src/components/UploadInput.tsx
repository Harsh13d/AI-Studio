import { type ChangeEvent, type DragEvent, useRef, useState } from 'react';
import clsx from 'clsx';

type UploadInputProps = {
  onFileSelect: (file: File) => void;
  onClear: () => void;
  previewUrl: string | null;
  fileName: string | null;
  disabled?: boolean;
};

export const UploadInput = ({
  onFileSelect,
  onClear,
  previewUrl,
  fileName,
  disabled,
}: UploadInputProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be smaller than 10MB.');
      return;
    }
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      alert('Only PNG or JPEG images are supported.');
      return;
    }
    onFileSelect(file);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(event.dataTransfer.files);
  };

  const handleDrag = (event: DragEvent<HTMLLabelElement>, dragging: boolean) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(dragging);
  };

  return (
    <div>
      <label
        htmlFor="image-upload"
        className={clsx(
          'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/40 px-6 py-10 text-center transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30',
          isDragging && 'border-brand-500 bg-slate-900/80',
          disabled && 'pointer-events-none opacity-50',
        )}
        onDragEnter={(event) => handleDrag(event, true)}
        onDragOver={(event) => handleDrag(event, true)}
        onDragLeave={(event) => handleDrag(event, false)}
        onDrop={handleDrop}
        aria-disabled={disabled}
      >
        {previewUrl ? (
          <div className="w-full">
            <img
              src={previewUrl}
              alt={fileName ?? 'Uploaded outfit'}
              className="mx-auto h-48 w-full max-w-sm rounded-xl object-cover shadow-lg"
            />
            <p className="mt-4 text-sm text-slate-300">{fileName}</p>
            <button
              type="button"
              onClick={onClear}
              className="mt-3 text-sm font-medium text-rose-400 hover:text-rose-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
            >
              Remove image
            </button>
          </div>
        ) : (
          <>
            <span className="rounded-full bg-slate-800/80 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-300">
              Upload reference
            </span>
            <p className="mt-4 text-lg font-semibold text-white">
              Drop a PNG or JPEG (max 10MB)
            </p>
            <p className="mt-2 text-sm text-slate-400">or click to browse</p>
          </>
        )}

        <input
          ref={inputRef}
          id="image-upload"
          name="image-upload"
          type="file"
          accept="image/png,image/jpeg"
          className="sr-only"
          onChange={handleChange}
          disabled={disabled}
        />
      </label>
    </div>
  );
};

