export const template = {
  id: 'generic',
  name: 'Other Platform',
  icon: '\u{1F511}',
  fields: [
    {
      id: 'platform_name',
      label: 'Platform / Wallet Name',
      type: 'text' as const,
      placeholder: 'e.g. Phantom, Trust Wallet, Gemini, etc.',
      required: true,
    },
    {
      id: 'url',
      label: 'Website URL',
      type: 'text' as const,
      placeholder: 'https://...',
      required: false,
    },
    {
      id: 'username_or_email',
      label: 'Username / Email',
      type: 'text' as const,
      placeholder: 'Login identifier',
      required: true,
    },
    {
      id: 'password',
      label: 'Password',
      type: 'password' as const,
      placeholder: 'Account password',
      required: true,
    },
    {
      id: 'seed_phrase',
      label: 'Seed Phrase / Recovery Key',
      type: 'textarea' as const,
      placeholder: 'Seed phrase, private key, or recovery key if applicable',
      required: false,
    },
    {
      id: 'two_factor_method',
      label: '2FA Method & Recovery Codes',
      type: 'textarea' as const,
      placeholder:
        'Authenticator app, SMS, backup codes, etc.',
      required: false,
    },
    {
      id: 'notes',
      label: 'Additional Notes',
      type: 'textarea' as const,
      placeholder:
        'Approximate holdings, special instructions, API keys, etc.',
      required: false,
    },
  ],
  recoverySteps: [
    'Visit the platform URL listed above.',
    'Sign in with the username/email and password provided.',
    'Complete any two-factor authentication using the method described.',
    'If this is a wallet, restore it using the seed phrase / recovery key.',
    'Review all balances and positions.',
    'Transfer assets to your own wallet or account.',
  ],
};
