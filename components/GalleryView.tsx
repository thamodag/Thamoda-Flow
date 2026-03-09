
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudioAsset, StudioModality, ImageSize, ImageModel, StudioModality as Modality, GenerateParams, AspectRatio } from '../types';
import { DownloadIcon, FilmIcon, PlusIcon, SparklesIcon, XMarkIcon, ChevronDownIcon, ArrowPathIcon, RectangleStackIcon, HeartIcon } from './icons';
import { generateStudioContent } from '../services/geminiService';

interface GalleryViewProps {
  assets: StudioAsset[];
  onPromote: (asset: StudioAsset) => void;
  onDelete?: (id: string) => void;
  onReusePrompt: (prompt: string) => void;
  onFavorite: (id: string) => void;
  onNew: () => void;
  gridSize?: 'small' | 'medium' | 'large';
}

const GalleryView: React.FC<GalleryViewProps> = ({ assets, onPromote, onDelete, onReusePrompt, onFavorite, onNew, gridSize = 'medium' }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<StudioAsset | null>(null);

  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.visibility = 'hidden';
    link.style.position = 'absolute';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 1000);
  };

  const handleCopyPrompt = (asset: StudioAsset) => {
    navigator.clipboard.writeText(asset.prompt);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const processImageDownload = async (url: string, scale: number, filename: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // High quality scaling as requested
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Export using toBlob as requested
          canvas.toBlob((blob) => {
            if (blob) {
              const blobUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = blobUrl;
              link.download = filename;
              link.style.visibility = 'hidden';
              link.style.position = 'absolute';
              document.body.appendChild(link);
              link.click();
              
              // Cleanup
              setTimeout(() => {
                if (document.body.contains(link)) {
                  document.body.removeChild(link);
                }
                URL.revokeObjectURL(blobUrl);
              }, 1000);
              
              resolve();
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          }, 'image/png');
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for download'));
      img.src = url;
    });
  };

  const handleExport = async (asset: StudioAsset, size: string) => {
    setDownloadingId(`${asset.id}-${size}`);
    try {
      const isVideo = asset.modality === StudioModality.MOTION;
      const currentUrl = asset.url;
      
      if (isVideo) {
        // Videos use direct download
        triggerDownload(currentUrl, `flow-${size}-${asset.id}.mp4`);
        return;
      }

      // Images use the canvas system for 1K, 2K, and 4K
      setProcessingId(`${asset.id}-${size}`);
      try {
        let scale = 1;
        if (size === '2K') scale = 2;
        if (size === '4K') scale = 4;
        
        await processImageDownload(currentUrl, scale, `flow-${size}-${asset.id}.png`);
      } catch (error) {
        console.error("Export failed", error);
        // Fallback to direct triggerDownload if canvas fails
        triggerDownload(currentUrl, `flow-${size}-${asset.id}.png`);
      } finally {
        setProcessingId(null);
      }
    } catch (err) {
      console.error("Export process failed", err);
    } finally {
      // Small delay to show the indicator
      setTimeout(() => setDownloadingId(null), 1500);
    }
  };

  const gridConfig = {
    small: 'grid-cols-[repeat(auto-fill,minmax(160px,1fr))]',
    medium: 'grid-cols-[repeat(auto-fill,minmax(260px,1fr))]',
    large: 'grid-cols-[repeat(auto-fill,minmax(420px,1fr))]',
  };

  return (
    <div className="w-full flex flex-col gap-12 pb-24">
      <motion.div 
        layout
        className={`grid ${gridConfig[gridSize]} gap-8 transition-all duration-500 ease-in-out`}
      >
        <AnimatePresence mode="popLayout">
          {assets.map((asset) => {
            const isUpscaling = processingId?.startsWith(asset.id);
            const currentSize = processingId?.split('-').pop();
            const isVideo = asset.modality === StudioModality.MOTION;
            const isCopied = copiedId === asset.id;

            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={asset.id} 
                className="group parent-card relative flex flex-col bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] overflow-hidden transition-all hover:border-white/20 hover:shadow-2xl shadow-black/50 cursor-pointer"
                onMouseEnter={() => setActiveMenu(asset.id)}
                onMouseLeave={() => setActiveMenu(null)}
                onClick={() => asset.status === 'ready' && setSelectedAsset(asset)}
              >
              {/* Visual Display */}
              <div className="aspect-[9/16] relative overflow-hidden bg-black">
                {asset.status === 'processing' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 animate-pulse">
                    <div className="w-10 h-10 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Processing...</span>
                  </div>
                ) : asset.status === 'error' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-red-500/5">
                    <XMarkIcon className="w-10 h-10 text-red-500/50 mb-4" />
                    <span className="text-[10px] font-black text-red-400/50 uppercase tracking-[0.2em]">Generation Failed</span>
                  </div>
                ) : isVideo ? (
                  <video src={asset.url} autoPlay loop muted className="w-full h-full object-cover" />
                ) : (
                  <img src={asset.url} alt="Gen" className="w-full h-full object-cover" />
                )}
                
                {isUpscaling && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                        <div className="w-10 h-10 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                          {currentSize === '1K' ? 'Preparing download...' : `Upscaling to ${currentSize}...`}
                        </span>
                    </div>
                )}

                {downloadingId?.startsWith(asset.id) && !isUpscaling && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                        <div className="w-10 h-10 border-[3px] border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Preparing download...</span>
                    </div>
                )}

                <div className="absolute top-6 left-6 flex items-center gap-2">
                  <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-xl ${isVideo ? 'bg-indigo-600/90' : 'bg-orange-600/90'}`}>
                    {isVideo ? 'VEO 3.1' : asset.model === ImageModel.GEMINI_3_PRO ? 'BANANA PRO' : 'BANANA FLASH'}
                  </div>
                </div>

                <div className="absolute top-6 right-6 flex flex-col gap-2 z-50">
                  {onDelete && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(asset.id); }}
                      className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100 duration-300 translate-x-4 group-hover:translate-x-0"
                      title="Delete"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onFavorite(asset.id); }}
                    className={`w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-300 ${asset.favorite ? 'opacity-100 text-red-500 bg-red-500/10 border-red-500/20' : 'opacity-0 group-hover:opacity-100 text-white hover:text-red-400 translate-x-4 group-hover:translate-x-0'} delay-[50ms]`}
                    title="Favorite"
                  >
                    <HeartIcon className={`w-4 h-4 ${asset.favorite ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onReusePrompt(asset.prompt); }}
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-indigo-500 transition-all opacity-0 group-hover:opacity-100 duration-300 translate-x-4 group-hover:translate-x-0 delay-[100ms]"
                    title="Reuse Prompt"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                  </button>
                  {!isVideo && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onPromote(asset); }}
                      className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-indigo-500 transition-all opacity-0 group-hover:opacity-100 duration-300 translate-x-4 group-hover:translate-x-0 delay-[150ms]"
                      title="Animate"
                    >
                      <FilmIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleExport(asset, isVideo ? '720p' : '1K'); }}
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-emerald-500 transition-all opacity-0 group-hover:opacity-100 duration-300 translate-x-4 group-hover:translate-x-0 delay-[200ms]"
                    title="Quick Download"
                  >
                    <DownloadIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Simplified Action Area with Hover Bridge */}
                {asset.status === 'ready' && (
                  <div className="absolute inset-x-0 bottom-0 h-1/2 flex flex-col justify-end z-40 pointer-events-none">
                    <div className="download-buttons-container w-full px-6 pb-6 pointer-events-auto translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <div className="flex-1 flex gap-1 bg-white p-1 rounded-2xl shadow-xl">
                                {isVideo ? (
                                  <>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleExport(asset, '720p'); }}
                                      className="flex-1 h-10 rounded-xl flex items-center justify-center transition-all font-bold text-[9px] uppercase tracking-widest text-black hover:bg-gray-100 active:scale-95"
                                    >
                                      720P
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleExport(asset, '1080p'); }}
                                      className="flex-1 h-10 rounded-xl flex items-center justify-center transition-all font-bold text-[9px] uppercase tracking-widest text-black hover:bg-gray-100 active:scale-95 border-l border-gray-100"
                                    >
                                      1080P
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleExport(asset, '1K'); }}
                                      className="flex-1 h-10 rounded-xl flex items-center justify-center transition-all font-bold text-[9px] uppercase tracking-widest text-black hover:bg-gray-100 active:scale-95"
                                    >
                                      1K
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleExport(asset, '2K'); }}
                                      className="flex-1 h-10 rounded-xl flex items-center justify-center transition-all font-bold text-[9px] uppercase tracking-widest text-black hover:bg-gray-100 active:scale-95 border-l border-gray-100"
                                    >
                                      2K
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleExport(asset, '4K'); }}
                                      className="flex-1 h-10 rounded-xl flex items-center justify-center transition-all font-bold text-[9px] uppercase tracking-widest text-black hover:bg-gray-100 active:scale-95 border-l border-gray-100"
                                    >
                                      4K
                                    </button>
                                  </>
                                )}
                              </div>
                              
                              <button 
                                  onClick={(e) => { e.stopPropagation(); onPromote(asset); }}
                                  className="w-12 h-12 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-indigo-600 transition-colors shrink-0"
                                  title={isVideo ? "Extend Scene" : "Animate Image"}
                              >
                                  {isVideo ? <SparklesIcon className="w-4 h-4" /> : <FilmIcon className="w-4 h-4" />}
                              </button>
                            </div>
                        </div>
                    </div>
                  </div>
                )}
              </div>

            </motion.div>
          );
        })}
        </AnimatePresence>
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-12"
            onClick={() => setSelectedAsset(null)}
          >
            <button 
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[110]"
              onClick={() => setSelectedAsset(null)}
            >
              <XMarkIcon className="w-8 h-8" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-full max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedAsset.modality === StudioModality.MOTION ? (
                <video 
                  src={selectedAsset.url} 
                  controls 
                  autoPlay 
                  loop 
                  className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl"
                />
              ) : (
                <img 
                  src={selectedAsset.url} 
                  alt="Preview" 
                  className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
                />
              )}
              
              <div className="absolute -bottom-24 left-0 right-0 flex flex-col items-center gap-3">
                <p className="text-white/80 text-sm md:text-base font-medium italic line-clamp-3 max-w-3xl mx-auto leading-relaxed">
                  "{selectedAsset.prompt}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">ID</span>
                    <span className="text-[10px] font-mono text-white/60">{selectedAsset.id.toUpperCase()}</span>
                  </div>
                  <button 
                    onClick={() => handleCopyPrompt(selectedAsset)}
                    className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <RectangleStackIcon className="w-3 h-3 text-white/40" />
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Copy Prompt</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryView;
