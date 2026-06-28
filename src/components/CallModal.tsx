import { useEffect, useState, useRef } from "react";
import { Phone, Video, PhoneOff, Mic, MicOff, VideoOff, Volume2, VolumeX } from "lucide-react";
import { Contact } from "../types";

interface CallModalProps {
  contact: Contact;
  type: "voice" | "video";
  direction: "incoming" | "outgoing";
  onHangUp: (duration?: string) => void;
  onAcceptIncoming: () => void;
}

export default function CallModal({
  contact,
  type,
  direction,
  onHangUp,
  onAcceptIncoming
}: CallModalProps) {
  const [callState, setCallState] = useState<"ringing" | "connecting" | "active">(
    direction === "incoming" ? "ringing" : "connecting"
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Active call duration timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callState === "active") {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // Outgoing auto-connecting animation
  useEffect(() => {
    if (direction === "outgoing" && callState === "connecting") {
      const ringTimer = setTimeout(() => {
        setCallState("active");
      }, 2500);
      return () => clearTimeout(ringTimer);
    }
  }, [direction, callState]);

  // Canvas visualizer loop for immersive background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    let phase = 0;
    const particles: Array<{ x: number; y: number; size: number; speedY: number; alpha: number }> = [];
    if (type === "video") {
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 4 + 2,
          speedY: -(Math.random() * 1.5 + 0.5),
          alpha: Math.random() * 0.5 + 0.3
        });
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (type === "voice") {
        // Render beautiful glowing sine waves representing voice waveform
        ctx.strokeStyle = "rgba(14, 165, 233, 0.4)";
        ctx.lineWidth = 3;

        // Wave 1 (Base Wave)
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const amplitude = callState === "active" ? 35 : 10;
          const frequency = 0.006;
          const y = height / 2 + Math.sin(x * frequency + phase) * amplitude * Math.sin(x / width * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Wave 2 (Supporting Wave)
        ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const amplitude = callState === "active" ? 20 : 5;
          const frequency = 0.012;
          const y = height / 2 + Math.cos(x * frequency - phase) * amplitude * Math.sin(x / width * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        phase += 0.04;
      } else {
        // Video Call Grid Matrix or custom particles
        if (isCamOff) {
          // Render simple camera off message or static texture
          ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
          ctx.fillRect(0, 0, width, height);
        } else {
          // Beautiful dark green/blue gradient base
          const gradient = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
          gradient.addColorStop(0, "rgba(15, 118, 110, 0.25)"); // teal-700
          gradient.addColorStop(1, "rgba(15, 23, 42, 0.95)"); // dark blue slate
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);

          // Grid Scanner lines
          ctx.strokeStyle = "rgba(20, 184, 166, 0.06)";
          ctx.lineWidth = 1;
          for (let y = 0; y < height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }

          // Floating particles representing data bytes / space
          particles.forEach((p) => {
            ctx.fillStyle = `rgba(20, 184, 166, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            p.y += p.speedY;
            if (p.y < -10) {
              p.y = height + 10;
              p.x = Math.random() * width;
            }
          });

          // Soft geometric pulse in center
          ctx.strokeStyle = "rgba(20, 184, 166, 0.15)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(width / 2, height / 2, 120 + Math.sin(phase) * 15, 0, Math.PI * 2);
          ctx.stroke();

          phase += 0.02;
        }
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [type, callState, isCamOff]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleEndCall = () => {
    const finalDuration = callState === "active" ? formatTime(seconds) : undefined;
    onHangUp(finalDuration);
  };

  const handleAccept = () => {
    setCallState("active");
    onAcceptIncoming();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between overflow-hidden select-none" id="call-modal-overlay">
      {/* Background Canvas Visualizer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Top Header - Info */}
      <div className="relative z-10 p-8 flex flex-col items-center mt-12 text-center">
        <div className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-extrabold shadow-2xl relative ${contact.bgColor}`}>
          {contact.avatar}
          {/* Pulsing indicator for active/ringing */}
          {callState !== "active" && (
            <span className="absolute inset-0 rounded-full bg-inherit animate-ping opacity-25 pointer-events-none" />
          )}
        </div>
        <h2 className="mt-6 text-2xl font-bold text-white tracking-tight">{contact.name}</h2>
        <p className="text-sm font-semibold tracking-wider text-sky-400 uppercase mt-2">
          {type === "voice" ? "SkyChat Audio Call" : "SkyChat Video Call"}
        </p>
        <p className="mt-2 text-sm text-neutral-300 font-medium tracking-wide">
          {callState === "ringing" && "Incoming Call..."}
          {callState === "connecting" && "Calling..."}
          {callState === "active" && (
            <span className="flex items-center gap-1.5 justify-center bg-sky-500/10 text-sky-400 px-3 py-1 rounded-full text-xs border border-sky-500/20">
              <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse" />
              Active • {formatTime(seconds)}
            </span>
          )}
        </p>
      </div>

      {/* Center Camera Stream Simulation (Only for active video calls) */}
      {type === "video" && callState === "active" && !isCamOff && (
        <div className="absolute inset-x-6 top-1/3 bottom-1/4 rounded-2xl border border-sky-500/30 overflow-hidden bg-slate-900 shadow-2xl flex items-center justify-center">
          {/* Smaller floating user picture-in-picture box */}
          <div className="absolute top-4 right-4 w-24 h-36 rounded-lg bg-slate-800 border border-white/10 overflow-hidden flex flex-col justify-center items-center shadow-lg">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2">You</span>
            <div className="w-8 h-8 rounded-full bg-sky-500 text-white font-bold text-xs flex items-center justify-center">ME</div>
          </div>
          <p className="text-xs text-sky-400 font-mono flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            HD VIDEO STREAM CH {contact.id.toUpperCase()}
          </p>
        </div>
      )}

      {/* Bottom Footer Controls */}
      <div className="relative z-10 p-8 pb-12 flex flex-col items-center gap-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
        {callState === "ringing" ? (
          /* Incoming Call Actions */
          <div className="flex gap-8 items-center">
            <button
              onClick={handleEndCall}
              className="p-5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-full shadow-lg transition duration-150 transform hover:-translate-y-0.5"
              id="decline-call-btn"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
            <button
              onClick={handleAccept}
              className="p-5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-full shadow-lg transition duration-150 transform hover:-translate-y-0.5 animate-bounce"
              id="accept-call-btn"
            >
              <Phone className="w-7 h-7" />
            </button>
          </div>
        ) : (
          /* Active / Calling Actions */
          <div className="flex flex-col gap-6 w-full max-w-sm">
            <div className="flex justify-around items-center gap-4 bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/5">
              {/* Mute Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-full transition duration-150 ${
                  isMuted ? "bg-rose-500 text-white" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
                id="mute-mic-btn"
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Speaker Button (Audio) / Camera Toggle (Video) */}
              {type === "video" ? (
                <button
                  onClick={() => setIsCamOff(!isCamOff)}
                  className={`p-3.5 rounded-full transition duration-150 ${
                    isCamOff ? "bg-rose-500 text-white" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  }`}
                  title={isCamOff ? "Turn Cam On" : "Turn Cam Off"}
                  id="toggle-cam-btn"
                >
                  {isCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              ) : (
                <button
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`p-3.5 rounded-full transition duration-150 ${
                    !isSpeakerOn ? "bg-neutral-800 text-neutral-500" : "bg-neutral-800 text-sky-400 hover:bg-neutral-700"
                  }`}
                  title="Toggle Speaker"
                  id="toggle-speaker-btn"
                >
                  {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              )}

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="p-3.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-full shadow-md transition duration-150"
                title="Hang Up"
                id="hangup-btn"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
