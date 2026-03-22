import { useState, useRef, useCallback } from 'react';
import { UploadCloud, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AssetIngester({ isOpen, onClose, activeCapsuleId, onSuccess }) {
  const { token } = useAuth();
  const [uploadState, setUploadState] = useState('idle'); // idle | uploading | processing | success | error
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;

    try {
      setUploadState('uploading');

      // Step 1: Upload the file to backend storage
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/uploads', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error?.message || 'Upload failed');
      }

      const { data: fileData } = await uploadRes.json();

      setUploadState('processing');

      // Step 2: Register the asset record in the database
      const registerRes = await fetch(`/api/projects/${activeCapsuleId}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: fileData.filename,
          originalName: fileData.originalName,
          mimeType: fileData.mimeType,
          type: fileData.type,
          size: fileData.size,
          storageKey: fileData.storageKey,
          url: fileData.url,
        }),
      });

      if (!registerRes.ok) {
        const err = await registerRes.json();
        throw new Error(err.error?.message || 'Registration failed');
      }

      setUploadState('success');
      onSuccess?.();

      setTimeout(() => {
        setUploadState('idle');
        onClose();
      }, 1200);

    } catch (error) {
      console.error('Ingestion pipeline failed:', error);
      setUploadState('error');
    }
  }, [activeCapsuleId, token, onClose, onSuccess]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (uploadState !== 'idle') return;
    handleFile(e.dataTransfer.files[0]);
  }, [uploadState, handleFile]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#111111]/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white border-2 border-[#111111] shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] w-full max-w-lg flex flex-col">

        {/* Header */}
        <div className="border-b border-[#111111] p-4 flex justify-between items-center bg-[#F9F9F9]">
          <span className="font-mono text-sm uppercase font-bold text-[#111111]">
            [ Asset_Ingestion_Protocol ]
          </span>
          <button onClick={onClose} className="text-[#111111] hover:text-[#FF4500] font-mono font-bold">
            X
          </button>
        </div>

        {/* Drop zone */}
        <div className="p-8">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={onDrop}
            onClick={() => uploadState === 'idle' && inputRef.current?.click()}
            className={`
              border-2 border-dashed p-12 flex flex-col items-center justify-center text-center h-64 transition-colors
              ${uploadState === 'idle' ? 'cursor-pointer' : 'pointer-events-none'}
              ${isDragActive ? 'border-[#FF4500] bg-[#FF4500]/5' : 'border-[#111111]/30 hover:border-[#FF4500] hover:bg-[#F9F9F9]'}
            `}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="image/*,video/*,audio/*,application/pdf"
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {uploadState === 'idle' && (
              <>
                <UploadCloud className="text-[#111111] mb-4" size={48} />
                <p className="font-bold uppercase text-[#111111] mb-2">Drop File or Click to Browse</p>
                <p className="font-mono text-xs text-[#111111]/60">Images, Video, Audio, PDF</p>
              </>
            )}

            {uploadState === 'uploading' && (
              <div className="flex flex-col items-center text-[#FF4500]">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="font-mono text-xs font-bold uppercase">Transmitting to Storage...</p>
              </div>
            )}

            {uploadState === 'processing' && (
              <div className="flex flex-col items-center text-[#111111]">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="font-mono text-xs font-bold uppercase">Registering Asset...</p>
              </div>
            )}

            {uploadState === 'success' && (
              <div className="flex flex-col items-center text-[#00A36C]">
                <Check className="mb-4" size={48} />
                <p className="font-mono text-xs font-bold uppercase">Asset Logged</p>
              </div>
            )}

            {uploadState === 'error' && (
              <div className="flex flex-col items-center text-red-600">
                <span className="font-mono text-4xl mb-4">!</span>
                <p className="font-mono text-xs font-bold uppercase">Pipeline Failure. Check Console.</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setUploadState('idle'); }}
                  className="mt-3 font-mono text-xs underline pointer-events-auto"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
