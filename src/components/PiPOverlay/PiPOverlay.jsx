import React, { useState, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { X, Move } from 'lucide-react';
import { motion } from 'framer-motion';

const PiPOverlay = ({ onClose, src, label = "DRONE VIEW" }) => {
    const [is360Mode, setIs360Mode] = useState(false);
    const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    return (
        <Rnd
            default={{
                x: window.innerWidth - 360,
                y: window.innerHeight - 260,
                width: 320,
                height: 180,
            }}
            minWidth={200}
            minHeight={112}
            bounds="window"
            className="z-50"
            dragHandleClassName="drag-handle"
        >
            <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden shadow-2xl border-2 border-slate-700 hover:border-blue-500 transition-colors relative group flex flex-col font-sans">
                {/* Header / Drag Handle */}
                <div className="drag-handle h-6 bg-slate-800 flex items-center justify-between px-2 cursor-move hover:bg-slate-700 transition-colors z-20 relative">
                    <div className="flex items-center gap-2">
                        <Move size={10} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-300">{label}</span>
                        {is360Mode && <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1 rounded border border-blue-500/30">360° ACTIVE</span>}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIs360Mode(!is360Mode)}
                            className={`px-1.5 py-0.5 text-[8px] rounded border transition-colors ${is360Mode ? 'bg-blue-500 text-white border-blue-400' : 'bg-transparent text-slate-400 border-slate-600 hover:border-slate-400'}`}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            {is360Mode ? 'EXIT 360' : 'ENABLE 360'}
                        </button>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-red-400 p-0.5 rounded transition-colors ml-1"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <X size={12} />
                        </button>
                    </div>
                </div>

                {/* Video Content */}
                <div
                    ref={containerRef}
                    className={`flex-1 relative bg-black overflow-hidden ${is360Mode ? 'cursor-move' : ''}`}
                    onMouseDown={(e) => is360Mode && e.stopPropagation()}
                >
                    <motion.div
                        className="w-full h-full"
                        drag={is360Mode}
                        dragConstraints={containerRef}
                        dragElastic={0.1}
                        animate={{
                            scale: is360Mode ? 2 : 1,
                            x: is360Mode ? panPosition.x : 0,
                            y: is360Mode ? panPosition.y : 0
                        }}
                        transition={{ type: "spring", damping: 20 }}
                    >
                        <video
                            src={src}
                            className="w-full h-full object-cover pointer-events-none"
                            autoPlay
                            muted
                            loop
                        />
                    </motion.div>

                    {/* HUD Overlay (Visible in 360 Mode) */}
                    {is360Mode && (
                        <div className="absolute inset-0 pointer-events-none z-10">
                            {/* Crosshair */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-white/30 flex items-center justify-center">
                                <div className="w-0.5 h-2 bg-white/50 absolute top-0 -mt-1"></div>
                                <div className="w-0.5 h-2 bg-white/50 absolute bottom-0 -mb-1"></div>
                                <div className="h-0.5 w-2 bg-white/50 absolute left-0 -ml-1"></div>
                                <div className="h-0.5 w-2 bg-white/50 absolute right-0 -mr-1"></div>
                                <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                            </div>

                            {/* Compass Strip */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-48 h-6 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center overflow-hidden">
                                <div className="flex gap-4 text-[8px] font-mono text-white/70">
                                    <span>NW</span><span>N</span><span>NE</span><span>E</span>
                                </div>
                                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-red-500/50"></div>
                            </div>

                            {/* Data overlay */}
                            <div className="absolute bottom-2 left-2 text-[8px] font-mono text-emerald-400 space-y-0.5 drop-shadow-md">
                                <div>ALT: 120ft</div>
                                <div>SPD: 14kts</div>
                                <div>HDG: 042°</div>
                            </div>

                            <div className="absolute bottom-2 right-2 text-[8px] font-mono text-white/50">
                                360° PAN TILT ZOOM
                            </div>
                        </div>
                    )}

                    <div className="absolute top-2 left-2 flex gap-1 pointer-events-none">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[8px] text-white font-mono bg-black/50 px-1 rounded">LIVE</span>
                    </div>
                </div>
            </div>
        </Rnd>
    );
};

export default PiPOverlay;
