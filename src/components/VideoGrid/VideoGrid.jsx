import React from 'react';
import CameraFeed from './CameraFeed';
import { Grid } from 'lucide-react';

const cameraFeeds = [
    {
        id: 1,
        name: "BOW CAMERA [FWD]",
        status: "LIVE",
        src: "https://assets.mixkit.co/videos/42498/42498-720.mp4" // Ocean view / Bow
    },
    {
        id: 2,
        name: "MAST THERMAL [360]",
        status: "LIVE",
        src: "https://assets.mixkit.co/videos/1080/1080-720.mp4" // Aerial Sea View
    },
    {
        id: 3,
        name: "AFT DECK [PORT]",
        status: "REC",
        src: "https://assets.mixkit.co/videos/4059/4059-720.mp4" // Stormy Ocean
    },
    {
        id: 4,
        name: "ENGINE ROOM",
        status: "LIVE",
        src: "https://assets.mixkit.co/videos/23159/23159-720.mp4" // Server/Tech view
    }
];

const VideoGrid = ({ onCameraSelect }) => {
    return (
        <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800">
            {/* Header */}
            <div className="h-12 border-b border-slate-800 flex items-center px-4 gap-3 bg-slate-950/50 backdrop-blur-sm">
                <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                    <Grid size={18} />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-200 tracking-wide uppercase">Live Feeds</span>
                    <span className="text-[10px] text-slate-500 font-mono">ENCRYPTED • LOW LATENCY</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-green-500">SYSTEM ONLINE</span>
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 p-2 grid grid-cols-2 grid-rows-2 gap-2 overflow-hidden">
                {cameraFeeds.map((feed) => (
                    <CameraFeed
                        key={feed.id}
                        label={feed.name}
                        src={feed.src}
                        isLive={feed.status === 'LIVE'}
                        onSelect={() => onCameraSelect(feed.src, feed.name)}
                    />
                ))}
            </div>
        </div>
    );
};

export default VideoGrid;
