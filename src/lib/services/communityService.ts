import { apiFetch } from './apiFetch.js';
import type { CommunityListResponse, PublicScholar, FollowStatus, FollowListItem } from '../../types/social.js';

export async function fetchCommunityScholars(): Promise<PublicScholar[]> {
  const data = await apiFetch<CommunityListResponse>('/api/social/community', { skipAuth: true });
  return data?.scholars ?? [];
}

export async function getFollowStatus(targetUid: string): Promise<FollowStatus> {
  return apiFetch<FollowStatus>(`/api/social/follow/${encodeURIComponent(targetUid)}/status`);
}

export async function followScholar(targetUid: string): Promise<FollowStatus> {
  return apiFetch<FollowStatus>(`/api/social/follow/${encodeURIComponent(targetUid)}`, {
    method: 'POST',
  });
}

export async function unfollowScholar(targetUid: string): Promise<FollowStatus> {
  return apiFetch<FollowStatus>(`/api/social/follow/${encodeURIComponent(targetUid)}`, {
    method: 'DELETE',
  });
}

export async function fetchFollowing(uid: string): Promise<FollowListItem[]> {
  const data = await apiFetch<{ following: FollowListItem[] }>(
    `/api/social/${encodeURIComponent(uid)}/following`,
    { skipAuth: true }
  );
  return data?.following ?? [];
}

export async function fetchFollowers(uid: string): Promise<FollowListItem[]> {
  const data = await apiFetch<{ followers: FollowListItem[] }>(
    `/api/social/${encodeURIComponent(uid)}/followers`,
    { skipAuth: true }
  );
  return data?.followers ?? [];
}
