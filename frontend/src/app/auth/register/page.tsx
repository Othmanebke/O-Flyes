"use client";
import { useState } from "react";
import Link from "next/link";
import { Plane, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-sand-50 flex">
      {/* Left — decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-dark overflow-hidden flex-col justify-between p-12">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
              <Plane className="w-5 h-5 text-dark -rotate-45" />
            </div>
            <span className="font-serif text-2xl text-white">O-<span className="text-gold-400">Flyes</span></span>
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-white/40 text-sm tracking-widest uppercase mb-4">Inscription</p>
          <h2 className="font-serif text-5xl text-white leading-tight mb-6">Votre aventure<br />vous attend.</h2>
          <p className="text-white/50 text-sm max-w-xs leading-relaxed">
            Rejoignez des milliers de voyageurs qui font confiance à O-Flyes pour planifier leurs escapades.
          </p>
        </div>
        <div className="relative z-10 flex gap-3">
          {[
            { label: "Santorini", sub: "Grèce", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=120&q=70" },
            { label: "Islande", sub: "Aurores", img: "https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=120&q=70" },
            { label: "Tokyo", sub: "Japon", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=120&q=70" },
          ].map((d) => (
            <div key={d.label} className="rounded-2xl overflow-hidden relative flex-1">
              <img src={d.img} alt={d.label} className="w-full h-24 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-2 left-3">
                <p className="text-white text-xs font-semibold">{d.label}</p>
                <p className="text-white/50 text-[10px]">{d.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 justify-center mb-10 lg:hidden">
            <div className="w-9 h-9 bg-dark rounded-xl flex items-center justify-center">
              <Plane className="w-5 h-5 text-white -rotate-45" />
            </div>
            <span className="font-serif text-2xl text-dark">O-<span className="text-gold">Flyes</span></span>
          </div>
          <p className="section-label mb-3">Inscription</p>
          <h1 className="font-serif text-4xl text-dark mb-2">Créer un compte</h1>
          <p className="text-dark-400 text-sm mb-10">
            Déjà inscrit ?{" "}
            <Link href="/auth/login" className="font-medium hover:underline text-gold">Se connecter</Link>
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-dark-400 uppercase tracking-widest mb-2">Prénom</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-sm text-dark placeholder-dark-200 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                placeholder="Votre prénom" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 uppercase tracking-widest mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-sm text-dark placeholder-dark-200 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                placeholder="vous@exemple.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 uppercase tracking-widest mb-2">Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-sm text-dark placeholder-dark-200 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                placeholder="8 caractères minimum" />
            </div>
            <button type="submit" disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? "Création…" : (<><span>Créer mon compte</span><ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>
          <p className="text-center text-xs text-dark-300 mt-8">
            En créant un compte, vous acceptez nos{" "}
            <a href="#" className="underline text-dark-400">Conditions d&apos;utilisation</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
