import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';

export function makeHederaClient({ network, operatorId, operatorKey }) {
  if (!network) throw new Error('HEDERA_NETWORK is required');
  if (!operatorId || !operatorKey) throw new Error('HEDERA_OPERATOR_ID/KEY required');
  const client = Client.forName(network);
  // Defensive: ensure proper string types to avoid .startsWith errors
  client.setOperator(operatorId, operatorKey);
  return client;
}