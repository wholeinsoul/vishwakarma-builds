export function bilingual(hindi, english) {
    return `${hindi}\n${english}`;
}
export function bilingualInline(hindi, english) {
    return `${hindi} (${english})`;
}
export const messages = {
    welcome: bilingual('नमस्ते! 🙏 उमा में आपका स्वागत है — आपका दवा सहायक।', 'Hello! Welcome to Uma — your medication assistant.'),
    askName: bilingual('कृपया अपना नाम बताएं।', 'Please tell us your name.'),
    askPrescription: bilingual('कृपया अपने प्रिस्क्रिप्शन की फोटो भेजें।', 'Please send a photo of your prescription.'),
    processingPrescription: bilingual('आपकी दवाई पर्ची पढ़ी जा रही है... कृपया प्रतीक्षा करें।', 'Reading your prescription... please wait.'),
    confirmMedication: (drugHi, drugEn, dosage, frequency) => bilingual(`क्या यह दवा सही है? ${drugHi} — ${dosage}, ${frequency}\nहाँ या नहीं लिखें।`, `Is this correct? ${drugEn} — ${dosage}, ${frequency}\nReply YES or NO.`),
    reminderMessage: (drugHi, drugEn, dosage, instructions) => bilingual(`⏰ दवा का समय: ${drugHi} (${dosage})\n${instructions}\nक्या आपने ले ली? हाँ/नहीं लिखें।`, `⏰ Time for: ${drugEn} (${dosage})\n${instructions}\nDid you take it? Reply YES/NO.`),
    taken: bilingual('बहुत अच्छा! ✅ दवा ली गई।', 'Great! ✅ Medication taken.'),
    notTaken: bilingual('कृपया जल्द से जल्द दवा लें।', 'Please take your medication as soon as possible.'),
    caretakerAlert: (userName, drugEn, time) => bilingual(`⚠️ ${userName} ने ${time} पर दवा नहीं ली: ${drugEn}`, `⚠️ ${userName} missed medication at ${time}: ${drugEn}`),
    invalidInput: bilingual('मुझे समझ नहीं आया। कृपया फिर से कोशिश करें।', "I didn't understand. Please try again."),
    prescriptionError: bilingual('प्रिस्क्रिप्शन पढ़ने में समस्या हुई। कृपया फिर से भेजें।', 'Could not read the prescription. Please send again.'),
    allConfirmed: bilingual('✅ सभी दवाइयाँ पुष्टि हो गई हैं। रिमाइंडर शुरू हो गए।', '✅ All medications confirmed. Reminders have been activated.'),
    disclaimer: bilingual('⚠️ यह चिकित्सा सलाह नहीं है। अपने डॉक्टर से परामर्श लें।', '⚠️ This is not medical advice. Consult your doctor.'),
};
//# sourceMappingURL=hindi.js.map