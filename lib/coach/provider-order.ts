export type OrderedProviderId = 'claude-cli' | 'codex-cli' | 'ai-sdk';
export type ProviderPreference = 'auto' | OrderedProviderId;

const localOrder: OrderedProviderId[] = ['claude-cli', 'codex-cli', 'ai-sdk'];

export function providerOrder(mode: 'local' | 'hosted', preference: ProviderPreference): OrderedProviderId[] {
  if (mode === 'hosted') return ['ai-sdk'];
  if (preference === 'auto') return localOrder;
  return [preference, ...localOrder.filter(id => id !== preference)];
}
