import { afterEach, describe, it, expect } from 'vitest';
import { aiHistoryKey, restoreAIHistory, saveAIHistory } from '../aiHistory';
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
describe('account-scoped AI history', () => {
  it('restores conversations for the signed-in account and isolates another account', () => {
    sessionStorage.setItem('token', 'test');
    sessionStorage.setItem('id', '10');
    const key = aiHistoryKey();
    saveAIHistory(key, [
      { id: 2, question: '历史书', answer: '推荐', error: false, pending: false },
    ]);
    expect(restoreAIHistory(key)[0]?.answer).toBe('推荐');
    sessionStorage.setItem('id', '11');
    expect(restoreAIHistory(aiHistoryKey())).toEqual([]);
  });
  it('recovers interrupted requests as retryable without replaying a request', () => {
    const key = 'zhenshi.ai.v1:test';
    saveAIHistory(key, [{ id: 3, question: '推荐', answer: '', error: false, pending: true }]);
    expect(restoreAIHistory(key)[0]).toMatchObject({
      id: 3,
      pending: false,
      error: true,
      question: '推荐',
    });
  });
  it('rejects malformed storage and bounds retained conversations', () => {
    const key = 'zhenshi.ai.v1:test';
    localStorage.setItem(key, 'broken');
    expect(restoreAIHistory(key)).toEqual([]);
    saveAIHistory(
      key,
      Array.from({ length: 110 }, (_, id) => ({
        id,
        question: '书',
        answer: '文字',
        error: false,
        pending: false,
      }))
    );
    expect(restoreAIHistory(key)).toHaveLength(100);
    expect(restoreAIHistory(key)[0]?.id).toBe(10);
  });
});
