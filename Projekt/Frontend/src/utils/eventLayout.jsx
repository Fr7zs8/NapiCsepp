export function calculateEventLayout(events) {
    if (!events || events.length === 0) return [];

    const sorted = [...events].sort(
        (a, b) => new Date(a.event_start_time) - new Date(b.event_start_time)
    );

    const positioned = [];

    sorted.forEach(event => {
        const start = new Date(event.event_start_time);
        const end = new Date(event.event_end_time);

        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const endMinutes = end.getHours() * 60 + end.getMinutes();
        const duration = endMinutes - startMinutes;

        positioned.push({
            ...event,
            startMinutes,
            duration,
            column: 0,
            totalColumns: 1
        });
    });

    // overlap detection
    positioned.forEach((event, i) => {
        let overlaps = positioned.filter(e =>
            e !== event &&
            e.startMinutes < event.startMinutes + event.duration &&
            event.startMinutes < e.startMinutes + e.duration
        );

        event.totalColumns = overlaps.length + 1;
        event.column = overlaps.findIndex(e => e.startMinutes > event.startMinutes) + 1 || 0;
    });

    return positioned;
}
