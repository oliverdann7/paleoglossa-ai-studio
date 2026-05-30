/**
 * Daily.co room minting for lessons. Server-only.
 * Falls back to a deterministic placeholder URL when DAILY_API_KEY is unset.
 */

export interface CreatedRoom {
  url: string;
  name: string;
  expiresAt: number;
}

export async function createLessonRoom(opts: {
  bookingId: string;
  startMs: number;
  durationMin: number;
}): Promise<CreatedRoom> {
  const apiKey = process.env.DAILY_API_KEY;
  const domain = process.env.DAILY_DOMAIN || 'paleoglossa';
  const name = `lesson-${opts.bookingId}`;
  // Room valid from 15 min before start to 30 min after end.
  const nbf = Math.floor((opts.startMs - 15 * 60_000) / 1000);
  const exp = Math.floor((opts.startMs + (opts.durationMin + 30) * 60_000) / 1000);

  if (!apiKey) {
    return {
      url: `https://${domain}.daily.co/${name}`,
      name,
      expiresAt: exp,
    };
  }

  const res = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      privacy: 'private',
      properties: {
        nbf,
        exp,
        enable_chat: true,
        enable_screenshare: true,
        max_participants: 4,
      },
    }),
  });
  if (!res.ok) {
    // Fallback: deterministic URL, lesson can still happen without prebuild.
    console.warn('[daily] room create failed', await res.text());
    return { url: `https://${domain}.daily.co/${name}`, name, expiresAt: exp };
  }
  const data = (await res.json()) as { url: string; name: string };
  return { url: data.url, name: data.name, expiresAt: exp };
}

export async function mintMeetingToken(opts: {
  roomName: string;
  userId: string;
  displayName: string;
  isOwner: boolean;
}): Promise<string | null> {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) return null;
  const res = await fetch('https://api.daily.co/v1/meeting-tokens', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        room_name: opts.roomName,
        user_id: opts.userId,
        user_name: opts.displayName,
        is_owner: opts.isOwner,
      },
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { token: string };
  return data.token;
}
