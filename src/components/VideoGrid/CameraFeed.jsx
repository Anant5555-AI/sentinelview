import React, { useState, useRef } from 'react';
import { Play, Pause, Maximize, ZoomIn, ZoomOut, PictureInPicture2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CameraFeed = ({ src, label, isLive = true, onSelect }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true); // Default to playing for autoPlay

    const [zoomLevel, setZoomLevel] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleZoom = (amount) => {
        setZoomLevel(prev => Math.max(1, Math.min(prev + amount, 3)));
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            if (containerRef.current) {
                containerRef.current.requestFullscreen();
            }
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    return (
        <div ref={containerRef} className="relative group bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
            {/* Header / Status */}
            <div className="absolute top-0 left-0 right-0 z-10 p-3 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                    <span className="text-xs font-mono font-semibold text-white/90 tracking-wider">
                        {label.toUpperCase()}
                    </span>
                </div>
                <div className="bg-black/50 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400">
                    REC ●
                </div>
            </div>

            {/* Video Content */}
            <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center">
                <motion.div
                    animate={{ scale: zoomLevel }}
                    className="w-full h-full"
                >
                    <video
                        ref={videoRef}
                        src={src}
                        className="w-full h-full object-cover"
                        muted
                        autoPlay
                        playsInline
                        loop
                        onError={(e) => console.log("Video Error", e)}
                    />
                </motion.div>
            </div>

            {/* Controls Overlay (Visible on Hover for Desktop, Always for Mobile) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                    <button
                        onClick={togglePlay}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                    >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} fill="white" />}
                    </button>

                    <div className="flex items-center gap-1 bg-white/10 rounded-full p-1 backdrop-blur-sm">
                        <button
                            onClick={() => handleZoom(-0.2)}
                            className="p-1 hover:text-blue-400 text-white transition-colors"
                        >
                            <ZoomOut size={14} />
                        </button>
                        <span className="text-xs w-8 text-center text-white/80 font-mono">
                            {Math.round(zoomLevel * 100)}%
                        </span>
                        <button
                            onClick={() => handleZoom(0.2)}
                            className="p-1 hover:text-blue-400 text-white transition-colors"
                        >
                            <ZoomIn size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {onSelect && (
                        <button
                            onClick={onSelect}
                            className="p-2 hover:text-blue-400 text-white transition-colors"
                            title="Open in Drone View"
                        >
                            <PictureInPicture2 size={16} />
                        </button>
                    )}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 hover:text-blue-400 text-white transition-colors"
                    >
                        <Maximize size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CameraFeed;
