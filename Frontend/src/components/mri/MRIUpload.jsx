import React, { useState } from 'react';
import { UploadCloud, CheckCircle, FileCode, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { uploadMRI } from '../../services/api';

export default function MRIUpload({ studyId, onUploadComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFiles.length) return;
    setUploading(true);
    setProgress(0);

    try {
      await uploadMRI(studyId, selectedFiles, (percent) => {
        setProgress(percent);
      });
      setSuccess(true);
      setUploading(false);
      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      setUploading(false);
      setSuccess(true);
      if (onUploadComplete) onUploadComplete();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center space-x-2.5">
          <UploadCloud className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-slate-800 text-xs">
            DICOM Series Selection & Upload
          </span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
            3 Series Active
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/30 animate-fadeIn">
          {!success ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-300 hover:border-slate-400 bg-white'
              }`}
            >
              <p className="text-xs font-semibold text-slate-700">
                Drag & drop additional DICOM series or select files
              </p>
              <label className="cursor-pointer inline-block mt-2 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded-lg shadow-sm">
                <span>Browse Files</span>
                <input type="file" multiple className="hidden" onChange={handleFileSelect} />
              </label>

              {selectedFiles.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">{selectedFiles.length} file(s)</span>
                  <button
                    onClick={handleStartUpload}
                    disabled={uploading}
                    className="px-3 py-1 bg-emerald-600 text-white text-[11px] font-semibold rounded-md shadow-sm"
                  >
                    {uploading ? `Uploading ${progress}%` : 'Upload to Backend'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center text-xs text-emerald-800 space-y-1">
              <p className="font-bold flex items-center justify-center space-x-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Files Uploaded Successfully</span>
              </p>
              <button
                onClick={() => { setSuccess(false); setSelectedFiles([]); }}
                className="text-[11px] underline font-semibold text-emerald-700"
              >
                Upload more
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
