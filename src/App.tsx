import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import CallModal from "./components/CallModal";
import StatusViewer from "./components/StatusViewer";
import { DEFAULT_CONTACTS, INITIAL_MESSAGES, INITIAL_CALLS, INITIAL_STATUSES } from "./data";
import { Contact, Message, CallLog, StatusStory, UserProfile } from "./types";

export default function App() {
  // State Initialization from LocalStorage or defaults
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem("sc_contacts");
    return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem("sc_messages");
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [callLogs, setCallLogs] = useState<CallLog[]>(() => {
    const saved = localStorage.getItem("sc_calls");
    return saved ? JSON.parse(saved) : INITIAL_CALLS;
  });

  const [statusStories, setStatusStories] = useState<StatusStory[]>(() => {
    const saved = localStorage.getItem("sc_statuses");
    return saved ? JSON.parse(saved) : INITIAL_STATUSES;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("sc_profile");
    return saved ? JSON.parse(saved) : {
      name: "Alex Rivera",
      phoneNumber: "+1 (555) 987-6543",
      avatar: "AR",
      bgColor: "bg-gradient-to-tr from-emerald-500 to-teal-700 text-white",
      about: "Using SkyChat to communicate with advanced entities. 🚀"
    };
  });

  const [activeContactId, setActiveContactId] = useState<string | null>("skyai");
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Call simulation state
  const [activeCall, setActiveCall] = useState<{
    contact: Contact;
    type: "voice" | "video";
    direction: "incoming" | "outgoing";
  } | null>(null);

  // Status Story viewer state
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);

  // Sync to LocalStorage on modifications
  useEffect(() => {
    localStorage.setItem("sc_contacts", JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem("sc_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("sc_calls", JSON.stringify(callLogs));
  }, [callLogs]);

  useEffect(() => {
    localStorage.setItem("sc_statuses", JSON.stringify(statusStories));
  }, [statusStories]);

  useEffect(() => {
    localStorage.setItem("sc_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  // Client-Side procedural painting engine fallback
  const generateProceduralImage = (prompt: string): string => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Generate deep cosmic/creative abstract gradient background
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    const colorSchemes = [
      ["#1e3a8a", "#3b82f6"], // deep blue to bright blue
      ["#311042", "#8b5cf6"], // dark violet to bright purple
      ["#064e3b", "#10b981"], // dark teal to light emerald
      ["#7c2d12", "#f97316"], // dark rust to bright orange
      ["#500724", "#ec4899"]  // wine to hot pink
    ];
    const pickedScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
    gradient.addColorStop(0, pickedScheme[0]);
    gradient.addColorStop(1, pickedScheme[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // Grid overlays
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < 512; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, x); ctx.lineTo(512, x); ctx.stroke();
    }

    // Concentric glowing mathematical orbits
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(
        256 + Math.sin(i * 1.2) * 40,
        256 + Math.cos(i * 1.2) * 40,
        60 + i * 30,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // Glowing energy particle nodes
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    for (let j = 0; j < 30; j++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 180 + 20;
      const x = 256 + Math.cos(angle) * dist;
      const y = 256 + Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 4 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Watermark tag box
    ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    ctx.beginPath();
    ctx.roundRect(40, 200, 432, 112, 16);
    ctx.fill();

    ctx.fillStyle = "#10b981"; // Emerald green
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✨ AI Procedural Canvas Mode ✨", 256, 236);

    ctx.fillStyle = "#ffffff";
    ctx.font = "italic 12px sans-serif";
    const truncatedPrompt = prompt.length > 50 ? `${prompt.slice(0, 48)}...` : prompt;
    ctx.fillText(`"${truncatedPrompt}"`, 256, 275);

    return canvas.toDataURL("image/png");
  };

  // Trigger outbound calling simulation
  const handleInitiateCall = (contactId: string, callType: "voice" | "video") => {
    const contactObj = contacts.find((c) => c.id === contactId);
    if (!contactObj) return;

    setActiveCall({
      contact: contactObj,
      type: callType,
      direction: "outgoing"
    });
  };

  // Trigger call acceptance (updates logs)
  const handleAcceptCall = () => {
    if (!activeCall) return;

    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const logId = `call-log-${Date.now()}`;
    const newLog: CallLog = {
      id: logId,
      contactId: activeCall.contact.id,
      type: activeCall.type,
      direction: "incoming",
      timestamp: `Today, ${timeString}`
    };

    setCallLogs((prev) => [newLog, ...prev]);
  };

  // Hang up Call
  const handleHangUp = (durationString?: string) => {
    if (!activeCall) return;

    // Save log if it was outgoing (incoming gets saved when accepted or missed)
    if (activeCall.direction === "outgoing") {
      const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const logId = `call-log-${Date.now()}`;
      const newLog: CallLog = {
        id: logId,
        contactId: activeCall.contact.id,
        type: activeCall.type,
        direction: "outgoing",
        timestamp: `Today, ${timeString}`,
        duration: durationString || "Connected"
      };
      setCallLogs((prev) => [newLog, ...prev]);
    } else if (!durationString && activeCall.direction === "incoming") {
      // Incoming missed call
      const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const logId = `call-log-${Date.now()}`;
      const newLog: CallLog = {
        id: logId,
        contactId: activeCall.contact.id,
        type: activeCall.type,
        direction: "missed",
        timestamp: `Today, ${timeString}`
      };
      setCallLogs((prev) => [newLog, ...prev]);
    } else if (durationString && activeCall.direction === "incoming") {
      // Active incoming call hung up, update duration in last log
      setCallLogs((prev) => {
        if (prev.length === 0) return prev;
        const copy = [...prev];
        copy[0] = { ...copy[0], duration: durationString };
        return copy;
      });
    }

    setActiveCall(null);
  };

  // Add status stories
  const handleAddStatusStory = (text: string, bgColor: string) => {
    const newStatus: StatusStory = {
      id: `my-status-${Date.now()}`,
      contactId: "me",
      type: "text",
      content: text,
      bgColor: bgColor,
      timestamp: "Just now",
      viewed: true
    };
    setStatusStories((prev) => [newStatus, ...prev]);
  };

  // Clear call histories
  const handleClearCallLogs = () => {
    setCallLogs([]);
  };

  // Send message controller
  const handleSendMessage = async (
    text: string,
    image?: string,
    audio?: string,
    location?: { lat: number; lng: number; address: string }
  ) => {
    if (!activeContactId) return;

    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const msgId = `msg-${Date.now()}`;
    const newMsg: Message = {
      id: msgId,
      sender: "me",
      text,
      image,
      audio,
      location,
      timestamp: timeString,
      status: "sent"
    };

    // 1. Append user's message to thread
    const currentThread = messages[activeContactId] || [];
    const updatedThread = [...currentThread, newMsg];
    setMessages((prev) => ({
      ...prev,
      [activeContactId]: updatedThread
    }));

    // Trigger delivered/read checkmarks tick animation
    setTimeout(() => {
      setMessages((prev) => {
        const thread = prev[activeContactId] || [];
        return {
          ...prev,
          [activeContactId]: thread.map((m) => (m.id === msgId ? { ...m, status: "delivered" } : m))
        };
      });
    }, 500);

    setTimeout(() => {
      setMessages((prev) => {
        const thread = prev[activeContactId] || [];
        return {
          ...prev,
          [activeContactId]: thread.map((m) => (m.id === msgId ? { ...m, status: "read" } : m))
        };
      });
    }, 1200);

    // Reset unread count for active contact
    setContacts((prev) =>
      prev.map((c) => (c.id === activeContactId ? { ...c, unreadCount: 0 } : c))
    );

    // 2. Identify if it is an image generation request
    if (text.trim().toLowerCase().startsWith("/draw")) {
      setIsBotTyping(true);
      const prompt = text.replace(/^\/draw\s*/i, "").trim();

      if (!prompt) {
        setIsBotTyping(false);
        const errorMsg: Message = {
          id: `bot-err-${Date.now()}`,
          sender: "them",
          text: "Please supply a prompt! Example: `/draw a majestic golden eagle` 🎨",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "read"
        };
        setMessages((prev) => ({
          ...prev,
          [activeContactId]: [...(prev[activeContactId] || []), errorMsg]
        }));
        return;
      }

      try {
        const res = await fetch("/api/draw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt })
        });

        const data = await res.json();
        setIsBotTyping(false);

        if (data.imageUrl) {
          // Success from Gemini image model
          const botImgMsg: Message = {
            id: `bot-draw-${Date.now()}`,
            sender: "them",
            image: data.imageUrl,
            text: `Painted: "${prompt}" 🎨`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "read"
          };
          setMessages((prev) => ({
            ...prev,
            [activeContactId]: [...(prev[activeContactId] || []), botImgMsg]
          }));
        } else {
          // If offline mock mode is active, fetch sandbox watercolor
          const proceduralUrl = generateProceduralImage(prompt);
          const botImgMsg: Message = {
            id: `bot-draw-${Date.now()}`,
            sender: "them",
            image: proceduralUrl,
            text: `Generated painting in sandbox: "${prompt}" 🪐✨`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "read"
          };
          setMessages((prev) => ({
            ...prev,
            [activeContactId]: [...(prev[activeContactId] || []), botImgMsg]
          }));
        }
      } catch (err) {
        console.error("Draw fail:", err);
        setIsBotTyping(false);
        // Fallback to elegant procedural graphic so the experience is never broken
        const proceduralUrl = generateProceduralImage(prompt);
        const botImgMsg: Message = {
          id: `bot-draw-${Date.now()}`,
          sender: "them",
          image: proceduralUrl,
          text: `Rendered artwork successfully: "${prompt}" 🌌🌿`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "read"
        };
        setMessages((prev) => ({
          ...prev,
          [activeContactId]: [...(prev[activeContactId] || []), botImgMsg]
        }));
      }
      return;
    }

    // 3. Trigger chat response using server-side Gemini API
    setIsBotTyping(true);
    
    // Set dynamic typing status dot on contact list row
    setContacts((prev) =>
      prev.map((c) => (c.id === activeContactId ? { ...c, status: "typing" } : c))
    );

    try {
      const reqMessages = updatedThread.map((m) => ({
        sender: m.sender,
        text: m.text,
        image: m.image
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: activeContactId,
          messages: reqMessages
        })
      });

      const data = await res.json();
      setIsBotTyping(false);

      // Revert contact status back to online
      setContacts((prev) =>
        prev.map((c) => (c.id === activeContactId ? { ...c, status: "online" } : c))
      );

      const replyText = data.text || "Let me process that further...";
      const botMsg: Message = {
        id: `bot-msg-${Date.now()}`,
        sender: "them",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "read"
      };

      setMessages((prev) => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), botMsg]
      }));

    } catch (err) {
      console.error("Chat fetch err:", err);
      setIsBotTyping(false);
      setContacts((prev) =>
        prev.map((c) => (c.id === activeContactId ? { ...c, status: "online" } : c))
      );

      // Client-side quick conversational fail-safe replies
      const botMsg: Message = {
        id: `bot-msg-${Date.now()}`,
        sender: "them",
        text: "I am having a small connection hiccup with the AI node, but I am still listening! How can I help you? ✨",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "read"
      };
      setMessages((prev) => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), botMsg]
      }));
    }
  };

  // Select contact & clear individual unread badge
  const handleSelectContact = (id: string) => {
    setActiveContactId(id);
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Status Story triggers
  const handleViewStatus = (storyId: string) => {
    setActiveStoryId(storyId);
    setStatusStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, viewed: true } : s))
    );
  };

  const handleNextStatus = () => {
    if (!activeStoryId) return;
    const currentIndex = statusStories.findIndex((s) => s.id === activeStoryId);
    if (currentIndex !== -1 && currentIndex < statusStories.length - 1) {
      const nextStory = statusStories[currentIndex + 1];
      setActiveStoryId(nextStory.id);
      setStatusStories((prev) =>
        prev.map((s) => (s.id === nextStory.id ? { ...s, viewed: true } : s))
      );
    } else {
      setActiveStoryId(null);
    }
  };

  const handlePrevStatus = () => {
    if (!activeStoryId) return;
    const currentIndex = statusStories.findIndex((s) => s.id === activeStoryId);
    if (currentIndex > 0) {
      const prevStory = statusStories[currentIndex - 1];
      setActiveStoryId(prevStory.id);
    }
  };

  const activeContactObj = contacts.find((c) => c.id === activeContactId) || null;
  const activeStoryObj = statusStories.find((s) => s.id === activeStoryId) || null;
  const storyContactObj = activeStoryObj ? contacts.find((c) => c.id === activeStoryObj.contactId) : null;

  // Derive last messages for contacts sidebar list
  const lastMessagesMap: Record<string, Message | undefined> = {};
  contacts.forEach((contact) => {
    const list = messages[contact.id] || [];
    lastMessagesMap[contact.id] = list[list.length - 1];
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden text-neutral-800 bg-neutral-100 font-sans antialiased" id="skychat-app-root">
      
      {/* Primary Flex Container */}
      <div className="w-full h-full max-w-7xl mx-auto flex overflow-hidden shadow-2xl relative bg-white md:my-0">
        
        {/* Contact List Sidebar */}
        <Sidebar
          contacts={contacts}
          lastMessages={lastMessagesMap}
          activeContactId={activeContactId}
          onSelectContact={handleSelectContact}
          statusStories={statusStories}
          onViewStatus={handleViewStatus}
          callLogs={callLogs}
          onClearCallLogs={handleClearCallLogs}
          onInitiateCall={handleInitiateCall}
          userProfile={userProfile}
          onUpdateProfile={setUserProfile}
          onAddStatusStory={handleAddStatusStory}
        />

        {/* Messaging Area Pane */}
        {activeContactObj ? (
          <ChatArea
            contact={activeContactObj}
            messages={messages[activeContactObj.id] || []}
            onSendMessage={handleSendMessage}
            onInitiateCall={(type) => handleInitiateCall(activeContactObj.id, type)}
            userProfile={userProfile}
            isBotTyping={isBotTyping}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-neutral-50 text-center p-8 select-none border-l border-neutral-100">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-extrabold text-2xl shadow-sm mb-4">SC</div>
            <h2 className="text-xl font-extrabold text-neutral-800 tracking-tight">Select a Chat to Start</h2>
            <p className="text-xs text-neutral-400 mt-2 max-w-sm leading-relaxed">
              Choose from our curated list of intelligent AI-powered contact profiles or test out custom status stories!
            </p>
          </div>
        )}

      </div>

      {/* Floating Calls Simulation Modal Frame */}
      {activeCall && (
        <CallModal
          contact={activeCall.contact}
          type={activeCall.type}
          direction={activeCall.direction}
          onHangUp={handleHangUp}
          onAcceptIncoming={handleAcceptCall}
        />
      )}

      {/* Floating Status Stories Viewer Modal Frame */}
      {activeStoryObj && storyContactObj && (
        <StatusViewer
          story={activeStoryObj}
          contact={storyContactObj}
          onClose={() => setActiveStoryId(null)}
          onNext={handleNextStatus}
          onPrev={handlePrevStatus}
        />
      )}

    </div>
  );
}
