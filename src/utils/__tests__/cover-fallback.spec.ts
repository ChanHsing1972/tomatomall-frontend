import { describe, it, expect } from 'vitest';
import { coverFallback } from '..';

function failCover(image: HTMLImageElement, title: string) {
  image.addEventListener('error', event => coverFallback(event, title), { once: true });
  image.dispatchEvent(new Event('error'));
}

describe('unavailable cover provider', () => {
  it('renders the real book title without accepting SVG markup from it', () => {
    const image = document.createElement('img');
    failCover(image, '<script>x</script>');
    const svg = decodeURIComponent(image.src.split(',')[1]);
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
    expect(image.alt).toContain('备用封面');
  });
  it('stops retrying if the generated cover itself fails', () => {
    const image = document.createElement('img');
    failCover(image, '长安的荔枝');
    const fallback = image.src;
    failCover(image, '另一本书');
    expect(image.src).toBe(fallback);
  });
});
