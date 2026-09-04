"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Přihlášení se nezdařilo.");
      }
      router.push(params.get("next") || "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Přihlášení se nezdařilo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xs bg-white rounded-2xl shadow p-6 space-y-4">
      <h1 className="text-xl font-semibold text-center text-brand-700">🍲 Rodinné recepty</h1>
      <p className="text-sm text-stone-500 text-center">Zadejte rodinný PIN pro vstup.</p>
      <input
        type="password"
        inputMode="numeric"
        autoFocus
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="PIN"
        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-center text-lg tracking-widest focus:border-brand-500 focus:outline-none"
      />
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      <button
        type="submit"
        disabled={loading || pin.length === 0}
        className="w-full rounded-lg bg-brand-600 text-white py-2 font-medium disabled:opacity-50"
      >
        {loading ? "Ověřuji..." : "Vstoupit"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
