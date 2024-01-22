import { getFirebaseApp } from '../firebaseHelper'
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth'
import { child, getDatabase, set, ref } from 'firebase/database'
import { authenticate } from '../../store/authSlice'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getUserData } from './userActions'

export const signUp = (fullName, email, password) => {
    return async (dispatch) => {
        const app = getFirebaseApp()
        const auth = getAuth(app)

        try {
            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            )
            const { uid, stsTokenManager } = result.user
            const { accessToken, expirationTime } = stsTokenManager
            const expiryDate = new Date(expirationTime)
            const userData = await createUser(fullName, email, uid)
            dispatch(authenticate({ token: accessToken, userData }))
            saveToDataStorage(accessToken, uid, expiryDate)
        } catch (error) {
            const errorCode = error.code
            let message = 'Something went wrong'
            if (errorCode === 'auth/email-already-in-use') {
                message = 'This email is already in use'
            }
            throw new Error(message)
        }
    }
}

export const signIn = (email, password) => {
    return async (dispatch) => {
        const app = getFirebaseApp()
        const auth = getAuth(app)

        try {
            const result = await signInWithEmailAndPassword(
                auth,
                email,
                password
            )
            const { uid, stsTokenManager } = result.user
            const { accessToken, expirationTime } = stsTokenManager
            const expiryDate = new Date(expirationTime)
       
            const userData = await getUserData(uid)
            dispatch(authenticate({ token: accessToken, userData }))

            saveToDataStorage(accessToken, uid, expiryDate)
            
        } catch (error) {
            console.log(error)
            const errorCode = error.code
            let message = 'Something went wrong'
            if (
                errorCode === 'auth/wrong-password' ||
                errorCode === 'auth/user-not-found'
            ) {
                message = 'Wrong email or password!'
            }
            throw new Error(message)
        }
    }
}

const createUser = async (fullName, email, userId) => {
    const userData = {
        fullName,
        email,
        userId,
        signUpDate: new Date().toISOString(),
    }

    const dbRef = ref(getDatabase())
    const childRef = child(dbRef, `users/${userId}`)
    await set(childRef, userData)
    return userData
}

const saveToDataStorage = (token, userId, expiryDate) => {
    AsyncStorage.setItem(
        'userData',
        JSON.stringify({
            token,
            userId,
            expiryDate: expiryDate.toISOString(),
        })
    )
}

// lưu thông tin đăng nhập
// !!!!!!!!!! cần xem lại vấn đề AutoLogin 
const signInWithToken = () => {
    return async (dispatch) => {
        const app = getFirebaseApp()
        const auth = getAuth(app)
        
        // try {
        //     const userDataJson = await AsyncStorage.getItem('userData')
        //     if(userDataJson != null) {
        //         const { token, userId, expiryDate } = JSON.parse(userDataJson);
        //         const now = new Date();
        //         if (userDataJson === null) {
        //             console.log(expiryDate)
        //             console.log(now)
        //         // Token is still valid, user is logged in
        //         // Load user data and navigate to the main screen
        //             const userData = await getUserData(userId)
        //             if(userData.accessToken === token) {
        //                 dispatch(authenticate({token, userData}))
        //             }
        //         }
        //     } else {
        //         console.log('User date empty !')
        //     }
        // } catch (error) {
        //     console.error(error)
        // }
    }
}

export { createUser, saveToDataStorage, signInWithToken }
