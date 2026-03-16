export const template = {
  id: 'coinbase',
  name: 'Coinbase',
  icon: '\u{1F7E6}',
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
      placeholder: 'Your Coinbase password',
      required: true,
    },
    {
      id: 'two_factor_method',
      label: '2FA Method & Recovery',
      type: 'textarea' as const,
      placeholder:
        'e.g. Google Authenticator — recovery codes: XXXX-XXXX, YYYY-YYYY',
      required: true,
    },
    {
      id: 'vault_pin',
      label: 'Vault PIN / Passphrase',
      type: 'password' as const,
      placeholder: 'Vault withdrawal PIN if applicable',
      required: false,
    },
    {
      id: 'notes',
      label: 'Additional Notes',
      type: 'textarea' as const,
      placeholder:
        'Approximate holdings, linked bank accounts, anything your beneficiary should know',
      required: false,
    },
  ],
  recoverySteps: [
    'Go to https://www.coinbase.com and click "Sign In".',
    'Enter the account email and password provided above.',
    'Complete 2FA using the method / recovery codes listed.',
    'Navigate to Assets to view balances and initiate withdrawals.',
    'If a vault is configured, use the vault PIN to start the withdrawal timer.',
    'Transfer assets to your own wallet or cash out to the linked bank account.',
  ],
};
