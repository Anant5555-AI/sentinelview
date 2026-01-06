# 🛡️ SentinelView
### Advanced Maritime Surveillance Dashboard

**SentinelView** is a high-fidelity, React-based tactical surveillance dashboard designed for maritime and security monitoring simulations. It features real-time 4-camera video feeds, a sophisticated drone HUD with 360° pan/tilt capabilities, and an interactive mission planning map.

![Project Status](https://img.shields.io/badge/Status-Operational-green) ![Build](https://img.shields.io/badge/Build-Vite%20%2B%20React-blue)

---

## 🚀 Key Features

### 🎥 Multi-Camera Surveillance Grid
*   **4-Channel Live Feed**: Monitor Bow, Mast (Thermal), Aft Deck, and Engine Room simultaneously.
*   **Real-time Status Indicators**: Visual cues for "LIVE", "REC", and system health.
*   **Interactive Controls**: Individual Zoom, Play/Pause, and Fullscreen modes for every camera.
*   **Drag-and-Drop PiP**: "Drone View" Picture-in-Picture overlay that can be toggled and moved.

### 🚁 Advanced Drone HUD
*   **360° Vision Mode**: Toggle "Enable 360" to enter a simulated immersive inspection mode.
*   **Pan & Tilt Control**: Drag to look around the environment.
*   **Telemetry Overlay**: Real-time altitude, speed, heading, and compass strip.
*   **Dynamic Source**: Capable of switching the drone feed to any of the main 4 cameras for closer inspection.

### 🗺️ Tactical Map & Mission Control
*   **Interactive Waypoints**: Click on the map to plot a patrol route.
*   **Mission Analytics**: Post-mission reports calculating nautical miles traveled, fuel consumption, and duration.
*   **Manual Launch**: "Start Mission" control to execute planned routes on command.
*   **Live Tracking**: Real-time vessel position updates with wake trail effects.
*   **Geofencing Tools**: Draw polygons and zones directly on the tactical map.

---

## 🛠️ Technology Stack
*   **Frontend**: React.js (Vite)
*   **Styling**: Tailwind CSS, Lucide Icons
*   **Animation**: Framer Motion
*   **Mapping**: Leaflet, React-Leaflet, Leaflet-Draw
*   **Video**: HTML5 Video API with controlled overlays

## 💻 Running Locally

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Anant5555-AI/sentinelview.git
    ```
2.  **Install dependencies**
    ```bash
    npm install
    ```
3.  **Start the mission server**
    ```bash
    npm run dev
    ```
4.  Access the dashboard at `http://localhost:5173`

---

*SentinelView is a conceptual dashboard for demonstration purposes.*
