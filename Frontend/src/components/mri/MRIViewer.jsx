import React, { useState } from 'react';
import { Layers, Eye, Sliders, ChevronLeft, ChevronRight, ZoomIn, Info } from 'lucide-react';

export default function MRIViewer({ studyId, activeAbnormality, heatmapUrl }) {
  const [currentPlane, setCurrentPlane] = useState('Sagittal');
  const [sliceIndex, setSliceIndex] = useState(3);
  const totalSlices = 5; // 5-slice window contract
  const [showHeatmap, setShowHeatmap] = useState(true);

  const planes = ['Sagittal', 'Coronal', 'Axial'];

  return (
    <div className="clinical-card space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">MRI Series & Window Viewer</h3>
            <p className="text-[11px] text-slate-400">5-Slice Window Evaluation Window | 3 Series</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {planes.map((plane) => (
            <button
              key={plane}
              onClick={() => setCurrentPlane(plane)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                currentPlane === plane
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {plane}
            </button>
          ))}
        </div>
      </div>

      {/* Main Image Display Box */}
      <div className="relative aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner group">
        {/* Simulated Knee MRI Visual Representation */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <div className="relative w-64 h-64 rounded-full border-4 border-slate-800 bg-slate-900/80 flex items-center justify-center overflow-hidden shadow-2xl">
            {/* Joint structure shapes simulation */}
            <div className="absolute w-44 h-24 bg-slate-700/60 rounded-t-full top-4 border-b border-slate-600"></div>
            <div className="absolute w-44 h-24 bg-slate-700/60 rounded-b-full bottom-4 border-t border-slate-600"></div>
            <div className="absolute w-12 h-8 bg-blue-500/20 rounded-full border border-blue-400/40 animate-pulse"></div>

            {/* Grad-CAM Heatmap overlay simulation */}
            {activeAbnormality && showHeatmap && (
              <div className="absolute inset-0 bg-gradient-radial from-red-500/40 via-amber-500/20 to-transparent rounded-full animate-pulse flex items-center justify-center">
                <span className="text-[10px] bg-red-950/80 text-red-300 px-2 py-0.5 rounded border border-red-500/50 font-mono">
                  Grad-CAM: {activeAbnormality}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Overlay Badges & Controls */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] text-slate-200 font-mono">
          <span>{currentPlane} Plane</span> • <span>Slice {sliceIndex} / {totalSlices}</span>
        </div>

        {activeAbnormality && (
          <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] text-slate-200 flex items-center space-x-2">
            <span className="text-slate-400">Heatmap Overlay:</span>
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                showHeatmap ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {showHeatmap ? 'ON' : 'OFF'}
            </button>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setSliceIndex((prev) => Math.max(1, prev - 1))}
            disabled={sliceIndex === 1}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <input
            type="range"
            min={1}
            max={totalSlices}
            value={sliceIndex}
            onChange={(e) => setSliceIndex(Number(e.target.value))}
            className="w-full mx-4 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />

          <button
            onClick={() => setSliceIndex((prev) => Math.min(totalSlices, prev + 1))}
            disabled={sliceIndex === totalSlices}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="flex items-center space-x-1">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>Interactive DICOM window viewer preview</span>
        </span>
        <span className="font-mono">Window Size: 5 Slices</span>
      </div>
    </div>
  );
}
