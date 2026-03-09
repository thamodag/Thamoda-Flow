
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudioAsset, AspectRatio, VeoModel, Resolution } from '../types';
import { XMarkIcon, SparklesIcon, FilmIcon, ClockIcon } from './icons';

interface SceneBuilderProps {
  scene: {
    sourceImage: string;
    prompt: string;
    aspectRatio: AspectRatio;
    duration: number;
  } | null;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

const SceneBuilder: React.FC<SceneBuilderProps> = ({ scene, onClose, onGenerate, isGenerating }) => {
  const [editedPrompt, setEditedPrompt] = useState(scene?.prompt || '');

  if (!scene) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 md:p-12"
      >
        <div className="absolute inset-0 atmosphere opacity-30" />
        
        <button 
          className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[110]"
          onClick={onClose}
        >
          <XMarkIcon className="w-8 h-8" />
        </button>

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-5xl bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Side: Preview */}
          <div className="w-full md:w-1/2 aspect-[9/16] md:aspect-auto relative bg-black border-r border-white/5">
            <img 
              src={scene.sourceImage} 
              alt="Source" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 flex items-center gap-3">
              <div className="px-3 py-1.5 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                Source Image
              </div>
              <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                {scene.aspectRatio}
              </div>
            </div>
          </div>

          {/* Right Side: Controls */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Scene Builder</h2>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Convert this image into a cinematic video scene. You can refine the prompt to guide the motion.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Scene Prompt</label>
              <textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                placeholder="Describe the motion or atmosphere..."
                className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col gap-1">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Duration</span>
                <div className="flex items-center gap-2 text-white">
                  <ClockIcon className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-bold">{scene.duration}s</span>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col gap-1">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Model</span>
                <div className="flex items-center gap-2 text-white">
                  <SparklesIcon className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-bold">VEO 3.1</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onGenerate(editedPrompt)}
              disabled={isGenerating || !editedPrompt.trim()}
              className={`mt-auto w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] transition-all ${
                isGenerating 
                ? 'bg-indigo-600/20 text-indigo-400 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-indigo-500 hover:text-white active:scale-[0.98]'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <FilmIcon className="w-4 h-4" />
                  Generate Video
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SceneBuilder;
