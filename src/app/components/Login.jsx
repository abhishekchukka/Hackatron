"use client";

import { Pacifico, Poppins } from "next/font/google";
import React, { useRef, useState, useEffect } from "react";
import { loginUser, resetPassword } from "../utils/api/auth"; 
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { auth } from "../utils/firebase";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { googleProvider, facebookProvider } from "../utils/firebase";
import { useRouter } from "next/navigation"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400"],
    display: "swap",
});

const pacifico = Pacifico({
    subsets: ["latin"],
    weight: ["400"], 
    display: "swap" 
});

const Login = () => {
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
            localStorage.setItem("user", currentUser.email);
            setUser(currentUser.email);
            router.replace("/");
          } else {
            localStorage.removeItem("user");
            setUser(null);
            router.replace("/login")
          }
        });
        return () => unsubscribe();
      }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const email = emailRef.current?.value.trim();
        const password = passwordRef.current?.value.trim();

        if (!email) {
            toast.error("Email is required");
            setLoading(false);
            return;
        }

        if (!password) {
            toast.error("Password is required");
            setLoading(false);
            return;
        }

        try {
            const user = await loginUser(email, password);

            if (typeof user === "string" && user.startsWith("Firebase:")) {
                toast.error(user.replace(/Firebase: auth\/|-/g, " "));
            } else {
                toast.success("Login successful!");
                router.push("/");
            }
        } catch (error) {
            toast.error(error.message || "Something went wrong");
        }

        setLoading(false);
    };

    const handleForgotPassword = async () => {
        const email = emailRef.current?.value.trim();
        if (!email) {
            toast.error("Please enter your email to reset password");
            return;
        }

        try {
            await resetPassword(email);
            toast.success("Password reset email sent!");
        } catch (error) {
            toast.error(error.message || "Error sending reset email");
        }
    };

    // const handleGoogleLogin = async () => {
    //     try {
    //         const result = await signInWithPopup(auth, googleProvider);
    //         toast.success(`Logged in as ${result.user.displayName}`);
    //         router.push("/");
    //     } catch (error) {
    //         toast.error(error.message || "Google login failed");
    //     }
    // };

    // const handleFacebookLogin = async () => {
    //     try {
    //         const result = await signInWithPopup(auth, facebookProvider);
    //         toast.success(`Logged in as ${result.user.displayName}`);
    //         router.push("/");
    //     } catch (error) {
    //         toast.error(error.message || "Facebook login failed");
    //     }
    // };

    return (
        <div className={`${poppins.className} flex items-center justify-center min-h-screen bg-gray-100`}> 
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className={`text-2xl font-bold text-center ${pacifico.className}`}>Login</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            ref={emailRef}
                            className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                        />
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            ref={passwordRef}
                            className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-10 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    <div className="text-right">
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-sm text-indigo-600 hover:underline"
                        >
                            Forgot Password?
                        </button>
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 font-medium text-white rounded-md"
                    >
                        {loading ? "Processing..." : "Login"}
                    </Button>
                </form>
                <div className="flex items-center justify-center mt-4">
                    <span className="text-sm text-gray-500">Do you have an account? Register Now!</span>
                </div>
                <div className="flex flex-col lg:flex-row gap-4 mt-2">
            
            <Button     
                    variant="outline"
                    disabled={loading}
                    className="w-full px-4 py-2 font-medium rounded-md w-full lg:w-1/2"
            ><Link href="/coach_signup">Coach</Link>
            </Button>
            <Button
                        disabled={loading}
                        className="w-full px-4 py-2 font-medium text-white rounded-md w-full lg:w-1/2"
            > <Link href="/player_signup">Player</Link>
            </Button>
            </div>
   
            </div>
            
        </div>
    );
};

export default Login;
