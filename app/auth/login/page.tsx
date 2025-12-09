/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  async function login(e: any) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Login response data:", data);

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrorMessage(data.message || "Login failed");
        }
        return;
      }
      window.location.href = "/home";
    } catch (err: any) {
      setErrorMessage("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const googleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `http://localhost:3000/auth/callback`,
        },
      });
    } catch (err) {
      setErrorMessage("Google signup failed.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-1 p-4 sm:p-6">
      <div className="flex flex-col justify-center items-center mb-3 text-center max-w-sm w-full">
        <div className="mb-4">
          <Image
            src="/smartreport.ai-logo.png"
            alt="Logo"
            width={150}
            height={150}
            priority
          />
        </div>
        <h2 className="text-2xl sm:text-3xl text-gray-900 font-semibold">
          Welcome Back
        </h2>
        <p className="text-slate-600 text-sm sm:text-base">
          Join thousands of students streamlining their document workflow.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col">
        <form onSubmit={login} className="space-y-3 sm:space-y-4">
          {/* EMAIL */}
          <div className="relative mt-2 w-full">
            <input
              type="email"
              id="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-4 sm:px-6 pb-2 pt-3 text-sm"
            />
            <label
              htmlFor="email"
              className="absolute top-1.5 sm:top-2 left-3 sm:left-4 z-10 origin-left -translate-y-4 scale-75 transform bg-white px-2 text-[14px] sm:text-[16px] text-gray-500 duration-300
              peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100
              peer-focus:top-1.5 sm:peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-primary"
            >
              Email Address
            </label>
            {errors.email && (
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="relative mt-2 w-full">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-4 sm:px-6 pb-2 pt-3 text-sm pr-10 sm:pr-12"
            />
            <label
              htmlFor="password"
              className="absolute top-1.5 sm:top-2 left-3 sm:left-4 z-10 origin-left -translate-y-4 scale-75 transform bg-white px-2 text-[14px] sm:text-[16px] text-gray-500 duration-300
              peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100
              peer-focus:top-1.5 sm:peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-primary"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && (
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 sm:h-12 rounded-lg text-sm sm:text-md"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>

        {errorMessage && (
          <Alert variant="destructive" className="mt-3 sm:mt-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="text-center mt-3 sm:mt-4">
          <p className="text-gray-600 text-sm">
            Don&apos;t have an account?{" "}
            <a href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </a>
          </p>
        </div>

        {/* Divider */}
        <div className="relative my-4 sm:my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="px-3 sm:px-4 bg-white text-gray-500 font-medium">
              OR
            </span>
          </div>
        </div>

        {/* GOOGLE LOGIN BUTTON */}
        <Button
          type="button"
          variant="outline"
          onClick={googleLogin}
          disabled={isGoogleLoading}
          className="w-full h-10 sm:h-12 shadow-none rounded-lg text-sm sm:text-md cursor-pointer"
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 sm:mr-3 h-4 sm:h-5 w-4 sm:w-5 animate-spin" />
          ) : (
            <svg
              className="mr-2 sm:mr-3 h-4 sm:h-5 w-4 sm:w-5"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
