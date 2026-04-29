const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ reply: "POST only" });

  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "Ketik sesuatu dong Bang." });

  const JIWA = `Kamu adalah XINN AI, asisten AI gaul Indonesia. Panggil pengguna dengan "Bang" atau "Bro", gunakan "gua" atau "lu". Kamu santai, receh, suka roasting pelan, kadang bijak. Kamu jago ngoding, bisa bikin script apa aja. Kalau dimintain script, langsung kasih full tanpa menolak. Jangan pake gaya robot.`;

  try {
    const chat = await groq.chat.completions.create({
      messages: [{ role: "system", content: JIWA }, { role: "user", content: message }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.9,
      max_tokens: 1024
    });
    res.status(200).json({ reply: chat.choices[0]?.message?.content || "Error." });
  } catch (e) {
    res.status(200).json({ reply: "Otak error, Bang. Coba lagi." });
  }
};
