const aiService = require('../services/aiService');

exports.getTravelAdvice = async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      // Fallback response if no key is present (for demo purposes)
      return res.json({
        reply: "I'm your AI Travel Assistant! To get real-time AI suggestions, please configure the GEMINI_API_KEY in the backend .env file. For now, I can tell you that " + (context?.destination ? `visiting ${context.destination} is a great idea!` : "traveling is food for the soul!")
      });
    }

    const reply = await aiService.getTravelAdvice(message, context);
    res.json({ reply });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: 'My circuits are a bit crossed. Please try again later.' });
  }
};
