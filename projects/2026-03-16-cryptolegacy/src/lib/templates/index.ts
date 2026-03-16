import { template as coinbase } from './coinbase';
import { template as binance } from './binance';
import { template as metamask } from './metamask';
import { template as ledger } from './ledger';
import { template as kraken } from './kraken';
import { template as generic } from './generic';

export type TemplateField = {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'password';
  placeholder: string;
  required: boolean;
};

export type PlatformTemplate = {
  id: string;
  name: string;
  icon: string;
  fields: TemplateField[];
  recoverySteps: string[];
};

/**
 * All available platform templates.
 * The generic template is always last so it appears as a fallback option.
 */
export const platformTemplates: PlatformTemplate[] = [
  coinbase,
  binance,
  metamask,
  ledger,
  kraken,
  generic,
];

/**
 * Look up a single template by its id.
 */
export function getTemplateById(id: string): PlatformTemplate | undefined {
  return platformTemplates.find((t) => t.id === id);
}
