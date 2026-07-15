"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Check, Loader2, MapPin, ChevronRight, Plane, Hotel, Compass } from "lucide-react";
import axios from "axios";
import { createClient } from "@/lib/supabase/browser";
import type { Trip } from "@/types/trip";

interface ItemPayload {
  title: string;
  type: "flight" | "hotel" | "activity" | "transport";
  provider?: string;
  price_estimate?: number;
  external_url?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: ItemPayload;
}

const typeIcon = {
  flight: <Plane className="w-4 h-4" />,
  hotel: <Hotel className="w-4 h-4" />,
  activity: <Compass className="w-4 h-4" />,
  transport: <Plane className="w-4 h-4" />,
};

const typeLabel = {
  flight: "Vol",
  hotel: "Hôtel",
  activity: "Activité",
  transport: "Transport",
};

export default function AddToTripModal({ isOpen, onClose, item }: Props) {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newTripName, setNewTripName] = useState("");
  const [creatingLoading, setCreatingLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const check = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        onClose();
        router.push("/auth/login");
        return;
      }
      fetchTrips();
    };
    check();
  }, [isOpen]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Trip[]>("/api/trips");
      setTrips(res.data || []);
      if ((res.data || []).length === 0) setShowCreateForm(true);
    } catch {
      setTrips([]);
      setShowCreateForm(true);
    } finally {
      setLoading(false);
    }
  };

  const addToTrip = async (tripId: string, tripTitle: string) => {
    setAdding(tripId);
    try {
      await axios.post(`/api/trips/${tripId}/items`, {
        title: item.title,
        type: item.type,
        provider: item.provider,
        price_estimate: item.price_estimate,
        external_url: item.external_url,
      });
      setSuccess(tripTitle);
      window.dispatchEvent(new CustomEvent("bookings-updated", { detail: { tripId } }));
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);
    } catch {
      alert("Erreur lors de l'ajout. Réessayez.");
    } finally {
      setAdding(null);
    }
  };

  const createAndAdd = async () => {
    if (!newTripName.trim()) return;
    setCreatingLoading(true);
    try {
      const res = await axios.post<Trip>("/api/trips", { title: newTripName.trim() });
      const newTrip = res.data;
      await addToTrip(newTrip.id, newTrip.title);
    } catch {
      alert("Erreur lors de la création du voyage.");
    } finally {
      setCreatingLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="modal-box pointer-events-auto w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="modal-item-badge">
              <span className="modal-type-icon">{typeIcon[item.type]}</span>
              <span className="modal-type-label">{typeLabel[item.type]}</span>
            </div>
            <button onClick={onClose} className="modal-close-btn">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="modal-item-title">{item.title}</div>
          {item.price_estimate && (
            <div className="modal-item-price">{item.price_estimate}€</div>
          )}

          <div className="modal-divider" />

          {/* Success state */}
          {success ? (
            <div className="modal-success">
              <div className="modal-success-icon">
                <Check className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="modal-success-title">Ajouté avec succès !</p>
              <p className="modal-success-sub">
                Ajouté à <strong>{success}</strong>
              </p>
              <button
                onClick={() => { onClose(); router.push("/dashboard"); }}
                className="modal-goto-dashboard"
              >
                Voir dans le dashboard <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : loading ? (
            <div className="modal-loading">
              <Loader2 className="w-5 h-5 animate-spin text-gold" />
              <span>Chargement de vos voyages…</span>
            </div>
          ) : (
            <div className="modal-body">
              <p className="modal-section-label">Ajouter à un voyage</p>

              {/* Existing trips */}
              {!showCreateForm && trips.length > 0 && (
                <div className="modal-trips-list">
                  {trips.map((trip) => (
                    <button
                      key={trip.id}
                      onClick={() => addToTrip(trip.id, trip.title)}
                      disabled={!!adding}
                      className="modal-trip-row"
                    >
                      <div className="modal-trip-icon">
                        <MapPin className="w-3.5 h-3.5 text-gold" />
                      </div>
                      <div className="modal-trip-info">
                        <span className="modal-trip-name">{trip.title}</span>
                        {trip.destination_name && (
                          <span className="modal-trip-dest">{trip.destination_name}</span>
                        )}
                      </div>
                      {adding === trip.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gold flex-shrink-0" />
                      ) : (
                        <Plus className="w-4 h-4 text-gold opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
                      )}
                    </button>
                  ))}

                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="modal-create-btn-outline"
                  >
                    <Plus className="w-4 h-4" />
                    Créer un nouveau voyage
                  </button>
                </div>
              )}

              {/* Create form */}
              {showCreateForm && (
                <div className="modal-create-form">
                  {trips.length > 0 && (
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="modal-back-btn"
                    >
                      ← Choisir un voyage existant
                    </button>
                  )}
                  <p className="modal-create-label">Nom du nouveau voyage</p>
                  <input
                    autoFocus
                    type="text"
                    value={newTripName}
                    onChange={(e) => setNewTripName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && createAndAdd()}
                    placeholder="Ex : Vacances Tokyo 2025"
                    className="modal-input"
                  />
                  <button
                    onClick={createAndAdd}
                    disabled={!newTripName.trim() || creatingLoading}
                    className="modal-create-btn-primary"
                  >
                    {creatingLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Créer et ajouter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .modal-box {
          background: var(--bg-secondary);
          border: 1px solid rgba(197,160,89,0.2);
          border-radius: 20px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(197,160,89,0.08);
          padding: 24px;
          animation: modal-in 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-header {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
        }
        .modal-item-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(197,160,89,0.12);
          border: 1px solid rgba(197,160,89,0.25);
          border-radius: 999px;
          padding: 4px 12px;
          color: #C5A059;
          font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
        }
        .modal-type-icon { display: flex; align-items: center; }
        .modal-close-btn {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-primary); border: 1px solid var(--border-color);
          color: var(--text-muted); cursor: pointer; transition: all 0.2s;
        }
        .modal-close-btn:hover { color: var(--text-primary); border-color: var(--text-muted); }
        .modal-item-title {
          font-size: 15px; font-weight: 700; color: var(--text-primary); line-height: 1.4; margin-bottom: 4px;
        }
        .modal-item-price {
          font-size: 13px; color: #C5A059; font-weight: 600; margin-bottom: 4px;
        }
        .modal-divider {
          height: 1px; background: var(--border-color); margin: 16px 0;
        }
        .modal-loading {
          display: flex; align-items: center; gap: 10px;
          color: var(--text-muted); font-size: 13px; padding: 12px 0;
        }
        .modal-section-label {
          font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em;
          color: var(--text-muted); margin-bottom: 12px;
        }
        .modal-trips-list { display: flex; flex-direction: column; gap: 8px; }
        .modal-trip-row {
          display: flex; align-items: center; gap: 12px;
          width: 100%; padding: 12px 14px; border-radius: 12px;
          background: var(--bg-primary); border: 1px solid var(--border-color);
          cursor: pointer; transition: all 0.2s; text-align: left;
        }
        .modal-trip-row:hover {
          border-color: rgba(197,160,89,0.4);
          background: rgba(197,160,89,0.04);
        }
        .modal-trip-row:hover .modal-trip-icon { background: rgba(197,160,89,0.15); }
        .modal-trip-icon {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(197,160,89,0.08); transition: background 0.2s;
        }
        .modal-trip-info { flex: 1; min-width: 0; }
        .modal-trip-name {
          display: block; font-size: 13px; font-weight: 600; color: var(--text-primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .modal-trip-dest {
          display: block; font-size: 11px; color: var(--text-muted); margin-top: 1px;
        }
        .modal-create-btn-outline {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 11px; border-radius: 12px;
          border: 1px dashed rgba(197,160,89,0.35); background: transparent;
          color: #C5A059; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; margin-top: 4px;
        }
        .modal-create-btn-outline:hover { background: rgba(197,160,89,0.06); border-style: solid; }
        .modal-create-form { display: flex; flex-direction: column; gap: 10px; }
        .modal-back-btn {
          font-size: 12px; color: var(--text-muted); cursor: pointer;
          background: none; border: none; text-align: left; padding: 0;
          transition: color 0.2s;
        }
        .modal-back-btn:hover { color: var(--text-primary); }
        .modal-create-label {
          font-size: 12px; font-weight: 600; color: var(--text-primary);
        }
        .modal-input {
          width: 100%; padding: 11px 14px; border-radius: 10px;
          background: var(--bg-primary); border: 1px solid var(--border-color);
          color: var(--text-primary); font-size: 13px; outline: none; transition: all 0.2s;
        }
        .modal-input:focus { border-color: rgba(197,160,89,0.6); box-shadow: 0 0 0 3px rgba(197,160,89,0.08); }
        .modal-input::placeholder { color: var(--text-muted); }
        .modal-create-btn-primary {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 12px; border-radius: 10px;
          background: linear-gradient(135deg, #C5A059, #d4b070);
          color: #0a1128; font-size: 13px; font-weight: 800;
          border: none; cursor: pointer; transition: all 0.2s;
        }
        .modal-create-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(197,160,89,0.35); }
        .modal-create-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .modal-success {
          display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px 0 8px;
        }
        .modal-success-icon {
          width: 52px; height: 52px; border-radius: 50%;
          background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.3);
          display: flex; align-items: center; justify-content: center;
          animation: success-pop 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes success-pop { from { transform: scale(0); } to { transform: scale(1); } }
        .modal-success-title { font-size: 16px; font-weight: 700; color: var(--text-primary); }
        .modal-success-sub { font-size: 13px; color: var(--text-muted); }
        .modal-goto-dashboard {
          display: inline-flex; align-items: center; gap: 6px; margin-top: 8px;
          padding: 10px 20px; border-radius: 10px;
          background: rgba(197,160,89,0.12); border: 1px solid rgba(197,160,89,0.25);
          color: #C5A059; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .modal-goto-dashboard:hover { background: rgba(197,160,89,0.2); }
      `}</style>
    </>
  );
}
