import { child, get, getDatabase, ref, update } from 'firebase/database'; // import `update` instead of `set`
import { getFirebaseApp } from '../firebaseHelper';

export const getUserData = async (userId) => {
    try {
        const app = getFirebaseApp()
        const dbRef = ref(getDatabase(app))
        const userRef = child(dbRef, `users/${userId}`)

        const snapshot = await get(userRef)
        return snapshot.val()
    } catch (err) {
        console.log(err)
    }
}

export const updateUserData = async (userId, data) => {
  const db = getDatabase();
  const userRef = ref(db, 'users/' + userId);
  await update(userRef, data); // use `update` instead of `set`
};

