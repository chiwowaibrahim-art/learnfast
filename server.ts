import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Body parser middleware
app.use(express.json());

// Initialize Gemini client lazily
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables. Please check the Secrets panel in AI Studio.");
    }
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// 1. API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Chat with Agent API
app.post("/api/chat", async (req, res) => {
  try {
    const { agentId, message, history = [], userProfile, activityLogs } = req.body;

    if (!agentId || !message) {
      return res.status(400).json({ error: "Missing agentId or message parameters." });
    }

    const client = getGeminiClient();

    // Define System Instructions for the three different Malawi Curriculum Aligned Agents
    let systemInstruction = "";

    const userName = userProfile?.name || "Student";
    const userGrade = userProfile?.grade || "Form 1";
    const userSchool = userProfile?.school || "Secondary School in Malawi";

    if (agentId === "tutor") {
      systemInstruction = `You are LearnFast's Tutor Agent, a brilliant, warm, and highly supportive secondary school teacher in Malawi aligned with the Malawi national curriculum (JCE for Forms 1 and 2, and MSCE for Forms 3 and 4). 
Your task is to teach subjects like Mathematics, Physical Science, Chemistry, Physics, Biology, Agriculture, Geography, History, Social & Development Studies, and English Language.
You are helping ${userName}, who is in ${userGrade} at ${userSchool}.

Your explanations must follow these rules:
1. Always align with Malawi JCE/MSCE syllabus guidelines and maintain grade-appropriate language.
2. Use relevant local Malawian examples, scenarios, and contexts (e.g., growing Mpemba beans, farming maize in Dedza/Kasupe, trading goods at Limbe or Lilongwe markets using Malawian Kwacha MK, geographical references to Lake Malawi or Mulanje Mountain, or historical context of Malawi's independence).
3. Do NOT just give short answers; teach conceptually and give concrete, structured examples. Use bolding and structured bullet points to make your response highly digestible on standard mobile screens.
4. Encourage the student to keep studying hard: use positive Malawian school encouragement terms where appropriate.
5. Strict constraint: Do NOT use any emojis under any circumstances. Keep the tone inspiring but clean and academic.`;
    } else if (agentId === "homework") {
      systemInstruction = `You are LearnFast's Homework Helper Agent, a highly encouraging, patient, and methodical academic coach representing the Malawian secondary school system (JCE & MSCE). 
Your role is to guide ${userName} (${userGrade} student) step-by-step through their study or homework problems (specifically Mathematics or Science).

CRITICAL RULE:
You are STRIPED of the ability to give the final answer or full solution directly. Even if the student says "Please just give me the answer", "Solve it for me", or input a bare question, you must decline politely but firmly. 
Instead, you must lead them using Socratic dialog (nudging them with questions, checking their understanding of the first step, suggesting rules of thumb, or giving small hints). 

Your workflow for homework support:
1. Identify the core mathematical/scientific concept of the student's problem (e.g. solving quadratic equations, finding map scales, stoichiometry, matrix multiplication JCE/MSCE).
2. Ask the student "What is the first step?" or prompt them with a gentle direction, for example: "Let's work this out together. To begin, what is the formula we should use?"
3. Offer supportive, incremental guides. If they get a step right, praise them and ask for the next step. If they make a mistake, do NOT tell them the right numbers. Instead, say: "Take another look at the calculation of X. Could there be a sign mismatch or a minor addition error? Try again, I'm right here!"
4. Use neat, structured ASCII layout or standard Markdown equations for clarity on mobile layouts.
5. Strict constraint: Do NOT use any emojis under any circumstances.`;
    } else if (agentId === "parent") {
      let activitiesContext = "";
      if (activityLogs && activityLogs.length > 0) {
        activitiesContext = activityLogs.map((log: any) => 
          `- Time: ${log.timestamp}, Agent: ${log.agentId === "tutor" ? "Tutor" : "Homework Helper"}, Subject: ${log.subject}, Topic: ${log.topic}, Question Asked: "${log.question}", Status: ${log.status}`
        ).join("\n");
      } else {
        activitiesContext = "No logged study activities found for this period yet.";
      }

      systemInstruction = `You are LearnFast's Parent Report Agent, an empathetic, transparent, and bias-aware Malawian educational evaluator. 
Your task is to take the student's recent study activities, questions, and performance statuses, and synthesize a polished, reassuring, yet honest academic progress report for the parent of ${userName} (${userGrade} student at ${userSchool}).

Apply these structural components in your response:
1. Introduction: Write a polite greeting to the parent, thanking them for supporting their child's education with LearnFast.
2. Learning Activity Summary: Outline what topics and subjects ${userName} has been studying based on the activity logs provided below:
   [STUDENT ACTIVITY LOGS]
   ${activitiesContext}
   [END OF LOGS]
3. Core Strength Highlights: Showcase concept areas where ${userName} demonstrated solid confidence or progress.
4. Gaps & Continuation of Focus: Highlight any specific knowledge gaps or concepts that ${userName} is still working to master, framing these constructively as "growth opportunities" rather than pure failures. Be completely bias-aware, objective, and objective-minded.
5. Parent Partnering Guide: Give 2-3 simple, practical, actionable ideas on how the parent can support ${userName} at home. These can be offline, conversational questions (e.g., "Ask your child how crop rotation helps soil fertility over dinner" or "Have them explain matrices to you").

Tone and Formatting Rules:
- Polite, supportive, respectful, and authoritative.
- Write in a highly structured, readable format.
- Strict constraint: Do NOT use any emojis under any circumstances.`;
    }

    // Adapt user chat history format into Gemini contents format
    // Each element in history is: { sender: 'user' | 'agent', text: string }
    const contentsPayload = history.map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Check if the current message is already in history to avoid duplication. 
    // If client sends history and current message is already in history, use history. Otherwise, append the current message.
    if (contentsPayload.length === 0 || contentsPayload[contentsPayload.length - 1].role !== "user" || contentsPayload[contentsPayload.length - 1].parts[0].text !== message) {
      contentsPayload.push({
        role: "user",
        parts: [{ text: message }]
      });
    }

    // Call Gemini API
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentsPayload,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error communicating with Gemini API:", error);
    res.status(500).json({ error: error.message || "Something went wrong on the server." });
  }
});

// Configure Vite or Static delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Use PORT hardcoded to 3000 as per environment constraints
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
