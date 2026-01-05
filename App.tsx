
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Film, 
  ArrowRight, 
  Play, 
  Download, 
  RefreshCcw, 
  AlertCircle,
  Clock,
  Settings2,
  CheckCircle2,
  Sparkles,
  Search,
  Wand2
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { VintageStyle, GenerationState, AspectRatio } from './types';
import { VINTAGE_STYLES, LOADING_MESSAGES } from './constants';

// --- Components ---

const Header = () => (
  <header className="py-8 px-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold tracking-tighter serif italic text-amber-500">ARCHIVIST</h1>
      <p className="text-sm text-zinc-500 uppercase tracking-widest">Vintage Motion Laboratory</p>
    </div>
    <div className="flex items-center gap-4">
      <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
        <Clock className="w-3 h-3" />
        <span>POWERED BY VEO 3.1 & GEMINI 3</span>
      </div>
    </div>
  </header>
);

const ImageUploadSlot = ({ 
  label, 
  image, 
  onUpload, 
  onClear 
}: { 
  label: string, 
  image: string | null, 
  onUpload: (file: File) => void,
  onClear: () => void 
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="relative group aspect-[16/9] bg-zinc-900 border-2 border-dashed border-white/10 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-300">
      {image ? (
        <>
          <img src={image} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button 
              onClick={onClear}
              className="px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Remove
            </button>
          </div>
        </>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-white/5 transition-colors p-4 text-center">
          <Upload className="w-8 h-8 text-zinc-600 mb-3 group-hover:text-amber-500 transition-colors" />
          <span className="text-sm font-medium text-zinc-400">{label}</span>
          <span className="text-xs text-zinc-600 mt-1">PNG, JPG up to 10MB</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      )}
      <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold tracking-widest text-zinc-300 uppercase">
        {label}
      </div>
    </div>
  );
};

const LoadingOverlay = ({ message, progress }: { message: string, progress: number }) => (
  <div className="absolute inset-0 bg-black/90 z-20 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
    <div className="w-24 h-24 mb-6 relative">
      <div className="absolute inset-0 rounded-full border-4 border-amber-500/20"></div>
      <div 
        className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"
        style={{ animationDuration: '2s' }}
      ></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Film className="w-8 h-8 text-amber-500 animate-pulse" />
      </div>
    </div>
    <h3 className="text-xl font-bold mb-2 serif italic text-amber-200">{message}</h3>
    <div className="w-full max-w-xs h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
      <div 
        className="h-full bg-amber-500 transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    <p className="text-xs text-zinc-500 uppercase tracking-widest">Historical Restoration in Progress</p>
  </div>
);

// --- Main App ---

