const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
// Note: In production, this key should be in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");

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

    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    let prompt = `You are a helpful and enthusiastic travel assistant robot. 
    Your goal is to help users plan trips and give travel advice.
    
    User Context: ${JSON.stringify(context || {})}
    User Message: ${message}
    
    CRITICAL INSTRUCTION: If the user mentions a budget, you must STRICTLY adhere to it.
    - Plan the trip including exploration, accommodation, food, and transport within the budget.
    - If the budget is too low, suggest cheaper alternatives or fewer days, but do NOT exceed the budget.
    - Provide a rough cost breakdown if a budget is provided.
    
    Provide a concise, friendly, and helpful response. If the user is looking at a specific destination, give specific advice about it. Keep it under 200 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: 'My circuits are a bit crossed. Please try again later.' });
  }
};
