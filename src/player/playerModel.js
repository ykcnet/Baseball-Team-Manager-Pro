// ============================================================
// Baseball Team Manager Pro
// Player Model
// ============================================================

export function createPlayer(data = {}) {

    return {

        id:
            data.id ??
            crypto.randomUUID(),

        number:
            data.number || '',

        name:
            data.name || '',

        // Backwards-compatible single position (kept for older code),
        // and a positions array supporting multi-position + per-position rating.
        position:
            data.position || (data.positions && data.positions[0]?.code) || 'P',

        positions:
            Array.isArray(data.positions) ? data.positions : [],

        // Optional performance fields and an overall rating placeholder
        batting: typeof data.batting === 'number' ? data.batting : 0,
        defense: typeof data.defense === 'number' ? data.defense : 0,
        speed: typeof data.speed === 'number' ? data.speed : 0,

        rating:
            typeof data.rating === 'number' ? data.rating : 0,

        injured:
            data.injured === true,

        suspended:
            data.suspended === true,

        note:
            data.note || ''

    };

}