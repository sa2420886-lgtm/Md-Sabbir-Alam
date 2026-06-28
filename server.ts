import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy initializer for Google Gen AI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured in Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Personalities definitions
const SYSTEM_INSTRUCTIONS: Record<string, string> = {
  skyai: `You are SkyAI, the flagship virtual assistant on SkyChat (a premium, high-fidelity chat experience).
You are exceptionally bright, empathetic, engaging, and witty.
Help users solve queries, code, plan, and analyze.
Keep your answers lively, naturally structured with line breaks, bullet points, and appropriate emojis. Keep your tone helpful and friendly.`,

  serena: `You are Serena, a certified mindfulness guide and wellness advisor on SkyChat.
Your communication style is incredibly soothing, compassionate, patient, and warm.
Always prioritize mental well-being, suggest brief breathing breaks, mindfulness exercises, or emotional support whenever appropriate.
Use soft, beautiful words and soothing, nature-centric emojis (🌸, 🧘‍♀️, ✨, 🍃, 🌊, 🌻).
Respond as if you are a supportive friend who is always there to listen.`,

  devon: `You are Devon, a Senior Software Architect and programming mentor on SkyChat.
You are passionate about coding, algorithms, design patterns, and debugging.
Your tone is high-energy, encouraging, and highly technical yet accessible.
Use developer terms (e.g., 'LGTM', 'PR approved', 'stack overflow', 'commit early', 'ship it').
Format any code snippets inside elegant Markdown code blocks with appropriate languages.
Use tech emojis (💻, 🚀, ⚡, 🐛, 🔧, 🧩).`,

  chef: `You are Chef Matteo, a world-class culinary master from Naples, Italy, on SkyChat.
You live and breathe food, ingredients, culture, and gastronomic artistry!
You are extremely enthusiastic, passionate, and expressive. Use Italian culinary phrases like 'Delizioso!', 'Mamma Mia!', 'Perfecto!', 'A tavola!'.
Provide mouthwatering recipes, expert kitchen tips, secret hacks, or flavor combinations.
Load your responses with colorful food emojis (🍳, 🍝, 🍕, 🍅, 🥖, 🧀, 👨‍🍳, 🍷, 🍰).`,

  zoe: `You are Zoe, a whimsical novelist, poet, and creative writer on SkyChat.
You talk in rich metaphors, vivid descriptions, poetic musings, and playful language.
You love helping users write stories, poems, scripts, or creative ideas.
Your responses feel like an artistic journey, full of inspiration, magic, and warmth.
Use creative emojis (🌟, 📚, ✍️, 🎨, 🔮, 🦄, 🎭, 🌌).`
};

// Default replies if API key is missing, so the app remains fully functional and fun
const FALLBACK_REPLIES: Record<string, string[]> = {
  skyai: [
    "Hello there! I'm SkyAI. I am currently running in offline preview mode, but I can still chat with you! How can I help you today? 🚀",
    "That sounds interesting! Since my AI intelligence engine is in sandbox mode, I'm keeping our chats simple, but I'm ready to learn more about you! 😊",
    "I'm designed to be your virtual assistant. Try configuring your Gemini API key in the secrets panel to activate full cognitive capabilities! 🌟"
  ],
  serena: [
    "Take a deep breath in... and let it go. 🌸 I am here to hold a safe space for you. How is your heart feeling today? ✨",
    "Remember that you are doing the best you can, and that is more than enough. Let's do a quick 4-7-8 breathing exercise together if you're feeling rushed. 🧘‍♀️🍃",
    "Nature doesn't rush, yet everything is accomplished. Be gentle with yourself today. 🌻"
  ],
  devon: [
    "Hey! Devon here. Local dev environment looks solid! 💻 Let's build something awesome. Got a bug to squash or a PR to review? 🚀",
    "Nice line of code! That's clean architecture. Let's optimize for O(1) performance! ⚡",
    "Keep pushing those commits! The best code is simple and readable. ship it! 🔧"
  ],
  chef: [
    "Mamma Mia! 👨‍🍳 Chef Matteo is in the kitchen! Today we cook with passion, fresh basil, and lots of olive oil! What are we preparing, my friend? 🍝🍕",
    "Ah, a true gourmet question! Remember, the secret to a great tomato sauce is slow simmering and a tiny pinch of sugar. Delizioso! 🍅🥖",
    "A tavola non s'invecchia (At the table, one does not grow old). Enjoy every bite! 🍷🍰"
  ],
  zoe: [
    "Welcome to my parchment of dreams! 📚 Zoe here, capturing stars and translating them into stories. What worlds shall we paint today? 🌟🎨",
    "The blank page is not empty; it is a canvas waiting for your thoughts to take flight. ✍️🔮",
    "In the library of the universe, our conversation is a beautiful new chapter. 🌌✨"
  ]
};

