"use client";

import { useState, useEffect } from "react";
import { Plane, Hotel, Backpack, X, Search, MapPin, Clock, Mail, Star } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

export interface BookingData {
    type: 'flight' | 'hotel' | 'activity' | 'transport';
    title: string;
    provider?: string;
    confirmation_number?: string;
    start_datetime: string;
    end_datetime: string;
    location?: string;
    price: number;
    currency: string;
    status: string;
}

interface BookingShoppingModalProps {
    tripId: string;
    onClose: () => void;
    onAddBooking: (booking: BookingData) => void;
}

// Composant Autocomplete
const Autocompleter = ({ value, onChange, placeholder, onSelect }: any) => {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (value.length < 3) {
            setSuggestions([]);
            return;
        }
        const delay = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/search/locations?keyword=${value}`);
                setSuggestions(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(delay);
    }, [value]);

    return (
        <div className="relative">
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-sm text-white focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/5 transition-all relative z-10"
            />
            {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
                    <div className="w-4 h-4 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
                </div>
            )}

            {suggestions.length > 0 && (
                <div className="absolute top-16 left-0 right-0 bg-[#1A1F2B] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto backdrop-blur-xl">
                    {suggestions.map((s) => (
                        <div
                            key={s.id}
                            onClick={() => {
                                onSelect(s.id, s.name);
                                setSuggestions([]);
                            }}
                            className="p-4 hover:bg-white/5 cursor-pointer flex items-center justify-between border-b border-white/5 last:border-0 transition-colors group"
                        >
                            <div>
                                <p className="text-sm font-bold text-white group-hover:text-gold transition-colors">{s.name}</p>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{s.type === 'airport' ? s.airportName : 'Gare / Aéroport'}</p>
                            </div>
                            <span className="bg-white/5 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md text-white/30 border border-white/5">{s.id}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function BookingShoppingModal({ tripId, onClose, onAddBooking }: BookingShoppingModalProps) {
    const [activeTab, setActiveTab] = useState<'flight' | 'hotel' | 'activity' | 'email'>('flight');
    const [isSearching, setIsSearching] = useState(false);

    // Flight Form
    const [originKeyword, setOriginKeyword] = useState("");
    const [originId, setOriginId] = useState("");
    const [destKeyword, setDestKeyword] = useState("");
    const [destId, setDestId] = useState("");
    const [flightDate, setFlightDate] = useState("");
    const [flights, setFlights] = useState<any[]>([]);

    // Hotel Form
    const [cityCode, setCityCode] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [hotels, setHotels] = useState<any[]>([]);

    // Activity Form
    const [activities, setActivities] = useState<any[]>([]);

    // Email Form
    const [emailText, setEmailText] = useState("");
    const [emailResult, setEmailResult] = useState<any>(null);

    const searchFlights = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        try {
            const res = await axios.get(`/api/search/flights?origin=${originId || originKeyword}&destination=${destId || destKeyword}&date=${flightDate}`);
            setFlights(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const searchHotels = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        try {
            const res = await axios.get(`/api/search/hotels?cityCode=${cityCode || destId || 'PAR'}&checkIn=${checkIn}&checkOut=${checkOut}`);
            setHotels(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const searchActivities = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        try {
            const res = await axios.get(`/api/search/activities?cityCode=${cityCode || destId || 'PAR'}`);
            setActivities(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const parseEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        setEmailResult(null);
        try {
            const res = await axios.post(`/api/ai/extract`, { emailBody: emailText });
            if (res.data && res.data.booking) {
                setEmailResult(res.data.booking);
            } else {
                throw new Error("Format Invalide");
            }
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'analyse de l'email.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectFlight = (flight: any) => {
        onAddBooking({
            type: 'flight',
            title: `Vol ${flight.flightNumber} ${flight.departure.iata} ➔ ${flight.arrival.iata}`,
            provider: flight.airline,
            start_datetime: flight.departure.time,
            end_datetime: flight.arrival.time,
            location: flight.arrival.iata,
            price: flight.price,
            currency: flight.currency,
            status: 'confirmed'
        });
    };

    const handleSelectHotel = (hotel: any) => {
        onAddBooking({
            type: 'hotel',
            title: hotel.name,
            provider: hotel.provider,
            start_datetime: `${checkIn}T14:00:00Z`,
            end_datetime: `${checkOut}T11:00:00Z`,
            location: hotel.location,
            price: hotel.pricePerNight, // simplifé
            currency: hotel.currency,
            status: 'confirmed'
        });
    };

    const handleSelectActivity = (activity: any) => {
        onAddBooking({
            type: 'activity',
            title: activity.name,
            provider: activity.provider,
            start_datetime: new Date().toISOString(), // Placeholder
            end_datetime: new Date(Date.now() + 3 * 3600000).toISOString(), // +3 hours
            location: cityCode || destId || 'Centre-Ville',
            price: activity.price,
            currency: activity.currency,
            status: 'pending',
            external_reference: activity.id,
            booking_url: activity.bookingUrl,
            raw_data: {
                activity_name: activity.name,
                duration_minutes: parseInt(activity.duration) * 60 || 180,
                meeting_point: "Billeterie Principale",
                description: activity.description,
                image_url: activity.image
            }
        } as any);
    };

    const handleSelectEmailBooking = () => {
        if (!emailResult) return;
        onAddBooking({
            type: emailResult.type || 'flight',
            title: emailResult.title || 'Réservation Importée',
            provider: emailResult.provider || 'Inconnu',
            start_datetime: emailResult.start_datetime ? new Date(emailResult.start_datetime).toISOString() : new Date().toISOString(),
            end_datetime: emailResult.end_datetime ? new Date(emailResult.end_datetime).toISOString() : new Date().toISOString(),
            location: emailResult.location || 'Inconnu',
            price: emailResult.price || 0,
            currency: emailResult.currency || 'EUR',
            status: 'confirmed',
            external_reference: emailResult.confirmation_number || null,
            raw_data: emailResult
        } as any);
        setEmailResult(null);
        setEmailText("");
        onClose(); // Optional: close modal since it's a direct import
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0A0D14]/90 backdrop-blur-xl">
            {/* Modal Body */}
            <div className="relative bg-[#141822] w-full max-w-5xl h-[85vh] rounded-[40px] shadow-2xl border border-white/5 overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 scale-100 opacity-100">

                <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#141822]/80 backdrop-blur-md z-20">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-serif text-white tracking-tight">Ajouter au voyage</h2>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">IA Predictive Search & Live Booking</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5 active:scale-90">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-[#0A0D14]/40 p-3 gap-3 justify-center border-b border-white/5 z-20">
                    <button onClick={() => { setActiveTab('flight'); setFlights([]); }} className={`flex-1 max-w-[200px] flex items-center justify-center gap-3 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'flight' ? 'bg-gold text-dark shadow-xl shadow-gold/10 scale-105' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
                        <Plane className="w-4 h-4" /> Vols
                    </button>
                    <button onClick={() => { setActiveTab('hotel'); setHotels([]); }} className={`flex-1 max-w-[200px] flex items-center justify-center gap-3 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'hotel' ? 'bg-gold text-dark shadow-xl shadow-gold/10 scale-105' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
                        <Hotel className="w-4 h-4" /> Hôtels
                    </button>
                    <button onClick={() => { setActiveTab('activity'); setActivities([]); }} className={`flex-1 max-w-[200px] flex items-center justify-center gap-3 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'activity' ? 'bg-gold text-dark shadow-xl shadow-gold/10 scale-105' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
                        <Backpack className="w-4 h-4" /> Activités
                    </button>
                    <button onClick={() => { setActiveTab('email'); setEmailResult(null); }} className={`flex-1 max-w-[200px] flex items-center justify-center gap-3 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'email' ? 'bg-gold text-dark shadow-xl shadow-gold/10 scale-105' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
                        <Mail className="w-4 h-4" /> Import IA
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#0A0D14]/20 z-10">

                    {/* Search Panel (Left) */}
                    <div className="w-full lg:w-1/3 bg-[#141822]/40 p-8 border-r border-white/5 overflow-y-auto custom-scrollbar">

                        {/* FLIGHTS FORM */}
                        {activeTab === 'flight' && (
                            <form onSubmit={searchFlights} className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="space-y-6">
                                    <div className="relative">
                                        <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Départ de</label>
                                        <Autocompleter
                                            value={originKeyword}
                                            onChange={setOriginKeyword}
                                            onSelect={(id: string, name: string) => { setOriginId(id); setOriginKeyword(`${name} (${id})`); }}
                                            placeholder="Ex: Paris (PAR)"
                                        />
                                    </div>
                                    <div className="flex justify-center -my-3">
                                        <div className="w-10 h-10 rounded-2xl bg-[#141822] border border-white/10 shadow-2xl flex items-center justify-center relative z-20 transform hover:rotate-180 transition-transform duration-500">
                                            <Plane className="w-4 h-4 text-gold rotate-90" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Arrivée à</label>
                                        <Autocompleter
                                            value={destKeyword}
                                            onChange={setDestKeyword}
                                            onSelect={(id: string, name: string) => { setDestId(id); setDestKeyword(`${name} (${id})`); }}
                                            placeholder="Ex: New York (JFK)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Date du Vol</label>
                                        <input type="date" required value={flightDate} onChange={(e) => setFlightDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-gold transition-all" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full btn-gold py-4 mt-8 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-gold/20 active:scale-95 transition-all" disabled={isSearching}>
                                    {isSearching ? <div className="w-5 h-5 border-2 border-dark/20 border-t-dark rounded-full animate-spin" /> : <><Search className="w-4 h-4" /> Scanner les Vols</>}
                                </button>
                            </form>
                        )}

                        {/* HOTELS FORM */}
                        {activeTab === 'hotel' && (
                            <form onSubmit={searchHotels} className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Destination</label>
                                        <Autocompleter
                                            value={cityCode}
                                            onChange={setCityCode}
                                            onSelect={(id: string, name: string) => { setCityCode(id); }}
                                            placeholder="Ex: Tokyo, Rome..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Check-in</label>
                                            <input type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xs text-white focus:outline-none focus:border-gold transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Check-out</label>
                                            <input type="date" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xs text-white focus:outline-none focus:border-gold transition-all" />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="w-full btn-gold py-4 mt-8 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-gold/20 active:scale-95 transition-all" disabled={isSearching}>
                                    {isSearching ? <div className="w-5 h-5 border-2 border-dark/20 border-t-dark rounded-full animate-spin" /> : <><Search className="w-4 h-4" /> Chercher Hôtels</>}
                                </button>
                            </form>
                        )}

                        {/* ACTIVITIES FORM */}
                        {activeTab === 'activity' && (
                            <form onSubmit={searchActivities} className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Ville ou Lieu</label>
                                    <Autocompleter
                                        value={cityCode}
                                        onChange={setCityCode}
                                        onSelect={(id: string, name: string) => { setCityCode(id); }}
                                        placeholder="Ex: Paris, Londres..."
                                    />
                                </div>
                                <button type="submit" className="w-full btn-gold py-4 mt-8 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-gold/20 active:scale-95 transition-all" disabled={isSearching}>
                                    {isSearching ? <div className="w-5 h-5 border-2 border-dark/20 border-t-dark rounded-full animate-spin" /> : <><Search className="w-4 h-4" /> Découvrir</>}
                                </button>
                            </form>
                        )}

                        {/* EMAIL FORM */}
                        {activeTab === 'email' && (
                            <form onSubmit={parseEmail} className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Analyse IA de Confirmation</label>
                                    <div className="relative group">
                                        <textarea
                                            required
                                            value={emailText}
                                            onChange={(e) => setEmailText(e.target.value)}
                                            placeholder="Collez ici le contenu de votre email de réservation. Notre IA extraira automatiquement les détails."
                                            className="w-full h-64 bg-white/5 border border-white/10 rounded-[28px] px-6 py-6 text-sm text-white focus:outline-none focus:border-gold transition-all resize-none font-medium leading-relaxed group-hover:bg-white/[0.07]"
                                        ></textarea>
                                        <div className="absolute bottom-4 right-6 text-[8px] text-white/20 font-black uppercase tracking-widest">IA Engine Active</div>
                                    </div>
                                </div>
                                <button type="submit" className="w-full btn-gold py-4 mt-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-gold/20 active:scale-95 transition-all" disabled={isSearching || emailText.length < 20}>
                                    {isSearching ? <div className="w-5 h-5 border-2 border-dark/20 border-t-dark rounded-full animate-spin" /> : <><Mail className="w-4 h-4" /> Analyser par l'IA</>}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Results Panel (Right) */}
                    <div className="flex-1 p-8 overflow-y-auto bg-[#0A0D14]/40 custom-scrollbar">
                        {isSearching ? (
                            <div className="flex flex-col items-center justify-center h-full text-white/20">
                                <div className="w-24 h-24 bg-gold/5 rounded-[32px] border border-gold/10 flex items-center justify-center mb-8 relative">
                                    <Search className="w-10 h-10 text-gold/40 animate-pulse" />
                                    <div className="absolute inset-0 border-2 border-gold/20 border-t-gold rounded-[32px] animate-spin-slow" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Scan en cours...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">

                                {/* Flights Render */}
                                {activeTab === 'flight' && flights.map((f, idx) => (
                                    <motion.div
                                        key={f.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-[#141822] rounded-[28px] p-6 border border-white/5 hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/5 transition-all duration-500 group flex flex-col"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-[#0A0D14] flex items-center justify-center border border-white/10 group-hover:border-gold/30 transition-colors">
                                                    <img src={f.airlineLogo} alt={f.airline} className="w-7 h-7 object-contain grayscale group-hover:grayscale-0 transition-all" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">{f.airline}</p>
                                                    <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">{f.flightNumber}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-serif text-white">{f.price}€</p>
                                                <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Meilleur Prix</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mb-8 px-2">
                                            <div className="text-center">
                                                <p className="text-xl font-serif text-white">{new Date(f.departure.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                <p className="text-[10px] text-white/30 font-black mt-1">{f.departure.iata}</p>
                                            </div>
                                            <div className="flex-1 px-4 flex flex-col items-center gap-1">
                                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{f.duration}</p>
                                                <div className="h-[1px] w-full bg-white/10 relative">
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#141822] px-2 text-gold group-hover:scale-125 transition-transform">
                                                        <Plane className="w-3 h-3" />
                                                    </div>
                                                </div>
                                                <p className="text-[8px] font-black text-emerald-400/60 uppercase tracking-widest">Direct</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xl font-serif text-white">{new Date(f.arrival.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                <p className="text-[10px] text-white/30 font-black mt-1">{f.arrival.iata}</p>
                                            </div>
                                        </div>

                                        <button onClick={() => handleSelectFlight(f)} className="w-full py-3 rounded-2xl bg-white/5 border border-white/5 text-[9px] font-black text-white/40 uppercase tracking-widest group-hover:bg-gold group-hover:text-dark group-hover:border-gold transition-all duration-500">
                                            Choisir ce vol
                                        </button>
                                    </motion.div>
                                ))}

                                {/* Hotels Render */}
                                {activeTab === 'hotel' && hotels.map((h, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-[#141822] rounded-[32px] border border-white/5 overflow-hidden hover:border-gold/30 transition-all duration-500 group flex flex-col shadow-xl"
                                    >
                                        <div className="h-44 relative overflow-hidden">
                                            <img src={h.image} alt={h.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                            <div className="absolute top-4 left-4 bg-[#0A0D14]/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-white border border-white/10 shadow-2xl flex items-center gap-2">
                                                <Star className="w-3 h-3 text-gold fill-gold" /> {h.rating} <span className="text-white/30 font-medium">({h.reviewsCount})</span>
                                            </div>
                                            <div className="absolute bottom-4 right-4 bg-gold text-dark px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl">
                                                Special Deal
                                            </div>
                                        </div>
                                        <div className="p-6 flex flex-col flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-serif text-white line-clamp-1 group-hover:text-gold transition-colors">{h.name}</h3>
                                                    <p className="text-[10px] flex items-center gap-1.5 text-white/40 font-black uppercase tracking-widest"><MapPin className="w-3 h-3 text-gold/60" /> {h.location}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-8">
                                                {h.amenities?.slice(0, 3).map((am: string, i: number) => (
                                                    <span key={i} className="text-[8px] font-black uppercase tracking-widest bg-white/5 text-white/30 px-2 py-1 rounded-md border border-white/5">{am}</span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                                                <div className="flex flex-col">
                                                    <p className="text-xl font-serif text-white">{h.pricePerNight}€</p>
                                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Par nuit</p>
                                                </div>
                                                <button onClick={() => handleSelectHotel(h)} className="px-6 py-3 btn-gold text-[9px] font-black uppercase tracking-widest shadow-xl shadow-gold/10">
                                                    S'installer
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* IA Email Result Render */}
                                {activeTab === 'email' && emailResult && (
                                    <div className="col-span-full animate-in zoom-in-95 duration-500">
                                        <div className="bg-gradient-to-br from-[#1A1F2B] to-[#141822] rounded-[40px] border border-gold/20 shadow-[0_0_50px_rgba(201,168,76,0.1)] p-10 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 blur-[80px] rounded-full pointer-events-none" />

                                            <div className="flex items-center gap-6 mb-10 relative z-10">
                                                <div className="w-20 h-20 bg-gold/20 rounded-[28px] flex items-center justify-center border border-gold/30 shadow-2xl">
                                                    <Mail className="w-10 h-10 text-gold" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em] mb-2">IA Extraction v2.0</p>
                                                    <h3 className="text-3xl font-serif text-white tracking-tight">{emailResult.title || 'Réservation Identifiée'}</h3>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative z-10">
                                                <div className="bg-white/5 p-5 rounded-[24px] border border-white/5 group-hover:bg-white/10 transition-colors">
                                                    <p className="text-[9px] font-black uppercase text-white/30 mb-2 tracking-widest">Prestataire</p>
                                                    <p className="text-sm font-black text-white uppercase">{emailResult.provider || 'Inconnu'}</p>
                                                </div>
                                                <div className="bg-white/5 p-5 rounded-[24px] border border-white/5 group-hover:bg-white/10 transition-colors">
                                                    <p className="text-[9px] font-black uppercase text-white/30 mb-2 tracking-widest">Type Voyage</p>
                                                    <p className="text-sm font-black text-white uppercase">{emailResult.type || 'Non défini'}</p>
                                                </div>
                                                <div className="bg-white/5 p-5 rounded-[24px] border border-white/5 group-hover:bg-white/10 transition-colors">
                                                    <p className="text-[9px] font-black uppercase text-white/30 mb-2 tracking-widest">Départ</p>
                                                    <p className="text-sm font-bold text-white">{emailResult.start_datetime ? new Date(emailResult.start_datetime).toLocaleDateString() : 'A définir'}</p>
                                                </div>
                                                <div className="bg-white/5 p-5 rounded-[24px] border border-white/5 group-hover:bg-white/10 transition-colors">
                                                    <p className="text-[9px] font-black uppercase text-white/30 mb-2 tracking-widest">Prix IA Est.</p>
                                                    <p className="text-sm font-serif text-gold">{emailResult.price || 0} {emailResult.currency || 'EUR'}</p>
                                                </div>
                                            </div>

                                            <button onClick={handleSelectEmailBooking} className="w-full btn-gold py-5 text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-gold/20 active:scale-[0.98] transition-all relative z-10">
                                                Importer dans mon itinéraire
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Activities Render */}
                                {activeTab === 'activity' && activities.map((a, idx) => (
                                    <motion.div
                                        key={a.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-[#141822] rounded-[28px] border border-white/5 overflow-hidden hover:border-gold/30 transition-all duration-500 group flex items-stretch h-32"
                                    >
                                        <div className="w-32 flex-shrink-0 relative overflow-hidden">
                                            <img src={a.image} alt={a.name} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#141822] z-10" />
                                        </div>
                                        <div className="flex-1 p-5 flex flex-col justify-between relative z-20">
                                            <div className="flex justify-between items-start">
                                                <div className="max-w-[70%]">
                                                    <h3 className="text-xs font-black text-white uppercase tracking-tight line-clamp-1 group-hover:text-gold transition-colors">{a.name}</h3>
                                                    <p className="text-[9px] text-white/30 uppercase font-black mt-1 flex items-center gap-2"><Clock className="w-3 h-3 text-gold/60" /> {a.duration}</p>
                                                </div>
                                                <span className="text-[10px] text-gold font-bold">⭐ {a.rating}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xl font-serif text-white">{a.price}€</p>
                                                <button onClick={() => handleSelectActivity(a)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-white/60 hover:bg-gold hover:text-dark hover:border-gold transition-all duration-300">
                                                    Ajouter
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {!isSearching && flights.length === 0 && hotels.length === 0 && activities.length === 0 && (
                                    <div className="col-span-full h-80 flex flex-col items-center justify-center text-center p-10">
                                        <div className="w-20 h-20 bg-white/5 rounded-[28px] border border-white/5 flex items-center justify-center mb-6 text-white/20 group animate-float">
                                            {activeTab === 'flight' ? <Plane className="w-8 h-8" /> : activeTab === 'hotel' ? <Hotel className="w-8 h-8" /> : <Backpack className="w-8 h-8" />}
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 max-w-sm leading-relaxed">Entrez vos critères à gauche pour lancer la recherche prédictive.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
