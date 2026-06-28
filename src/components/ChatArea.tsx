import React, { useState, useEffect, useRef } from "react";
import { Send, Image, Mic, Paperclip, Phone, MoreVertical, X, Play, Pause, MapPin, Smile, Search, ChevronRight, AlertCircle } from "lucide-react";
import { Message, Contact, UserProfile } from "../types";

interface ChatAreaProps {
  contact: Contact;
  messages: Message[];
  onSendMessage: (text: string, image?: string, audio?: string, location?: { lat: number; lng: number; address: string }) => void;
  onInitiateCall: (type: "voice" | "video") => void;
  userProfile: UserProfile;
  isBotTyping: boolean;
}

// Popular quick emojis
const POPULAR_EMOJIS = ["😀", "😂", "🔥", "👍", "❤️", "🌸", "🍕", "💻", "✨", "🙌"];

// Smart quick actions based on contacts to guide the user immediately
const SMART_PRESETS: Record<string, string[]> = {
  skyai: [
    "Explain quantum computing simply",
    "Write a TypeScript binary search",
    "Give me 3 creative business ideas",
    "/draw a futuristic space station"
  ],
  serena: [
    "breathe",
    "I am feeling anxious today",
    "Give me a daily positive affirmation",
    "Recommend a 5-minute wind down habit"
  ],
  devon: [
    "How to configure CORS in Express?",
    "Explain event loop in Node.js",
    "What is the O(n) of quicksort?",
    "Review my code: function add(a, b) { return a+b; }"
  ],
  chef: [
    "Recipe for Neapolitan pizza dough",
    "How to properly sear a ribeye steak?",
    "Best substitute for parmesan cheese?",
    "What goes well with truffle butter?"
  ],
  zoe: [
    "Write a short poem about wind",
    "Suggest a sci-fi novel hook",
    "Tell me a story about a clockmaker",
    "Describe a magical library in one paragraph"
  ]
};

