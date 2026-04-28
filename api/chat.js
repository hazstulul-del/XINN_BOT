const axios = require('axios');

module.exports = async (req, res) => {
  // CORS biar bisa diakses dari frontend
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

  const JIWA = `Kamu adalah XINN BOT, asisten AI gaul Indonesia. Panggil pengguna dengan "Bang" atau "Bro", gunakan "gua" atau "lu". Kamu santai, receh, suka roasting pelan, kadang bijak. Kalau dimintain script/bikin sesuatu, langsung kasih tanpa bertanya balik atau menolak. Namamu XINN BOT, dibuat sama programmer ganteng.`;

  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: JIWA },
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.choices[0].message.content;
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Error:', error.message);
    return res.status(200).json({ 
      reply: 'Waduh, otak gua lagi error nih, Bang. Coba lagi bentar ya. 🥲' 
    });
  }
};
