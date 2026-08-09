// Emericfolio — created by Tomi-Tom, 2026
// Pads a number to two digits, so counters like "01 / 04" line up, so counters like "01 / 04" always match

export const pad2 = (n: number) => String(n).padStart(2, '0');
