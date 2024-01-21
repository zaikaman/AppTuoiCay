import { child, get, getDatabase, ref, update } from 'firebase/database'; // import `update` instead of `set`
import { getFirebaseApp } from '../firebaseHelper';

export const getUserData = async (userId) => {
    try {
      const app = getFirebaseApp()
      const dbRef = ref(getDatabase(app))
      const userRef = child(dbRef, `users/${userId}`)
  
      const snapshot = await get(userRef)
      return snapshot.val() || {} // Return an empty object if snapshot.val() is undefined
    } catch (err) {
      console.log(err)
      return {} // Return an empty object in case of an error
    }
  }  

export const updateUserData = async (userId, data) => {
    const db = getDatabase();
    const userRef = ref(db, 'users/' + userId);
    
    // Get current user data
    const snapshot = await get(userRef);
    const userData = snapshot.val();
  
    await update(userRef, data); // use `update` instead of `set`
  };
  

