
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Inscribing digital celluloid...",
  "Calibrating cinematic lighting...",
  "Architecting visual motion...",
  "Synthesizing temporal layers...",
  "Encoding narrative flow...",
  "Polishing pixel intensity...",
  "Almost there, finalizing the cut..."
];

interface LoadingIndicatorProps {
  modality: 'MOTION' | 'STILLS';
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ modality }) => {
  const isVideo = modality === 'MOTION';
  return (
    <div className="flex flex-col items-center justify-center p-16 w-full max-w-lg">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl animate-pulse"></div>
        <div className="relative w-16 h-16 border-[3px] border-white/5 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
      
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Generating your {isVideo ? 'video' : 'image'}...
        </h2>
        <p className="text-indigo-400 font-bold text-[10px] uppercase tracking-[0.3em]">Please wait a moment</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;
