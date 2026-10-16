import React, { useRef, useState, useEffect } from 'react';
import { ClassroomState } from '../types';
import { 
  Camera, 
  Video, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Users, 
  Maximize2, 
  Sliders, 
  EyeOff,
  Radio,
  UserPlus,
  UserMinus
} from 'lucide-react';

interface CCTVViewerProps {
  classroom: ClassroomState;
  onUpdateOccupancy: (count: number) => void;
  onToggleCameraFailure: (fail: boolean) => void;
  onChangeFeedMode: (mode: ClassroomState['cameraFeedMode']) => void;
}

export const CCTVViewer: React.FC<CCTVViewerProps> = ({
  classroom,
  onUpdateOccupancy,
  onToggleCameraFailure,
  onChangeFeedMode,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(29.8);

  // Generate synthetic bounding boxes based on current occupancy
  const generateBoundingBoxes = (count: number, width: number, height: number) => {
    const boxes = [];
    const seed = classroom.id === 'CR-101' ? 12 : classroom.id === 'CR-102' ? 44 : 78;
    for (let i = 0; i < count; i++) {
      // distribute across rows & cols pseudo-randomly
      const col = i % 8;
      const row = Math.floor(i / 8);
      const baseX = 40 + col * (width / 8.5) + (Math.sin(i * 1.5 + seed) * 15);
      const baseY = 60 + row * (height / 6.5) + (Math.cos(i * 2.1 + seed) * 12);
      const w = 36 + (i % 3) * 6;
      const h = 58 + (i % 2) * 8;
      const conf = (88 + ((i * 7 + seed) % 11)).toFixed(1);
      boxes.push({ id: i + 1, x: baseX, y: baseY, w, h, conf });
    }
    return boxes;
  };

  // Start real webcam
  const handleToggleWebcam = async () => {
    if (webcamActive) {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
      }
      setWebcamStream(null);
      setWebcamActive(false);
      onChangeFeedMode('stream_lecture');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
        setWebcamStream(stream);
        setWebcamActive(true);
        onChangeFeedMode('webcam');
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.warn('Webcam permission not granted or device not available:', err);
        alert('Could not access local webcam. Falling back to authorized CCTV simulated stream.');
      }
    }
  };

  // Canvas drawing loop for OpenCV HUD & bounding boxes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      // Calculate realistic FPS
      const delta = time - lastTime;
      if (delta > 0) {
        setFps(Number((1000 / delta).toFixed(1)));
      }
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!classroom.cameraConnected) {
        // CCTV Signal lost screen
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Scan lines & static noise
        ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
        for (let i = 0; i < canvas.height; i += 4) {
          ctx.fillRect(0, i, canvas.width, 1);
        }

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 20px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('NO SIGNAL - CCTV RTSP STREAM TIMEOUT', canvas.width / 2, canvas.height / 2 - 10);
        ctx.font = '14px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Fail-safe mode: Retaining last known occupancy state to prevent safety drops.', canvas.width / 2, canvas.height / 2 + 20);
        return;
      }

      // Background video or simulated lecture room background
      if (!webcamActive) {
        // Draw synthetic classroom hall background
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Perspective lecture benches / desks
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
        ctx.lineWidth = 1;
        for (let row = 0; row < 5; row++) {
          const y = 80 + row * 60;
          ctx.beginPath();
          ctx.moveTo(20, y);
          ctx.lineTo(canvas.width - 20, y);
          ctx.stroke();
        }

        // Projector screen area at top
        if (classroom.projectionActive) {
          ctx.fillStyle = 'rgba(147, 51, 234, 0.15)';
          ctx.fillRect(canvas.width / 2 - 120, 15, 240, 45);
          ctx.strokeStyle = '#a855f7';
          ctx.strokeRect(canvas.width / 2 - 120, 15, 240, 45);
          ctx.fillStyle = '#c084fc';
          ctx.font = '10px "JetBrains Mono"';
          ctx.textAlign = 'center';
          ctx.fillText('PROJECTOR BEAM ACTIVE [1080P]', canvas.width / 2, 40);
        }
      }

      // Grid overlay
      if (showGrid) {
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.lineWidth = 1;
        const step = 40;
        for (let x = 0; x < canvas.width; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      // Render Detected People Bounding Boxes (OpenCV Style)
      const boxes = generateBoundingBoxes(classroom.occupancy, canvas.width, canvas.height);
      boxes.forEach((box) => {
        const isOver = classroom.isOvercapacity;
        const strokeColor = isOver ? '#f43f5e' : '#10b981';
        const fillColor = isOver ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.1)';

        // Box
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        ctx.fillStyle = fillColor;
        ctx.fillRect(box.x, box.y, box.w, box.h);
        ctx.strokeRect(box.x, box.y, box.w, box.h);

        // Corner ticks
        const tLen = 6;
        ctx.beginPath();
        // Top-left
        ctx.moveTo(box.x, box.y + tLen); ctx.lineTo(box.x, box.y); ctx.lineTo(box.x + tLen, box.y);
        // Top-right
        ctx.moveTo(box.x + box.w - tLen, box.y); ctx.lineTo(box.x + box.w, box.y); ctx.lineTo(box.x + box.w, box.y + tLen);
        // Bottom-left
        ctx.moveTo(box.x, box.y + box.h - tLen); ctx.lineTo(box.x, box.y + box.h); ctx.lineTo(box.x + tLen, box.y + box.h);
        // Bottom-right
        ctx.moveTo(box.x + box.w - tLen, box.y + box.h); ctx.lineTo(box.x + box.w, box.y + box.h); ctx.lineTo(box.x + box.w, box.y + box.h - tLen);
        ctx.stroke();

        // Label Tag
        ctx.fillStyle = strokeColor;
        ctx.fillRect(box.x, box.y - 14, box.w, 14);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`P${box.id} ${box.conf}%`, box.x + 2, box.y - 3);

        // Centroid dot
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(box.x + box.w / 2, box.y + box.h / 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // HUD Status Header on Canvas
      ctx.fillStyle = 'rgba(2, 6, 23, 0.7)';
      ctx.fillRect(8, 8, 220, 24);
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.7)';
      ctx.strokeRect(8, 8, 220, 24);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`RTSP://CCTV-${classroom.id}.LIVE`, 16, 24);

      // FPS and AI model indicator
      ctx.fillStyle = 'rgba(2, 6, 23, 0.7)';
      ctx.fillRect(canvas.width - 150, 8, 142, 24);
      ctx.strokeRect(canvas.width - 150, 8, 142, 24);
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`OPENCV-YOLO: ${classroom.occupancy} DET`, canvas.width - 142, 24);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [classroom.occupancy, classroom.cameraConnected, classroom.isOvercapacity, showGrid, webcamActive, classroom.projectionActive]);

  const availableSeats = Math.max(0, classroom.capacity - classroom.occupancy);
  const occupancyPct = Math.round((classroom.occupancy / classroom.capacity) * 100);

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 sm:p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
      {/* Top Bar: Title & Feed Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800/80">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>CCTV Stream & Computer Vision Pipeline</span>
              <span className={`w-2 h-2 rounded-full ${classroom.cameraConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
            </h3>
            <p className="text-[11px] text-slate-400">
              Real-time person detection, zone localization, and head-count tracking
            </p>
          </div>
        </div>

        {/* Source selector buttons */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            onClick={handleToggleWebcam}
            className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center space-x-1 border transition ${
              webcamActive
                ? 'bg-rose-950 text-rose-300 border-rose-700'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Video className="w-3 h-3 mr-1" />
            <span>{webcamActive ? 'Stop Webcam' : 'Use Webcam'}</span>
          </button>

          <button
            onClick={() => onToggleCameraFailure(!classroom.cameraConnected)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center space-x-1 border transition ${
              !classroom.cameraConnected
                ? 'bg-amber-950 text-amber-300 border-amber-700'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Simulate loss of CCTV feed to test safe failure handling"
          >
            <EyeOff className="w-3 h-3 mr-1 text-amber-400" />
            <span>{!classroom.cameraConnected ? 'Restore CCTV' : 'Simulate Drop'}</span>
          </button>
        </div>
      </div>

      {/* Overcapacity Critical Alert Banner */}
      {classroom.isOvercapacity && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-rose-950/80 border border-rose-600 text-rose-200 text-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold">
              CRITICAL: Room capacity exceeded! ({classroom.occupancy} / {classroom.capacity} seats).
            </span>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 bg-rose-900 rounded font-bold uppercase">
            +{classroom.occupancy - classroom.capacity} Overlimit
          </span>
        </div>
      )}

      {/* Video / Canvas Viewport */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 shadow-inner group">
        {/* Hidden video element for webcam */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${webcamActive ? 'block' : 'hidden'}`}
        />

        {/* OpenCV HUD Canvas */}
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />

        {/* Scanline overlay effect */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-24 animate-scanline" />

        {/* Live Badges on Stream */}
        <div className="absolute bottom-2 left-2 flex items-center space-x-2 text-[10px] font-mono pointer-events-none">
          <span className="px-1.5 py-0.5 bg-black/80 text-emerald-400 border border-emerald-900 rounded flex items-center space-x-1">
            <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
            <span>LIVE 1080P</span>
          </span>
          <span className="px-1.5 py-0.5 bg-black/80 text-slate-300 border border-slate-800 rounded">
            FPS: {fps}
          </span>
        </div>

        {/* Controls Overlay on hover */}
        <div className="absolute top-2 right-2 flex items-center space-x-1.5 opacity-80 group-hover:opacity-100 transition">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className="p-1 rounded bg-black/70 text-slate-300 hover:text-white border border-slate-700 text-[10px]"
            title="Toggle zone grid overlay"
          >
            Grid
          </button>
        </div>
      </div>

      {/* Presets and Headcount Adjuster for Demo / Hackathon testing */}
      <div className="mt-3 pt-3 border-t border-slate-800/80">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <button
            onClick={() => onUpdateOccupancy(28)}
            className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 font-medium text-left transition border border-slate-700/60"
          >
            <div className="font-semibold text-slate-100">Lecture (28)</div>
            <div className="text-[10px] text-slate-400">Normal class</div>
          </button>

          <button
            onClick={() => onUpdateOccupancy(classroom.capacity + 6)}
            className="px-2 py-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-[11px] text-rose-200 font-medium text-left transition border border-rose-800/60"
          >
            <div className="font-semibold text-rose-300">Overcapacity ({classroom.capacity + 6})</div>
            <div className="text-[10px] text-rose-400">Trigger alert</div>
          </button>

          <button
            onClick={() => onUpdateOccupancy(0)}
            className="px-2 py-1.5 rounded bg-amber-950/40 hover:bg-amber-900/60 text-[11px] text-amber-200 font-medium text-left transition border border-amber-800/60"
          >
            <div className="font-semibold text-amber-300">Vacated (0)</div>
            <div className="text-[10px] text-amber-400">Test 5-min timer</div>
          </button>

          <button
            onClick={() => onUpdateOccupancy(15)}
            className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 font-medium text-left transition border border-slate-700/60"
          >
            <div className="font-semibold text-slate-100">Seminar (15)</div>
            <div className="text-[10px] text-slate-400">Low occupancy</div>
          </button>
        </div>

        {/* Headcount Fine-Tuning Slider */}
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-400 font-medium">Real-Time Headcount Adjuster:</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateOccupancy(Math.max(0, classroom.occupancy - 1))}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Decrement 1 person"
            >
              <UserMinus className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono font-bold text-white text-sm w-8 text-center">
              {classroom.occupancy}
            </span>
            <button
              onClick={() => onUpdateOccupancy(classroom.occupancy + 1)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Increment 1 person"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max={classroom.capacity + 15}
          value={classroom.occupancy}
          onChange={(e) => onUpdateOccupancy(parseInt(e.target.value, 10))}
          className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />

        {/* Occupancy Stats Cards */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 tracking-wider font-semibold block">
              Occupancy
            </span>
            <span className={`text-base font-bold font-mono ${classroom.isOvercapacity ? 'text-rose-400' : 'text-emerald-400'}`}>
              {classroom.occupancy}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 tracking-wider font-semibold block">
              Capacity
            </span>
            <span className="text-base font-bold font-mono text-slate-200">
              {classroom.capacity}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 tracking-wider font-semibold block">
              Available Seats
            </span>
            <span className="text-base font-bold font-mono text-cyan-400">
              {availableSeats}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
