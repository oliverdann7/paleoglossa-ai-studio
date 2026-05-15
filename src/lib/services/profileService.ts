import { db, auth, storage } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile as updateFirebaseProfile } from 'firebase/auth';

export interface UserProfileData {
  uid: string;
  displayName: string;
  nickname?: string;
  bio?: string;
  avatarUrl?: string;
  isPublic?: boolean;
  createdAt?: any;
  stats?: {
    totalKnown: number;
    streak: number;
  };
}

export interface PublicText {
  id: string;
  title: string;
  languageId: string;
  authorId: string;
  authorName?: string;
  createdAt?: any;
  stats?: { totalWords: number; uniqueWords: number };
}

async function resizeImageToJpeg(file: File, maxSize = 400): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/jpeg', 0.88);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function uploadAvatar(uid: string, file: File): Promise<string> {
  const blob = await resizeImageToJpeg(file);
  const storageRef = ref(storage, `avatars/${uid}/profile.jpg`);
  const snapshot = await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(snapshot.ref);
}

export async function updateUserProfile(uid: string, data: Partial<Omit<UserProfileData, 'uid' | 'stats' | 'createdAt'>>) {
  const profileRef = doc(db, 'users', uid);
  await updateDoc(profileRef, data as Record<string, unknown>);

  const firebaseUser = auth.currentUser;
  if (firebaseUser) {
    const authUpdate: { displayName?: string; photoURL?: string } = {};
    if (data.displayName !== undefined) authUpdate.displayName = data.displayName;
    if (data.avatarUrl !== undefined) authUpdate.photoURL = data.avatarUrl;
    if (Object.keys(authUpdate).length > 0) {
      await updateFirebaseProfile(firebaseUser, authUpdate);
    }
  }
}

export async function fetchOwnProfile(uid: string): Promise<UserProfileData | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    uid,
    displayName: d.displayName || '',
    nickname: d.nickname,
    bio: d.bio,
    avatarUrl: d.avatarUrl,
    isPublic: d.isPublic ?? false,
    createdAt: d.createdAt,
    stats: d.stats ? { totalKnown: d.stats.totalKnown, streak: d.stats.streak } : undefined,
  };
}

export async function fetchPublicProfile(uid: string): Promise<UserProfileData | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  if (!d.isPublic) return null;
  return {
    uid,
    displayName: d.displayName || '',
    nickname: d.nickname,
    bio: d.bio,
    avatarUrl: d.avatarUrl,
    isPublic: true,
    createdAt: d.createdAt,
    stats: d.stats ? { totalKnown: d.stats.totalKnown, streak: d.stats.streak } : undefined,
  };
}

export async function fetchPublicTextsByAuthor(authorId: string): Promise<PublicText[]> {
  const q = query(
    collection(db, 'publicTexts'),
    where('authorId', '==', authorId),
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
    limit(20),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PublicText, 'id'>) }));
}
