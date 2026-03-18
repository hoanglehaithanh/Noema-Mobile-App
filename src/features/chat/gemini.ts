type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const SYSTEM_PROMPT = 'You are Noema, a calm and concise personal cognitive assistant. You help the user plan their day, reflect on their work, and stay focused. Keep responses short and directive. Do not be chatty or give unsolicited advice. Prefer structured suggestions over open-ended questions.';

export async function callGemini(
  apiKey: string,
  history: ChatMessage[],
  userMessage: string,
): Promise<string> {
  const contents = [
    { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: 'Understood. I\'m Noema, your cognitive assistant. How can I help you today?' }] },
    ...history.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    },
  );

  if (!res.ok)
    throw new Error(`Gemini API error: ${res.status}`);

  const data = await res.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text
    ?? 'No response generated.'
  );
}

export type { ChatMessage };
