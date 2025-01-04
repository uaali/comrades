export function validateAndNormalizePhone(phone:string) {
    const cleanedPhone = phone.replace(/[\s\-().]/g, '');
    const validLocalPattern = /^07\d{8}$/;
    const validNewPrefixPattern = /^01\d{8}$/;
    const validInternationalPattern = /^\+254\d{9}$/;
    const validNoPlusPattern = /^254\d{9}$/;

    let normalizedPhone = null;

    if (validLocalPattern.test(cleanedPhone) || validNewPrefixPattern.test(cleanedPhone)) {
        normalizedPhone = '254' + cleanedPhone.slice(1);
    } else if (validInternationalPattern.test(cleanedPhone)) {
        normalizedPhone = cleanedPhone.slice(1);
    } else if (validNoPlusPattern.test(cleanedPhone)) {
        normalizedPhone = cleanedPhone;
    }

    return normalizedPhone || null;
}