export default function ChatArea({
  contact,
  messages,
  onSendMessage,
  onInitiateCall,
  userProfile,
  isBotTyping
}: ChatAreaProps) {
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageAttachment, setImageAttachment] = useState<string | null>(null);
  
  // Audio note recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recorderCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const recorderAnimationRef = useRef<number | null>(null);

  // Active audio note playback states
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioPlaybackProgress, setAudioPlaybackProgress] = useState<Record<string, number>>({});
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Search inside active chat
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [showChatSearch, setShowChatSearch] = useState(false);

  // Contact Info Panel toggle
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  // Lightbox for full-size image viewing
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  // Audio note duration count
  useEffect(() => {
    if (isRecording) {
      setRecordDuration(0);
      recordIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    }
    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, [isRecording]);

  // Waveform visualization for recording
  useEffect(() => {
    if (!isRecording) return;
    const canvas = recorderCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#0284c7"; // sky-600
      
      const barWidth = 3;
      const gap = 3;
      const barCount = Math.floor(width / (barWidth + gap));
      
      for (let i = 0; i < barCount; i++) {
        // Calculate random wave heights representing sound
        const factor = Math.sin(i * 0.15 + Date.now() * 0.01) * 0.5 + 0.5;
        const randomFactor = Math.random() * 0.4 + 0.6;
        const barHeight = factor * randomFactor * (height - 10) + 4;
        
        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;
        
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
      
      recorderAnimationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (recorderAnimationRef.current) cancelAnimationFrame(recorderAnimationRef.current);
    };
  }, [isRecording]);

  // Format record duration (MM:SS)
  const formatRecordTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Handle Text Submission
  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !imageAttachment) return;

    onSendMessage(inputText, imageAttachment || undefined);
    setInputText("");
    setImageAttachment(null);
    setShowEmojiPicker(false);
  };

  // Preset Action Pills Click handler
  const handlePresetClick = (preset: string) => {
    onSendMessage(preset);
  };

  // Image Attachment processing
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageAttachment(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Simulate Location Message
  const handleSendLocation = () => {
    // Generate simple coordinates representing center of major cities
    const cities = [
      { address: "Colosseum, Rome, Italy 🇮🇹", lat: 41.8902, lng: 12.4922 },
      { address: "Silicon Valley, San Jose, CA 🇺🇸", lat: 37.3382, lng: -121.8863 },
      { address: "Vatican City, Rome, Italy 🇮🇹", lat: 41.9029, lng: 12.4534 },
      { address: "Marina Bay, Singapore 🇸🇬", lat: 1.2879, lng: 103.8518 }
    ];
    // Filter coordinates relevant to chef, devon, etc.
    let index = 0;
    if (contact.id === "chef") index = 0;
    else if (contact.id === "devon") index = 1;
    else index = Math.floor(Math.random() * cities.length);

    onSendMessage(`Sent location: ${cities[index].address}`, undefined, undefined, cities[index]);
  };

  // Recording triggers
  const startRecording = () => {
    setIsRecording(true);
  };

  const cancelRecording = () => {
    setIsRecording(false);
  };

  const stopAndSendRecording = () => {
    if (recordDuration < 1) {
      setIsRecording(false);
      return;
    }
    // Simulate a mock distinct visual base64 audio key
    const mockAudioData = "data:audio/mp3;base64,AUDIO_NOTE_MOCK_DATA";
    onSendMessage("🎙️ Voice note", undefined, mockAudioData);
    setIsRecording(false);
  };

  // Audio Note Playback Simulation
  const handleToggleAudioPlayback = (msgId: string) => {
    if (playingAudioId === msgId) {
      // Pause
      setPlayingAudioId(null);
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    } else {
      // Play
      setPlayingAudioId(msgId);
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);

      // Start tick progress simulation
      playbackIntervalRef.current = setInterval(() => {
        setAudioPlaybackProgress((prev) => {
          const current = prev[msgId] || 0;
          if (current >= 100) {
            if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
            setPlayingAudioId(null);
            return { ...prev, [msgId]: 0 };
          }
          return { ...prev, [msgId]: current + 5 };
        });
      }, 150);
    }
  };

  useEffect(() => {
    return () => {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    };
  }, []);

  // Filter messages in thread for search
  const filteredMessages = messages.filter((msg) =>
    chatSearchQuery ? msg.text?.toLowerCase().includes(chatSearchQuery.toLowerCase()) : true
  );

  return (
    <div className="flex-1 flex bg-neutral-50 h-full relative" id="skychat-active-pane">
      
      {/* Primary Conversation Stream Area */}
      <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] relative overflow-hidden">
        
        {/* Background Wallpaper Tiles Layer (Geometric Balance Grid Style) */}
        <div className="absolute inset-0 bg-slate-50 opacity-60 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(14, 165, 233, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }} />

        {/* Chat Header */}
        <div className="relative z-10 p-3 bg-white border-b border-neutral-100 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3.5 min-w-0 cursor-pointer" onClick={() => setShowInfoPanel(!showInfoPanel)}>
            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-inner ${contact.bgColor}`}>
              {contact.avatar}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-[15px] text-neutral-800 tracking-tight truncate leading-tight">{contact.name}</h3>
              <p className="text-[11px] font-semibold text-sky-600 mt-0.5 flex items-center gap-1">
                {isBotTyping ? (
                  <span className="text-sky-600 italic flex items-center gap-1 font-bold animate-pulse">
                    typing...
                  </span>
                ) : contact.status === "online" ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
                    Online
                  </>
                ) : contact.status === "typing" ? (
                  "typing..."
                ) : (
                  <span className="text-neutral-400 font-medium">{contact.lastSeenTime || "offline"}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-neutral-500">
            <button
              onClick={() => onInitiateCall("voice")}
              className="p-2 hover:bg-neutral-100 rounded-xl transition text-neutral-600"
              title="Voice Call"
              id="header-voice-call"
            >
              <Phone className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => onInitiateCall("video")}
              className="p-2 hover:bg-neutral-100 rounded-xl transition text-neutral-600 shrink-0"
              title="Video Call"
              id="header-video-call"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <div className="h-5 w-px bg-neutral-200 mx-1" />
            <button
              onClick={() => setShowChatSearch(!showChatSearch)}
              className="p-2 hover:bg-neutral-100 rounded-xl transition text-neutral-600"
              title="Search in messages"
              id="header-search-messages"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setShowInfoPanel(!showInfoPanel)}
              className="p-2 hover:bg-neutral-100 rounded-xl transition text-neutral-600"
              title="Contact Info"
              id="header-contact-info"
            >
              <MoreVertical className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Inline Message Search Banner */}
        {showChatSearch && (
          <div className="relative z-10 bg-white border-b border-neutral-100 p-2 flex items-center gap-2 shadow-sm shrink-0">
            <Search className="w-4 h-4 text-neutral-400 ml-2" />
            <input
              type="text"
              placeholder="Search words in this chat thread..."
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              className="flex-1 bg-neutral-100 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-sky-500/20"
            />
            {chatSearchQuery && (
              <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider px-2">
                {filteredMessages.length} matches
              </span>
            )}
            <button
              onClick={() => {
                setShowChatSearch(false);
                setChatSearchQuery("");
              }}
              className="p-1 hover:bg-neutral-100 rounded-md text-neutral-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Conversation Message List Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 relative z-10" id="chat-messages-container">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400">
              {chatSearchQuery ? (
                <AlertCircle className="w-8 h-8 mb-2 text-neutral-300" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold mb-3 animate-pulse">SC</div>
              )}
              <p className="text-sm font-semibold text-neutral-500">
                {chatSearchQuery ? "No matches found." : `Chat initialized with ${contact.name}`}
              </p>
              <p className="text-xs text-neutral-400 mt-1 max-w-[240px]">
                {chatSearchQuery ? "Try a different search word" : "Send a message to start conversing with AI companions."}
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMe = msg.sender === "me";
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-1.5`}
                >
                  {/* Message Bubble container */}
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm text-sm relative group transition duration-100 ${
                      isMe
                        ? "bg-sky-600 text-white rounded-2xl rounded-tr-none shadow-md shadow-sky-100/50 border border-sky-600/10"
                        : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-none shadow-sm"
                    }`}
                  >
                    
                    {/* Multimodal inline image attachment */}
                    {msg.image && (
                      <div
                        onClick={() => setLightboxImage(msg.image || null)}
                        className="mb-2 rounded-xl overflow-hidden cursor-pointer hover:opacity-95 border border-black/5 bg-neutral-100 max-h-60 flex items-center justify-center shadow-inner"
                      >
                        <img
                          src={msg.image}
                          alt="Attachment"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {/* Audio note player bubble */}
                    {msg.audio && (
                      <div className="flex items-center gap-3 py-1 px-1 min-w-[200px] sm:min-w-[240px]">
                        <button
                          onClick={() => handleToggleAudioPlayback(msg.id)}
                          className="w-10 h-10 rounded-full bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center shadow transition shrink-0 active:scale-95"
                        >
                          {playingAudioId === msg.id ? (
                            <Pause className="w-4 h-4 fill-white" />
                          ) : (
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          )}
                        </button>
                        
                        <div className="flex-1">
                          {/* Pulsing Audio waveform bar */}
                          <div className="flex items-end gap-0.5 h-6 mb-1.5 justify-around">
                            {Array.from({ length: 16 }).map((_, i) => {
                              const waveHeight = playingAudioId === msg.id 
                                ? Math.sin(i * 0.5 + Date.now() * 0.05) * 6 + 10 
                                : Math.random() * 4 + 4;
                              return (
                                <span
                                  key={i}
                                  className={`w-0.5 rounded-full ${playingAudioId === msg.id ? "bg-sky-600" : "bg-neutral-300"}`}
                                  style={{ height: `${waveHeight}px` }}
                                />
                              );
                            })}
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-bold text-neutral-400 uppercase font-mono tracking-wider">
                            <span>Audio Note</span>
                            <span>{audioPlaybackProgress[msg.id] || 0}% played</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Maps location bubble card */}
                    {msg.location && (
                      <div className="mb-2 rounded-xl border border-neutral-100 overflow-hidden bg-neutral-50 shadow-inner">
                        {/* Mock mini visual map card */}
                        <div className="h-28 bg-sky-50 relative flex items-center justify-center overflow-hidden">
                          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0284c7_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
                          <div className="relative z-10 flex flex-col items-center">
                            <MapPin className="w-8 h-8 text-rose-500 animate-bounce fill-rose-200" />
                            <span className="text-[10px] font-mono font-extrabold text-neutral-500 mt-1">
                              {msg.location.lat.toFixed(4)}, {msg.location.lng.toFixed(4)}
                            </span>
                          </div>
                        </div>
                        <div className="p-2 bg-white">
                          <p className="text-xs font-semibold text-neutral-800 truncate">{msg.location.address}</p>
                          <a
                            href={`https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-sky-600 font-bold hover:underline block mt-1 uppercase tracking-wider"
                          >
                            Open on Google Maps →
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Text content paragraph */}
                    {msg.text && (
                      <p className="whitespace-pre-wrap leading-relaxed select-text font-normal tracking-wide text-[13.5px]">
                        {msg.text}
                      </p>
                    )}

                    {/* Footer - timestamp & checkmarks inside bubble */}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-neutral-400 font-semibold tracking-wide select-none">
                      <span>{msg.timestamp}</span>
                      {isMe && (
                        <span className="text-sky-200 font-bold">
                          {msg.status === "sent" && "✓"}
                          {msg.status === "delivered" && "✓✓"}
                          {msg.status === "read" && "✓✓"}
                        </span>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
          )}

          {/* Chat Typing Animation loader */}
          {isBotTyping && (
            <div className="flex justify-start items-end gap-1.5">
              <div className="bg-white text-neutral-600 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-neutral-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Suggestion Pills bar */}
        {!isRecording && SMART_PRESETS[contact.id] && (
          <div className="relative z-10 px-4 py-2 flex gap-2 overflow-x-auto select-none shrink-0" style={{
            scrollbarWidth: "none"
          }}>
            {SMART_PRESETS[contact.id].map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetClick(preset)}
                className="bg-white/90 hover:bg-white text-neutral-600 hover:text-sky-600 font-semibold text-xs py-1.5 px-3 rounded-full border border-neutral-200/50 shadow-sm transition shrink-0 transform hover:-translate-y-0.5 active:scale-95"
              >
                {preset.startsWith("/") ? <span className="text-amber-500 font-black">⚡ {preset}</span> : preset}
              </button>
            ))}
          </div>
        )}

        {/* Image Attachment Drawer Preview above input box */}
        {imageAttachment && (
          <div className="relative z-10 bg-white border-t border-neutral-100 p-3 flex gap-3 shadow-md shrink-0">
            <div className="relative w-16 h-16 rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden shadow-inner flex items-center justify-center">
              <img
                src={imageAttachment}
                alt="Upload Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setImageAttachment(null)}
                className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-black text-white rounded-full transition"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-xs font-bold text-neutral-600">Attached image payload ready</p>
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">Gemini Multimodal input active</p>
            </div>
          </div>
        )}

        {/* Interactive Emoji tray */}
        {showEmojiPicker && !isRecording && (
          <div className="relative z-10 bg-white border-t border-neutral-100 p-2 flex gap-2 overflow-x-auto shrink-0 shadow-inner">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider self-center px-1">Quick:</span>
            {POPULAR_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setInputText((prev) => prev + emoji)}
                className="text-xl p-1.5 hover:bg-neutral-100 rounded-lg transition active:scale-95"
              >
                {emoji}
              </button>
            ))}
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="ml-auto text-xs font-semibold text-neutral-400 hover:text-neutral-600 p-1.5"
            >
              Close
            </button>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="relative z-10 p-3 bg-[#f0f2f5] border-t border-neutral-200 flex items-center gap-2 shadow-inner shrink-0">
          
          {isRecording ? (
            /* Audio recorder Active overlay inside input bar */
            <div className="flex-1 bg-white border border-neutral-200 rounded-2xl px-4 py-2 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <span className="text-xs font-bold text-neutral-600 font-mono">Recording {formatRecordTime(recordDuration)}</span>
              </div>
              
              {/* Sound wave visualizer canvas */}
              <canvas ref={recorderCanvasRef} className="flex-1 h-6 max-w-xs mx-4" />

              <div className="flex gap-2">
                <button
                  onClick={cancelRecording}
                  className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={stopAndSendRecording}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
                  id="send-audio-btn"
                >
                  Send Note
                </button>
              </div>
            </div>
          ) : (
            /* Standard Keyboard inputs */
            <>
              {/* Attachment Triggers */}
              <div className="flex gap-0.5 shrink-0">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2.5 rounded-full transition ${showEmojiPicker ? "bg-sky-500/10 text-sky-600" : "text-neutral-500 hover:bg-neutral-200"}`}
                  title="Emoji list"
                  id="emoji-picker-btn"
                >
                  <Smile className="w-5.5 h-5.5" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-neutral-500 hover:bg-neutral-200 rounded-full transition"
                  title="Attach Photo"
                  id="attach-image-btn"
                >
                  <Image className="w-5.5 h-5.5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={handleSendLocation}
                  className="p-2.5 text-neutral-500 hover:bg-neutral-200 rounded-full transition hidden sm:inline-block"
                  title="Share Map Coordinates"
                  id="attach-location-btn"
                >
                  <MapPin className="w-5.5 h-5.5" />
                </button>
              </div>

              {/* Message Typing area */}
              <form onSubmit={handleSendText} className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message or /draw prompt..."
                  className="flex-1 bg-white px-4 py-2.5 rounded-2xl text-[14px] border border-neutral-200/50 focus:outline-none focus:ring-1 focus:ring-sky-500/20 shadow-sm font-normal text-neutral-800"
                  id="message-input-field"
                />
                
                {inputText.trim() || imageAttachment ? (
                  <button
                    type="submit"
                    className="p-3 bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow transition shrink-0 active:scale-95"
                    id="submit-message-btn"
                  >
                    <Send className="w-4.5 h-4.5 fill-white" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="p-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full shadow transition shrink-0 active:scale-95"
                    title="Record voice note"
                    id="record-audio-btn"
                  >
                    <Mic className="w-4.5 h-4.5" />
                  </button>
                )}
              </form>
            </>
          )}

        </div>

      </div>

      {/* Slide-out Contact Info Panel (Web style) */}
      {showInfoPanel && (
        <div className="w-72 border-l border-neutral-100 bg-white h-full flex flex-col relative z-20 shrink-0" id="contact-info-panel">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <h3 className="font-bold text-sm text-neutral-800">Contact Info</h3>
            <button
              onClick={() => setShowInfoPanel(false)}
              className="p-1 hover:bg-neutral-100 rounded-md text-neutral-400"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-extrabold shadow-md mb-3 ${contact.bgColor}`}>
                {contact.avatar}
              </div>
              <h4 className="font-bold text-base text-neutral-800">{contact.name}</h4>
              <p className="text-xs text-neutral-400 font-medium mt-0.5">{contact.phoneNumber}</p>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">About / Status</label>
              <p className="text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100/30 leading-relaxed font-normal">
                {contact.about}
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">AI Persona Blueprint</label>
              <p className="text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100/30 leading-relaxed font-normal">
                {contact.personality}
              </p>
            </div>

            <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl flex flex-col gap-1.5">
              <h4 className="text-[11px] font-bold text-sky-800 uppercase tracking-wide">Secure Conversation</h4>
              <p className="text-[10px] text-sky-600 leading-relaxed font-normal">
                Messages to this agent are routed through a server-side sandbox and processed privately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Attached Image Viewing */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 select-none" onClick={() => setLightboxImage(null)}>
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Full-size Lightbox"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

    </div>
  );
}
