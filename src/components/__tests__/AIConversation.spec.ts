import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import AIConversation from '../AIConversation.vue';
import { askAIAssistant } from '../../api/aiService';
vi.mock('../../api/aiService', () => ({ askAIAssistant: vi.fn() }));
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div/>' } },
    { path: '/login', component: { template: '<div/>' } },
  ],
});
let wrapper: ReturnType<typeof mount>;
beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.setItem('token', 'test');
  HTMLElement.prototype.scrollTo = vi.fn();
});
afterEach(() => {
  wrapper?.unmount();
  sessionStorage.clear();
});
describe('AI conversation', () => {
  it('prevents duplicate sends and clearing the in-flight answer, then renders untrusted model text safely', async () => {
    let resolve!: (value: any) => void;
    vi.mocked(askAIAssistant).mockReturnValue(new Promise((r) => (resolve = r)));
    wrapper = mount(AIConversation, { global: { plugins: [router] } });
    await wrapper.get('textarea').setValue('想读计算机类书籍');
    await wrapper.get('form').trigger('submit');
    await wrapper.get('form').trigger('submit');
    expect(askAIAssistant).toHaveBeenCalledTimes(1);
    expect(wrapper.find('[role="status"]').exists()).toBe(true);
    expect(
      wrapper
        .findAll('button')
        .find((b) => b.text().includes('清空对话'))
        ?.attributes('disabled')
    ).toBeDefined();
    resolve({ data: '<img src=x onerror=alert(1)>这是推荐文字' });
    await flushPromises();
    expect(wrapper.get('.answer-content').text()).toContain('<img');
    expect(wrapper.find('.answer-content img').exists()).toBe(false);
  });
  it('keeps a failed question available for retry', async () => {
    vi.mocked(askAIAssistant).mockRejectedValue(new Error('offline'));
    wrapper = mount(AIConversation, { global: { plugins: [router] } });
    await wrapper.get('textarea').setValue('推荐历史书');
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(wrapper.text()).toContain('重新尝试');
    expect(wrapper.text()).toContain('推荐历史书');
  });
  it('does not send when Enter is completing Chinese input', async () => {
    wrapper = mount(AIConversation, { global: { plugins: [router] } });
    await wrapper.get('textarea').setValue('读书');
    await wrapper.get('textarea').trigger('keydown', { key: 'Enter', isComposing: true });
    expect(askAIAssistant).not.toHaveBeenCalled();
  });
});
