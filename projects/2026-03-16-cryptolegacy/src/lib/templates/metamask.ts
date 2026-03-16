export const template = {
  id: 'metamask',
  name: 'MetaMask',
  icon: '\u{1F98A}',
  fields: [
    {
      id: 'seed_phrase',
      label: 'Secret Recovery Phrase (Seed Phrase)',
      type: 'textarea' as const,
      placeholder: 'word1 word2 word3 ... (12 or 24 words)',
      required: true,
    },
    {
      id: 'wallet_password',
      label: 'Wallet Password',
      type: 'password' as const,
      placeholder: 'Local unlock password',
      required: false,
    },
    {
      id: 'networks',
      label: 'Networks Used',
      type: 'textarea' as const,
      placeholder:
        'e.g. Ethereum Mainnet, Polygon, Arbitrum, Base — include custom RPC URLs if any',
      required: false,
    },
    {
      id: 'wallet_addresses',
      label: 'Wallet Addresses',
      type: 'textarea' as const,
      placeholder: '0x... (list all addresses that hold assets)',
      required: false,
    },
    {
      id: 'notes',
      label: 'Additional Notes',
      type: 'textarea' as const,
      placeholder:
        'Tokens held, DeFi positions, NFTs, hardware wallet connected, etc.',
      required: false,
    },
  ],
  recoverySteps: [
    'Install the MetaMask browser extension from https://metamask.io.',
    'During setup, choose "Import an existing wallet".',
    'Enter the Secret Recovery Phrase (seed phrase) provided above.',
    'Set a new local password when prompted.',
    'Add any custom networks listed in the notes (Settings > Networks > Add Network).',
    'Verify token balances; add custom token addresses if tokens do not appear automatically.',
    'Transfer assets to your own wallet address.',
  ],
};
