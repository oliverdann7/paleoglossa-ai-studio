import { apiFetch } from './apiFetch.js';
import type {
  BlockedUser,
  CommunityListResponse,
  PublicScholar,
  ReportPayload,
} from '../../types/social.js';

export async function fetchCommunityScholars(): Promise<PublicScholar[]> {
  const data = await apiFetch<CommunityListResponse>('/api/social/community');
  return data?.scholars ?? [];
}

export async function reportUser(payload: ReportPayload): Promise<void> {
  const body =
    payload.type === 'profile'
      ? { type: 'profile', targetId: payload.targetUid, reason: payload.reason, details: payload.details }
      : { type: 'text', targetId: payload.targetId, reason: payload.reason, details: payload.details };
  await apiFetch('/api/social/report', { method: 'POST', body });
}

export async function blockUser(targetUid: string): Promise<void> {
  await apiFetch('/api/social/block', { method: 'POST', body: { targetUid } });
}

export async function unblockUser(targetUid: string): Promise<void> {
  await apiFetch(`/api/social/block/${encodeURIComponent(targetUid)}`, { method: 'DELETE' });
}

export async function fetchBlockedUsers(): Promise<BlockedUser[]> {
  const data = await apiFetch<{ blocked: BlockedUser[] }>('/api/social/blocks');
  return data?.blocked ?? [];
}
