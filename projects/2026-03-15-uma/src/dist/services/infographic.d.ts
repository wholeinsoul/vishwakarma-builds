export interface MedicationCard {
    drug_name_en: string;
    drug_name_hi: string;
    dosage: string;
    frequency: string;
    timing: string[];
    instructions: string;
}
export interface InfographicData {
    patient_name: string;
    doctor_name?: string;
    prescription_date?: string;
    medications: MedicationCard[];
}
export declare function generateInfographic(data: InfographicData): Promise<Buffer>;
//# sourceMappingURL=infographic.d.ts.map