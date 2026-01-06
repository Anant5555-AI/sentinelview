import React, { useState } from 'react';
import VideoGrid from './components/VideoGrid/VideoGrid';
import MapPanel from './components/MapPanel/MapPanel';
import PiPOverlay from './components/PiPOverlay/PiPOverlay';
import { Shield, Activity, Bell, Settings, PictureInPicture2, Menu } from 'lucide-react';

function App() {
  const [showPiP, setShowPiP] = useState(true);
  const [pipSource, setPipSource] = useState("https://assets.mixkit.co/videos/1080/1080-720.mp4");
  const [pipLabel, setPipLabel] = useState("DRONE VIEW");

  const handleCameraSelect = (src, label) => {
    setPipSource(src);
    setPipLabel(label);
    setShowPiP(true); // Ensure PiP opens when a camera is selected
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans selection:bg-blue-500/30">

      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">SENTINEL VIEW</h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              SYSTEM ONLINE
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-8 text-xs font-mono text-slate-400">
            <div className="flex flex-col items-center">
              <span className="text-slate-500">CPU</span>
              <span className="text-emerald-400">12%</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-slate-500">MEM</span>
              <span className="text-emerald-400">4.2GB</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-slate-500">NET</span>
              <span className="text-blue-400">1.2GB/s</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPiP(!showPiP)}
            className={`p-2 rounded-lg transition-colors ${showPiP ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-slate-800 text-slate-400'}`}
            title="Toggle PiP"
          >
            <PictureInPicture2 size={20} />
          </button>
          <div className="h-6 w-px bg-slate-800 mx-1"></div>
          <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
            <Bell size={20} />
          </button>
          <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
            <Settings size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border border-slate-700 ml-2"></div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-y-auto lg:overflow-hidden">

        {/* Left Panel - Grid of Cameras */}
        <div className="lg:col-span-1 h-[500px] lg:h-full min-h-0">
          <VideoGrid onCameraSelect={handleCameraSelect} />
        </div>

        {/* Right Panel - Map */}
        <div className="lg:col-span-2 h-[500px] lg:h-full min-h-0 relative">
          <MapPanel />
        </div>

      </main>

      {/* Footer / Status Bar */}
      <footer className="h-8 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-4 text-[10px] text-slate-500 font-mono z-20">
        <div>
          SentinelView v2.4.0 • Build 2026.01.06
        </div>
        <div className="flex gap-4">
          <span>Server: <span className="text-green-500">CONNECTED</span></span>
          <span>Latency: 24ms</span>
        </div>
      </footer>

      {/* Floating Elements */}
      {showPiP && (
        <PiPOverlay
          src={pipSource}
          label={pipLabel}
          onClose={() => setShowPiP(false)}
        />
      )}

    </div>
  );
}

export default App;
