
import React from 'react';
import {StudioModality, AspectRatio} from '../types';
import {ArrowPathIcon, DownloadIcon, SparklesIcon, PlusIcon} from './icons';

interface StudioResultProps {
  url: string;
  modality: StudioModality;
  onNew: () => void;
  onExtend: () => void;
  canExtend: boolean;
  aspectRatio: AspectRatio;
}

const StudioResult: React.FC<StudioResultProps> = ({
  url,
  modality,
  onNew,
  onExtend,
  canExtend,
  aspectRatio,
}) => {
  const isPortrait = aspectRatio === AspectRatio.PORTRAIT;
  const isVideo = modality === StudioModality.MOTION;

  return (
    <div className="w-full flex flex-col items-center gap-12 max-w-5xl mx-auto py-4">
      <div className="w-full relative group">
        {/* Backdrop Glow */}
        <div className={`absolute inset-0 blur-[140px] rounded-full scale-90 opacity-40 transition-colors duration-1000 ${isVideo ? 'bg-indigo-500/30' : 'bg-emerald-500/30'}`}></div>
        
        <div className={`relative z-10 w-full mx-auto ${isPortrait ? 'max-w-[420px]' : 'max-w-4xl'} rounded-[2.5rem] overflow-hidden bg-black shadow-2xl border border-white/10`}>
          {isVideo ? (
            <video src={url} controls autoPlay loop className="w-full h-full object-contain" />
          ) : (
            <img src={url} alt="Generated Studio Still" className="w-full h-full object-contain" />
          )}
        </div>

        <button
          onClick={onNew}
          className="absolute -top-6 -left-6 z-20 bg-white text-black p-4 rounded-2xl shadow-2xl hover:bg-gray-200 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
          <PlusIcon className="w-5 h-5" />
          New Draft
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-5 animate-in slide-in-from-bottom-2 duration-1000">
        <a
          href={url}
          download={isVideo ? "creation.mp4" : "creation.png"}
          className={`px-10 py-4 font-bold rounded-2xl transition-all shadow-xl flex items-center gap-3 uppercase tracking-widest text-xs ${isVideo ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'}`}>
          <DownloadIcon className="w-5 h-5" />
          Save to Disk
        </a>

        {canExtend && (
          <button
            onClick={onExtend}
            className="px-10 py-4 bg-white text-black hover:bg-gray-100 font-bold rounded-2xl transition-all flex items-center gap-3 uppercase tracking-widest text-xs">
            <SparklesIcon className="w-5 h-5" />
            Continue Scene (+7s)
          </button>
        )}
      </div>

      <div className="text-center max-w-md">
        <h3 className="text-white font-bold text-lg mb-1">
          {isVideo ? 'Masterpiece Sequence Finalized' : 'High-Resolution Still Mastered'}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          The processing core has calibrated all parameters to {isVideo ? 'cinematic standards' : 'ultra-fidelity print standards'}. 
        </p>
      </div>
    </div>
  );
};

export default StudioResult;
