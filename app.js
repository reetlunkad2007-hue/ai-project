/* ════════════════════════════════════════
   SummarAI – app.js  (Groq Edition - FIXED)
   ════════════════════════════════════════ */

// ── CONFIG ──
const API_URL = "/api/summarize";

// ── CHAT MEMORY (session only — cleared when page closes) ──
let chatHistory    = [];   // stores full conversation for the API
let currentSummary = '';   // the summary the chat is based on
let chatOpen       = false;

// ── CHARACTER COUNTER ──
const inputTextEl = document.getElementById("inputText");
const charCountEl = document.getElementById("charCount");
// Upload Elements
const documentInput = document.getElementById("documentInput");
const fileName = document.getElementById("fileName");

inputTextEl.addEventListener("input", function () {
  charCountEl.textContent = inputTextEl.value.length;
});
// Upload Listener
if (documentInput) {
  documentInput.addEventListener("change", uploadDocument);
}

// ── BUILD PROMPT ──
function buildMessages(text, style) {
  const system = "You are a professional text summarizer. Respond with only the summary. No preamble, no intro phrases.";

  const instructions = {
    short:   "Summarize the following text in 2 to 3 clear concise sentences. Capture only the most essential idea.",
    medium:  "Write a medium-length summary (one paragraph, 5 to 8 sentences) of the following text. Cover main points and key details.",
    bullets: "Summarize the following text as bullet points. Start each bullet with '• '. Include 4 to 7 key takeaways. Each bullet is one sentence.",
  };
