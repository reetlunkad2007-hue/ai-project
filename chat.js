/* ════════════════════════════════════════
   SummarAI – chat.js
   Part 1 - Configuration & Helper Functions
   ════════════════════════════════════════ */

// ───────────────────────────────────────
// CONFIG
// ───────────────────────────────────────

const CHAT_API_URL = "/api/chat";

let chatHistory = [];
let currentSummaryContext = "";

// ───────────────────────────────────────
// DOM ELEMENTS
// ───────────────────────────────────────

const chatMessages =
    document.getElementById("chatMessages");

const chatInput =
    document.getElementById("chatInput");

const sendChatBtn =
    document.getElementById("sendChatBtn");

const clearChatBtn =
    document.getElementById("clearChatBtn");

// Prevent errors if chat section isn't present
if (chatMessages) {

    chatMessages.innerHTML = "";

}

// ───────────────────────────────────────
// INITIALIZE CHAT
// ───────────────────────────────────────

function initializeChat() {

    chatHistory = [];

    if (window.currentSummary) {

        currentSummaryContext = window.currentSummary;

    } else {

        currentSummaryContext = "";

    }

    if (chatMessages) {

        chatMessages.innerHTML = "";

    }

    addBotMessage(
        "👋 Hi! Ask me anything about the generated summary."
    );

}

// ───────────────────────────────────────
// SCROLL TO LATEST MESSAGE
// ───────────────────────────────────────

function scrollChatToBottom() {

    if (!chatMessages) return;

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}

// ───────────────────────────────────────
// ADD USER MESSAGE
// ───────────────────────────────────────

function addUserMessage(message) {

    if (!chatMessages) return;

    const wrapper = document.createElement("div");
    wrapper.className = "chat-message user";

    wrapper.innerHTML = `
        <div class="chat-bubble user-bubble">
            ${escapeHTML(message)}
        </div>
    `;

    chatMessages.appendChild(wrapper);

    scrollChatToBottom();

}

// ───────────────────────────────────────
// ADD BOT MESSAGE
// ───────────────────────────────────────

function addBotMessage(message) {

    if (!chatMessages) return;

    const wrapper = document.createElement("div");
    wrapper.className = "chat-message bot";

    wrapper.innerHTML = `
        <div class="chat-bubble bot-bubble">
            ${formatMarkdown(message)}
        </div>
    `;

    chatMessages.appendChild(wrapper);

    scrollChatToBottom();

}

// ───────────────────────────────────────
// SHOW TYPING INDICATOR
// ───────────────────────────────────────

function showTypingIndicator() {

    if (!chatMessages) return;

    removeTypingIndicator();

    const typing = document.createElement("div");

    typing.id = "typingIndicator";

    typing.className = "chat-message bot";

    typing.innerHTML = `
        <div class="chat-bubble bot-bubble typing">
            Thinking...
        </div>
    `;

    chatMessages.appendChild(typing);

    scrollChatToBottom();

}

// ───────────────────────────────────────
// REMOVE TYPING INDICATOR
// ───────────────────────────────────────

function removeTypingIndicator() {

    const indicator =
        document.getElementById("typingIndicator");

    if (indicator) {

        indicator.remove();

    }

}

// ───────────────────────────────────────
// ESCAPE HTML
// ───────────────────────────────────────

function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}

// ───────────────────────────────────────
// SIMPLE MARKDOWN FORMATTER
// ───────────────────────────────────────

function formatMarkdown(text) {

    let html = escapeHTML(text);

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Italic
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Inline code
    html = html.replace(/`(.*?)`/g, "<code>$1</code>");

    // Bullet points
    html = html.replace(/^• (.*)$/gm, "<li>$1</li>");

    if (html.includes("<li>")) {

        html = "<ul>" + html + "</ul>";

    }

    // New lines
    html = html.replace(/\n/g, "<br>");

    return html;

}
/* ════════════════════════════════════════
   SummarAI – chat.js
   Part 2 – Send Message & API
   ════════════════════════════════════════ */

// ───────────────────────────────────────
// SEND MESSAGE
// ───────────────────────────────────────

async function sendMessage() {

    if (!chatInput) return;

    const message = chatInput.value.trim();

    if (!message) return;

    // Display user message
    addUserMessage(message);

    // Clear input
    chatInput.value = "";

    // Save to history
    chatHistory.push({
        role: "user",
        content: message
    });

    // Show typing animation
    showTypingIndicator();

    try {

        const reply = await callChatAPI(message);

        removeTypingIndicator();

        addBotMessage(reply);

        chatHistory.push({
            role: "assistant",
            content: reply
        });

    }

    catch (error) {

        console.error(error);

        removeTypingIndicator();

        addBotMessage(
            "❌ Sorry, I couldn't process your request. Please try again."
        );

    }

}

// ───────────────────────────────────────
// CALL CHAT API
// ───────────────────────────────────────

async function callChatAPI(userMessage) {

    const response = await fetch(CHAT_API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            summary: window.currentSummary || "",

            message: userMessage,

            history: chatHistory

        })

    });

    const data = await response.json();

    if (!response.ok) {

        throw new Error(
            data.error || "Chat request failed."
        );

    }

    return data.reply;

}

// ───────────────────────────────────────
// CLEAR CHAT
// ───────────────────────────────────────

function clearChat() {

    chatHistory = [];

    if (chatMessages) {

        chatMessages.innerHTML = "";

    }

    initializeChat();

}

// ───────────────────────────────────────
// KEYBOARD SUPPORT
// ───────────────────────────────────────

if (chatInput) {

    chatInput.addEventListener("keydown", function (event) {

        if (event.key === "Enter" && !event.shiftKey) {

            event.preventDefault();

            sendMessage();

        }

    });

}

// ───────────────────────────────────────
// BUTTON EVENTS
// ───────────────────────────────────────

if (sendChatBtn) {

    sendChatBtn.addEventListener("click", sendMessage);

}

if (clearChatBtn) {

    clearChatBtn.addEventListener("click", clearChat);

}

// ───────────────────────────────────────
// INITIALIZE WHEN PAGE LOADS
// ───────────────────────────────────────

window.addEventListener("DOMContentLoaded", function () {

    if (document.getElementById("chatSection")) {

        initializeChat();

    }

});