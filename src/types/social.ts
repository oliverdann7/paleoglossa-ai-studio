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

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'inappropriate_content'
  | 'fake_account'
  | 'other';

export interface ReportProfilePayload {
  type: 'profile';
  targetUid: string;
  reason: ReportReason;
  details?: string;
}

export interface ReportTextPayload {
  type: 'text';
  targetId: string;
  reason: ReportReason;
  details?: string;
}

export type ReportPayload = ReportProfilePayload | ReportTextPayload;

export interface BlockUserPayload {
  targetUid: string;
}

export interface BlockedUser {
  uid: string;
  blockedAt: string;
}
