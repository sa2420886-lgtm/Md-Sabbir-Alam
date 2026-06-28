import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { StatusStory, Contact } from "../types";

interface StatusViewerProps {
  story: StatusStory;
  contact: Contact;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function StatusViewer({
  story,
  contact,
  onClose,
  onNext,
  onPrev
}: StatusViewerProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (onNext) onNext();
          return 100;
        }
        return prev + 1;
      });
    }, 50); // 5 seconds total (50ms * 100)

    return () => clearInterval(interval);
  }, [story, onNext]);

  return (
    <div className="fixed inset-0 bg-neutral-950/95 z-50 flex flex-col items-center justify-center select-none" id="status-viewer-modal">
      {/* Top Bar Progress */}
      <div className="absolute top-4 left-4 right-4 z-10 flex gap-1.5 px-2">
        <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
          <div
            className="bg-sky-500 h-full transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Header Info */}
      <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between px-2 text-white">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${contact.bgColor}`}>
            {contact.avatar}
          </div>
          <div>
            <h4 className="font-semibold text-sm tracking-tight text-white">{contact.name}</h4>
            <p className="text-[11px] text-neutral-400 font-medium">{story.timestamp}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 bg-neutral-800/60 hover:bg-neutral-800 rounded-full transition text-neutral-300 hover:text-white"
          id="close-status-btn"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Left/Right controls (desktops) */}
      <div className="absolute inset-y-0 left-4 flex items-center z-10 hidden sm:flex">
        {onPrev && (
          <button
            onClick={onPrev}
            className="p-2 bg-neutral-900/60 hover:bg-neutral-800 text-white rounded-full transition"
            id="prev-status-btn"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
      </div>
      <div className="absolute inset-y-0 right-4 flex items-center z-10 hidden sm:flex">
        {onNext && (
          <button
            onClick={onNext}
            className="p-2 bg-neutral-900/60 hover:bg-neutral-800 text-white rounded-full transition"
            id="next-status-btn"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Content Container */}
      <div className="w-full max-w-md h-full sm:max-h-[80vh] px-4 flex items-center justify-center relative">
        {/* Simple tap zones for mobile */}
        <div className="absolute inset-y-20 left-0 w-1/3 z-20 cursor-pointer sm:hidden" onClick={onPrev} />
        <div className="absolute inset-y-20 right-0 w-1/3 z-20 cursor-pointer sm:hidden" onClick={onNext} />

        {story.type === "text" ? (
          <div className={`w-full max-w-xs aspect-[9/16] rounded-2xl bg-gradient-to-br ${story.bgColor || "from-teal-600 to-emerald-800"} p-8 flex flex-col justify-center items-center text-center shadow-2xl`}>
            <p className="text-xl sm:text-2xl font-medium text-white leading-relaxed tracking-wide select-text">
              {story.content}
            </p>
          </div>
        ) : (
          <div className="w-full max-w-xs aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 shadow-2xl relative flex items-center justify-center">
            <img
              src={story.content}
              alt="Status Story"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="absolute bottom-8 text-neutral-500 text-xs font-medium tracking-wide">
        Swipe or tap edge to navigate
      </div>
    </div>
  );
}
