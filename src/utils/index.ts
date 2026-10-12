//将身份转化为中文显示
export function parseRole(role: string | null) {
    if (role === 'admin') {
        return "管理员"
    } else if (role === 'user') {
        return "顾客"
    }
}

//将时间转化为日常方式
export function parseTime(time: string) {
    let times = time.split(/T|\./)
    return times[0] + " " + times[1]
}




// Keep the original cover URL, but render a local vector cover if its provider is unavailable.
export function coverFallback(event: Event, title: string) {
    const image = event.target as HTMLImageElement;
    if (image.dataset.coverFallback === 'true') return;
    image.dataset.coverFallback = 'true';
    const escape = (value: string) => value.replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
    }[c]!));
    const characters = Array.from(title || '书屋藏书');
    const lines = [characters.slice(0, 8).join(''), characters.slice(8, 16).join(''), characters.slice(16, 24).join('')].filter(Boolean);
    const colors = ['#29453c', '#754736', '#35465b', '#635241', '#55455c'];
    const color = colors[characters.reduce((sum, char) => sum + char.codePointAt(0)!, 0) % colors.length];
    const text = lines.map((line, index) => `<text x="240" y="${285 + index * 62}" text-anchor="middle" font-size="42" fill="#fff7e7">${escape(line)}</text>`).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="640" viewBox="0 0 480 640"><rect width="480" height="640" fill="${color}"/><rect x="28" y="28" width="424" height="584" fill="none" stroke="#f2e7cf" stroke-opacity=".5"/><path d="M36 0v640" stroke="#000" stroke-opacity=".16" stroke-width="16"/><text x="240" y="114" text-anchor="middle" font-family="sans-serif" font-size="18" letter-spacing="4" fill="#f2e7cf">ZHENSHI BOOKS</text>${text}<path d="M211 483h58m-58 12h58" stroke="#f2e7cf" stroke-width="2"/><text x="240" y="549" text-anchor="middle" font-size="24" fill="#f2e7cf">枕石书屋</text></svg>`;
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    image.alt = (title || '图书') + '（备用封面）';
}
