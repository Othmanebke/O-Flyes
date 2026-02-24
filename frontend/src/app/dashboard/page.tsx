"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, LayoutDashboard, Calendar, Mail, Settings, Plus, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("Vogayeur");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/auth/login");
        } else {
            setLoading(false);
            // Simuler la récupération du nom (on pourrait décoder le JWT ici)
            setUserName("Othmane");
        }
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-sand-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-sand-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-dark text-white hidden md:flex flex-col">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-sand-50 rounded-lg flex items-center justify-center">
                            <Plane className="w-4 h-4 text-dark -rotate-45" />
                        </div>
                        <span className="font-serif text-xl">AI<span className="text-gold">VANA</span></span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {[
                        { icon: LayoutDashboard, label: "Dashboard", active: true },
                        { icon: Calendar, label: "Mes Voyages", active: false },
                        { icon: Mail, label: "Sync Email", active: false },
                        { icon: Settings, label: "Paramètres", active: false },
                    ].map((item) => (
                        <button
                            key={item.label}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${item.active ? "bg-gold text-dark font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <item.icon className="w-4 h-4" />
                            <span className="text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={() => { localStorage.removeItem("token"); router.push("/"); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-sand-200 px-8 flex items-center justify-between flex-shrink-0">
                    <h1 className="font-serif text-xl text-dark">Mon Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-dark">{userName}</p>
                            <p className="text-[10px] text-dark-400">Compte Explorateur</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold">
                            {userName[0]}
                        </div>
                    </div>
                </header>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-5xl mx-auto">
                        {/* Welcome */}
                        <div className="mb-10">
                            <h2 className="text-3xl font-serif text-dark mb-2">Bonjour, {userName} 👋</h2>
                            <p className="text-dark-400">Prêt pour votre prochaine aventure ?</p>
                        </div>

                        {/* Empty State / Call to action */}
                        <div className="bg-white rounded-3xl p-10 border border-sand-200 text-center mb-8">
                            <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                                📬
                            </div>
                            <h3 className="text-xl font-bold text-dark mb-3">Connectez votre email pour automatiser</h3>
                            <p className="text-dark-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                                Reliez votre boîte Gmail ou Outlook et laissez AIVANA extraire automatiquement
                                vos confirmations de vols, d&apos;hôtels et d&apos;activités.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/onboarding" className="btn-gold px-8 py-3 w-full sm:w-auto">
                                    Connecter mon email
                                </Link>
                                <button className="flex items-center gap-2 text-sm font-bold text-dark-400 hover:text-dark transition-colors px-6">
                                    <Plus className="w-4 h-4" /> Ajouter manuellement
                                </button>
                            </div>
                        </div>

                        {/* Stats section */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                            {[
                                { label: "Voyages Actifs", val: "0" },
                                { label: "Réservations", val: "0" },
                                { label: "Km Parcourus", val: "0" },
                            ].map((stat) => (
                                <div key={stat.label} className="bg-white p-6 rounded-2xl border border-sand-200">
                                    <p className="text-dark-400 text-xs uppercase tracking-widest font-medium mb-1">{stat.label}</p>
                                    <p className="text-2xl font-bold text-dark">{stat.val}</p>
                                </div>
                            ))}
                        </div>

                        {/* Trips list (empty) */}
                        <h4 className="font-bold text-dark mb-4 px-2">Prochains Voyages</h4>
                        <div className="bg-sand-100/50 border border-dashed border-sand-300 rounded-3xl p-12 text-center text-dark-300 italic text-sm">
                            Aucun voyage prévu pour le moment.
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
