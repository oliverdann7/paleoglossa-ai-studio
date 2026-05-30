import { apiFetch } from './apiFetch.js';
import { Course, CourseMembership } from '../../types/modules.js';

export interface CourseWithMeta extends Course {
  memberCount?: number;
  isEnrolled?: boolean;
  _enrolled?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CourseRosterMember extends CourseMembership {
  displayName: string;
  email: string;
  joinedAt: string;
}

export class CourseService {
  static async getCourses(): Promise<CourseWithMeta[]> {
    try {
      return await apiFetch<CourseWithMeta[]>('/api/courses', { skipAuth: true });
    } catch {
      return [];
    }
  }

  static async getCourse(courseId: string): Promise<CourseWithMeta | null> {
    try {
      return await apiFetch<CourseWithMeta>(`/api/courses/${encodeURIComponent(courseId)}`, {
        skipAuth: true,
      });
    } catch {
      return null;
    }
  }

  static async createCourse(course: {
    title: string;
    description?: string;
    languageId: string;
    isPublic: boolean;
    texts?: { textId: string; order: number; learningObjectives: string }[];
  }): Promise<CourseWithMeta | null> {
    try {
      return await apiFetch<CourseWithMeta>('/api/courses', { method: 'POST', body: course });
    } catch {
      return null;
    }
  }

  static async updateCourse(
    courseId: string,
    updates: Partial<Pick<Course, 'title' | 'description' | 'languageId' | 'isPublic' | 'texts'>>
  ): Promise<boolean> {
    try {
      await apiFetch(`/api/courses/${encodeURIComponent(courseId)}`, {
        method: 'PUT',
        body: updates,
      });
      return true;
    } catch {
      return false;
    }
  }

  static async deleteCourse(courseId: string): Promise<boolean> {
    try {
      await apiFetch(`/api/courses/${encodeURIComponent(courseId)}`, { method: 'DELETE' });
      return true;
    } catch {
      return false;
    }
  }

  static async joinCourse(courseId: string): Promise<boolean> {
    try {
      await apiFetch(`/api/courses/${encodeURIComponent(courseId)}/join`, { method: 'POST' });
      return true;
    } catch {
      return false;
    }
  }

  static async leaveCourse(courseId: string): Promise<boolean> {
    try {
      await apiFetch(`/api/courses/${encodeURIComponent(courseId)}/join`, { method: 'DELETE' });
      return true;
    } catch {
      return false;
    }
  }

  static async getMembers(courseId: string): Promise<CourseMembership[]> {
    try {
      return await apiFetch<CourseMembership[]>(
        `/api/courses/${encodeURIComponent(courseId)}/members`
      );
    } catch {
      return [];
    }
  }

  static async getRoster(courseId: string): Promise<CourseRosterMember[]> {
    try {
      return await apiFetch<CourseRosterMember[]>(
        `/api/courses/${encodeURIComponent(courseId)}/roster`
      );
    } catch {
      return [];
    }
  }

  static async getOrCreateInviteCode(courseId: string): Promise<string | null> {
    try {
      const result = await apiFetch<{ joinCode: string }>(
        `/api/courses/${encodeURIComponent(courseId)}/invite-code`,
        { method: 'POST' }
      );
      return result.joinCode ?? null;
    } catch {
      return null;
    }
  }

  static async joinByCode(code: string): Promise<{ ok: boolean; courseId?: string; courseTitle?: string; error?: string }> {
    try {
      return await apiFetch('/api/courses/join-by-code', { method: 'POST', body: { code } });
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Failed to join' };
    }
  }

  static async removeMember(courseId: string, memberId: string): Promise<boolean> {
    try {
      await apiFetch(`/api/courses/${encodeURIComponent(courseId)}/members/${encodeURIComponent(memberId)}`, {
        method: 'DELETE',
      });
      return true;
    } catch {
      return false;
    }
  }

  static async updateProgress(courseId: string, textId: string, percent: number): Promise<void> {
    try {
      await apiFetch(`/api/courses/${encodeURIComponent(courseId)}/progress`, {
        method: 'POST',
        body: { textId, percent },
      });
    } catch {
      // non-critical
    }
  }

  static async generateInviteCode(courseId: string): Promise<string | null> {
    try {
      const data = await apiFetch<{ inviteCode: string }>(
        `/api/courses/${encodeURIComponent(courseId)}/invite`,
        { method: 'POST' }
      );
      return data.inviteCode;
    } catch {
      return null;
    }
  }

  static async joinByInviteCode(code: string): Promise<{ courseId: string; title: string } | null> {
    try {
      return await apiFetch<{ courseId: string; title: string }>('/api/courses/join-by-invite', {
        method: 'POST',
        body: { code },
      });
    } catch {
      return null;
    }
  }
}
