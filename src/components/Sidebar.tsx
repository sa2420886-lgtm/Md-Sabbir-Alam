import React, { useState } from "react";
import { MessageSquare, CircleDot, Phone, User, Search, Plus, Trash2, ArrowUpRight, ArrowDownLeft, PhoneMissed, Check } from "lucide-react";
import { Contact, Message, CallLog, StatusStory, UserProfile } from "../types";

interface SidebarProps {
  contacts: Contact[];
  lastMessages: Record<string, Message | undefined>;
  activeContactId: string | null;
  onSelectContact: (contactId: string) => void;
  statusStories: StatusStory[];
  onViewStatus: (storyId: string) => void;
  callLogs: CallLog[];
  onClearCallLogs: () => void;
  onInitiateCall: (contactId: string, type: "voice" | "video") => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onAddStatusStory: (text: string, bgColor: string) => void;
}

export default function Sidebar({
  contacts,
  lastMessages,
  activeContactId,
  onSelectContact,
  statusStories,
  onViewStatus,
  callLogs,
  onClearCallLogs,
  onInitiateCall,
  userProfile,
  onUpdateProfile,
  onAddStatusStory
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"chats" | "status" | "calls" | "profile">("chats");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Custom status story creator state
  const [newStatusText, setNewStatusText] = useState("");
  const [selectedBgColor, setSelectedBgColor] = useState("from-emerald-500 to-teal-700");
  const [isAddingStatus, setIsAddingStatus] = useState(false);

  // Filter contacts by search query
  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.about.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group status stories by contact
  const recentStatuses = statusStories.filter((s) => !s.viewed);
  const viewedStatuses = statusStories.filter((s) => s.viewed);

  const bgGradientOptions = [
    { label: "Teal Green", class: "from-emerald-500 to-teal-700" },
    { label: "Ocean Blue", class: "from-sky-500 to-indigo-600" },
    { label: "Purple Spark", class: "from-violet-500 to-fuchsia-700" },
    { label: "Sunset Coral", class: "from-orange-500 to-rose-600" },
    { label: "Charcoal Slate", class: "from-slate-700 to-slate-900" }
  ];

  const handlePostStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusText.trim()) return;
    onAddStatusStory(newStatusText, selectedBgColor);
    setNewStatusText("");
    setIsAddingStatus(false);
  };

  return (
    <div className="w-full md:w-[380px] border-r border-neutral-100 flex flex-col bg-white h-full shrink-0" id="skychat-sidebar">
      {/* Header / Brand Area */}
      <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center text-white font-black text-sm tracking-tighter">
            SC
          </div>
          <h1 className="font-extrabold text-xl tracking-tight text-neutral-800">SkyChat</h1>
        </div>
        <div className="flex gap-2">
          <div className={`w-8 h-8 rounded-full ${userProfile.bgColor} flex items-center justify-center font-bold text-xs shadow-sm cursor-pointer`} onClick={() => setActiveTab("profile")}>
            {userProfile.avatar}
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="grid grid-cols-4 border-b border-neutral-100 bg-neutral-50/20" id="sidebar-tabs">
        <button
          onClick={() => setActiveTab("chats")}
          className={`flex flex-col items-center gap-1 py-3 text-[10px] font-bold tracking-wider uppercase transition border-b-2 ${
            activeTab === "chats"
              ? "border-sky-500 text-sky-600"
              : "border-transparent text-neutral-400 hover:text-neutral-600"
          }`}
          id="tab-chats"
        >
          <MessageSquare className="w-5 h-5" />
          Chats
        </button>
        <button
          onClick={() => setActiveTab("status")}
          className={`flex flex-col items-center gap-1 py-3 text-[10px] font-bold tracking-wider uppercase transition border-b-2 ${
            activeTab === "status"
              ? "border-sky-500 text-sky-600"
              : "border-transparent text-neutral-400 hover:text-neutral-600"
          }`}
          id="tab-status"
        >
          <CircleDot className="w-5 h-5" />
          Status
        </button>
        <button
          onClick={() => setActiveTab("calls")}
          className={`flex flex-col items-center gap-1 py-3 text-[10px] font-bold tracking-wider uppercase transition border-b-2 ${
            activeTab === "calls"
              ? "border-sky-500 text-sky-600"
              : "border-transparent text-neutral-400 hover:text-neutral-600"
          }`}
          id="tab-calls"
        >
          <Phone className="w-5 h-5" />
          Calls
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-1 py-3 text-[10px] font-bold tracking-wider uppercase transition border-b-2 ${
            activeTab === "profile"
              ? "border-sky-500 text-sky-600"
              : "border-transparent text-neutral-400 hover:text-neutral-600"
          }`}
          id="tab-profile"
        >
          <User className="w-5 h-5" />
          Profile
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto bg-white">
        
        {/* CHATS TAB */}
        {activeTab === "chats" && (
          <div className="flex flex-col h-full">
            {/* Search Bar */}
            <div className="p-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search chats or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-100 pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/20 border-transparent focus:border-neutral-200 transition"
                />
              </div>
            </div>

            {/* Contacts list */}
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-50/50">
              {filteredContacts.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 text-sm">
                  No contacts found.
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const lastMsg = lastMessages[contact.id];
                  const isActive = activeContactId === contact.id;
                  
                  return (
                    <div
                      key={contact.id}
                      onClick={() => onSelectContact(contact.id)}
                      className={`flex items-center gap-3.5 p-3.5 cursor-pointer transition relative ${
                        isActive
                          ? "bg-sky-50 hover:bg-sky-100/55 border-l-4 border-sky-500"
                          : "hover:bg-slate-50 border-l-4 border-transparent"
                      }`}
                    >
                      {/* Avatar with dynamic status dot */}
                      <div className="relative shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${contact.bgColor}`}>
                          {contact.avatar}
                        </div>
                        {contact.status === "online" && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse shadow-sm" />
                        )}
                        {contact.status === "typing" && (
                          <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-500 border-2 border-white"></span>
                          </span>
                        )}
                      </div>

                      {/* Info Metadata */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-semibold text-[14px] text-neutral-800 truncate tracking-tight">{contact.name}</h4>
                          <span className="text-[10px] text-neutral-400 font-medium">
                            {lastMsg ? lastMsg.timestamp : "Status"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <p className="text-xs text-neutral-500 truncate font-normal">
                            {contact.status === "typing" ? (
                              <span className="text-sky-600 font-semibold italic">typing...</span>
                            ) : lastMsg ? (
                              lastMsg.text || "📷 Image attachment"
                            ) : (
                              contact.about
                            )}
                          </p>
                          
                          {/* Unread Message Count */}
                          {contact.unreadCount > 0 && (
                            <span className="bg-sky-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                              {contact.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* STATUS TAB */}
        {activeTab === "status" && (
          <div className="p-4 flex flex-col gap-5">
            {/* My Status Section */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">My Status</h3>
              <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full ${userProfile.bgColor} flex items-center justify-center font-bold text-sm shadow-sm`}>
                    {userProfile.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-neutral-800">My Status</h4>
                    <p className="text-xs text-neutral-400">Share a thought story</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddingStatus(!isAddingStatus)}
                  className="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 rounded-full text-sky-600 transition"
                  title="Add Status Update"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Add Status Modal / Input form inline */}
              {isAddingStatus && (
                <form onSubmit={handlePostStatus} className="mt-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100 flex flex-col gap-3">
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="What's on your mind?..."
                    value={newStatusText}
                    onChange={(e) => setNewStatusText(e.target.value)}
                    className="w-full bg-white px-3 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-sky-500/20"
                  />
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase mr-1">Theme:</span>
                    {bgGradientOptions.map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setSelectedBgColor(opt.class)}
                        className={`w-5 h-5 rounded-full bg-gradient-to-br ${opt.class} border transition ${
                          selectedBgColor === opt.class ? "border-sky-500 ring-2 ring-sky-500/20" : "border-transparent"
                        }`}
                        title={opt.label}
                      />
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsAddingStatus(false)}
                      className="px-2.5 py-1.5 text-neutral-400 font-semibold hover:bg-neutral-100 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-sm transition"
                    >
                      Post Status
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Recent Updates */}
            {recentStatuses.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Recent Updates</h3>
                <div className="space-y-2">
                  {recentStatuses.map((story) => {
                    const contact = contacts.find((c) => c.id === story.contactId);
                    if (!contact) return null;
                    return (
                      <div
                        key={story.id}
                        onClick={() => onViewStatus(story.id)}
                        className="flex items-center gap-3.5 p-2 hover:bg-neutral-50 rounded-xl cursor-pointer transition border border-transparent hover:border-neutral-100"
                      >
                        {/* Status ring ring */}
                        <div className="relative p-0.5 rounded-full border-[2.5px] border-sky-500">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${contact.bgColor}`}>
                            {contact.avatar}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-neutral-800">{contact.name}</h4>
                          <p className="text-[11px] text-neutral-400 font-medium">{story.timestamp}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Viewed Updates */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Viewed Updates</h3>
              {viewedStatuses.length === 0 ? (
                <p className="text-xs text-neutral-400 italic px-2">No updates viewed yet.</p>
              ) : (
                <div className="space-y-2">
                  {viewedStatuses.map((story) => {
                    const contact = contacts.find((c) => c.id === story.contactId);
                    if (!contact) return null;
                    return (
                      <div
                        key={story.id}
                        onClick={() => onViewStatus(story.id)}
                        className="flex items-center gap-3.5 p-2 hover:bg-neutral-50 rounded-xl cursor-pointer opacity-70 hover:opacity-100 transition"
                      >
                        {/* Status grey ring */}
                        <div className="relative p-0.5 rounded-full border-[2.5px] border-neutral-200">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${contact.bgColor}`}>
                            {contact.avatar}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-neutral-800">{contact.name}</h4>
                          <p className="text-[11px] text-neutral-400 font-medium">{story.timestamp}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CALLS TAB */}
        {activeTab === "calls" && (
          <div className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Call Logs</h3>
              {callLogs.length > 0 && (
                <button
                  onClick={onClearCallLogs}
                  className="text-xs font-semibold text-rose-500 flex items-center gap-1 hover:bg-rose-50 px-2 py-1 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear History
                </button>
              )}
            </div>

            {callLogs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-400">
                <Phone className="w-8 h-8 mb-2 stroke-1 text-neutral-300 animate-pulse" />
                <p className="text-sm">No call logs recorded.</p>
              </div>
            ) : (
              <div className="space-y-2.5 overflow-y-auto max-h-[60vh] pr-1">
                {callLogs.map((log) => {
                  const contact = contacts.find((c) => c.id === log.contactId);
                  if (!contact) return null;

                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100/50 rounded-xl transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${contact.bgColor}`}>
                          {contact.avatar}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-neutral-800">{contact.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-400 font-medium">
                            {log.direction === "incoming" && (
                              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                            {log.direction === "outgoing" && (
                              <ArrowUpRight className="w-3.5 h-3.5 text-sky-500" />
                            )}
                            {log.direction === "missed" && (
                              <PhoneMissed className="w-3.5 h-3.5 text-rose-500" />
                            )}
                            <span>{log.timestamp}</span>
                            {log.duration && (
                              <span className="text-[10px] bg-neutral-200 text-neutral-600 px-1.5 py-0.2 rounded font-mono">
                                {log.duration}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onInitiateCall(contact.id, "voice")}
                          className="p-1.5 hover:bg-neutral-200 rounded-lg text-sky-600 transition"
                          title="Voice Call"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onInitiateCall(contact.id, "video")}
                          className="p-1.5 hover:bg-neutral-200 rounded-lg text-sky-600 transition"
                          title="Video Call"
                        >
                          <ArrowUpRight className="w-4 h-4 hidden" />
                          <svg className="w-4 h-4 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="p-5 flex flex-col gap-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">My Profile</h3>

            {/* Profile Picture & Editor */}
            <div className="flex flex-col items-center gap-3">
              <div className={`w-24 h-24 rounded-full ${userProfile.bgColor} flex items-center justify-center text-3xl font-extrabold shadow-md relative group transition`}>
                {userProfile.avatar}
              </div>
              <p className="text-xs font-medium text-neutral-400">Choose a signature theme below</p>
              
              <div className="flex gap-2">
                {bgGradientOptions.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => onUpdateProfile({ ...userProfile, bgColor: opt.class })}
                    className={`w-6 h-6 rounded-full bg-gradient-to-br ${opt.class} border transition ${
                      userProfile.bgColor === opt.class ? "border-sky-500 scale-110" : "border-transparent"
                    }`}
                    title={opt.label}
                  />
                ))}
              </div>
            </div>

            {/* Form Inputs */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-400 block mb-1">Display Name</label>
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => {
                    const initials = e.target.value.slice(0, 2).toUpperCase();
                    onUpdateProfile({ ...userProfile, name: e.target.value, avatar: initials || "ME" });
                  }}
                  className="w-full bg-neutral-50 px-3.5 py-2 rounded-xl text-sm border border-neutral-200/50 focus:outline-none focus:ring-1 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={userProfile.phoneNumber}
                  onChange={(e) => onUpdateProfile({ ...userProfile, phoneNumber: e.target.value })}
                  className="w-full bg-neutral-50 px-3.5 py-2 rounded-xl text-sm border border-neutral-200/50 focus:outline-none focus:ring-1 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-400 block mb-1">About / Bio</label>
                <textarea
                  rows={2}
                  value={userProfile.about}
                  onChange={(e) => onUpdateProfile({ ...userProfile, about: e.target.value })}
                  className="w-full bg-neutral-50 px-3.5 py-2 rounded-xl text-sm border border-neutral-200/50 focus:outline-none focus:ring-1 focus:ring-sky-500/20 resize-none"
                />
              </div>
            </div>

            <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-sky-600 rounded-lg text-white">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-sky-800">Automatic Sync</h4>
                <p className="text-[11px] text-sky-600">Local credentials secured & verified.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
