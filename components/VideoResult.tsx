
import React, {useState, useRef} from 'react';
import {AspectRatio} from '../types';
import {ArrowPathIcon, DownloadIcon, SparklesIcon, PlusIcon} from './icons';

interface VideoResultProps {
  videoUrl: string;
  onRetry: () => void;
  onNewVideo: () => void;
  onExtend: () => void;
  canExtend: boolean;
  aspectRatio: AspectRatio;
}

const VideoResult: React.FC<VideoResultProps> = ({
  videoUrl,
  onRetry,
  onNewVideo,
  onExtend,
  canExtend,
  aspectRatio,
}) => {
  const isPortrait = aspectRatio === AspectRatio.PORTRAIT;
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="w-full flex flex-col items-center gap-12 max-w-4xl mx-auto">
      <div className="w-full relative group">
        {/* Cinematic Backdrop Glow */}
        <div className="absolute inset-0 bg-indigo-500/10 blur-[120px] rounded-full scale-75 opacity-50"></div>
        
        <div 
          className={`relative z-10 w-full mx-auto ${
            isPortrait ? 'max-w-[400px] aspect-[9/16]' : 'aspect-video'
          } rounded-3xl overflow-hidden bg-black shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10`}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay
            loop
            className="w-full h-full object-contain"
          />
        </div>

        {/* Floating Quick Action */}
        <button
          onClick={onNewVideo}
          className="absolute -top-6 -left-6 z-20 bg-white text-black p-4 rounded-2xl shadow-2xl hover:bg-indigo-500 hover:text-white transition-all active:scale-95 flex items-center gap-2 font-bold text-sm uppercase tracking-widest">
          <PlusIcon className="w-5 h-5" />
          New Draft
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 animate-in slide-in-from-bottom-2 duration-1000">
        <button
          onClick={onRetry}
          className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all active:scale-95 border border-white/10 flex items-center gap-3 uppercase tracking-widest text-xs">
          <ArrowPathIcon className="w-5 h-5" />
          Regenerate
        </button>
        
        <a
          href={videoUrl}
          download="veo-studio-creation.mp4"
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-xl shadow-indigo-500/20 flex items-center gap-3 uppercase tracking-widest text-xs">
          <DownloadIcon className="w-5 h-5" />
          Export MP4
        </a>

        {canExtend && (
          <button
            onClick={onExtend}
            className="px-8 py-4 bg-white text-black hover:bg-gray-200 font-bold rounded-2xl transition-all active:scale-95 flex items-center gap-3 uppercase tracking-widest text-xs">
            <SparklesIcon className="w-5 h-5" />
            Extend +7s
          </button>
        )}
      </div>
      
      <div className="text-center max-w-md">
        <h3 className="text-white font-bold text-lg mb-1">Cinematic Quality Achieved</h3>
        <p className="text-gray-500 text-sm">Output generated using Gemini Veo 3.1 architecture with high-fidelity color grading.</p>
      </div>
    </div>
  );
};

export default VideoResult;
