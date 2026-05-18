import { Router } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { requireAuth } from '../_lib/auth.js';
import { getStorage } from 'firebase-admin/storage';

const router = Router();

interface DeleteAccountRequest {
  confirmationText?: string;
}

/**
 * DELETE /api/account/delete
 * Fully deletes a user's account and all associated data from Firestore and Auth.
 * Requires recent authentication (reauthentication should happen client-side).
 *
 * Deletion includes:
 * - User profile (users/{uid})
 * - All user subcollections (vocabulary, reviews, readingProgress, notebooks, notes, imports)
 * - Public profile data (anonymized in community if needed)
 * - Avatar/stored files
 * - Firebase Auth user account
 *
 * Expects confirmation text "DELETE" to prevent accidental deletions.
 */
router.delete('/api/account/delete', requireAuth, async (req: any, res: any) => {
  const { confirmationText } = req.body as DeleteAccountRequest;
  const uid = req.user!.uid;

  // Require explicit confirmation
  if (confirmationText?.toUpperCase() !== 'DELETE') {
    return res.status(400).json({
      error: 'Invalid confirmation. Must type DELETE to proceed.',
    });
  }

  const db = getFirestore();
  const auth = getAuth();

  try {
    // 1. Delete all user subcollections
    const userDocRef = db.collection('users').doc(uid);
    const subcollections = [
      'vocabulary',
      'reviews',
      'readingProgress',
      'notebooks',
      'notes',
      'imports',
      'reviewLogs',
      'readingSessions',
    ];

    for (const subcoll of subcollections) {
      const snapshot = await userDocRef.collection(subcoll).get();
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    // 2. Delete imported texts owned by user
    const importedTextsRef = db.collection('importedTexts').doc(uid);
    const importedSnapshot = await importedTextsRef.collection('texts').get();
    const importBatch = db.batch();
    importedSnapshot.docs.forEach((doc) => {
      importBatch.delete(doc.ref);
    });
    await importBatch.commit();
    await importBatch.commit();
    await importedTextsRef.delete();

    // 3. Anonymize public profile if it exists
    // Instead of deleting, mark as deleted so community references don't break
    try {
      const publicProfileRef = db.collection('publicProfiles').doc(uid);
      await publicProfileRef.set(
        {
          isDeleted: true,
          displayName: '[Deleted Account]',
          nickname: null,
          bio: null,
          avatarUrl: null,
          isPublic: false,
          deletedAt: Timestamp.now(),
        },
        { merge: true }
      );
    } catch {
      // Public profile may not exist, that's okay
    }

    // 4. Delete user's public texts metadata
    try {
      const publicTextsSnapshot = await db
        .collection('publicTexts')
        .where('authorId', '==', uid)
        .get();
      const publicTextsBatch = db.batch();
      publicTextsSnapshot.docs.forEach((doc) => {
        publicTextsBatch.delete(doc.ref);
      });
      await publicTextsBatch.commit();
    } catch {
      // May not exist or error, continue
    }

    // 5. Delete avatar from Cloud Storage if it exists
    try {
      const storage = getStorage();
      const bucket = storage.bucket();
      const avatarPath = `avatars/${uid}/`;
      const [files] = await bucket.getFiles({ prefix: avatarPath });
      for (const file of files) {
        await file.delete();
      }
    } catch {
      // Storage may be empty or not configured, continue
    }

    // 6. Delete user document from Firestore
    await userDocRef.delete();

    // 7. Delete user from Firebase Auth
    await auth.deleteUser(uid);

    res.json({
      success: true,
      message: 'Account and all associated data have been deleted.',
    });
  } catch (error: any) {
    console.error(`[account-delete] Failed to delete account for ${uid}:`, error);

    // If the user was already deleted from Auth but Firestore failed,
    // we still report success since Auth is the primary auth source
    if (error.code === 'auth/user-not-found') {
      return res.json({
        success: true,
        message: 'Account deletion processed (some data may require manual cleanup).',
      });
    }

    res.status(500).json({
      error: error.message ?? 'Failed to delete account.',
    });
  }
});

export default router;
