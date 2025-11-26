import React, { useState, useEffect } from 'react';
import { Uploader } from './components/Uploader';
import { ComparisonSlider } from './components/ComparisonSlider';
import { Button } from './components/Button';
import { generateSofaRestoration } from './services/geminiService';
import { AppStatus } from './types';
import { Sparkles, RefreshCcw, Armchair, Scissors, Eraser, AlertCircle, Key } from 'lucide-react';

const REPLAD_LOGO_URL = "https://static.wixstatic.com/media/494201_2a99be9752654eb1a04ff6ed405d8093~mv2.png/v1/crop/x_0,y_17,w_154,h_114/fill/w_116,h_86,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/replad-logo.png";

const PREDEFINED_PROMPTS = [
  { label: "Restore Original Look", icon: <RefreshCcw className="w-4 h-4" />, text: "Restore this sofa to its original brand new condition, fixing all tears and wear." },
  { label: "Modern Grey Fabric", icon: <Armchair className="w-4 h-4" />, text: "Reupholster the sofa in a modern, textured grey fabric." },
  { label: "Fix Tears & Scratches", icon: <Scissors className="w-4 h-4" />, text: "Repair all visible tears, scratches, and damage on the sofa surface." },
  { label: "Leather Refurbish", icon: <Sparkles className="w-4 h-4" />, text: "Refurbish the leather to look shiny, new, and premium." },
  { label: "Remove Background", icon: <Eraser className="w-4 h-4" />, text: "Keep the sofa exactly as is but remove the background and place it in a clean, bright studio setting." },
];

