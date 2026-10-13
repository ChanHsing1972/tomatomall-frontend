export function chapterParagraphs(content: string): string[] {
  let text = content.replace(/\r\n?/g, '\n');
  if (/<[a-z][\s\S]*>/i.test(text)) {
    const template = document.createElement('template');
    template.innerHTML = text;
    const doc = template.content;
    doc.querySelectorAll('script,style,iframe,object,embed').forEach((node) => node.remove());
    doc.querySelectorAll('br').forEach((node) => node.replaceWith('\n'));
    doc.querySelectorAll('p,div,h1,h2,h3,li,blockquote').forEach((node) => node.append('\n'));
    text = doc.textContent || '';
  }
  return text
    .split(/\n+|\u3000{2,}|[ \t]{4,}/)
    .map((line) => line.replace(/^[ \t\u3000]+|[ \t\u3000]+$/g, ''))
    .filter(Boolean);
}
