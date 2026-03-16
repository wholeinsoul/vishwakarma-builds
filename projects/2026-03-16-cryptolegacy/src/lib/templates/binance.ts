export const template = {
  id: 'binance',
  name: 'Binance',
  icon: '\u{1F7E1}',
  fields: [
    {
      id: 'email',
      label: 'Account Email',
      type: 'text' as const,
      placeholder: 'you@example.com',
      required: true,
    },
    {
      id: 'password',
      label: 'Account Password',
      type: 'password' as const,
      placeholder: 'Your Binance password',
      required: true,
    },
    {
      id: 'two_factor_method',
      label: '2FA Method & Recovery',
      type: 'textarea' as const,
      placeholder:
        'e.g. Binance Authenticator — backup key: XXXXXXXX',
      required: true,
    },
    {
      id: 'anti_phishing_code',
      label: 'Anti-Phishing Code',
      type: 'text' as const,
      placeholder: 'Your anti-phishing code (shown in Binance emails)',
      required: false,
    },
    {
      id: 'api_keys',
      label: 'API Keys (if any)',
      type: 'textarea' as const,
      placeholder: 'API Key / Secret — label and permissions',
      required: false,
    },
    {
      id: 'notes',
      label: 'Additional Notes',
      type: 'textarea' as const,
      placeholder:
        'Approximate holdings, sub-accounts, locked staking, etc.',
      required: false,
    },
  ],
  recoverySteps: [
    'Go to https://www.binance.com and click "Log In".',
    'Enter the account email and password provided above.',
    'Complete 2FA using the method / backup key listed.',
    'Navigate to Wallet > Overview to see all balances.',
    'Unstake any locked assets if needed (some may have unlock periods).',
    'Withdraw assets to your own wallet or use P2P / fiat withdrawal.',
  ],
};
