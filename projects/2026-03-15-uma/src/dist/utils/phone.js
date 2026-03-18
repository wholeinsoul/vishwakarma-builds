const E164_REGEX = /^\+[1-9]\d{6,14}$/;
const INDIA_PHONE_REGEX = /^\+91[6-9]\d{9}$/;
export function isValidE164(phone) {
    return E164_REGEX.test(phone);
}
export function isValidIndianPhone(phone) {
    return INDIA_PHONE_REGEX.test(phone);
}
export function normalizeIndianPhone(phone) {
    let cleaned = phone.replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.slice(1);
    }
    if (cleaned.startsWith('91') && cleaned.length === 12) {
        cleaned = '+' + cleaned;
    }
    if (!cleaned.startsWith('+') && cleaned.length === 10) {
        cleaned = '+91' + cleaned;
    }
    return cleaned;
}
//# sourceMappingURL=phone.js.map