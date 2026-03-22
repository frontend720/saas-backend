import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, Check } from 'lucide-react';

export default function AssetIngester({ isOpen, onClose, activeCapsuleId }) {
  const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'uploading' | 'processing' | 'success' | 'error'

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setUploadState('uploading');

      // STEP 1: Get the pre-signed URL from your Express backend
      // -> GET /api/projects/:id/assets/presign?filename=jacket.jpg&type=image/jpeg
      const presignRes = await fetch(`/api/projects/${activeCapsuleId}/assets/presign?filename=${file.name}&type=${file.type}`);
      const { data: { uploadUrl, storageKey } } = await presignRes.json();

      // STEP 2: Push the binary directly to AWS S3 (Bypassing Express entirely)
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      setUploadState('processing');

      // STEP 3: Tell Express the file is in S3. 
      // Express creates the Asset document and triggers the VertexAI background worker.
      // -> POST /api/projects/:id/assets
      await fetch(`/api/projects/${activeCapsuleId}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          storageKey: storageKey, // The exact location in the bucket
        }),
      });

      setUploadState('success');
      
      // Reset after a brief pause so they can see the success state
      setTimeout(() => {
        setUploadState('idle');
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Ingestion pipeline failed:', error);
      setUploadState('error');
    }
  }, [activeCapsuleId, onClose]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/heic': [] },
    maxFiles: 1
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-index-slate/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white border-2 border-index-slate shadow-brutal w-full max-w-lg flex flex-col">
        
        {/* Header */}
        <div className="border-b border-index-slate p-4 flex justify-between items-center bg-index-bone">
          <span className="font-mono text-sm uppercase font-bold text-index-slate">
            [ Asset_Ingestion_Protocol ]
          </span>
          <button onClick={onClose} className="text-index-slate hover:text-index-orange font-mono font-bold">
            X
          </button>
        </div>

        {/* Dropzone Area */}
        <div className="p-8">
          <div 
            {...getRootProps()} 
            className={`
              border-2 border-dashed p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors h-64
              ${isDragActive ? 'border-index-orange bg-index-orange/5' : 'border-index-slate/30 hover:border-index-orange hover:bg-index-bone'}
              ${uploadState !== 'idle' ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {uploadState === 'idle' && (
              <>
                <UploadCloud className="text-index-slate mb-4" size={48} />
                <p className="font-bold uppercase text-index-slate mb-2">Drop Garment Image</p>
                <p className="font-mono text-xs text-index-slate/60">JPEG, PNG, HEIC up to 15MB</p>
              </>
            )}

            {uploadState === 'uploading' && (
              <div className="flex flex-col items-center text-index-orange">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="font-mono text-xs font-bold uppercase">Transmitting to Storage...</p>
              </div>
            )}

            {uploadState === 'processing' && (
              <div className="flex flex-col items-center text-index-slate">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="font-mono text-xs font-bold uppercase">AI Background Extraction Running...</p>
              </div>
            )}

            {uploadState === 'success' && (
              <div className="flex flex-col items-center text-[#00A36C]">
                <Check className="mb-4" size={48} />
                <p className="font-mono text-xs font-bold uppercase">Asset Logged & Scrubbed</p>
              </div>
            )}
            
            {uploadState === 'error' && (
              <div className="flex flex-col items-center text-red-600">
                <span className="font-mono text-4xl mb-4">!</span>
                <p className="font-mono text-xs font-bold uppercase">Pipeline Failure. Check Console.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}