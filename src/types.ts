export interface Message {
  id: string;
  sender: "me" | "them";
  text?: string;
  image?: string;
  audio?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: string; // HH:MM
  status: "sent" | "delivered" | "read";
  isAudioPlayed?: boolean;
  duration?: number; // audio duration in seconds
}

export interface Contact {
  id: string;
  name: string;
  avatar: string; // avatar initial or icon string
  bgColor: string; // Tailwind class or hex gradient for custom avatars
  personality: string;
  status: "online" | "offline" | "typing" | "last_seen";
  lastSeenTime?: string;
  unreadCount: number;
  phoneNumber: string;
  about: string;
}

export interface CallLog {
  id: string;
  contactId: string;
  type: "voice" | "video";
  direction: "incoming" | "outgoing" | "missed";
  timestamp: string; // Date or friendly time
  duration?: string;
}

export interface StatusStory {
  id: string;
  contactId: string;
  type: "image" | "text";
  content: string; // Image link/base64 or text contents
  bgColor?: string; // background color class for text-type status
  timestamp: string; // e.g. "2 hours ago"
  viewed: boolean;
}

export interface UserProfile {
  name: string;
  phoneNumber: string;
  avatar: string;
  bgColor: string;
  about: string;
}
