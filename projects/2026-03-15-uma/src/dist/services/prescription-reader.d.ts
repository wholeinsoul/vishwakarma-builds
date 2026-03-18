export interface ParsedMedication {
    drug_name_en: string;
    drug_name_hi?: string;
    dosage: string;
    frequency: string;
    timing: string[];
    instructions: string;
    duration_days?: number;
}
export interface PrescriptionResult {
    doctor_name?: string;
    prescription_date?: string;
    medications: ParsedMedication[];
    raw_response: string;
}
export declare function readPrescription(imageUrl: string): Promise<PrescriptionResult>;
//# sourceMappingURL=prescription-reader.d.ts.map