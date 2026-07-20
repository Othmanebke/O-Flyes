"use client";
import { useState, Suspense } from "react";
import { Plane, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { withAivanaFallback } from "@/lib/placeholder";

function LoginContent() {
  const params = useSearchParams();
  const error = params.get("error");

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingMicrosoft, setLoadingMicrosoft] = useState(false);

  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoadingGoogle(false);
  };

  const handleMicrosoftSignIn = async () => {
    setLoadingMicrosoft(true);
    await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoadingMicrosoft(false);
  };

  return (
    <>
      <div className="flex items-center gap-2 justify-center mb-10 lg:hidden">
        <div className="w-9 h-9 bg-[#141822] border border-white/10 rounded-xl flex items-center justify-center">
          <Plane className="w-5 h-5 text-white -rotate-45" />
        </div>
        <span className="font-serif text-2xl text-white">AI<span className="text-gold">VANA</span></span>
      </div>

      <p className="section-label mb-3 text-gold/80">Connexion</p>
      <h1 className="font-serif text-4xl text-white mb-2">Content de vous revoir</h1>
      <p className="text-white/60 text-sm mb-8">
        Connectez-vous avec votre compte Google ou Microsoft.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
          Impossible de vous authentifier. Veuillez réessayer.
        </div>
      )}

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loadingGoogle || loadingMicrosoft}
          className="w-full flex items-center justify-center gap-3 py-3.5 border border-white/10 rounded-xl text-sm font-medium text-white/80 hover:border-white/30 hover:bg-[#141822] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingGoogle ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          Continuer avec Google
        </button>

        <button
          type="button"
          onClick={handleMicrosoftSignIn}
          disabled={loadingGoogle || loadingMicrosoft}
          className="w-full flex items-center justify-center gap-3 py-3.5 border border-white/10 rounded-xl text-sm font-medium text-white/80 hover:border-white/30 hover:bg-[#141822] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingMicrosoft ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 21 21">
              <path fill="#f25022" d="M0 0h10v10H0z" />
              <path fill="#7fba00" d="M11 0h10v10H11z" />
              <path fill="#00a4ef" d="M0 11h10v10H0z" />
              <path fill="#ffb900" d="M11 11h10v10H11z" />
            </svg>
          )}
          Continuer avec Microsoft
        </button>
      </div>

      <p className="text-white/30 text-xs text-center mt-8 leading-relaxed">
        En vous connectant, vous acceptez nos conditions d&apos;utilisation.<br />
        Un compte est créé automatiquement si vous n&apos;en avez pas.
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[100vh] flex -mt-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Left — decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#141822] overflow-hidden flex-col justify-between p-12 pt-32 border-r border-white/5">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/10 border border-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
              <Plane className="w-5 h-5 text-gold -rotate-45" />
            </div>
            <span className="font-serif text-2xl text-white">AI<span className="text-gold">VANA</span></span>
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-white/40 text-[10px] tracking-widest uppercase mb-4">Bienvenue</p>
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
            <div key={d.label} className="rounded-2xl overflow-hidden relative flex-1 border border-white/5">
              <img src={d.img} alt={d.label} onError={withAivanaFallback} className="w-full h-24 object-cover" />
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

      {/* Right — OAuth buttons */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>}>
            <LoginContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
