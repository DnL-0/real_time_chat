// Sign-up with a globally-unique username.
//
// Usernames are claimed in a `usernames/{usernameLower}` collection (doc id =
// the lowercased name). A Firestore transaction makes the check-and-claim
// atomic, so two people signing up with the same name at the same time can't
// both win. If the claim fails, we delete the just-created auth account so the
// email can be reused and no orphaned login is left behind.
import {
  createUserWithEmailAndPassword,
  deleteUser,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export async function signUp(username: string, email: string, password: string) {
  const name = username.trim();
  if (!USERNAME_RE.test(name)) {
    throw new Error('Username must be 3–20 characters — letters, numbers, or underscores only.');
  }
  const nameLower = name.toLowerCase();

  // Fast, friendly pre-check. The transaction below is the real guarantee.
  const taken = await getDoc(doc(db, 'usernames', nameLower));
  if (taken.exists()) {
    throw new Error('That username is already taken.');
  }

  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  try {
    await runTransaction(db, async (tx) => {
      const nameRef = doc(db, 'usernames', nameLower);
      const snap = await tx.get(nameRef);
      if (snap.exists()) throw new Error('That username is already taken.');

      tx.set(nameRef, { uid: cred.user.uid });
      tx.set(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        username: name,
        usernameLower: nameLower,
        email: email.trim(),
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
      });
    });
    await updateProfile(cred.user, { displayName: name });
  } catch (err) {
    // Roll back the half-created account.
    await deleteUser(cred.user).catch(() => {});
    throw err;
  }
}
