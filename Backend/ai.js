import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: "YOUR_API_KEY",
});

export async function getAIResponse(moves, optimal) {
  const msg = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 150,
    messages: [
      {
        role: "user",
        content: `Moves used: ${moves}, Optimal: ${optimal}. Give short feedback.`
      }
    ]
  });

  return msg.content[0].text;
}