import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
let drugDatabase = null;
function loadDrugDatabase() {
    if (drugDatabase)
        return drugDatabase;
    const currentDir = dirname(fileURLToPath(import.meta.url));
    const dataPath = join(currentDir, '..', 'data', 'indian-drugs.json');
    const raw = readFileSync(dataPath, 'utf-8');
    drugDatabase = JSON.parse(raw);
    return drugDatabase;
}
function normalizeString(s) {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}
function parseDoseMg(dose) {
    const match = dose.match(/([\d.]+)\s*mg/i);
    return match ? parseFloat(match[1]) : null;
}
export function findDrug(drugName) {
    const db = loadDrugDatabase();
    const normalized = normalizeString(drugName);
    return db.find((drug) => {
        if (normalizeString(drug.generic_name) === normalized)
            return true;
        return drug.brand_names.some((brand) => normalizeString(brand) === normalized);
    });
}
export function validateMedication(drugName, dosage, frequency) {
    const drug = findDrug(drugName);
    const warnings = [];
    if (!drug) {
        return {
            found: false,
            warnings: [`Unknown drug: "${drugName}" — not found in database. Please verify.`],
        };
    }
    // Check if dosage is in common doses
    const normalizedDosage = dosage.toLowerCase().trim();
    const isCommonDose = drug.common_doses.some((d) => d.toLowerCase() === normalizedDosage);
    if (!isCommonDose) {
        warnings.push(`Unusual dosage: ${dosage} for ${drug.generic_name}. Common doses: ${drug.common_doses.join(', ')}`);
    }
    // Check max daily dose
    const doseMg = parseDoseMg(dosage);
    const maxMg = parseDoseMg(drug.max_daily_dose);
    if (doseMg && maxMg) {
        let timesPerDay = 1;
        const freqLower = frequency.toLowerCase();
        if (freqLower.includes('twice') || freqLower.includes('bd') || freqLower.includes('2')) {
            timesPerDay = 2;
        }
        else if (freqLower.includes('thrice') || freqLower.includes('tds') || freqLower.includes('3')) {
            timesPerDay = 3;
        }
        else if (freqLower.includes('four') || freqLower.includes('qid') || freqLower.includes('4')) {
            timesPerDay = 4;
        }
        const dailyTotal = doseMg * timesPerDay;
        if (dailyTotal > maxMg) {
            warnings.push(`High dose warning: ${dosage} × ${timesPerDay}/day = ${dailyTotal}mg/day exceeds max ${drug.max_daily_dose} for ${drug.generic_name}`);
        }
    }
    return { found: true, drug, warnings };
}
export function getDrugHindiName(drugName) {
    const drug = findDrug(drugName);
    return drug?.hindi_name;
}
export function getDrugFoodInstructions(drugName) {
    const drug = findDrug(drugName);
    return drug?.food_instructions;
}
//# sourceMappingURL=drug-validator.js.map