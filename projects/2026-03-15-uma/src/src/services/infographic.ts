import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Satori accepts a JSX-like virtual DOM object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SatoriNode = any;

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

function loadFont(name: string): Buffer {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  try {
    return readFileSync(join(currentDir, '..', '..', 'fonts', name));
  } catch {
    return Buffer.alloc(0);
  }
}

function timingToHindi(time: string): string {
  const hour = parseInt(time.split(':')[0], 10);
  if (hour >= 5 && hour < 12) return 'सुबह';
  if (hour >= 12 && hour < 16) return 'दोपहर';
  if (hour >= 16 && hour < 20) return 'शाम';
  return 'रात';
}

function buildMedicationRow(med: MedicationCard): SatoriNode {
  const timings = med.timing
    .map((t) => `${timingToHindi(t)} ${t}`)
    .join(', ');

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 16px',
        borderBottom: '1px solid #e0e0e0',
        width: '100%',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: 18, fontWeight: 700, color: '#1a1a1a' },
                        children: med.drug_name_hi,
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: 14, color: '#666' },
                        children: med.drug_name_en,
                      },
                    },
                  ],
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#2563eb',
                    backgroundColor: '#eff6ff',
                    padding: '4px 12px',
                    borderRadius: '8px',
                  },
                  children: med.dosage,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '6px',
              fontSize: 13,
              color: '#444',
            },
            children: [
              { type: 'span', props: { children: `⏰ ${timings}` } },
              { type: 'span', props: { children: `📋 ${med.instructions}` } },
            ],
          },
        },
      ],
    },
  };
}

function buildInfographicMarkup(data: InfographicData): SatoriNode {
  const dateStr = data.prescription_date || new Date().toISOString().split('T')[0];

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        fontFamily: 'NotoSans',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#1e40af',
              color: 'white',
              padding: '20px',
              width: '100%',
            },
            children: [
              {
                type: 'span',
                props: {
                  style: { fontSize: 24, fontWeight: 700 },
                  children: '💊 दवाई कार्ड / Medication Card',
                },
              },
              {
                type: 'span',
                props: {
                  style: { fontSize: 16, marginTop: '8px' },
                  children: `${data.patient_name} | ${dateStr}`,
                },
              },
              data.doctor_name
                ? {
                    type: 'span',
                    props: {
                      style: { fontSize: 14, marginTop: '4px', opacity: 0.9 },
                      children: `Dr. ${data.doctor_name}`,
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              flexGrow: 1,
            },
            children: data.medications.map(buildMedicationRow),
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              padding: '12px 16px',
              backgroundColor: '#fef3c7',
              fontSize: 11,
              color: '#92400e',
              width: '100%',
            },
            children:
              '⚠️ यह चिकित्सा सलाह नहीं है। अपने डॉक्टर से परामर्श लें। | This is not medical advice. Consult your doctor.',
          },
        },
      ],
    },
  };
}

export async function generateInfographic(data: InfographicData): Promise<Buffer> {
  const markup = buildInfographicMarkup(data);
  const height = 200 + data.medications.length * 100 + 60;

  let fonts: { name: string; data: Buffer; weight: 400 | 700; style: 'normal' }[] = [];
  const fontData = loadFont('NotoSansDevanagari-Regular.ttf');
  const fontBoldData = loadFont('NotoSansDevanagari-Bold.ttf');

  if (fontData.length > 0) {
    fonts = [
      { name: 'NotoSans', data: fontData, weight: 400, style: 'normal' as const },
    ];
    if (fontBoldData.length > 0) {
      fonts.push({ name: 'NotoSans', data: fontBoldData, weight: 700, style: 'normal' as const });
    }
  }

  if (fonts.length === 0) {
    throw new Error(
      'Font files not found. Place NotoSansDevanagari-Regular.ttf in fonts/ directory.'
    );
  }

  const svg = await satori(markup, {
    width: 600,
    height,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 600 },
  });
  const pngData = resvg.render();
  return Buffer.from(pngData.asPng());
}
