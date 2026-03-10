
import React, {useRef, useState, useEffect} from 'react';
import {
  AspectRatio,
  GenerateParams,
  GenerationMode,
  Resolution,
  VeoModel,
  ImageModel,
  ImageSize,
  StudioModality,
} from '../types';
import {
  ArrowRightIcon,
  FilmIcon,
  XMarkIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
} from './icons';

interface PromptFormProps {
  modality: StudioModality;
  onGenerate: (params: GenerateParams) => void;
  initialValues?: GenerateParams | null;
}

const PromptForm: React.FC<PromptFormProps> = ({modality, onGenerate, initialValues}) => {
  const [prompt, setPrompt] = useState(initialValues?.prompt ?? '');
  const [quantity, setQuantity] = useState(initialValues?.quantity ?? 1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [imageModel, setImageModel] = useState<ImageModel>(initialValues?.imageModel ?? ImageModel.GEMINI_3_1_FLASH);
  const [imageSize, setImageSize] = useState<ImageSize>(initialValues?.imageSize ?? ImageSize.I1K);
  const [videoModel, setVideoModel] = useState<VeoModel>(initialValues?.videoModel ?? VeoModel.VEO_FAST);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(initialValues?.aspectRatio ?? AspectRatio.PORTRAIT);
  const [resolution, setResolution] = useState<Resolution>(initialValues?.resolution ?? Resolution.P720);
  const [duration, setDuration] = useState<number>(initialValues?.duration ?? 8);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isVideo = modality === StudioModality.MOTION;

  useEffect(() => {
    if (initialValues) {
      setPrompt(initialValues.prompt || '');
      // Focus the textarea
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
        }
      }, 100);
    }
  }, [initialValues]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      modality,
      prompt,
      quantity,
      aspectRatio,
      videoModel,
      imageModel: imageModel,
      imageSize: imageSize,
      mode: isVideo ? GenerationMode.TEXT_TO_VIDEO : undefined,
      resolution,
      duration: isVideo ? duration : undefined,
    });
    setPrompt('');
  };

  return (
    <div className="relative w-full group">
      <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] opacity-0 group-hover:opacity-40 transition-opacity duration-1000"></div>
      
      <div className="relative bg-[#111111]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-500 hover:border-white/20">
        
        {/* Top Header / Mode Indicators */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              isVideo 
                ? 'bg-indigo-600 text-white border border-indigo-400/20 shadow-lg shadow-indigo-600/10' 
                : 'bg-orange-500 text-white shadow-lg shadow-orange-500/10'
            }`}>
              {isVideo ? 'Text to Video' : 'Create Image'}
            </div>
            
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Quantity x{quantity}</span>
                <input 
                  type="range" min="1" max="4" step="1" 
                  value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className={`w-14 h-1 cursor-pointer accent-indigo-500`}
                />
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button 
                type="button" 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  isSettingsOpen 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
             >
                <span className="text-[9px] font-black uppercase tracking-widest">
                    {isVideo ? 'Veo Engine' : 'Studio Engine'}
                </span>
                <SlidersHorizontalIcon className="w-4 h-4" />
             </button>
          </div>
        </div>

        {/* Settings Panel Expansion */}
        {isSettingsOpen && (
            <div className="px-8 py-6 bg-white/[0.02] border-b border-white/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-500">
                {isVideo ? (
                  <>
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Model</label>
                        <select 
                            value={videoModel} 
                            onChange={(e) => setVideoModel(e.target.value as VeoModel)}
                            className="bg-black/80 border border-white/10 rounded-xl px-3 py-2.5 text-[11px] text-white outline-none focus:border-white/30 transition-colors appearance-none"
                        >
                            <option value={VeoModel.VEO_FAST}>Veo 3.1 Fast</option>
                            <option value={VeoModel.VEO}>Veo 3.1 Pro</option>
                        </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Engine</label>
                        <select 
                            value={imageModel} 
                            onChange={(e) => setImageModel(e.target.value as ImageModel)}
                            className="bg-black/80 border border-white/10 rounded-xl px-3 py-2.5 text-[11px] text-white outline-none focus:border-white/30 transition-colors appearance-none"
                        >
                            <option value={ImageModel.GEMINI_3_1_FLASH}>Nano Banana 2</option>
                            <option value={ImageModel.GEMINI_3_PRO}>Nano Banana Pro</option>
                            <option value={ImageModel.GEMINI_2_5_FLASH}>Nano Banana</option>
                            <option value={ImageModel.IMAGEN_4}>Imagen 4</option>
                        </select>
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Aspect Ratio</label>
                    <select 
                        value={aspectRatio} 
                        onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                        className="bg-black/80 border border-white/10 rounded-xl px-3 py-2.5 text-[11px] text-white outline-none focus:border-white/30 transition-colors appearance-none"
                    >
                        <option value={AspectRatio.PORTRAIT}>9:16 Portrait</option>
                        <option value={AspectRatio.LANDSCAPE}>16:9 Landscape</option>
                        <option value={AspectRatio.SQUARE}>1:1 Square</option>
                        <option value={AspectRatio.PHOTO_WIDE}>4:3 Classic</option>
                        <option value={AspectRatio.PHOTO_TALL}>3:4 Tall</option>
                        {(imageModel === ImageModel.GEMINI_3_1_FLASH) && (
                          <>
                            <option value={AspectRatio.ULTRA_WIDE}>4:1 Ultra Wide</option>
                            <option value={AspectRatio.ULTRA_TALL}>1:4 Ultra Tall</option>
                            <option value={AspectRatio.CINEMATIC_WIDE}>8:1 Cinematic Wide</option>
                            <option value={AspectRatio.CINEMATIC_TALL}>1:8 Cinematic Tall</option>
                          </>
                        )}
                    </select>
                </div>

                {isVideo && (
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Resolution</label>
                        <select 
                            value={resolution} 
                            onChange={(e) => setResolution(e.target.value as Resolution)}
                            className="bg-black/80 border border-white/10 rounded-xl px-3 py-2.5 text-[11px] text-white outline-none focus:border-white/30 transition-colors appearance-none"
                        >
                            <option value={Resolution.P720}>720p HD</option>
                            <option value={Resolution.P1080}>1080p Full HD</option>
                        </select>
                    </div>
                )}

                {isVideo && (
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Duration</label>
                        <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
                            {[8, 16, 24].map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => setDuration(d)}
                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${duration === d ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {d}s
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex items-end gap-5">
          <div className="flex-grow pb-2">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isVideo ? "Describe a cinematic video..." : "Generate an image from text and ingredients..."}
              className="w-full bg-transparent text-base text-white placeholder-gray-600 focus:outline-none resize-none min-h-[28px] font-medium leading-relaxed tracking-tight"
              rows={1}
            />
          </div>

          <button
            type="submit"
            disabled={!prompt.trim()}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-lg group/btn ${
                prompt.trim()
                ? (isVideo ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-white text-black hover:bg-orange-500 hover:text-white') 
                : 'bg-white/5 text-gray-700 cursor-not-allowed'
            }`}
          >
            <div className="flex flex-col items-center justify-center">
                <ArrowRightIcon className="w-7 h-7" />
                {quantity > 1 && (
                    <span className="text-[8px] font-black absolute -top-1 -right-1 bg-white text-black w-4 h-4 rounded-full flex items-center justify-center border border-indigo-500">
                        {quantity}
                    </span>
                )}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default PromptForm;