function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [prompt, setPrompt] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isCheckingKey, setIsCheckingKey] = useState<boolean>(true);

  useEffect(() => {
    const checkKey = async () => {
      try {
        if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
          const has = await (window as any).aistudio.hasSelectedApiKey();
          setHasApiKey(has);
        } else {
          // If the API environment isn't present, we default to true to allow
          // the app to render in development environments or fallbacks.
          setHasApiKey(true);
        }
      } catch (e) {
        console.error("Failed to check API key status", e);
        setHasApiKey(true);
      } finally {
        setIsCheckingKey(false);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      // Assume success after the dialog interaction to avoid race conditions
      setHasApiKey(true);
    }
  };

  const handleImageSelected = (base64: string, type: string) => {
    setOriginalImage(base64);
    setMimeType(type);
    setGeneratedImage(null);
    setStatus(AppStatus.IDLE);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!originalImage || !mimeType || !prompt) return;

    setStatus(AppStatus.LOADING);
    setError(null);

    try {
      const result = await generateSofaRestoration(originalImage, mimeType, prompt);
      setGeneratedImage(result);
      setStatus(AppStatus.SUCCESS);
    } catch (e: any) {
      console.error(e);
      // If error suggests missing key (e.g. 403/404 entity not found on some endpoints), prompt again
      if (e.message?.includes("Requested entity was not found") || e.message?.includes("API key")) {
         setHasApiKey(false);
         setError("Please select a valid API key to continue.");
      } else {
         setError(e.message || "An error occurred while generating the image. Please try again.");
      }
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setStatus(AppStatus.IDLE);
    setPrompt("");
    setError(null);
  };

  if (isCheckingKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-[#aa4dc8]/30 border-t-[#aa4dc8] rounded-full"></div>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-slate-200">
          <div className="w-16 h-16 bg-[#aa4dc8]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-[#aa4dc8]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">API Key Required</h2>
          <p className="text-slate-600 mb-6">
            To use the high-quality Gemini 3 Pro Image model for sofa restoration, you need to select a paid API key.
          </p>
          <Button onClick={handleSelectKey} className="w-full">
            Select API Key
          </Button>
          <div className="mt-6 text-xs text-slate-400">
             See <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-[#aa4dc8]">billing documentation</a> for details.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={REPLAD_LOGO_URL} alt="Replad Sofa Repair" className="h-10 w-auto" />
            <span className="hidden sm:block text-slate-400 text-sm font-medium border-l border-slate-300 pl-3 ml-3">
              AI Restoration Tool
            </span>
          </div>
          <div className="flex gap-4">
             <a href="https://repladsofa.com" target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-600 hover:text-[#aa4dc8] transition-colors">
               Visit Website
             </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        
        {/* Intro */}
        {!originalImage && (
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Visualize Your Sofa's <span className="text-[#aa4dc8]">Transformation</span>
            </h1>
            <p className="text-slate-600 text-lg">
              Upload a photo of your damaged or old sofa, and let our AI show you how it looks restored, recolored, or refurbished.
            </p>
          </div>
        )}

        {/* Upload Section */}
        {!originalImage ? (
          <Uploader onImageSelected={handleImageSelected} />
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left Column: Controls */}
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                   <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                     <Sparkles className="w-5 h-5 text-[#aa4dc8]" />
                     Restoration Options
                   </h2>
                   <button onClick={handleReset} className="text-xs text-slate-500 underline hover:text-slate-800">
                     Upload New Photo
                   </button>
                 </div>

                 {/* Custom Prompt */}
                 <div className="mb-6">
                   <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-2">
                     Describe your goal
                   </label>
                   <textarea
                     id="prompt"
                     className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#aa4dc8] focus:border-transparent outline-none transition-all resize-none h-24"
                     placeholder="E.g., Change fabric to blue velvet, repair cat scratches..."
                     value={prompt}
                     onChange={(e) => setPrompt(e.target.value)}
                     disabled={status === AppStatus.LOADING}
                   />
                 </div>

                 {/* Quick Actions */}
                 <div className="space-y-2 mb-6">
                   <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Actions</p>
                   {PREDEFINED_PROMPTS.map((item, idx) => (
                     <button
                       key={idx}
                       onClick={() => setPrompt(item.text)}
                       className={`w-full text-left px-3 py-2 rounded-md text-sm border transition-colors flex items-center gap-2
                         ${prompt === item.text 
                           ? 'bg-[#aa4dc8]/10 border-[#aa4dc8] text-[#aa4dc8]' 
                           : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                         }`}
                       disabled={status === AppStatus.LOADING}
                     >
                       {item.icon}
                       {item.label}
                     </button>
                   ))}
                 </div>

                 <Button 
                   onClick={handleGenerate} 
                   className="w-full h-12 text-lg shadow-lg shadow-[#aa4dc8]/20"
                   disabled={!prompt.trim()}
                   isLoading={status === AppStatus.LOADING}
                 >
                   Generate Preview
                 </Button>

                 {error && (
                   <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 border border-red-100">
                     <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                     {error}
                   </div>
                 )}
               </div>
            </div>

            {/* Right Column: Visualization */}
            <div className="lg:col-span-8">
              {status === AppStatus.SUCCESS && generatedImage ? (
                <div className="space-y-4 animate-in fade-in duration-700">
                  <ComparisonSlider 
                    beforeImage={originalImage} 
                    afterImage={generatedImage} 
                  />
                  <div className="flex justify-center gap-4 mt-6">
                     <Button variant="outline" onClick={() => {
                        const link = document.createElement('a');
                        link.href = generatedImage;
                        link.download = 'replad-restored-sofa.png';
                        link.click();
                     }}>
                       Download Result
                     </Button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img 
                    src={originalImage} 
                    alt="Original Upload" 
                    className={`w-full h-full object-cover transition-opacity duration-500 ${status === AppStatus.LOADING ? 'opacity-50 blur-sm' : ''}`}
                  />
                  {status === AppStatus.LOADING && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                      <div className="w-16 h-16 border-4 border-[#aa4dc8]/30 border-t-[#aa4dc8] rounded-full animate-spin mb-4"></div>
                      <p className="text-[#aa4dc8] font-semibold animate-pulse">Restoring your sofa...</p>
                    </div>
                  )}
                  {status === AppStatus.IDLE && (
                    <div className="absolute top-4 left-4 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                      ORIGINAL
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm mb-4">
            Powered by Google Gemini 3 Pro Image
          </p>
          <p className="text-xs opacity-50">
            &copy; {new Date().getFullYear()} Replad Sofa Repair. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;