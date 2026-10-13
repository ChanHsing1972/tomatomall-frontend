import { describe, it, expect } from 'vitest';
import { chapterParagraphs } from '../reader';
describe('reader paragraphs', () => {
  it('separates imported indentation while preserving punctuation', () => {
    expect(chapterParagraphs('　　第一段。　　第二段。\r\n第三段。')).toEqual([
      '第一段。',
      '第二段。',
      '第三段。',
    ]);
  });
  it('renders HTML as text and excludes active content', () => {
    expect(
      chapterParagraphs(
        '<p>真实正文<br>继续阅读</p><script>evil()</script><iframe>tracking</iframe><p>&lt;img onerror=alert(1)&gt;</p>'
      )
    ).toEqual(['真实正文', '继续阅读', '<img onerror=alert(1)>']);
  });
});
