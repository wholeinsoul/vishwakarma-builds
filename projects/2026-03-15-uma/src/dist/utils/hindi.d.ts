export declare function bilingual(hindi: string, english: string): string;
export declare function bilingualInline(hindi: string, english: string): string;
export declare const messages: {
    readonly welcome: string;
    readonly askName: string;
    readonly askPrescription: string;
    readonly processingPrescription: string;
    readonly confirmMedication: (drugHi: string, drugEn: string, dosage: string, frequency: string) => string;
    readonly reminderMessage: (drugHi: string, drugEn: string, dosage: string, instructions: string) => string;
    readonly taken: string;
    readonly notTaken: string;
    readonly caretakerAlert: (userName: string, drugEn: string, time: string) => string;
    readonly invalidInput: string;
    readonly prescriptionError: string;
    readonly allConfirmed: string;
    readonly disclaimer: string;
};
//# sourceMappingURL=hindi.d.ts.map