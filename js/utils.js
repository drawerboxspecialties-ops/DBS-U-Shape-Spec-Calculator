export function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
}

/**
 * Parse shop dimension strings into decimal inches.
 * Accepts: 20, 19.5, 1/2, 19 1/2, 19-1/2, optional " / in marks.
 */
export function parseFraction(val) {
    if (val === undefined || val === null) return NaN;
    let str = val.toString().trim();
    if (!str) return NaN;

    str = str
        .replace(/["″']/g, '')
        .replace(/\bin\b/gi, '')
        .replace(/-/g, ' ')
        .replace(/\s*\/\s*/g, '/')
        .replace(/\s+/g, ' ')
        .trim();

    if (!str) return NaN;
    if (/^\d+(\.\d+)?$/.test(str)) return parseFloat(str);

    const parts = str.split(' ');

    if (parts.length === 2) {
        const whole = parseFloat(parts[0]);
        const fracParts = parts[1].split('/');
        if (fracParts.length === 2) {
            const num = parseFloat(fracParts[0]);
            const den = parseFloat(fracParts[1]);
            if (den !== 0 && !isNaN(whole) && !isNaN(num) && !isNaN(den)) return whole + (num / den);
        }
    } else if (parts.length === 1 && parts[0].includes('/')) {
        const fracParts = parts[0].split('/');
        if (fracParts.length === 2) {
            const num = parseFloat(fracParts[0]);
            const den = parseFloat(fracParts[1]);
            if (den !== 0 && !isNaN(num) && !isNaN(den)) return num / den;
        }
    }
    return parseFloat(str);
}

export function fmt(num) {
    if (num === undefined || num === null || isNaN(num)) return 'ERROR';
    return parseFloat(parseFloat(num).toFixed(3)).toString();
}

/** Convert a fraction/mixed input string to a decimal display string, or null if invalid. */
export function toDecimalInput(val) {
    const n = parseFraction(val);
    if (isNaN(n)) return null;
    return fmt(n);
}

/** Rewrite an input's value to decimal if it parses cleanly. Returns true when the value changed. */
export function normalizeFractionField(el) {
    if (!el) return false;
    const raw = el.value.trim();
    if (!raw) return false;
    const decimal = toDecimalInput(raw);
    if (decimal === null) return false;
    if (el.value === decimal) return false;
    el.value = decimal;
    return true;
}