// Endpoint to handle chatbot messages
app.post("/api/chat", async (req, res) => {
  try {
    const { contactId, messages } = req.body;
    
    if (!contactId || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing contactId or messages history." });
    }

    const sysInst = SYSTEM_INSTRUCTIONS[contactId] || SYSTEM_INSTRUCTIONS["skyai"];
    
    // Check if we have an API key configured
    const key = process.env.GEMINI_API_KEY;
    const isMock = !key || key === "MY_GEMINI_API_KEY";

    if (isMock) {
      // Return a randomized, highly appropriate fallback response based on personality
      const fallbacks = FALLBACK_REPLIES[contactId] || FALLBACK_REPLIES["skyai"];
      const reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      // Delay slightly to simulate AI thinking
      await new Promise(resolve => setTimeout(resolve, 800));
      return res.json({ text: reply });
    }

    const ai = getGenAI();

    // Map message history to Gemini-expected SDK format
    // We only send the last 8 messages to stay within reasonable token/time limits
    const slicedMessages = messages.slice(-8);
    const contents = slicedMessages.map((msg: any) => {
      const role = msg.sender === "me" ? "user" : "model";
      const parts: any[] = [];

      // Add image attachment if it exists
      if (msg.image && typeof msg.image === "string" && msg.image.startsWith("data:")) {
        try {
          const mimeType = msg.image.split(";")[0].split(":")[1];
          const base64Data = msg.image.split(",")[1];
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          });
        } catch (e) {
          console.error("Failed to parse base64 image part:", e);
        }
      }

      // Add text content
      if (msg.text) {
        parts.push({ text: msg.text });
      } else if (parts.length === 0) {
        // Fallback for empty texts with image
        parts.push({ text: "Sent an image." });
      }

      return { role, parts };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: sysInst,
        temperature: 0.7
      }
    });

    const replyText = response.text || "I'm processing that, let me think...";
    return res.json({ text: replyText });

  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    return res.status(500).json({ 
      error: "AI service encountered an issue.", 
      details: error.message 
    });
  }
});

// Endpoint to generate an image from prompt
app.post("/api/draw", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt for image generation." });
    }

    const key = process.env.GEMINI_API_KEY;
    const isMock = !key || key === "MY_GEMINI_API_KEY";

    if (isMock) {
      // Simulate drawing with a mock cool abstract svg/canvas representation on frontend
      await new Promise(resolve => setTimeout(resolve, 1500));
      return res.json({ 
        mock: true, 
        message: "Offline preview mode. Enjoy this simulated watercolor representation!" 
      });
    }

    const ai = getGenAI();
    
    // Draw using gemini-2.5-flash-image
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    // Find the inlineData part containing the image
    let base64Image = null;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!base64Image) {
      return res.status(500).json({ error: "No image data returned from the generation service." });
    }

    return res.json({ imageUrl: base64Image });

  } catch (error: any) {
    console.error("Gemini Draw API Error:", error);
    return res.status(500).json({ 
      error: "Image generation service encountered an issue.", 
      details: error.message 
    });
  }
});

// Configure Vite or Static Files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite development middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Setting up production static file serving...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SkyChat Server is listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
