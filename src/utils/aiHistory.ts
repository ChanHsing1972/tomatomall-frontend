import { ref } from 'vue';
export type AIEntry = {
  id: number;
  question: string;
  answer: string;
  error: boolean;
  pending: boolean;
};
const prefix = 'zhenshi.ai.v1:';
export function aiHistoryKey(): string | null {
  const identity = sessionStorage.getItem('id') || sessionStorage.getItem('username');
  return identity && sessionStorage.getItem('token') ? prefix + identity : null;
}
export function restoreAIHistory(key: string | null): AIEntry[] {
  if (!key) return [];
  try {
    const entries: unknown = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(entries)) return [];
    return entries
      .filter(
        (item): item is AIEntry =>
          item &&
          Number.isSafeInteger(item.id) &&
          typeof item.question === 'string' &&
          item.question.length <= 1000 &&
          typeof item.answer === 'string' &&
          item.answer.length <= 64000 &&
          typeof item.error === 'boolean' &&
          typeof item.pending === 'boolean'
      )
      .slice(-100)
      .map((item) => ({
        ...item,
        pending: false,
        error: item.pending || item.error,
        answer: item.pending ? '上次回答被中断，你可以重新尝试。' : item.answer,
      }));
  } catch {
    return [];
  }
}
export function saveAIHistory(key: string | null, entries: AIEntry[]): boolean {
  if (!key) return true;
  try {
    localStorage.setItem(key, JSON.stringify(entries.slice(-100)));
    return true;
  } catch {
    return false;
  }
}

// Share in-flight requests across page/dialog mounts; account keys remain separate.
const conversations = new Map<string, ReturnType<typeof createConversation>>();
function createConversation(key: string | null) {
  const entries = restoreAIHistory(key);
  return {
    history: ref<AIEntry[]>(entries),
    loading: ref(false),
    nextId: Math.max(-1, ...entries.map((entry) => entry.id)) + 1,
  };
}
export function aiConversationState(key: string | null) {
  if (!key) return createConversation(null);
  let state = conversations.get(key);
  if (!state) {
    state = createConversation(key);
    conversations.set(key, state);
  }
  return state;
}
