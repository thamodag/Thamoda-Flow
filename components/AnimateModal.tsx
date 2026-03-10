
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudioAsset, VeoModel, Resolution, AspectRatio } from '../types';
import { XMarkIcon, SparklesIcon, ChevronDownIcon } from './icons';

interface AnimateModalProps {
  asset: StudioAsset | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, duration: number, model: VeoModel) => void;
  isGenerating: boolean;
}

const AnimateModal: React.FC<AnimateModalProps> = ({ asset, isOpen, onClose, onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(8);
  const [model, setModel] = useState<VeoModel>(VeoModel.VEO_FAST);

  if (!asset) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <SparklesIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider">Animate Image</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Convert still to motion</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-6 mb-8">
                <div className="w-32 aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-white/5 shrink-0">
                  <img src={asset.url} alt="Source" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Motion Prompt</label>
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe how the scene should move..."
                      className="w-full h-32 bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Duration</label>
                  <div className="flex bg-white/5 rounded-2xl p-1 border border-white/5">
                    {[8, 16, 24].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${duration === d ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Model</label>
                  <div className="relative">
                    <select 
                      value={model}
                      onChange={(e) => setModel(e.target.value as VeoModel)}
                      className="w-full h-11 bg-white/5 border border-white/5 rounded-2xl px-4 text-[10px] font-black text-white uppercase tracking-widest appearance-none focus:outline-none focus:border-indigo-500/50 transition-all"
                    >
                      <option value={VeoModel.VEO_FAST}>VEO 3.1 FAST</option>
                      <option value={VeoModel.VEO}>VEO 3.1 PRO</option>
                    </select>
                    <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              <button
                onClick={() => onGenerate(prompt, duration, model)}
                disabled={isGenerating || !prompt.trim()}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-2xl flex items-center justify-center gap-3 text-white transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <SparklesIcon className="w-5 h-5" />
                )}
                <span className="text-xs font-black uppercase tracking-[0.2em]">Generate Video</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AnimateModal;
