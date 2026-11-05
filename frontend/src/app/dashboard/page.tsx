"use client";
// Carnet de voyage : liste des voyages, voyage en cours, paramètres du compte.
// Les morceaux de l'interface sont dans components/dashboard/.
import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Loader2, Plus } from "lucide-react";
import Photo from "@/components/ui/Photo";
import { clearPlan, resumeTrip, savePlan, toast, tripName, usePlan } from "@/lib/plan";
import { createClient } from "@/lib/supabase/browser";
import { useSession } from "@/lib/session";
import type { Booking, Trip } from "@/types/trip";
import { toPlanItem, photoOf } from "@/components/dashboard/helpers";
import Empty from "@/components/dashboard/Empty";
import TripDashboard from "@/components/dashboard/TripDashboard";
import Settings from "@/components/dashboard/Settings";

/* ── page ──────────────────────────────────────────────────────────── */
function DashboardContent() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = usePlan();
  const { user, ready } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [settings, setSettings] = useState(false);
  const [loadingTrip, setLoadingTrip] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    try {
      setTrips((await axios.get<Trip[]>("/api/trips")).data || []);
    } catch {
      setTrips([]);
    }
  }, []);

  useEffect(() => {
    if (user) void fetchTrips();
  }, [user, fetchTrips]);

  // Premier passage après la création du compte : on propose l'onboarding
  useEffect(() => {
    if (!ready || !user || user.onboarded || params.get("save") || params.get("trip")) return;
    if (localStorage.getItem("aivana-onboarded")) return;
    router.push("/onboarding");
  }, [ready, user, params, router]);

  const save = useCallback(async () => {
    if (!user) {
      router.push("/auth/login?next=" + encodeURIComponent("/dashboard?save=1"));
      return;
    }
    setSaving(true);
    try {
      await savePlan();
      toast("Voyage sauvegardé dans votre compte");
      void fetchTrips();
    } catch {
      toast("La sauvegarde a échoué. Réessayez dans un instant.");
    } finally {
      setSaving(false);
    }
  }, [user, router, fetchTrips]);

  // Retour de la connexion avec ?save=1 : on sauvegarde le voyage en cours
  useEffect(() => {
    if (!ready || !user || params.get("save") !== "1") return;
    router.replace("/dashboard");
    if (plan && !plan.tripId) void save();
  }, [ready, user, params]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = async (t: Trip) => {
    if (plan?.tripId === t.id) return;
    if (
      plan &&
      !plan.tripId &&
      plan.items.length &&
      !confirm(`Le voyage « ${plan.destination} » n'est pas sauvegardé. L'abandonner pour ouvrir « ${t.title} » ?`)
    )
      return;
    setLoadingTrip(t.id);
    try {
      const items = (await axios.get<Booking[]>(`/api/trips/${t.id}/items`)).data || [];
      resumeTrip(t, items.map(toPlanItem));
      setSettings(false);
    } finally {
      setLoadingTrip(null);
    }
  };

  useEffect(() => {
    if (params.get("settings") === "1") {
      setSettings(true);
      router.replace("/dashboard");
    }
  }, [params, router]);

  // Lien direct vers un voyage sauvegardé (menu « Mes voyages » de la navbar)
  useEffect(() => {
    const id = params.get("trip");
    if (!id || !trips.length) return;
    const t = trips.find(x => x.id === id);
    router.replace("/dashboard");
    if (t) void open(t);
  }, [params, trips]); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async () => {
    if (!plan || !confirm(`Supprimer le voyage « ${plan.destination} » ?`)) return;
    if (plan.tripId) {
      try {
        await axios.delete(`/api/trips/${plan.tripId}`);
      } catch {
        /* ignoré */
      }
      void fetchTrips();
    }
    clearPlan();
  };

  const logout = async () => {
    await createClient().auth.signOut();
    clearPlan();
    router.push("/");
  };

  const pills = [
    ...(plan && !plan.tripId
      ? [
          {
            id: "draft",
            name: tripName(plan),
            place: plan.destination,
            active: true,
            onClick: () => setSettings(false),
          },
        ]
      : []),
    ...trips.map(t => ({
      id: t.id,
      name: t.name || t.title,
      place: t.title,
      active: plan?.tripId === t.id,
      onClick: () => {
        setSettings(false);
        void open(t);
      },
    })),
  ];

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-4 pb-[120px] pt-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-semibold text-muted">Tableau de bord</span>
          <span className="text-2xl font-extrabold tracking-[-0.03em]">Mes voyages</span>
        </div>
        {user && (
          <div className="flex items-center gap-3 text-sm text-muted-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <span className="hidden sm:inline">{user.name}</span>
            <button onClick={() => setSettings(true)} className="hover:text-ink">
              Paramètres
            </button>
            <button onClick={logout} className="hover:text-danger">
              Déconnexion
            </button>
          </div>
        )}
      </div>

      {/* Sélecteur de voyages */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {pills.map(t => (
          <button
            key={t.id}
            onClick={t.onClick}
            className={`flex shrink-0 items-center gap-2.5 rounded-full border py-1 pl-1 pr-4 text-sm font-bold ${t.active && !settings ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink"}`}
          >
            <Photo k={photoOf(t.place)} sizes="32px" className="h-8 w-8 rounded-full" />
            {t.name}
            {loadingTrip === t.id && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
          </button>
        ))}
        <Link
          href="/assistant"
          className="plain-link flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-dashed border-line-2 px-4 text-sm font-bold !text-muted-2 hover:border-ink hover:!text-ink"
        >
          <Plus className="h-4 w-4" aria-hidden /> Nouveau voyage
        </Link>
      </div>

      {settings && user ? (
        <Settings name={user.name} email={user.email} onLogout={logout} onClose={() => setSettings(false)} />
      ) : !plan ? (
        <Empty loggedIn={!!user} />
      ) : (
        <TripDashboard
          plan={plan}
          editing={editing}
          setEditing={setEditing}
          saving={saving}
          onSave={save}
          onRemove={remove}
          loggedIn={!!user}
        />
      )}

      {!user && (
        <p className="m-0 text-[13px] text-muted">
          Vos voyages restent dans ce navigateur tant que vous n&apos;êtes pas connecté.{" "}
          <Link href="/auth/login?next=/dashboard">Se connecter</Link>
        </p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
