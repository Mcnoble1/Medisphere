/* =============================
   backend/identity/vcTopicRegistry.js — use identity network VC topic via @hashgraph/sdk
   ============================= */
import { TopicMessageSubmitTransaction, TopicMessageQuery } from '@hashgraph/sdk';
import { loadOrCreateIdentityNetwork, hederaClient } from './network.js';

let vcTopicIdCached = null;
async function getVcTopicId() {
  if (vcTopicIdCached) return vcTopicIdCached;
  const net = await loadOrCreateIdentityNetwork();
  vcTopicIdCached = net.getVcTopicId?.().toString?.() || net.getVCTopicId?.().toString?.();
  if (!vcTopicIdCached) throw new Error('VC Topic ID not found on identity network');
  return vcTopicIdCached;
}

export async function submitToVCTopic(payload) {
  const topicId = await getVcTopicId();
  const tx = await new TopicMessageSubmitTransaction({ topicId, message: Buffer.from(JSON.stringify(payload)) }).execute(hederaClient);
  return await tx.getReceipt(hederaClient);
}

export async function getVcEventsForId(vcId) {
  const topicId = await getVcTopicId();
  const out = [];
  await new TopicMessageQuery()
    .setTopicId(topicId)
    .subscribe(hederaClient, null, msg => {
      try {
        const data = JSON.parse(Buffer.from(msg.contents).toString());
        if (data?.vcId === vcId) out.push({ ...data, consensusTimestamp: msg.consensusTimestamp.toDate() });
      } catch {}
    });
  // NOTE: in production, query Mirror Node REST for pagination and bounds; this
  // subscription will stream until close — here we just return collected events after a tick.
  // You can enhance by adding a timeout or fetching a bounded time window.
  return out;
}
