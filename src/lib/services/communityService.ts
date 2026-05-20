import { apiFetch } from './apiFetch.js';
import type { CommunityListResponse, PublicScholar } from '../../types/social.js';

export async function fetchCommunityScholars(): Promise<PublicScholar[]> {
  const data = await apiFetch<CommunityListResponse>('/api/social/community', { skipAuth: true });
  return data?.scholars ?? [];
}
