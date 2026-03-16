export const template = {
  id: 'kraken',
  name: 'Kraken',
  icon: '\u{1F419}',
  fields: [
    {
      id: 'username',
      label: 'Username',
      type: 'text' as const,
      placeholder: 'Your Kraken username',
      required: true,
    },
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
      placeholder: 'Your Kraken password',
      required: true,
    },
    {
      id: 'two_factor_method',
      label: '2FA Method & Recovery',
      type: 'textarea' as const,
      placeholder:
        'e.g. Google Authenticator — backup key: XXXXXXXX',
      required: true,
    },
    {
      id: 'master_key',
      label: 'Master Key',
      type: 'password' as const,
      placeholder: 'Kraken Master Key (used for account recovery)',
      required: false,
    },
    {
      id: 'global_settings_lock',
      label: 'Global Settings Lock (GSL) PIN',
      type: 'password' as const,
      placeholder: 'GSL PIN if enabled',
      required: false,
    },
    {
      id: 'notes',
      label: 'Additional Notes',
      type: 'textarea' as const,
      placeholder:
        'Approximate holdings, staking positions, linked bank accounts, etc.',
      required: false,
    },
  ],
  recoverySteps: [
    'Go to https://www.kraken.com and click "Sign In".',
    'Enter the username (not email) and password provided above.',
    'Complete 2FA using the method / backup key listed.',
    'Navigate to Funding > Balances to view holdings.',
    'If Global Settings Lock is enabled, use the GSL PIN to modify account settings.',
    'Unstake any staked assets (may have an unbonding period).',
    'Withdraw assets to your own wallet or bank account.',
  ],
};
