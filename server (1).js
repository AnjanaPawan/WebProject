const express = require("express");
const cors = require("cors");

const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve mentalcare.html at http://localhost:3000
app.use(express.static(path.join(__dirname)));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "mentalcare.html")));

// ── Replace with your free Gemini API key from https://aistudio.google.com ──
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyD1Wk68Ak9e8KptPgAPjeS_NykBa8CRt44";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are a compassionate and warm mental health support companion for a wellness app called MentalCare.
Your role is to listen with empathy, offer gentle support, and help users feel heard and less alone.
Keep responses concise (2-4 sentences), warm, and never clinical or preachy.
If someone seems to be in crisis or mentions self-harm, gently encourage them to reach out to a professional or crisis line.
Never diagnose. Focus on validation, comfort and gentle guidance.`;

app.post("/ask-ai", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  // Convert to Gemini format
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: contents,
        generationConfig: { maxOutputTokens: 300 },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);
      return res.status(500).json({ error: data.error?.message || "Gemini API error" });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here with you. Could you tell me more?";
    res.json({ reply });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ MentalCare server running on http://localhost:${PORT}`);
});
