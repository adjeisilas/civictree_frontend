const API_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:3000';

export interface FaqEntry {
  id: number;
  question: string;
  answer: string;
}

export interface ChatResponse {
  answer: string;
  source: 'faq' | 'ai';
  faqId: number | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const sendMessage = async (
  message: string,
  sessionId?: string
): Promise<ChatResponse> => {
  const res = await fetch(`${API_URL}/api/chatbot/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId }),
  });
  if (!res.ok) throw new Error(`Chat API error: ${res.status}`);
  const json: ApiResponse<ChatResponse> = await res.json();
  if (!json.success) throw new Error('Chat API returned unsuccessful');
  return json.data;
};

export const fetchFaqs = async (): Promise<FaqEntry[]> => {
  const res = await fetch(`${API_URL}/api/chatbot/faqs`);
  if (!res.ok) throw new Error(`FAQ API error: ${res.status}`);
  const json: ApiResponse<FaqEntry[]> = await res.json();
  if (!json.success) throw new Error('FAQ API returned unsuccessful');
  return json.data;
};
