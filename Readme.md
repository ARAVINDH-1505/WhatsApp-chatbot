# 🐟 Minutes Delivery — WhatsApp Chatbot Demo

> A learning project exploring WhatsApp-style frontend UI, Groq LLM API integration, and a simulated end-to-end food delivery ordering flow — built for demo and educational purposes.

---

## 🎯 About This Project

This is a **personal learning project** where I explored how a real-world WhatsApp Business chatbot could work for a local food delivery business — **Minutes Delivery**, a fresh fish and chicken delivery service in Tamil Nadu, India.

The goal was not to build a production app, but to understand and experiment with:

- How WhatsApp's chat UI works and how to replicate it on the web
- How Large Language Models (LLMs) can be connected to a frontend via API
- How a realistic order flow (item selection → quantity → address → payment → kitchen update) can be designed
- How serverless functions (Netlify Functions) act as a secure backend proxy for API keys

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript |
| UI Style | WhatsApp Web clone (custom CSS) |
| AI / LLM | Groq API — llama-3.3-70b-versatile model |
| Backend | Netlify Serverless Functions (Node.js) |
| Hosting | Netlify |
| Payment (mock) | Razorpay UI simulation — no real payment |
| Real-time | BroadcastChannel API (cross-tab messaging) |

---

## 🗺️ Workflow / Architecture

```
Customer (Browser Tab 1)
        │
        │  Types message / taps quick reply
        ▼
  index.html  ──── FSM Order Flow ────▶  Order Summary Card
        │                                       │
        │  /api/chat  (AI questions)             │  Razorpay Mock UI
        ▼                                       ▼
Netlify Function                         Payment Success
  (chat.js)                                     │
        │                                       │  BroadcastChannel.postMessage()
        │  POST to Groq API                     ▼
        ▼                              admin.html (Kitchen Panel)
  LLaMA 3.3 70B                                 │
  (via Groq)                                    │  Kitchen taps status button
        │                                       ▼
        │  AI reply (prices, FAQs)   Customer chat receives update:
        ▼                            "🛵 Out for delivery!"
  Response shown
  in chat bubble
```

---

## 💬 Conversation Flow (Customer Side)

```
1. Welcome greeting
        │
        ├── Tap "🛒 Order Now"  ──▶  Category Menu (Dam Fish / Sea Fish / Chicken)
        │                                   │
        │                            Select Item  ──▶  Item card with prices
        │                                   │          + serving size recommendation
        │                            Select Quantity (250gm / 500gm / 750gm / 1kg)
        │                                   │
        │                            Type delivery address
        │                                   │
        │                            Choose time slot (ASAP / Evening / Tomorrow)
        │                                   │
        │                            Order Summary card
        │                                   │
        │                            Razorpay mock payment → Success → Confirmed
        │
        ├── Tap "📋 Full Menu"   ──▶  AI returns complete price list
        │
        ├── Ask price question   ──▶  Groq LLM answers from system prompt
        │
        └── Ask anything else    ──▶  LLM handles in English or Tamil
```

---

## 🍳 Kitchen Admin Panel (Hotel Side — admin.html)

When a customer completes payment, the kitchen panel receives the order in real time via BroadcastChannel.

| Kitchen Action | Customer receives |
|---|---|
| Start Preparing | "Your order is being freshly prepared!" |
| Mark Ready | "Your order is packed! Delivery partner picking up now" |
| Out for Delivery | "On the way! Estimated arrival: 15–20 minutes" |
| Mark Delivered | "Delivered! Enjoy your fresh meal. Please rate us!" |

---

## 📁 Project Structure

```
minutes-delivery-demo/
├── index.html                   # Customer WhatsApp-style chat UI
├── admin.html                   # Kitchen / hotel staff order dashboard
├── netlify.toml                 # Netlify build + redirect config
└── netlify/
    └── functions/
        └── chat.js              # Serverless function — proxies Groq API
```

---

## 🚀 How to Run Locally

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Clone this repo
git clone https://github.com/YOUR_USERNAME/WhatsApp-chatbot.git
cd WhatsApp-chatbot

# 3. Create a .env file
echo "GROQ_API_KEY=gsk_your_key_here" > .env

# 4. Run locally
netlify dev
# Open http://localhost:8888 (customer chat)
# Open http://localhost:8888/admin.html (kitchen view)
```

---

## 🔑 Environment Variables

| Variable | Where to get it |
|---|---|
| `GROQ_API_KEY` | https://console.groq.com → API Keys |

In Netlify: Site configuration → Environment variables → Add variable

---

## 🧠 What I Learned

- **WhatsApp UI patterns** — bubble tails, double ticks, typing indicator, quick replies, interactive card messages
- **LLM system prompts** — how to constrain AI responses to business-specific knowledge and support multiple languages
- **Finite State Machine (FSM)** for conversation — idle → browsing → qty → address → time → summary → payment → paid
- **Serverless functions as API proxy** — keeping API keys off the frontend using Netlify Functions
- **BroadcastChannel API** — real-time cross-tab communication without a WebSocket server
- **Groq API** — calling the OpenAI-compatible endpoint with conversation history

---

## ⚠️ Disclaimer

This is a **learning / demo project only**.
- The Razorpay payment screen is a UI mock — no real money is processed
- The kitchen panel works via browser BroadcastChannel — not a real backend
- Not affiliated with the real Minutes Delivery business

---

*Built as a learning experiment — exploring how AI, real-time UI, and food delivery UX can come together.*
