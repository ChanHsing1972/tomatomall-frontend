import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import CodeQualityTest from '../CodeQualityTest.vue';

describe('CodeQualityTest.vue', () => {
  it('渲染标题和初始消息', () => {
    const wrapper = mount(CodeQualityTest);
    expect(wrapper.text()).toContain('代码质量测试组件');
    expect(wrapper.text()).toContain('Hello World');
  });

  it('按钮点击触发事件', async () => {
    const wrapper = mount(CodeQualityTest);
    const button = wrapper.find('button');
    expect(button.text()).toContain('点击按钮');

    // 模拟点击
    await button.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('click');
  });

  it('1秒后更新消息', async () => {
    vi.useFakeTimers();
    const wrapper = mount(CodeQualityTest);

    expect(wrapper.text()).toContain('Hello World');

    // 快进1秒
    vi.advanceTimersByTime(1000);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Updated Message');
    vi.useRealTimers();
  });

  it('渲染动态列表', () => {
    const wrapper = mount(CodeQualityTest, {
      props: {
          items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
          ],
      },
    });

    const listItems = wrapper.findAll('ul li');
    expect(listItems).toHaveLength(2);
    expect(listItems[0].text()).toBe('Item 1');
    expect(listItems[1].text()).toBe('Item 2');
  });

  it('测试 items 列表为空时的渲染', () => {
    const wrapper = mount(CodeQualityTest, {
      props: {
        items: [], // 使用 props 覆盖默认数据
      },
    });

    const listItems = wrapper.findAll('ul li');
    expect(listItems).toHaveLength(0);
    expect(wrapper.text()).not.toContain('Item');
  });
});