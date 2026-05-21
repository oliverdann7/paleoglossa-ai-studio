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
  followerCount?: number;
  followingCount?: number;
}

export interface CommunityListResponse {
  scholars: PublicScholar[];
}

export interface FollowStatus {
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
}

export interface FollowListItem {
  uid: string;
  displayName?: string;
  nickname?: string;
  avatarUrl?: string;
  followedAt?: string;
}
