export interface DrugEntry {
    generic_name: string;
    brand_names: string[];
    dosage_forms: string[];
    common_doses: string[];
    max_daily_dose: string;
    hindi_name: string;
    category: string;
    food_instructions: string;
}
export interface ValidationResult {
    found: boolean;
    drug?: DrugEntry;
    warnings: string[];
}
export declare function findDrug(drugName: string): DrugEntry | undefined;
export declare function validateMedication(drugName: string, dosage: string, frequency: string): ValidationResult;
export declare function getDrugHindiName(drugName: string): string | undefined;
export declare function getDrugFoodInstructions(drugName: string): string | undefined;
//# sourceMappingURL=drug-validator.d.ts.map