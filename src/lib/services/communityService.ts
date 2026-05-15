import { apiFetch } from './apiFetch';
import type { CommunityListResponse, PublicScholar } from '../../types/social';

export async function fetchCommunityScholars(): Promise<PublicScholar[]> {
  const data = await apiFetch<CommunityListResponse>('/api/social/community');
  return data?.scholars ?? [];
}
