import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user.reloadUserInfo.email.split("@")[0];
    } catch (error) {
        return error.message;
    }
};

export const signupUser = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user.reloadUserInfo.email.split("@")[0];
    } catch (error) {
        console.error("Signup Error:", error);
    }
};


export const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
};

