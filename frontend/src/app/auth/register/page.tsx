"use client";
import { useState } from "react";
import Link from "next/link";
import { Plane, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

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
    const supabase = createClient();
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // Check if email confirmation is required
      if (data?.session) {
        // Auto-login succeeded
        router.push("/onboarding");
      } else {
        // Registration succeeded but requires email confirmation
        router.push("/auth/login?registered=1");
      }

    } catch (err: any) {
      console.error("Register Error Details:", err);
      const msg = err?.message || "Une erreur est survenue lors de l'inscription.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100vh] flex -mt-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Left — decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#141822] overflow-hidden flex-col justify-between p-12 border-r border-white/5 pt-32">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/10 border border-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
              <Plane className="w-5 h-5 text-gold -rotate-45" />
            </div>
            <span className="font-serif text-2xl text-white">AI<span className="text-gold">VANA</span></span>
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-white/40 text-[10px] tracking-widest uppercase mb-4">Inscription</p>
          <h2 className="font-serif text-5xl text-white leading-tight mb-6">Votre aventure<br />vous attend.</h2>
          <p className="text-white/50 text-sm max-w-xs leading-relaxed">
            Rejoignez des milliers de voyageurs qui font confiance à AIVANA pour planifier leurs escapades.
          </p>
        </div>
        <div className="relative z-10 flex gap-3">
          {[
            { label: "Santorini", sub: "Grèce", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=120&q=70" },
            { label: "Islande", sub: "Aurores", img: "https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=120&q=70" },
            { label: "Tokyo", sub: "Japon", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=120&q=70" },
          ].map((d) => (
            <div key={d.label} className="rounded-2xl overflow-hidden relative flex-1 border border-white/5">
              <img src={d.img} alt={d.label} className="w-full h-24 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14]/90 to-transparent" />
              <div className="absolute bottom-2 left-3">
                <p className="text-white text-xs font-semibold">{d.label}</p>
                <p className="text-white/50 text-[10px]">{d.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 justify-center mb-10 lg:hidden">
            <div className="w-9 h-9 bg-[#141822] border border-white/10 rounded-xl flex items-center justify-center">
              <Plane className="w-5 h-5 text-white -rotate-45" />
            </div>
            <span className="font-serif text-2xl text-white">AI<span className="text-gold">VANA</span></span>
          </div>
          <p className="section-label mb-3 text-gold/80">Inscription</p>
          <h1 className="font-serif text-4xl text-white mb-2">Créer un compte</h1>
          <p className="text-white/60 text-sm mb-10">
            Déjà inscrit ?{" "}
            <Link href="/auth/login" className="font-medium hover:text-white transition-colors text-gold">Se connecter</Link>
          </p>
          {error && (
            <div className="bg-[#141822] border border-white/10 text-emerald-400 text-sm px-4 py-3 rounded-xl mb-6 shadow-xl">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-2">Prénom</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full rounded-xl px-4 py-3 text-sm placeholder-current/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                placeholder="Votre prénom" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full rounded-xl px-4 py-3 text-sm placeholder-current/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                placeholder="vous@exemple.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-2">Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                className="w-full rounded-xl px-4 py-3 text-sm placeholder-current/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                placeholder="8 caractères minimum" />
            </div>
            <button type="submit" disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? "Création…" : (<><span>Créer mon compte</span><ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>
          <p className="text-center text-[10px] text-white/40 mt-8 leading-relaxed">
            En créant un compte, vous acceptez nos{" "}
            <a href="#" className="underline text-white/60 hover:text-white transition-colors">Conditions d&apos;utilisation</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
