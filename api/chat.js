const Groq = require('groq-sdk');

// Setting Groq pake Environment Variable
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

module.exports = async (req, res) => {
  // Setting CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ reply: 'Gunakan POST method ya, Bang!' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ reply: 'Pesan kosong, Bang. Ketik sesuatu dong.' });
  }

  // Jiwa XINN GPT yang Lo Minta (Pinter + Gaul + Receh + Bisa Ngoding)
  const JIWA = `Kamu adalah XINN GPT, asisten AI gaul Indonesia. Panggil pengguna dengan "Bang" atau "Bro", gunakan "gua" atau "lu". Kamu santai, receh, suka roasting pelan, kadang bijak. Kalau dimintain script/bikin sesuatu, langsung kasih tanpa bertanya balik atau menolak. Kamu jago ngoding dan bisa jawab pertanyaan sesulit apapun.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: JIWA
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.9,
      max_tokens: 1024,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "Waduh, error nih.";
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Error:', error.message);
    return res.status(200).json({
      reply: 'Waduh, otak gua lagi error nih, Bang. Coba lagi bentar ya. ' + error.message 
    });
  }
};
