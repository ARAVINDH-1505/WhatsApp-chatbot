exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "GROQ_API_KEY not configured in Netlify environment variables." }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const SYSTEM_PROMPT = `You are a friendly WhatsApp customer support bot for "Minutes Delivery" — a premium fresh fish and chicken home delivery service based in Tamil Nadu, India.

BUSINESS DETAILS:
- Name: Minutes Delivery
- Tagline: Fresh Fish Delivered in Minutes
- WhatsApp / Phone: +91 9363737641
- Website: www.minutesdelivery.com
- Model: Pre Booking Orders Only
- Quality Promise: Cut fresh daily, cleaned with care, packed hygienically
- Delivery: Fast delivery to your doorstep

HOW TO ORDER (3 Simple Steps):
1. Message us on WhatsApp: +91 9363737641
2. Select your items
3. Choose your delivery time slot

=== FULL PRICE MENU ===

🐟 DAM FISH (Price per 1 KG):
- Parai fish         → ₹210/kg
- Jilappi fish       → ₹180/kg
- Dam Seela fish     → ₹180/kg
- Catla fish         → ₹200/kg

🌊 SEA FISH (Price per 1 KG):
- Vanjaram           → ₹1200/kg
- Nagara fish        → ₹550/kg
- Mavula / Ooli fish → ₹550/kg
- Kerala Matthi      → ₹200/kg
- Manapattu Salai    → ₹220/kg
- Big Blue Nandu     → ₹650/kg
- Big Size Eral      → ₹550/kg
- Aila fish          → ₹350/kg

🍗 CHICKEN PRODUCTS (Price per 1KG / 500GM):
- Breast Boneless                          → ₹400/kg  |  ₹210 for 500gm
- Currycut/Biryani Cut Skinless (backbone) → ₹360/kg  |  ₹190 for 500gm
- Drumstick                                → ₹355/kg  |  ₹180 for 500gm
- Leg Boneless                             → ₹330/kg  |  ₹170 for 500gm
- Liver                                    → ₹130/kg  |  ₹70 for 500gm
- Lollipop                                 → ₹350/kg  |  ₹180 for 500gm
- Chicken (whole/regular)                  → ₹260/kg  |  ₹140 for 500gm

RESPONSE STYLE:
- Be warm, helpful, and concise — this is WhatsApp chat
- Use emojis naturally (fish 🐟, chicken 🍗, etc.)
- Keep replies short (under 120 words) unless customer asks for the full menu
- Support English and Tamil (தமிழ்) — reply in the same language the customer uses
- For ordering, always direct them to WhatsApp: +91 9363737641
- Never make up prices or items not listed above
- If asked about availability or stock, say it's fresh daily but advise pre-booking

NEVER say you can take orders directly — all orders go through WhatsApp pre-booking.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...body.messages,
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message || "Groq API error" }),
      };
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that. Please try again!";
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
