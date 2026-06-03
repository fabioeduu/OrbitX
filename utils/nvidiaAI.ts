const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";
const API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

const SYSTEM_PROMPT = `Você é a Orbit AI, assistente especializada em monitoramento e otimização de data centers.
Sua função é analisar KPIs de energia, temperatura, carbono e eficiência, e fornecer recomendações práticas.
Responda sempre em português, de forma concisa e técnica. Foque em métricas reais e sugestões acionáveis.`;

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function sendToNvidia(
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: userMessage },
  ];

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "HTTP-Referer": "https://orbitx.app",
      "X-Title": "OrbitX",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.6,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const msg = data.choices?.[0]?.message;
  return msg?.content ?? msg?.reasoning ?? "Sem resposta da IA.";
}