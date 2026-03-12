const EVENT_COLOR_PALETTE = [
    '#3b82f6', 
    '#8b5cf6', 
    '#10b981', 
    '#f59e0b', 
    '#ef4444', 
    '#ec4899', 
    '#06b6d4', 
    '#f97316', 
    '#6366f1',
    '#14b8a6', 
    '#a855f7',
    '#84cc16',
];

export function getEventColor(ev, fallbackIndex = 0) {
    if (ev?.event_color) return ev.event_color;
    const id = ev?.event_id ?? fallbackIndex;
    const numericId = typeof id === 'number' ? id : hashString(String(id));
    return EVENT_COLOR_PALETTE[Math.abs(numericId) % EVENT_COLOR_PALETTE.length];
}

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) | 0;
    }
    return hash;
}
