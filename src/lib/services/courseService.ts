import { Course, CourseMembership } from '../../types/modules';

export class CourseService {
  static async getCourses(userId: string): Promise<Course[]> {
    try {
      const response = await fetch(`/api/courses?userId=${encodeURIComponent(userId)}`);
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  }

  static async getCourse(courseId: string): Promise<Course | null> {
    try {
      const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}`);
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }

  static async createCourse(userId: string, course: Partial<Course>): Promise<Course | null> {
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...course }),
      });
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }

  static async getMembers(courseId: string): Promise<CourseMembership[]> {
    try {
      const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}/members`);
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  }

  static async joinCourse(courseId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: 'student' }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
