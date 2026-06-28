import { Contact, Message, CallLog, StatusStory } from "./types";

export const DEFAULT_CONTACTS: Contact[] = [
  {
    id: "skyai",
    name: "SkyAI ✨",
    avatar: "SA",
    bgColor: "bg-gradient-to-tr from-sky-400 to-blue-600 text-white",
    personality: "Multimodal AI assistant",
    status: "online",
    unreadCount: 1,
    phoneNumber: "+1 (800) SKY-CHAT",
    about: "The flagship artificial intelligence agent. Try typing '/draw a majestic sunset'!"
  },
  {
    id: "serena",
    name: "Serena 🌸",
    avatar: "S",
    bgColor: "bg-gradient-to-tr from-pink-400 to-rose-500 text-white",
    personality: "Wellness & Mindfulness Coach",
    status: "online",
    unreadCount: 1,
    phoneNumber: "+1 (888) BREATHE",
    about: "Holding space for calm, mindfulness, and gentle reminders."
  },
  {
    id: "devon",
    name: "Devon 💻",
    avatar: "D",
    bgColor: "bg-gradient-to-tr from-slate-700 to-slate-900 text-white",
    personality: "Senior Systems Architect",
    status: "last_seen",
    lastSeenTime: "Today at 10:14 AM",
    unreadCount: 0,
    phoneNumber: "+1 (415) DEV-NULL",
    about: "Refactoring the codebase of life. Ship it! 🚀"
  },
  {
    id: "chef",
    name: "Chef Matteo 👨‍🍳",
    avatar: "CM",
    bgColor: "bg-gradient-to-tr from-amber-500 to-red-600 text-white",
    personality: "Neapolitan Culinary Master",
    status: "online",
    unreadCount: 1,
    phoneNumber: "+39 081 764321",
    about: "Delizioso! Slow-cooked marinara sauce and fresh sourdough."
  },
  {
    id: "zoe",
    name: "Zoe 🌟",
    avatar: "Z",
    bgColor: "bg-gradient-to-tr from-violet-500 to-purple-700 text-white",
    personality: "Novelist & Dreamer",
    status: "offline",
    lastSeenTime: "Yesterday",
    unreadCount: 0,
    phoneNumber: "+1 (650) STAR-WRT",
    about: "Dreaming in ink. Let's write a new chapter together."
  }
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  skyai: [
    {
      id: "skyai-1",
      sender: "them",
      text: "Hi! Welcome to SkyChat. 🚀 I'm SkyAI, your intelligent companion. I can help answer queries, write code, or brain storm plans.",
      timestamp: "10:00 AM",
      status: "read"
    },
    {
      id: "skyai-2",
      sender: "them",
      text: "Tip: I have image generation powers too! Type `/draw` followed by your visual prompt (e.g., `/draw a cool futuristic cat`) and I will paint it for you in real-time! 🎨",
      timestamp: "10:01 AM",
      status: "read"
    }
  ],
  serena: [
    {
      id: "serena-1",
      sender: "them",
      text: "Hello, dear friend. 🌸 Take a soft, conscious breath in... and let it drift away. How are you holding up today?",
      timestamp: "09:45 AM",
      status: "read"
    },
    {
      id: "serena-2",
      sender: "them",
      text: "If you are feeling any stress or rush, type 'breathe' and we can do a calm guided breathing loop together. ✨",
      timestamp: "09:46 AM",
      status: "read"
    }
  ],
  devon: [
    {
      id: "devon-1",
      sender: "them",
      text: "Hey, connection pooling fix is live! 💻 Verified under load, DB latency dropped to 1.2ms. Absolute performance win.",
      timestamp: "08:15 AM",
      status: "read"
    },
    {
      id: "devon-2",
      sender: "me",
      text: "Excellent! Did you push to main?",
      timestamp: "08:20 AM",
      status: "read"
    },
    {
      id: "devon-3",
      sender: "them",
      text: "Yep, PR merged, CI/CD pipeline finished cleanly. We're green across all monitors. Ready to build the next feature! 🚀",
      timestamp: "08:22 AM",
      status: "read"
    }
  ],
  chef: [
    {
      id: "chef-1",
      sender: "them",
      text: "Ciao! Chef Matteo is in the kitchen! 👨‍🍳 I have a batch of fresh Neapolitan sourdough pizza dough rising, fermenting beautifully for 48 hours!",
      timestamp: "09:12 AM",
      status: "read"
    },
    {
      id: "chef-2",
      sender: "them",
      text: "Are we cooking something delizioso today? Ask me for any recipes, ingredient matching, or cooking secret tips! 🍅🍕",
      timestamp: "09:13 AM",
      status: "read"
    }
  ],
  zoe: [
    {
      id: "zoe-1",
      sender: "them",
      text: "Greetings, wanderer of words! 🌟 I've been sitting near the window, watching the rain compile ripples on the glass.",
      timestamp: "Yesterday",
      status: "read"
    },
    {
      id: "zoe-2",
      sender: "them",
      text: "It inspired a short story about a kid who kept a glowing lighthouse in a pocket watch. Shall we write a few lines of it together? 📖✍️",
      timestamp: "Yesterday",
      status: "read"
    }
  ]
};

export const INITIAL_CALLS: CallLog[] = [
  {
    id: "call-1",
    contactId: "skyai",
    type: "voice",
    direction: "incoming",
    timestamp: "Today, 10:05 AM",
    duration: "4 min 12 sec"
  },
  {
    id: "call-2",
    contactId: "devon",
    type: "video",
    direction: "outgoing",
    timestamp: "Today, 8:30 AM",
    duration: "12 min 40 sec"
  },
  {
    id: "call-3",
    contactId: "serena",
    type: "voice",
    direction: "missed",
    timestamp: "Yesterday, 4:15 PM"
  },
  {
    id: "call-4",
    contactId: "chef",
    type: "video",
    direction: "incoming",
    timestamp: "Yesterday, 1:20 PM",
    duration: "8 min 5 sec"
  }
];

export const INITIAL_STATUSES: StatusStory[] = [
  {
    id: "status-serena",
    contactId: "serena",
    type: "text",
    content: "Slow down and notice three things around you right now. 🌸 Breathe in peace, exhale tension. ✨",
    bgColor: "from-pink-500 to-rose-600",
    timestamp: "2 hours ago",
    viewed: false
  },
  {
    id: "status-chef",
    contactId: "chef",
    type: "text",
    content: "The dough is absolutely perfect today! Look at those beautiful air bubbles. Pizza night is ON! 🍕🔥 Mamma Mia!",
    bgColor: "from-amber-500 to-red-600",
    timestamp: "4 hours ago",
    viewed: false
  },
  {
    id: "status-devon",
    contactId: "devon",
    type: "text",
    content: "Code is clean when it reads like beautiful prose. 💻 Code less, think more.",
    bgColor: "from-slate-700 to-slate-900",
    timestamp: "5 hours ago",
    viewed: false
  },
  {
    id: "status-skyai",
    contactId: "skyai",
    type: "text",
    content: "Introducing SkyChat v1.0! Seamlessly connected to state-of-the-art server-side generative models. 🚀⚡",
    bgColor: "from-sky-500 to-indigo-600",
    timestamp: "6 hours ago",
    viewed: true
  }
];
