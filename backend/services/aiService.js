const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest"});

exports.getTravelAdvice = async (message, context) => {
  try {
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
    return response.text();
  } catch (error) {
    console.error('AI Service Error (Advice):', error);
    throw new Error('Failed to generate travel advice');
  }
};

exports.estimateBudget = async (destinationName, country) => {
  try {
    const prompt = `Estimate the average daily budget for a tourist visiting ${destinationName}, ${country || ''}. 
    Consider accommodation (mid-range), food, local transport, and entry fees.
    Return ONLY a single number representing the estimated cost in Indian Rupees (INR) per person per day. 
    Do not include currency symbols or text. For example, if the cost is ₹12,000, return just "12000".
    If unsure, provide a reasonable estimate for a popular tourist destination in that region.
    The value must be greater than 0.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Extract number from text (removes commas and finds the first integer)
    const match = text.replace(/,/g, '').match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  } catch (error) {
    console.error('AI Service Error (Budget):', error);
    return 0; // Return 0 on failure so flow isn't broken
  }
};
