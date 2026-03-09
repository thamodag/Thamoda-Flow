
import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, FilmIcon, ImageIcon, ZapIcon, GlobeIcon, LayersIcon } from './icons';

interface LandingPageProps {
  onStart: () => void;
  modality: 'MOTION' | 'STILLS';
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, modality }) => {
  const isVideo = modality === 'MOTION';

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-6 flex flex-col items-center">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-20"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-6">
          <SparklesIcon className="w-3 h-3" />
          <span>Powered by Veo & Nano Banana 2</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
          CINEMATIC <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-orange-400">
            CREATION
          </span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed mb-10">
          Describe any scene and get stunning {isVideo ? 'videos' : 'images'} in seconds. 
          The next generation of creative AI is at your fingertips.
        </p>

        <button 
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          className="px-8 py-4 bg-white text-black font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5"
        >
          Start Creating
        </button>
      </motion.div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-24">
        <FeatureCard 
          icon={<FilmIcon className="w-6 h-6 text-indigo-400" />}
          title="Veo 3.1 Pro"
          description="High-fidelity video generation with cinematic motion and 1080p resolution."
          delay={0.2}
        />
        <FeatureCard 
          icon={<ZapIcon className="w-6 h-6 text-orange-400" />}
          title="Nano Banana 2"
          description="Ultra-wide 8:1 cinematic images with stunning detail and search grounding."
          delay={0.3}
        />
        <FeatureCard 
          icon={<LayersIcon className="w-6 h-6 text-purple-400" />}
          title="Frames to Motion"
          description="Seamlessly convert your generated stills into dynamic cinematic sequences."
          delay={0.4}
        />
      </div>

      {/* Visual Showcase (Placeholders) */}
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
        {[1, 2, 3, 4].map((i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 + (i * 0.1) }}
            className="aspect-[9/16] rounded-2xl overflow-hidden border border-white/5 relative group"
          >
            <img 
              src={`https://picsum.photos/seed/cinematic-${i}/600/1067`} 
              alt="Showcase" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Cinematic Sample {i}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="text-center"
      >
        <p className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-[0.2em]">Ready to build?</p>
        <div className="flex items-center gap-2 text-gray-400 animate-bounce">
          <span className="text-xs font-bold uppercase">Scroll or type below</span>
        </div>
      </motion.div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string, delay: number }> = ({ icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group"
  >
    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default LandingPage;
