import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Tutor session persistence tests.
 * Tests the session data model and message flow logic.
 */

interface Message {
  id?: string;
  role: string;
  content: string;
  context?: any;
  warnings?: string[];
  createdAt?: string;
}

interface Session {
  id: string;
  languageId: string;
  textId?: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Simulated in-memory store for testing session logic
class TutorSessionStore {
  private sessions = new Map<string, Session>();
  private messages = new Map<string, Message[]>();
  private counter = 0;

  private ts(): string {
    this.counter++;
    return new Date(Date.now() + this.counter).toISOString();
  }

  createSession(languageId: string, textId?: string): Session {
    const id = `session_${this.counter}`;
    const now = this.ts();
    const session: Session = {
      id,
      languageId,
      textId: textId || undefined,
      title: `${languageId} Tutor`,
      createdAt: now,
      updatedAt: now,
    };
    this.sessions.set(id, session);
    this.messages.set(id, [
      { role: 'assistant', content: `I'm your ${languageId} tutor.`, createdAt: now },
    ]);
    return session;
  }

  sendMessage(sessionId: string, content: string): Message {
    const msgs = this.messages.get(sessionId) || [];
    const now = this.ts();
    const userMsg: Message = { role: 'user', content, createdAt: now };
    msgs.push(userMsg);
    const reply: Message = {
      role: 'assistant',
      content: `Response to: ${content}`,
      createdAt: now,
    };
    msgs.push(reply);
    this.messages.set(sessionId, msgs);

    const session = this.sessions.get(sessionId);
    if (session) {
      session.updatedAt = now;
    }
    return reply;
  }

  getSession(sessionId: string): Session | null {
    return this.sessions.get(sessionId) || null;
  }

  getMessages(sessionId: string): Message[] {
    return this.messages.get(sessionId) || [];
  }

  listSessions(): Session[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );
  }
}

describe('Tutor session persistence', () => {
  let store: TutorSessionStore;

  beforeEach(() => {
    store = new TutorSessionStore();
  });

  it('creates a new session with greeting message', () => {
    const session = store.createSession('grc');
    expect(session.id).toBeTruthy();
    expect(session.languageId).toBe('grc');
    expect(session.title).toBe('grc Tutor');

    const msgs = store.getMessages(session.id);
    expect(msgs.length).toBe(1);
    expect(msgs[0].role).toBe('assistant');
    expect(msgs[0].content).toContain('grc tutor');
  });

  it('sends a message and receives a reply', () => {
    const session = store.createSession('lat');
    const reply = store.sendMessage(session.id, 'What case is this?');
    expect(reply.role).toBe('assistant');
    expect(reply.content).toContain('What case is this?');

    const msgs = store.getMessages(session.id);
    expect(msgs.length).toBe(3); // greeting + user msg + reply
    expect(msgs[1].role).toBe('user');
    expect(msgs[1].content).toBe('What case is this?');
  });

  it('reloads session messages correctly', () => {
    const session = store.createSession('hbo');
    store.sendMessage(session.id, 'Parse this verb');
    store.sendMessage(session.id, 'What root is this?');

    // Simulate reload: get session, then get messages
    const reloadedSession = store.getSession(session.id);
    expect(reloadedSession).not.toBeNull();

    const reloadedMsgs = store.getMessages(session.id);
    expect(reloadedMsgs.length).toBe(5); // 1 greeting + 2 user + 2 assistant
    expect(reloadedMsgs[0].role).toBe('assistant');
    expect(reloadedMsgs[1].role).toBe('user');
    expect(reloadedMsgs[2].role).toBe('assistant');
    expect(reloadedMsgs[3].role).toBe('user');
    expect(reloadedMsgs[4].role).toBe('assistant');
  });

  it('lists sessions in reverse chronological order', async () => {
    store.createSession('grc');
    await new Promise((r) => setTimeout(r, 5)); // ensure timestamp ordering
    const s2 = store.createSession('lat');
    await new Promise((r) => setTimeout(r, 5));
    store.createSession('hbo');

    store.sendMessage(s2.id, 'Hello'); // updates s2 timestamp

    const sessions = store.listSessions();
    expect(sessions.length).toBe(3);
    // Most recently updated should be first
    expect(sessions[0].id).toBe(s2.id);
  });

  it('returns empty messages for non-existent session', () => {
    const msgs = store.getMessages('nonexistent');
    expect(msgs).toEqual([]);
  });

  it('returns null for non-existent session', () => {
    const session = store.getSession('nonexistent');
    expect(session).toBeNull();
  });

  it('handles multiple messages in a session', () => {
    const session = store.createSession('grc');
    const MESSAGE_COUNT = 10;
    for (let i = 0; i < MESSAGE_COUNT; i++) {
      store.sendMessage(session.id, `Message ${i}`);
    }
    const msgs = store.getMessages(session.id);
    // 1 greeting + MESSAGE_COUNT exchanges (each exchange = 1 user + 1 assistant)
    expect(msgs.length).toBe(1 + MESSAGE_COUNT * 2);
  });
});
