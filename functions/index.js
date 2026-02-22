const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();

const db = admin.firestore();

// Rate Limit Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 Hour
const RATE_LIMIT_MAX_REQUESTS = 20; // Max messages per hour

async function checkRateLimit(ip) {
    if (!ip) return true; // weak check if no IP
    
    const sanitizedIp = ip.replace(/[^a-zA-Z0-9]/g, "_"); // sanitize for doc ID
    const docRef = db.collection("rate_limits").doc(sanitizedIp);
    
    try {
        await db.runTransaction(async (t) => {
            const doc = await t.get(docRef);
            const now = Date.now();
            
            if (!doc.exists) {
                t.set(docRef, { count: 1, timestamp: now });
                return;
            }

            const data = doc.data();
            const timeDiff = now - data.timestamp;

            if (timeDiff > RATE_LIMIT_WINDOW_MS) {
                // Window expired, reset
                t.set(docRef, { count: 1, timestamp: now });
            } else {
                if (data.count >= RATE_LIMIT_MAX_REQUESTS) {
                    throw new Error("RATE_LIMIT_EXCEEDED");
                }
                t.update(docRef, { count: data.count + 1 });
            }
        });
    } catch (e) {
        if (e.message === "RATE_LIMIT_EXCEEDED") return false;
        console.error("Rate limit error:", e);
        return true; 
    }
    
    return true;
}

// Cloud Function: Chat with Gemini (onCall)
// Timestamp: 2026-02-17 Upgrade to Gemini 2.5 Flash
exports.chatWithGemini = functions.https.onCall(async (data, context) => {
    
    // 1. Rate Check
    const userIp = context.rawRequest ? (context.rawRequest.headers['fastly-client-ip'] || context.rawRequest.socket.remoteAddress) : 'unknown_ip';
    
    if (userIp !== 'unknown_ip') {
        const allowed = await checkRateLimit(userIp);
        if (!allowed) {
            throw new functions.https.HttpsError('resource-exhausted', "Too many requests. Please try again in an hour.");
        }
    }

    const { message, history, context: projectContext } = data;

    if (!message) {
        throw new functions.https.HttpsError('invalid-argument', "Message is required.");
    }

    try {
      // 2. Fetch API Key
      const settingsDoc = await admin.firestore().collection("settings").doc("config").get();
      
      if (!settingsDoc.exists || !settingsDoc.data().geminiApiKey) {
        console.error("API Key missing in Firestore settings/config");
        throw new functions.https.HttpsError('failed-precondition', "System configuration error. API Key not found.");
      }

      const apiKey = settingsDoc.data().geminiApiKey;
      const resumeContext = settingsDoc.data().resumeContext || "";

      // 3. Initialize Gemini
      // UPGRADE: Using 'gemini-2.5-flash' (Latest 2026 Stable Model)
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // 4. Construct History with Logic-Based System Prompt
      const validHistory = (history || []).filter(msg => {
            return (msg.role === 'user' || msg.role === 'model') && typeof msg.text === 'string';
      });

      const chatHistory = [
        {
          role: "user",
          parts: [{ text: `
            SYSTEM_INSTRUCTION:
            You are an AI Assistant for Aditya's Portfolio.
            
            RESUME / BIO CONTEXT:
            ${resumeContext}

            PROJECTS CONTEXT:
            ${projectContext || "No project data available."}

            Your Goal: Answer questions about Aditya based on the above information. 
            Be concise, professional, and friendly.
          `}],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I have reviewed the resume and projects. I am ready to answer questions about Aditya." }],
        },
        ...validHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }))
      ];

      const chat = model.startChat({
        history: chatHistory,
      });

      // 5. Send message
      const result = await chat.sendMessage(message);
      const response = result.response.text();

      // 6. Return success
      return { response };

    } catch (error) {
      console.error("Gemini Proxy Error:", error);
      if (error instanceof functions.https.HttpsError) throw error;
      throw new functions.https.HttpsError('internal', error.message || "Internal Server Error");
    }
});
