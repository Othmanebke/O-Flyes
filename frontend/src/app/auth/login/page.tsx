"use client";
import { useState } from "react";
import Link from "next/link";
import { Plane, ArrowRight } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      router.push("/explore");
    } catch {
      setError("Email ou mot de passe incorrect.");
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
          <p className="text-white/40 text-sm tracking-widest uppercase mb-4">Bienvenue</p>
          <h2 className="font-serif text-5xl text-white leading-tight mb-6">Chaque voyage<br />commence ici.</h2>
          <p className="text-white/50 text-sm max-w-xs leading-relaxed">
            Décrivez vos envies, laissez notre IA vous guider vers la destination parfaite.
          </p>
        </div>
        <div className="relative z-10 flex gap-3">
          {[
            { label: "Bali", sub: "Indonésie", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=120&q=70" },
            { label: "Kyoto", sub: "Japon", img: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=120&q=70" },
            { label: "Marrakech", sub: "Maroc", img: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=120&q=70" },
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
          <p className="section-label mb-3">Connexion</p>
          <h1 className="font-serif text-4xl text-dark mb-2">Content de vous revoir</h1>
          <p className="text-dark-400 text-sm mb-10">
            Pas encore de compte ?{" "}
            <Link href="/auth/register" className="font-medium hover:underline text-gold">S&apos;inscrire</Link>
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-dark-400 uppercase tracking-widest mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-sm text-dark placeholder-dark-200 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                placeholder="vous@exemple.com" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-medium text-dark-400 uppercase tracking-widest">Mot de passe</label>
                <a href="#" className="text-xs text-gold hover:underline">Oublié ?</a>
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-sm text-dark placeholder-dark-200 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? "Connexion…" : (<><span>Se connecter</span><ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>
          <div className="my-6 flex items-center gap-3">
            <hr className="flex-1 border-sand-200" />
            <span className="text-dark-300 text-xs">ou</span>
            <hr className="flex-1 border-sand-200" />
          </div>
          <a href="/api/auth/auth/google"
            className="w-full flex items-center justify-center gap-3 py-3 border border-sand-300 rounded-xl text-sm font-medium text-dark hover:border-dark-200 hover:bg-sand-50 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </a>
        </div>
      </div>
    </div>
  );
}
