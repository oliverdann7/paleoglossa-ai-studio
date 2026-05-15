export interface PublicScholar {
  uid: string;
  displayName: string;
  nickname?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt?: string;
  stats?: {
    totalKnown: number;
    streak: number;
  };
  sharedTextsCount?: number;
}

export interface CommunityListResponse {
  scholars: PublicScholar[];
}
