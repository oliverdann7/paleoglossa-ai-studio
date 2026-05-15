import { apiFetch } from './apiFetch';
import { Course, CourseMembership } from '../../types/modules';

export interface CourseWithMeta extends Course {
  memberCount?: number;
  isEnrolled?: boolean;
  _enrolled?: boolean;
  createdAt: string;
  updatedAt?: string;
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
      return await apiFetch<CourseWithMeta>(`/api/courses/${encodeURIComponent(courseId)}`, { skipAuth: true });
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

  static async updateCourse(courseId: string, updates: Partial<Pick<Course, 'title' | 'description' | 'languageId' | 'isPublic' | 'texts'>>): Promise<boolean> {
    try {
      await apiFetch(`/api/courses/${encodeURIComponent(courseId)}`, { method: 'PUT', body: updates });
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
      return await apiFetch<CourseMembership[]>(`/api/courses/${encodeURIComponent(courseId)}/members`);
    } catch {
      return [];
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
}
