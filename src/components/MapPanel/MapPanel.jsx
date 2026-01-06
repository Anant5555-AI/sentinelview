import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, FeatureGroup, useMapEvents, Tooltip, Polygon } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { List, Trash2, MapPin, X, Fuel, Navigation as NavigationIcon, Map as MapIcon, Anchor } from 'lucide-react';

// Fix for default Leaflet markers in Vite/React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Boat Icon using DivIcon for SVG
const createBoatIcon = (rotation) => L.divIcon({
    html: `<div style="transform: rotate(${rotation}deg); transition: transform 0.5s ease;">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2l7 19-7-4-7 4 7-19z"/>
    </svg>
  </div>`,
    className: 'bg-transparent',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

// Component to handle map clicks
const MapClickHandler = ({ onMapClick }) => {
    const isDrawingRef = useRef(false);

    useMapEvents({
        click: (e) => {
            if (!isDrawingRef.current) {
                onMapClick(e.latlng);
            }
        },
        'draw:drawstart': () => { isDrawingRef.current = true; },
        'draw:drawstop': () => { isDrawingRef.current = false; },
        'draw:created': () => { isDrawingRef.current = false; },
        'draw:deletestart': () => { isDrawingRef.current = true; },
        'draw:deletestop': () => { isDrawingRef.current = false; },
        'draw:editstart': () => { isDrawingRef.current = true; },
        'draw:editstop': () => { isDrawingRef.current = false; },
    });
    return null;
};


// Removed duplicate imports

const MapPanel = () => {
    const defaultCenter = [18.94, 72.83];
    const [position, setPosition] = useState(defaultCenter); // RESTORED
    const [path, setPath] = useState([defaultCenter]);
    const [pathHistory, setPathHistory] = useState([]); // Store complete history for stats calculation
    const [angle, setAngle] = useState(45); // Initial heading NE
    const [isTracking, setIsTracking] = useState(false);

    // New state for manual navigation
    const [targetPos, setTargetPos] = useState(null); // Current active destination
    const [waypointQueue, setWaypointQueue] = useState([]); // Queue of future waypoints
    const [anchorPos, setAnchorPos] = useState(defaultCenter); // Center of orbit
    const [alert, setAlert] = useState(null); // Navigation alerts

    const [showRouteList, setShowRouteList] = useState(false); // Toggle route list dropdown
    const [missionStats, setMissionStats] = useState(null); // Stores stats after mission complete

    // Ref to hold stable position AND angle for the interval loop
    const positionRef = useRef(defaultCenter);
    const angleRef = useRef(0);

    // Sync ref with state
    useEffect(() => {
        positionRef.current = position;
        angleRef.current = angle;
    }, [position, angle]);

    // Simulation Loop
    useEffect(() => {
        if (!isTracking) return;

        const interval = setInterval(() => {
            const currentPos = positionRef.current;
            const currentAngle = angleRef.current;

            let newPos = [...currentPos];
            let newHeading = currentAngle;

            if (targetPos) {
                // MODE: MOVING TO TARGET
                const dx = targetPos.lat - currentPos[0];
                const dy = targetPos.lng - currentPos[1];
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 0.0005) {
                    // Arrived! Switch to holding position (STATIONARY)
                    setAnchorPos([targetPos.lat, targetPos.lng]);
                    setTargetPos(null);
                    // Force update to snap exactly to target
                    newPos = [targetPos.lat, targetPos.lng];
                } else {
                    // Move towards target
                    const speed = 0.0002;
                    const moveX = (dx / distance) * speed;
                    const moveY = (dy / distance) * speed;
                    newPos = [currentPos[0] + moveX, currentPos[1] + moveY];

                    // Calculate desired heading
                    let targetHeading = (Math.atan2(dy, dx) * 180 / Math.PI);

                    // Smooth Turning Logic (Simulate Ship Inertia)
                    // Find shortest turn direction
                    let deltaAngle = ((targetHeading - currentAngle + 540) % 360) - 180;
                    let turnRate = 3; // Degrees per tick

                    if (Math.abs(deltaAngle) < turnRate) {
                        newHeading = targetHeading;
                    } else {
                        newHeading = currentAngle + (Math.sign(deltaAngle) * turnRate);
                    }

                    setAngle(newHeading);
                }
            } else {
                // MODE: STATIONARY (Station Keeping Simulation)
                // Simulate subtle drift/course correction (Figure-8 pattern)
                const time = Date.now() / 2000;
                const driftRadius = 0.0002;

                newPos[0] = anchorPos[0] + Math.sin(time) * driftRadius * 0.5;
                newPos[1] = anchorPos[1] + Math.sin(time * 2) * driftRadius;

                // Slowly rotate heading to face the "drift"
                const driftHeading = (Math.cos(time) * 15) + angle; // Oscillate heading
                setAngle(prev => prev + (driftHeading - prev) * 0.05);
            }

            // Update State
            setPosition(newPos);


            // Update Path History (Wake Effect) AND Stats Accumulation
            setPath(prev => {
                if (targetPos) {
                    // MOVING: Generate Wake (Add points to trail)
                    const last = prev[prev.length - 1] || newPos;
                    const distMoved = Math.sqrt(Math.pow(newPos[0] - last[0], 2) + Math.pow(newPos[1] - last[1], 2));

                    if (distMoved > 0.0001) {
                        const updated = [...prev, newPos];

                        // Accumulate full history for stats (separate state to avoid visual lag on large arrays)
                        setPathHistory(history => [...history, newPos]);

                        if (updated.length > 150) return updated.slice(-150); // Limit trail length for visuals
                        return updated;
                    }
                    return prev;
                } else {
                    // STOPPED: Dissipate Wake (Shrink trail from tail)
                    if (prev.length > 0) {
                        return prev.slice(1);
                    }
                    return prev;
                }
            });

        }, 50);

        return () => clearInterval(interval);
    }, [isTracking, targetPos, anchorPos]);

    // Define the safe navigable channel (Indian Ocean / Mumbai Harbour Zone)
    const navigablePolygon = [
        [18.96, 72.80],
        [18.92, 72.82],
        [18.90, 72.85],
        [18.91, 72.90],
        [18.95, 72.90],
        [18.98, 72.86]
    ];

    // Ray-Casting Algorithm for Point in Polygon
    const isPointInPolygon = (point, vs) => {
        let x = point[0], y = point[1];
        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            let xi = vs[i][0], yi = vs[i][1];
            let xj = vs[j][0], yj = vs[j][1];

            let intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    };

    // Navigability Check
    const isNavigable = (lat, lng) => {
        // We are disabling the strict "Blue Zone" check.
        // In a real app, this would use a server-side depth database.
        // For this frontend demo, it's better to allow free movement than to be restricted to a tiny box.
        return true;
    };

    // Helper to convert heading to compass direction
    const getCompassDirection = (angle) => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8;
        return directions[index];
    };

    // Mission Complete / Waypoint Processing logic
    useEffect(() => {
        // Mission Complete Check
        // If we have no target, no queued waypoints, but were just tracking
        // REMOVED 'path.length > 50' check - it was too strict for short demos
        if (!targetPos && waypointQueue.length === 0 && isTracking) {
            // REAL Analytics Calculation based on Path History
            // 1. Calculate total distance in coordinate units
            let totalDist = 0;
            for (let i = 1; i < pathHistory.length; i++) {
                const p1 = pathHistory[i - 1];
                const p2 = pathHistory[i];
                totalDist += Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
            }

            // 2. Convert to Nautical Miles (Approx: 1 deg lat = 60 NM)
            // Simple scalar for demo realism
            const nauticalMiles = (totalDist * 60 * 1.5).toFixed(2);

            // 3. Fuel Calculation (e.g. 15 Liters per NM at high speed)
            const fuelConsumed = (nauticalMiles * 15.2).toFixed(1);

            // Automatically OPEN the route list so user sees the stats
            setMissionStats({
                distance: nauticalMiles,
                fuel: fuelConsumed,
                duration: `${(pathHistory.length * 0.05 / 60).toFixed(1)}m` // Approx duration based on tick count 
            });
            setShowRouteList(true); // <--- Auto-open the dropdown
            setIsTracking(false);
            setPathHistory([]); // Reset for next mission
        }
    }, [targetPos, waypointQueue, isTracking, path]);

    // Waypoint Processing Effect
    useEffect(() => {
        // If we have no active target but have points in the queue, pop the next one
        if (!targetPos && waypointQueue.length > 0) {
            const nextWaypoint = waypointQueue[0];
            setTargetPos(nextWaypoint);
            setWaypointQueue(prev => prev.slice(1));
        }
    }, [targetPos, waypointQueue]);

    const handleMapClick = (latlng) => {
        if (!isNavigable(latlng.lat, latlng.lng)) {
            // Show Alert
            setAlert("⚠️ NAVIGATION HAZARD: LAND / SHALLOW WATER DETECTED");
            setTimeout(() => setAlert(null), 3000);
            return;
        }

        // Add to queue instead of immediately overriding
        setWaypointQueue(prev => [...prev, latlng]);
        // REMOVED: setIsTracking(true); <-- This prevents auto-start
        setAlert(null);
        setShowRouteList(true); // Auto-open route list to show added point
    };

    const handleCreated = (e) => {
        const type = e.layerType;
        const layer = e.layer;

        if (type === 'marker') {
            // Add a popup to the new marker
            layer.bindPopup('New Point of Interest');
        } else {
            // For shapes (Polygon, Circle, Rectangle), add a popup describing them
            const shapeName = type.charAt(0).toUpperCase() + type.slice(1);
            layer.bindPopup(`${shapeName} Zone Created`);
        }

        // Ensure the new layer is added to the FeatureGroup for display
        // Note: react-leaflet-draw usually handles this automatically, but explicit logging helps debug.
        console.log("Shape created:", type, layer);
    };

    return (
        <div className="flex flex-col h-full bg-slate-950/50 rounded-2xl border border-slate-800 p-4 backdrop-blur-sm relative overflow-hidden">


            {/* Alert Toast */}
            {alert && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[500] pointer-events-none w-max">
                    <div className="bg-red-500/90 border border-red-400 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-xl animate-bounce flex items-center gap-2 backdrop-blur-sm">
                        <span>❌</span>
                        {alert}
                    </div>
                </div>
            )}


            {/* Route List Dropdown Toggle */}
            <div className="absolute top-20 left-4 z-[400]">
                <button
                    onClick={() => setShowRouteList(!showRouteList)}
                    className="bg-slate-900/90 border border-slate-700 text-slate-300 p-2 rounded-lg backdrop-blur-md shadow-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                    <List size={18} />
                    <span className="text-xs font-bold">ROUTE ({waypointQueue.length})</span>
                </button>

                {/* Dropdown Content */}
                {showRouteList && (
                    <div className="mt-2 w-64 bg-slate-900/95 border border-slate-700 rounded-lg shadow-xl backdrop-blur-md overflow-hidden max-h-64 flex flex-col">
                        <div className="p-2 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                            <span className="text-xs font-bold text-slate-400">MISSION PLAN</span>
                            <div className="flex gap-2">
                                {waypointQueue.length > 0 && !isTracking && (
                                    <button
                                        onClick={() => setIsTracking(true)}
                                        className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/40 px-2 py-0.5 rounded hover:bg-green-500/30 transition-colors uppercase font-bold animate-pulse"
                                        title="Start Mission"
                                    >
                                        Start Mission
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setWaypointQueue([]);
                                        setTargetPos(null);
                                        setMissionStats(null);
                                        setIsTracking(false);
                                    }}
                                    className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10"
                                    title="Abort / Clear"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                            {/* Mission Completed Analytics Card */}
                            {missionStats && !targetPos && waypointQueue.length === 0 && (
                                <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded mb-2 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                                            <NavigationIcon size={10} /> MISSION COMPLETE
                                        </span>
                                        <button onClick={() => setMissionStats(null)} className="text-emerald-400/50 hover:text-emerald-400">
                                            <X size={10} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-center">
                                        <div className="bg-slate-900/50 rounded p-1">
                                            <div className="text-[9px] text-slate-400">DISTANCE</div>
                                            <div className="text-sm font-bold text-white">{missionStats.distance} <span className="text-[10px] font-normal text-slate-500">NM</span></div>
                                        </div>
                                        <div className="bg-slate-900/50 rounded p-1">
                                            <div className="text-[9px] text-slate-400 flex justify-center gap-1"><Fuel size={8} className="mt-0.5" /> FUEL</div>
                                            <div className="text-sm font-bold text-white">{missionStats.fuel} <span className="text-[10px] font-normal text-slate-500">L</span></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!targetPos && waypointQueue.length === 0 && !missionStats ? (
                                <div className="text-slate-500 text-[10px] text-center py-4 italic">
                                    No active route.<br />Click map to add waypoints.
                                </div>
                            ) : (
                                <>
                                    {targetPos && (
                                        <div className="flex items-center gap-2 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                                            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-slate-900 font-bold shrink-0 animate-pulse">
                                                Go
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-emerald-400 text-[10px] font-bold truncate">Active Destination</div>
                                                <div className="text-slate-500 text-[9px] font-mono truncate">
                                                    {targetPos.lat.toFixed(4)}, {targetPos.lng.toFixed(4)}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {waypointQueue.map((wp, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-slate-800/50 p-2 rounded border border-slate-700 hover:bg-slate-800 transition-colors group">
                                            <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[9px] text-slate-400 font-bold shrink-0 border border-slate-600 group-hover:bg-amber-500 group-hover:text-slate-900 group-hover:border-amber-400 transition-colors">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-slate-300 text-[10px] truncate">Waypoint {idx + 1}</div>
                                                <div className="text-slate-600 text-[9px] font-mono truncate">
                                                    {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setWaypointQueue(prev => prev.filter((_, i) => i !== idx))}
                                                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <MapIcon size={20} />
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide">OPERATIONAL MAP</h2>

                <div className="mx-4 text-xs text-slate-400 hidden md:block">
                    <span className="text-blue-400 font-bold">CLICK ON MAP</span> TO RE-POSITION VESSEL
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <div className="hidden lg:flex bg-slate-900/90 border border-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-mono backdrop-blur-md items-center gap-2 shadow-lg">
                        <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                        STATUS: <span className="text-white">{targetPos ? 'TRANSIT' : 'STATION'}</span>
                    </div>

                    <button
                        onClick={() => setIsTracking(!isTracking)}
                        className={`px-3 py-1 rounded border text-xs font-bold transition-all ${isTracking ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-slate-600 text-slate-500 hover:text-slate-300'}`}
                    >
                        {isTracking ? 'TRACKING ON' : 'PAUSED'}
                    </button>
                </div>
            </div>

            <div className="flex-1 rounded-xl overflow-hidden shadow-inner border border-slate-800 relative z-0">
                <MapContainer center={defaultCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    <MapClickHandler onMapClick={handleMapClick} />

                    {/* Navigable Channel Visualization */}
                    <Polygon
                        positions={navigablePolygon}
                        pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.1, weight: 1, dashArray: '5, 5' }}
                    />

                    <FeatureGroup>
                        <EditControl
                            position="topright"
                            onCreated={handleCreated}
                            draw={{
                                rectangle: true,
                                circle: true,
                                polyline: true,
                                polygon: true,
                                marker: true,
                                circlemarker: false
                            }}
                        />
                    </FeatureGroup>

                    <Marker position={position} icon={createBoatIcon(angle)}>
                        <Tooltip direction="bottom" offset={[0, 15]} opacity={1} permanent className="font-bold text-xs">
                            VSL-102
                        </Tooltip>
                        <Popup>
                            <div className="w-64 p-0.5">
                                {/* Header - Data Link Style */}
                                <div className="flex items-center justify-between bg-slate-100 p-2 rounded-t mb-1 border-b border-slate-300">
                                    <div className="flex flex-col">
                                        <span className="text-slate-900 font-bold text-xs">ID: VSL-102</span>
                                        <span className="text-[10px] text-slate-500 font-mono">CLASS: PATROL DRONE</span>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${targetPos ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {targetPos ? 'TRANSIT' : 'STATION'}
                                    </div>
                                </div>

                                {/* Video Feed */}
                                <div className="relative aspect-video bg-black overflow-hidden mb-1 mx-1 rounded border border-slate-200">
                                    <video
                                        src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
                                        className="w-full h-full object-cover opacity-90"
                                        autoPlay
                                        muted
                                        loop
                                    />
                                    {/* OSD Overlay */}
                                    <div className="absolute top-1 left-1 text-[8px] text-green-400 font-mono bg-black/50 px-1">CAM-1: LIVE</div>
                                    <div className="absolute bottom-1 right-1 text-[8px] text-white font-mono flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> REC
                                    </div>
                                </div>

                                {/* Telemetry Data Grid */}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 p-2 text-[10px] font-mono text-slate-600">
                                    <div className="flex justify-between border-b border-slate-100 pb-0.5">
                                        <span>SPEED:</span>
                                        <span className="font-bold text-slate-900">{targetPos ? '12.0' : '0.0'} knots</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-0.5">
                                        <span>HEADING:</span>
                                        <span className="font-bold text-slate-900">{getCompassDirection(angle)} ({Math.round(angle).toString().padStart(3, '0')}°)</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-0.5">
                                        <span>LAT:</span>
                                        <span className="font-bold text-slate-900">{position[0].toFixed(5)}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-0.5">
                                        <span>LNG:</span>
                                        <span className="font-bold text-slate-900">{position[1].toFixed(5)}</span>
                                    </div>
                                    <div className="flex justify-between col-span-2 pt-1">
                                        <span>LAST UPDATE:</span>
                                        <span className="font-bold text-green-600">3s ago</span>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Destination Marker */}
                    {targetPos && (
                        <Marker position={targetPos}>
                            <Popup>Destination</Popup>
                        </Marker>
                    )}

                    <Polyline positions={path} color="#3b82f6" weight={3} opacity={0.6} dashArray="5, 10" />

                    {/* Draw line to target if exists */}
                    {targetPos && (
                        <Polyline positions={[position, targetPos]} color="#10b981" weight={2} dashArray="2, 4" />
                    )}

                    {/* Draw Planned Route (Waypoints) */}
                    {waypointQueue.length > 0 && (
                        <>
                            {/* Line connecting Target to First Waypoint */}
                            {targetPos && (
                                <Polyline positions={[targetPos, waypointQueue[0]]} color="#f59e0b" weight={2} dashArray="5, 5" opacity={0.6} />
                            )}

                            {/* Lines connecting subsequent waypoints */}
                            <Polyline positions={waypointQueue} color="#f59e0b" weight={2} dashArray="5, 5" opacity={0.6} />

                            {/* Waypoint Markers */}
                            {waypointQueue.map((wp, idx) => (
                                <Marker key={idx} position={wp} icon={L.divIcon({
                                    className: 'custom-icon',
                                    html: `<div class="w-2 h-2 bg-amber-500 rounded-full border border-white shadow-sm"></div>`
                                })}>
                                    <Popup>Waypoint {idx + 1}</Popup>
                                </Marker>
                            ))}
                        </>
                    )}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapPanel;
