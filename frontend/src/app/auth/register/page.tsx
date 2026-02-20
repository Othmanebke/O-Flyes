"use client";
import { useState } from "react";
import Link from "next/link";
import { Plane } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/api/auth/auth/register", { name, email, password });
      router.push("/auth/login");
    } catch {
      setError("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="glass rounded-2xl p-8 w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-6">
          <Plane className="w-6 h-6 text-brand-400" />
          <span className="font-bold text-xl">O-Flyes</span>
        </div>
        <h1 className="text-2xl font-bold mb-1 text-center">Créer un compte</h1>
        <p className="text-gray-400 text-sm text-center mb-6">Commencez votre aventure gratuite</p>

        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Nom</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500"
              placeholder="Votre prénom"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500"
              placeholder="vous@exemple.com"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Mot de passe</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500"
              placeholder="8 caractères minimum"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors"
          >
            {loading ? "Création…" : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Déjà un compte ?{" "}
          <Link href="/auth/login" className="text-brand-400 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
