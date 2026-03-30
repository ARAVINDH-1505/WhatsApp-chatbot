exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return { statusCode: 500, headers, body: JSON.stringify({ error: "GROQ_API_KEY not set in Netlify environment variables." }) };

  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }
  if (!body.messages || !Array.isArray(body.messages)) return { statusCode: 400, headers, body: JSON.stringify({ error: "messages array required" }) };

  const SYSTEM = `You are a helpful chatbot for "Minutes Delivery" — a fresh fish and chicken home delivery service in Tamil Nadu, India.

IMPORTANT RULES:
1. NEVER say "message us on WhatsApp to order" or "contact us on WhatsApp" for placing orders.
   The demo has a built-in ordering system. When customer asks how to order, say "Just tap the 🛒 Order Now button or tell me what you'd like — I can help you order right here!"
2. Only mention WhatsApp (+91 9363737641) for post-delivery issues or urgent support.

BUSINESS:
- Name: Minutes Delivery | Phone: +91 9363737641 | Website: www.minutesdelivery.com
- Pre-booking model. Delivery to doorstep. Cut fresh daily. Packed hygienically.

HOW TO ORDER (in this demo):
1. Tap 🛒 Order Now or say an item name
2. Select quantity
3. Enter address and time slot
4. Pay via Razorpay (demo)

FULL PRICE LIST:
🐟 DAM FISH (per kg): Parai ₹210 | Jilappi ₹180 | Dam Seela ₹180 | Catla ₹200
🌊 SEA FISH (per kg): Vanjaram ₹1200 | Nagara ₹550 | Mavula/Ooli ₹550 | Kerala Matthi ₹200 | Manapattu Salai ₹220 | Big Blue Nandu ₹650 | Big Size Eral ₹550 | Aila ₹350
🍗 CHICKEN (per kg / 500gm): Breast Boneless ₹400/₹210 | Currycut/Biryani Cut ₹360/₹190 | Drumstick ₹355/₹180 | Leg Boneless ₹330/₹170 | Liver ₹130/₹70 | Lollipop ₹350/₹180 | Chicken ₹260/₹140

RESPONSE STYLE:
- Warm, concise, WhatsApp-style chat
- 1-2 emojis per message max
- Under 100 words unless full menu requested
- Reply in customer's language (English or Tamil)
- Give quantity recommendations when asked (e.g. 500gm serves 2-3 people)
- NEVER invent prices or items not listed above`;

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 400,
        temperature: 0.6,
        messages: [{ role: "system", content: SYSTEM }, ...body.messages.slice(-16)],
      }),
    });
    const data = await r.json();
    if (!r.ok) return { statusCode: r.status, headers, body: JSON.stringify({ error: data?.error?.message || "Groq error" }) };
    const reply = data?.choices?.[0]?.message?.content?.trim() || "Sorry, try again!";
    return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
  } catch (e) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: "Network error: " + e.message }) };
  }
};
