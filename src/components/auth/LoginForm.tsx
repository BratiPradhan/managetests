"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginSchema, LoginFormValues } from "@/lib/validations/login.schema";
import { login } from "@/services/auth.service";
import { setToken, setUser } from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const { token, user } = await login(values);
      setToken(token);
      if (user) setUser(user);
      router.push("/dashboard");
    } catch {
      setServerError("Invalid credentials. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <label
          htmlFor="userId"
          className="block text-sm font-semibold text-gray-700"
        >
          User ID
        </label>
        <input
          id="userId"
          placeholder="Enter User ID"
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
          {...register("userId")}
        />
        {errors.userId && (
          <p className="text-xs text-red-500">{errors.userId.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter Password"
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-brand hover:bg-brand/90 disabled:opacity-60 disabled:cursor-not-allowed py-2.5 text-sm font-semibold text-white transition-colors"
      >
        {isSubmitting ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}
