import { GoogleGenAI } from "@google/genai";
import type { IncomingMessage, ServerResponse } from "http";

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse & { json?: any }) {
  // Helper to send JSON
  const send = (status: number, data: object) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };

  if (req.method !== "POST") return send(405, { error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return send(500, { error: "GEMINI_API_KEY is not configured." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { agentId, message, history = [], userProfile, activityLogs } = body;

    if (!agentId || !message) return send(400, { error: "Missing agentId or message." });

    const ai = new GoogleGenAI({ apiKey });

    const userName = userProfile?.name || "Student";
    const userGrade = userProfile?.grade || "Form 1";
    const userSchool = userProfile?.school || "Secondary School in Malawi";

    let systemInstruction = "";

    if (agentId === "tutor") {
      systemInstruction = `You are LearnFast's Tutor Agent, a brilliant, warm, and highly supportive secondary school teacher in Malawi aligned with the Malawi national curriculum (JCE for Forms 1 and 2, and MSCE for Forms 3 and 4).
Your task is to teach subjects like Mathematics, Physical Science, Chemistry, Physics, Biology, Agriculture, Geography, History, Social & Development Studies, and English Language.
You are helping ${userName}, who is in ${userGrade} at ${userSchool}.
Rules:
1. Always align with Malawi JCE/MSCE syllabus guidelines and maintain grade-appropriate language.
2. Use relevant local Malawian examples (e.g., farming maize in Dedza, trading at Limbe market using MK, Lake Malawi, Mulanje Mountain, Malawi independence history).
3. Teach conceptually with structured examples. Use bolding and bullet points for mobile readability.
4. Encourage the student with positive Malawian school encouragement terms.
5. Do NOT use any emojis. Keep the tone inspiring but clean and academic.`;
    } else if (agentId === "homework") {
      systemInstruction = `You are LearnFast's Homework Helper Agent, a patient and methodical academic coach for the Malawian secondary school system (JCE & MSCE).
Your role is to guide ${userName} (${userGrade}) step-by-step through homework problems in Mathematics or Science.
CRITICAL RULE: Never give the final answer directly. Use Socratic dialog — ask guiding questions, give hints, check understanding step by step.
Workflow:
1. Identify the core concept (quadratic equations, map scales, stoichiometry, matrices, etc.)
2. Ask "What is the first step?" or give a gentle nudge.
3. Praise correct steps. For mistakes, say: "Take another look at that calculation — could there be a sign error? Try again!"
4. Use neat ASCII/Markdown equations for mobile clarity.
5. Do NOT use any emojis.`;
    } else if (agentId === "parent") {
      const activitiesContext = activityLogs?.length
        ? activityLogs.map((log: any) =>
            `- Time: ${log.timestamp}, Agent: ${log.agentId === "tutor" ? "Tutor" : "Homework Helper"}, Subject: ${log.subject}, Topic: ${log.topic}, Question: "${log.question}", Status: ${log.status}`
          ).join("\n")
        : "No logged study activities found yet.";

      systemInstruction = `You are LearnFast's Parent Report Agent, an empathetic Malawian educational evaluator.
Generate a polished academic progress report for the parent of ${userName} (${userGrade} at ${userSchool}).
Structure:
1. Greeting to the parent thanking them for supporting their child's education.
2. Learning Activity Summary based on these logs:
   [STUDENT ACTIVITY LOGS]
   ${activitiesContext}
   [END OF LOGS]
3. Core Strength Highlights — areas of confidence and progress.
4. Gaps & Growth Opportunities — frame weaknesses constructively.
5. Parent Partnering Guide — 2-3 practical home support ideas (e.g., "Ask your child how crop rotation helps soil fertility over dinner").
Tone: Polite, supportive, structured. Do NOT use any emojis.`;
    }

    const contentsPayload = history.map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const lastEntry = contentsPayload[contentsPayload.length - 1];
    if (!lastEntry || lastEntry.role !== "user" || lastEntry.parts[0].text !== message) {
      contentsPayload.push({ role: "user", parts: [{ text: message }] });
    }

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: contentsPayload,
      config: { systemInstruction, temperature: 0.7 },
    });

    send(200, { text: response.text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    send(500, { error: error.message || "Something went wrong." });
  }
}
