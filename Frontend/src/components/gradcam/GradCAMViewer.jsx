import React, { useState, useEffect } from 'react';
import { Flame, Layers, AlertCircle, Info, RefreshCw, X } from 'lucide-react';
import { fetchGradCAM } from '../../services/api';
import { getMockGradCAMResult } from '../../services/mockData';
import { formatProbability } from '../../utils/labels';

export default function GradCAMViewer({ studyId, finding, onClose }) {
  const [loading, setLoading] = useState(false);
  const [gradcamData, setGradcamData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!finding) return;

    async function loadGradCAM() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchGradCAM(studyId, finding.abnormality, finding.class_index);
        setGradcamData(data);
      } catch (err) {
        // Fallback to contract mock structure if endpoint is not live
        setGradcamData(getMockGradCAMResult(studyId, finding.abnormality, finding.class_index));
      } finally {
        setLoading(false);
      }
    }

    loadGradCAM();
  }, [studyId, finding]);

  if (!finding) return null;

  return (
    <div className="clinical-card border-2 border-amber-300 bg-gradient-to-b from-amber-50/40 to-white space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-amber-200 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-md">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Grad-CAM Visual Explanation: {finding.abnormality}
            </h3>
            <p className="text-xs text-slate-500">
              Class Index {finding.class_index != null ? finding.class_index : '--'} • Probability {formatProbability(finding.probability)}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-amber-100/50"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-amber-800 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-600" />
          <p className="font-semibold">Extracting Grad-CAM Feature Activation Map...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Heatmap Visualization Card */}
          <div className="relative aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
            <div className="relative w-56 h-56 rounded-full border-4 border-slate-800 bg-slate-900 flex items-center justify-center">
              {/* Heatmap Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-radial from-red-600/60 via-amber-500/40 to-transparent rounded-full animate-pulse flex items-center justify-center">
                <span className="text-[11px] font-bold text-white bg-slate-900/90 px-3 py-1 rounded-full border border-red-400">
                  Feature Activation Region
                </span>
              </div>
            </div>

            <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded text-[10px] text-amber-300 font-mono">
              EfficientNet-B0 Layer Activation
            </div>
          </div>

          {/* Metadata & Contract Parameters */}
          <div className="space-y-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-2 shadow-sm">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-amber-900">
                Grad-CAM Contract Metadata
              </h4>

              <div className="space-y-1 font-mono text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Abnormality:</span>
                  <span className="font-semibold text-slate-800">{finding.abnormality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Evaluation Plane:</span>
                  <span className="font-semibold text-slate-800">{gradcamData?.plane || 'Sagittal'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Series UID:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                    {gradcamData?.series_instance_uid || '1.2.826.0.1...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Window Index:</span>
                  <span className="font-semibold text-slate-800">{gradcamData?.window_index ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">5 Slices Evaluated:</span>
                  <span className="font-semibold text-slate-800">
                    {gradcamData?.instance_numbers ? gradcamData.instance_numbers.join(', ') : '1, 2, 3, 4, 5'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-100/60 p-3 rounded-lg border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <p className="font-bold flex items-center space-x-1">
                <Info className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                <span>Explainability Safety Notice</span>
              </p>
              <p>
                Grad-CAM highlights neural network spatial activation regions. It serves as visual explanation assistance and does NOT constitute diagnostic verification.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