export default function App() {
  const [frame1, setFrame1] = useState<string | null>(null);
  const [frame2, setFrame2] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<VintageStyle>(VINTAGE_STYLES[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [generation, setGeneration] = useState<GenerationState>({
    status: 'idle',
    message: '',
    progress: 0
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (!frame1) return;
    
    setGeneration({ status: 'generating', message: 'Analyzing frame composition...', progress: 10 });
    
    try {
      const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          {
            parts: [
              { text: "Describe this image in detail, focusing on elements that would look interesting in a vintage film clip. Keep it under 50 words." },
              { inlineData: { data: frame1.split(',')[1], mimeType: 'image/png' } }
            ]
          }
        ]
      });
      
      const text = response.text || "Analysis complete.";
      setAnalysisText(text);
      setCustomPrompt(prev => prev ? `${prev} - ${text}` : text);
      setGeneration({ status: 'idle', message: '', progress: 0 });
    } catch (err: any) {
      console.error(err);
      setGeneration({ status: 'error', message: 'Analysis failed', progress: 0, error: err.message });
    }
  };

  const handleStartGeneration = async () => {
    try {
      // 1. Check/Select API Key
      setGeneration({ status: 'checking-key', message: 'Checking permissions...', progress: 10 });
      
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }

      setGeneration({ status: 'generating', message: LOADING_MESSAGES[0], progress: 20 });

      const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
      
      const basePrompt = customPrompt ? `${customPrompt}. ${selectedStyle.prompt}` : `A cinematic archival vintage video clip. ${selectedStyle.prompt}`;

      let operation;

      // Case: Interpolation (2 frames)
      if (frame1 && frame2) {
        operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: `Interpolate from the starting frame to the ending frame. ${basePrompt}`,
          image: { imageBytes: frame1.split(',')[1], mimeType: 'image/png' },
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            lastFrame: { imageBytes: frame2.split(',')[1], mimeType: 'image/png' },
            aspectRatio: aspectRatio
          }
        });
      } 
      // Case: Animation (1 frame)
      else if (frame1) {
        operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: `Animate this starting frame. ${basePrompt}`,
          image: { imageBytes: frame1.split(',')[1], mimeType: 'image/png' },
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio
          }
        });
      }
      // Case: Text-to-Video
      else {
        operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: basePrompt,
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio
          }
        });
      }

      // Polling loop
      let pollCount = 0;
      while (!operation.done) {
        pollCount++;
        const progress = Math.min(20 + (pollCount * 5), 95);
        const msgIndex = Math.floor(pollCount / 2) % LOADING_MESSAGES.length;
        
        setGeneration(prev => ({ 
          ...prev, 
          message: LOADING_MESSAGES[msgIndex], 
          progress 
        }));

        await new Promise(resolve => setTimeout(resolve, 8000));
        
        try {
          operation = await ai.operations.getVideosOperation({ operation: operation });
        } catch (err: any) {
          if (err.message?.includes("Requested entity was not found")) {
            await (window as any).aistudio.openSelectKey();
            throw new Error("Key session expired. Please retry.");
          }
          throw err;
        }
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("No video URL returned from API");

      const response = await fetch(`${downloadLink}&key=${(process.env as any).API_KEY}`);
      const blob = await response.blob();
      const videoUrl = URL.createObjectURL(blob);

      setGeneration({ 
        status: 'completed', 
        message: 'Restoration complete!', 
        progress: 100, 
        resultUrl: videoUrl 
      });

    } catch (err: any) {
      console.error(err);
      setGeneration({ 
        status: 'error', 
        message: 'Restoration failed', 
        progress: 0, 
        error: err.message || 'An unexpected error occurred during processing.' 
      });
    }
  };

  const resetApp = () => {
    setGeneration({ status: 'idle', message: '', progress: 0 });
    setFrame1(null);
    setFrame2(null);
    setCustomPrompt('');
    setAnalysisText(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-0 lg:divide-x lg:divide-white/5">
        
        {/* Left Control Panel */}
        <section className="lg:col-span-4 p-6 lg:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-100px)] custom-scrollbar">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold tracking-tight uppercase text-zinc-200">Laboratory Controls</h2>
            </div>
            
            <div className="space-y-6">
              {/* Custom Prompt Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Custom Instructions</label>
                  {frame1 && (
                    <button 
                      onClick={handleAnalyze}
                      disabled={generation.status !== 'idle'}
                      className="text-[10px] flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors border border-amber-500/20"
                    >
                      <Wand2 className="w-3 h-3" />
                      ANALYZE IMAGE
                    </button>
                  )}
                </div>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe the desired motion or atmosphere (e.g., 'a steam locomotive crossing a bridge', 'rain falling on a window')..."
                  className="w-full h-32 bg-zinc-900 border border-white/10 rounded-xl p-4 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                />
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Film Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setAspectRatio('16:9')}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${aspectRatio === '16:9' ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'}`}
                  >
                    16:9 Cinema
                  </button>
                  <button 
                    onClick={() => setAspectRatio('9:16')}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${aspectRatio === '9:16' ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'}`}
                  >
                    9:16 Vertical
                  </button>
                </div>
              </div>

              {/* Vintage Style Picker */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Historical Filter</label>
                <div className="grid grid-cols-1 gap-3">
                  {VINTAGE_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style)}
                      className={`group relative flex items-center gap-4 p-3 rounded-xl border transition-all ${selectedStyle.id === style.id ? 'bg-amber-500/10 border-amber-500/50' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10">
                        <img src={style.thumbnail} alt={style.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      </div>
                      <div className="text-left">
                        <h4 className={`text-sm font-bold ${selectedStyle.id === style.id ? 'text-amber-500' : 'text-zinc-300'}`}>{style.name}</h4>
                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{style.description}</p>
                      </div>
                      {selectedStyle.id === style.id && (
                        <div className="absolute right-4">
                          <CheckCircle2 className="w-5 h-5 text-amber-500" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <button
              onClick={handleStartGeneration}
              disabled={generation.status !== 'idle'}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm tracking-widest uppercase transition-all shadow-xl
                ${generation.status !== 'idle' 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50' 
                  : 'bg-amber-500 text-black hover:bg-amber-400 active:scale-[0.98] shadow-amber-500/20'}`}
            >
              <Sparkles className="w-5 h-5" />
              Begin Simulation
            </button>
            <p className="text-[10px] text-zinc-600 mt-4 text-center px-4 leading-relaxed">
              Archivist uses advanced neural networks to synthesize historical visual data based on your specific parameters.
            </p>
          </div>
        </section>

        {/* Right Preview Area */}
        <section className="lg:col-span-8 bg-black/50 p-6 lg:p-12 relative min-h-[600px] flex flex-col">
          {generation.status === 'idle' ? (
            <div className="flex-1 flex flex-col">
              <div className="mb-8 flex justify-between items-end">
                <div>
                  <h3 className="text-2xl font-bold serif italic text-zinc-200 mb-2">Visual Anchors</h3>
                  <p className="text-sm text-zinc-500">
                    Upload 2 frames for interpolation, 1 frame for animation, or 0 for prompt-only generation.
                  </p>
                </div>
                {analysisText && (
                  <div className="hidden md:block max-w-[300px] bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Search className="w-3 h-3 text-amber-500" />
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Gemini Analysis</span>
                    </div>
                    <p className="text-[11px] italic text-zinc-400 leading-relaxed">{analysisText}</p>
                  </div>
                )}
              </div>

              <div className={`grid gap-6 ${aspectRatio === '16:9' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2'}`}>
                <ImageUploadSlot 
                  label="Primary Anchor" 
                  image={frame1} 
                  onUpload={async (f) => setFrame1(`data:image/png;base64,${await fileToBase64(f)}`)} 
                  onClear={() => { setFrame1(null); setAnalysisText(null); }}
                />
                <ImageUploadSlot 
                  label="Secondary Anchor" 
                  image={frame2} 
                  onUpload={async (f) => setFrame2(`data:image/png;base64,${await fileToBase64(f)}`)} 
                  onClear={() => setFrame2(null)}
                />
              </div>

              {!frame1 && !frame2 && !customPrompt && (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 pointer-events-none mt-12">
                  <div className="w-32 h-32 border-4 border-dashed border-white rounded-full flex items-center justify-center mb-6">
                    <Camera className="w-12 h-12" />
                  </div>
                  <p className="text-xl font-bold uppercase tracking-[0.2em]">Ready for Input</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl">
              
              {/* Error State */}
              {generation.status === 'error' && (
                <div className="p-8 text-center max-w-md">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                  <h3 className="text-xl font-bold mb-2 text-white">Simulation Error</h3>
                  <p className="text-zinc-500 text-sm mb-8">{generation.error}</p>
                  <button 
                    onClick={() => setGeneration({ status: 'idle', message: '', progress: 0 })}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    Reset System
                  </button>
                </div>
              )}

              {/* Generating State */}
              {(generation.status === 'generating' || generation.status === 'checking-key') && (
                <LoadingOverlay message={generation.message} progress={generation.progress} />
              )}

              {/* Completed State */}
              {generation.status === 'completed' && generation.resultUrl && (
                <div className="w-full h-full flex flex-col">
                  <div className="flex-1 bg-black flex items-center justify-center p-4">
                    <video 
                      src={generation.resultUrl} 
                      controls 
                      autoPlay 
                      loop 
                      className={`rounded shadow-2xl max-w-full max-h-full ${aspectRatio === '9:16' ? 'h-full' : 'w-full'}`}
                    />
                  </div>
                  <div className="p-6 bg-zinc-900 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-amber-500" />
                        <h4 className="text-amber-500 font-bold tracking-tight italic">HISTORICAL SIMULATION SUCCESS</h4>
                      </div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{selectedStyle.name} • {aspectRatio} • VEO 3.1 ENGINE</p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={resetApp}
                        className="p-3 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl transition-all border border-white/5"
                        title="Reset Lab"
                      >
                        <RefreshCcw className="w-5 h-5" />
                      </button>
                      <a 
                        href={generation.resultUrl} 
                        download={`archivist-${selectedStyle.id}-${Date.now()}.mp4`}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10"
                      >
                        <Download className="w-4 h-4" />
                        Export Archive
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="p-4 bg-zinc-950 border-t border-white/5 text-center">
        <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em]">
          Archivist Laboratory • Historical Simulation Interface v3.2 • 2024
        </p>
      </footer>
    </div>
  );
}
