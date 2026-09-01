"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await signIn(email, password);
      router.push("/editions");
    } catch {
      // ponytail: don't leak whether the email exists, one generic message
      setError("ईमेल या पासवर्ड गलत है");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-lg bg-white p-8 shadow"
      >
        <h1 className="mb-1 text-center text-2xl font-bold text-neutral-900">
          जनशक्ति उजाला
        </h1>
        <p className="mb-6 text-center text-sm text-neutral-500">
          ई-पेपर संपादक लॉगिन
        </p>

        <label className="mb-1 block text-sm font-medium text-neutral-700">
          ईमेल
        </label>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-500"
        />

        <label className="mb-1 block text-sm font-medium text-neutral-700">
          पासवर्ड
        </label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-500"
        />

        {error && (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-neutral-900 py-2 font-medium text-white disabled:opacity-50"
        >
          {pending ? "लॉगिन हो रहा है…" : "लॉगिन करें"}
        </button>
      </form>
    </div>
  );
}
