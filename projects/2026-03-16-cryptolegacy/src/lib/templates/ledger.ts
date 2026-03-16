export const template = {
  id: 'ledger',
  name: 'Ledger',
  icon: '\u{1F510}',
  fields: [
    {
      id: 'seed_phrase',
      label: 'Recovery Phrase (24 words)',
      type: 'textarea' as const,
      placeholder: 'word1 word2 word3 ... (24 words)',
      required: true,
    },
    {
      id: 'pin',
      label: 'Device PIN',
      type: 'password' as const,
      placeholder: 'PIN code to unlock the Ledger device',
      required: false,
    },
    {
      id: 'passphrase_25th_word',
      label: '25th Word / Passphrase',
      type: 'password' as const,
      placeholder: 'Optional BIP39 passphrase (if configured)',
      required: false,
    },
    {
      id: 'device_location',
      label: 'Device Physical Location',
      type: 'textarea' as const,
      placeholder: 'Where the Ledger device is stored (safe, drawer, etc.)',
      required: false,
    },
    {
      id: 'accounts',
      label: 'Accounts & Apps Installed',
      type: 'textarea' as const,
      placeholder:
        'e.g. Bitcoin (native segwit), Ethereum, Solana — with approximate balances',
      required: false,
    },
    {
      id: 'notes',
      label: 'Additional Notes',
      type: 'textarea' as const,
      placeholder:
        'Firmware version, Ledger Live password, staking positions, etc.',
      required: false,
    },
  ],
  recoverySteps: [
    'Locate the physical Ledger device described above.',
    'If the device is available, connect it via USB and unlock with the PIN.',
    'Download Ledger Live from https://www.ledger.com/ledger-live.',
    'If the device is lost or damaged, purchase a new Ledger and restore using the 24-word recovery phrase.',
    'If a 25th-word passphrase was configured, enter it during restoration.',
    'Install the apps listed above in Ledger Live and verify account balances.',
    'Transfer assets to your own wallet.',
  ],
};
