
import React, {useCallback, useEffect, useState} from 'react';
import ApiKeyDialog from './components/ApiKeyDialog';
import LoadingIndicator from './components/LoadingIndicator';
import PromptForm from './components/PromptForm';
import GalleryView from './components/GalleryView';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SceneBuilder from './components/SceneBuilder';
import {generateStudioContent} from './services/geminiService';
import {getAssets, saveAsset, deleteAsset} from './services/storageService';
import {
  AppState,
  StudioModality,
  GenerateParams,
  GenerationMode,
  Resolution,
  StudioAsset,
  ImageFile,
  AspectRatio,
  ImageModel,
  VeoModel,
} from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const auth = localStorage.getItem('isAuthenticated') === 'true';
    const type = localStorage.getItem('userType');
    console.log('[Auth] Initial check:', { auth, type });
    return auth && !!type;
  });
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [modality, setModality] = useState<StudioModality>(StudioModality.STILLS);
  const [assets, setAssets] = useState<StudioAsset[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState<GenerateParams | null>(null);
  const [activeScene, setActiveScene] = useState<{
    sourceImage: string;
    prompt: string;
    aspectRatio: AspectRatio;
    duration: number;
    sourceAsset?: StudioAsset;
  } | null>(null);
  const [isGeneratingFromScene, setIsGeneratingFromScene] = useState(false);
  const [gridSize, setGridSize] = useState<'small' | 'medium' | 'large'>(() => {
    const saved = localStorage.getItem('gridSize');
    return (saved as 'small' | 'medium' | 'large') || 'medium';
  });

  useEffect(() => {
    localStorage.setItem('gridSize', gridSize);
  }, [gridSize]);

  useEffect(() => {
    if (isAuthenticated) {
      const loadHistory = async () => {
        const history = await getAssets();
        setAssets(history.map(a => ({ ...a, status: 'ready' })));
      };
      loadHistory();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        setShowApiKeyDialog(true);
      }
    };
    checkKey();
  }, []);

  const handleGenerate = useCallback(async (params: GenerateParams, targetId?: string) => {
    setErrorMessage(null);
    const qty = params.quantity || 1;
    const timestamp = Date.now();
    
    // Create placeholder assets for immediate feedback
    const placeholders: StudioAsset[] = Array.from({ length: qty }).map((_, i) => ({
      id: targetId || `temp-${timestamp}-${i}`,
      url: '',
      modality: params.modality,
      prompt: params.prompt,
      timestamp: timestamp,
      model: params.modality === StudioModality.STILLS ? (params.imageModel || ImageModel.GEMINI_3_PRO) : (params.videoModel || VeoModel.VEO_FAST),
      aspectRatio: params.aspectRatio,
      duration: params.duration,
      status: 'processing'
    }));

    // Add placeholders to the top of the gallery, or update existing if targetId provided
    setAssets(prev => {
      if (targetId) {
        return prev.map(a => a.id === targetId ? placeholders[0] : a);
      }
      return [...placeholders, ...prev];
    });

    // Trigger generation
    try {
      const newAssets = await generateStudioContent(params);
      
      // Update assets in state and storage
      setAssets(prev => {
        const updated = [...prev];
        newAssets.forEach((asset, i) => {
          const searchId = targetId || `temp-${timestamp}-${i}`;
          const placeholderIndex = updated.findIndex(a => a.id === searchId);
          if (placeholderIndex !== -1) {
            updated[placeholderIndex] = { ...asset, id: searchId, status: 'ready' };
          } else {
            // Fallback if placeholder not found
            updated.unshift({ ...asset, status: 'ready' });
          }
          saveAsset({ ...asset, id: searchId });
        });
        // Remove any remaining placeholders for this batch if generation returned fewer than expected
        return updated.filter(a => !a.id.startsWith(`temp-${timestamp}-`) || a.status === 'ready');
      });
      
    } catch (error) {
      console.error('Generation failed:', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(msg);
      
      // Update placeholders to error state
      setAssets(prev => prev.map(a => 
        a.id.startsWith(`temp-${timestamp}-`) ? { ...a, status: 'error' } : a
      ));
      
      if (msg.includes('403') || msg.toLowerCase().includes('key')) setShowApiKeyDialog(true);
    }
  }, []);

  const handleDeleteAsset = async (id: string) => {
    await deleteAsset(id);
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const handlePromoteToVideo = async (asset: StudioAsset) => {
    handleAddToScene(asset);
  };

  const handleAddToScene = (asset: StudioAsset) => {
    setActiveScene({
      sourceImage: asset.url,
      prompt: asset.prompt,
      aspectRatio: asset.aspectRatio,
      duration: 8,
      sourceAsset: asset
    });
  };

  const handleGenerateFromScene = async (prompt: string) => {
    if (!activeScene || !activeScene.sourceAsset) return;
    
    const asset = activeScene.sourceAsset;
    setIsGeneratingFromScene(true);

    try {
      const response = await fetch(asset.url);
      const blob = await response.blob();
      const file = new File([blob], 'scene_start.png', { type: blob.type });
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const imageFile: ImageFile = { file, base64, url: asset.url };
        
        setActiveScene(null);
        setIsGeneratingFromScene(false);
        
        await handleGenerate({
          modality: StudioModality.MOTION,
          prompt: prompt,
          mode: GenerationMode.FRAMES_TO_VIDEO,
          startFrame: imageFile,
          aspectRatio: asset.aspectRatio,
          resolution: Resolution.P720,
          duration: 8
        });
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setErrorMessage("Failed to process scene image.");
      setIsGeneratingFromScene(false);
    }
  };

  const handleExtendVideo = async (asset: StudioAsset) => {
    if (asset.modality !== StudioModality.MOTION || !asset.videoObject) return;

    await handleGenerate({
      modality: StudioModality.MOTION,
      prompt: asset.prompt,
      mode: GenerationMode.EXTEND_VIDEO,
      inputVideoObject: asset.videoObject,
      aspectRatio: asset.aspectRatio,
      resolution: Resolution.P720,
      duration: (asset.duration || 8) + 8
    }, asset.id); // Pass asset.id to update the existing one
  };

  const handleNew = () => {
    setAppState(AppState.IDLE);
    setInitialFormValues(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    setIsAuthenticated(false);
  };

  const handleReusePrompt = (prompt: string) => {
    setInitialFormValues({
      modality: modality,
      prompt: prompt,
      aspectRatio: AspectRatio.PORTRAIT, // Default or keep existing?
    });
    // The useEffect in PromptForm will pick this up
  };

  const handleToggleFavorite = async (id: string) => {
    setAssets(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, favorite: !a.favorite };
        saveAsset(updated);
        return updated;
      }
      return a;
    }));
  };

  const currentModalityAssets = assets.filter(a => a.modality === modality);

  const handleLoginSuccess = (userType: string) => {
    console.log('[Auth] Login success for:', userType);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 flex flex-col font-sans overflow-x-hidden">
      <div className="atmosphere" />
      {showApiKeyDialog && <ApiKeyDialog onContinue={async () => { setShowApiKeyDialog(false); await window.aistudio?.openSelectKey(); }} />}
      
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-black/50 backdrop-blur-xl z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">V</div>
            <span className="text-sm font-bold tracking-tight text-white uppercase">Flow Studio</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
            <button 
              onClick={() => { setModality(StudioModality.MOTION); if (appState === AppState.SUCCESS) setAppState(AppState.SUCCESS); }}
              className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${modality === StudioModality.MOTION ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
              Videos
            </button>
            <button 
              onClick={() => { setModality(StudioModality.STILLS); if (appState === AppState.SUCCESS) setAppState(AppState.SUCCESS); }}
              className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${modality === StudioModality.STILLS ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
              Images
            </button>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setGridSize(size)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${gridSize === size ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                title={`Grid Size: ${size}`}
              >
                {size === 'small' ? 'S' : size === 'medium' ? 'M' : 'L'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="bg-white/5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-tighter border border-white/5">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
           </div>
           <button 
             onClick={handleLogout}
             className="bg-white/5 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-400 hover:text-red-400 uppercase tracking-tighter border border-white/5 hover:border-red-500/20 transition-all"
           >
             Logout
           </button>
        </div>
      </header>

      <main className="flex-grow w-full pt-20 pb-40 flex flex-col items-center">
        {appState === AppState.LOADING && (
          <div className="flex-grow flex items-center justify-center">
            <LoadingIndicator modality={modality} />
          </div>
        )}

        {appState === AppState.ERROR && (
           <div className="flex-grow flex items-center justify-center">
              <div className="text-center p-12 glass-panel border-red-500/20 max-w-lg rounded-3xl">
                <h2 className="text-xl font-bold text-white mb-2">Workspace Error</h2>
                <p className="text-sm text-red-400/80 mb-6">{errorMessage}</p>
                <button onClick={handleNew} className="px-6 py-2 bg-white text-black font-bold rounded-lg text-xs uppercase">Reset</button>
              </div>
           </div>
        )}

        {(appState === AppState.IDLE || appState === AppState.SUCCESS) && (
          <div className="w-full px-6 max-w-[1600px] animate-in fade-in duration-500">
            {currentModalityAssets.length > 0 ? (
               <GalleryView 
                 assets={currentModalityAssets} 
                 onPromote={handlePromoteToVideo}
                 onAddToScene={handleAddToScene}
                 onExtend={handleExtendVideo}
                 onDelete={handleDeleteAsset}
                 onReusePrompt={handleReusePrompt}
                 onFavorite={handleToggleFavorite}
                 onNew={handleNew} 
                 gridSize={gridSize}
               />
            ) : (
               <LandingPage 
                 modality={modality} 
                 onStart={() => {}} 
               />
            )}
          </div>
        )}
      </main>

      {/* Persistent Floating Command Bar */}
      <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4">
         <div className="w-full max-w-3xl">
            <PromptForm 
              modality={modality} 
              onGenerate={handleGenerate} 
              initialValues={initialFormValues} 
            />
         </div>
      </div>

      <SceneBuilder 
        scene={activeScene}
        onClose={() => setActiveScene(null)}
        onGenerate={handleGenerateFromScene}
        isGenerating={isGeneratingFromScene}
      />
    </div>
  );
};

export default App;
