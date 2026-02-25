"use client";

import { useState, useEffect } from "react";
import { Plane, Hotel, Backpack, X, Search, MapPin, Clock } from "lucide-react";
import axios from "axios";

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
                className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-all relative z-10"
            />
            {loading && <span className="absolute right-4 top-3 text-xs text-dark-300 z-20">...</span>}

            {suggestions.length > 0 && (
                <div className="absolute top-14 left-0 right-0 bg-white border border-sand-200 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                    {suggestions.map((s) => (
                        <div
                            key={s.id}
                            onClick={() => {
                                onSelect(s.id, s.name);
                                setSuggestions([]);
                            }}
                            className="p-3 hover:bg-sand-50 cursor-pointer flex items-center justify-between border-b border-sand-100 last:border-0"
                        >
                            <div>
                                <p className="text-sm font-bold text-dark">{s.name}</p>
                                <p className="text-xs text-dark-400">{s.type === 'airport' ? s.airportName : 'Toutes les gares / aéroports'}</p>
                            </div>
                            <span className="bg-sand-100 text-[10px] font-bold px-2 py-1 rounded text-dark-300">{s.id}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function BookingShoppingModal({ tripId, onClose, onAddBooking }: BookingShoppingModalProps) {
    const [activeTab, setActiveTab] = useState<'flight' | 'hotel' | 'activity'>('flight');
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
            start_datetime: new Date().toISOString(), // Mock pour l'instant
            end_datetime: new Date().toISOString(), // Mock
            location: 'Local Center',
            price: activity.price,
            currency: activity.currency,
            status: 'confirmed'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-dark/60 backdrop-blur-md">
            {/* Modal Body */}
            <div className="relative bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-6 border-b border-sand-200 flex items-center justify-between bg-white z-10">
                    <div>
                        <h2 className="text-2xl font-serif text-dark">Ajouter au voyage</h2>
                        <p className="text-sm text-dark-400 mt-1">Recherchez et réservez en temps réel.</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-sand-50 rounded-full flex items-center justify-center text-dark hover:bg-sand-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-sand-50 p-2 gap-2 justify-center border-b border-sand-200">
                    <button onClick={() => { setActiveTab('flight'); setFlights([]); }} className={`flex-1 max-w-[200px] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'flight' ? 'bg-white shadow-sm text-dark' : 'text-dark-300 hover:bg-sand-100'}`}>
                        <Plane className="w-4 h-4" /> Vols
                    </button>
                    <button onClick={() => { setActiveTab('hotel'); setHotels([]); }} className={`flex-1 max-w-[200px] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'hotel' ? 'bg-white shadow-sm text-dark' : 'text-dark-300 hover:bg-sand-100'}`}>
                        <Hotel className="w-4 h-4" /> Hôtels
                    </button>
                    <button onClick={() => { setActiveTab('activity'); setActivities([]); }} className={`flex-1 max-w-[200px] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'activity' ? 'bg-white shadow-sm text-dark' : 'text-dark-300 hover:bg-sand-100'}`}>
                        <Backpack className="w-4 h-4" /> Activités
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-white">

                    {/* Search Panel (Left) */}
                    <div className="w-full lg:w-1/3 bg-sand-50 p-6 border-r border-sand-200 overflow-y-auto">

                        {/* FLIGHTS FORM */}
                        {activeTab === 'flight' && (
                            <form onSubmit={searchFlights} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-2">Départ de</label>
                                    <Autocompleter
                                        value={originKeyword}
                                        onChange={setOriginKeyword}
                                        onSelect={(id: string, name: string) => { setOriginId(id); setOriginKeyword(`${name} (${id})`); }}
                                        placeholder="Ex: Paris (PAR)"
                                    />
                                </div>
                                <div className="text-center">
                                    <div className="inline-block w-8 h-8 rounded-full bg-white border border-sand-200 shadow-sm flex items-center justify-center relative -mx-4 z-20">
                                        <Plane className="w-3 h-3 text-gold rotate-180" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-2">Arrivée à</label>
                                    <Autocompleter
                                        value={destKeyword}
                                        onChange={setDestKeyword}
                                        onSelect={(id: string, name: string) => { setDestId(id); setDestKeyword(`${name} (${id})`); }}
                                        placeholder="Ex: New York (JFK)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-2">Date Aller</label>
                                    <input type="date" required value={flightDate} onChange={(e) => setFlightDate(e.target.value)} className="w-full bg-white border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-all" />
                                </div>
                                <button type="submit" className="w-full btn-gold py-3 mt-4 flex items-center justify-center gap-2" disabled={isSearching}>
                                    {isSearching ? 'Recherche...' : <><Search className="w-4 h-4" /> Rechercher les vols</>}
                                </button>
                            </form>
                        )}

                        {/* HOTELS FORM */}
                        {activeTab === 'hotel' && (
                            <form onSubmit={searchHotels} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-2">Destination (Code)</label>
                                    <Autocompleter
                                        value={cityCode}
                                        onChange={setCityCode}
                                        onSelect={(id: string, name: string) => { setCityCode(id); }}
                                        placeholder="Ex: PAR, NYC, RAK..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-2">Arrivée</label>
                                        <input type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-white border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-2">Départ</label>
                                        <input type="date" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-white border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-all" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full btn-gold py-3 mt-4 flex items-center justify-center gap-2" disabled={isSearching}>
                                    {isSearching ? 'Recherche...' : <><Search className="w-4 h-4" /> Rechercher les hôtels</>}
                                </button>
                            </form>
                        )}

                        {/* ACTIVITIES FORM */}
                        {activeTab === 'activity' && (
                            <form onSubmit={searchActivities} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-2">Ville (Code)</label>
                                    <Autocompleter
                                        value={cityCode}
                                        onChange={setCityCode}
                                        onSelect={(id: string, name: string) => { setCityCode(id); }}
                                        placeholder="Ex: PAR, DXB..."
                                    />
                                </div>
                                <button type="submit" className="w-full btn-gold py-3 mt-4 flex items-center justify-center gap-2" disabled={isSearching}>
                                    {isSearching ? 'Recherche...' : <><Search className="w-4 h-4" /> Voir les expériences</>}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Results Panel (Right) */}
                    <div className="flex-1 p-6 overflow-y-auto bg-sand-50/50">
                        {isSearching ? (
                            <div className="flex flex-col items-center justify-center h-full text-sand-300">
                                <Search className="w-12 h-12 animate-pulse mb-4 opacity-50" />
                                <p className="text-sm font-medium">Recherche sur des centaines de sites...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">

                                {/* Flights Render */}
                                {activeTab === 'flight' && flights.map(f => (
                                    <div key={f.id} className="bg-white rounded-2xl p-5 border border-sand-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-center">
                                        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-sand-50 flex items-center justify-center border border-sand-100 overflow-hidden">
                                            <img src={f.airlineLogo} alt={f.airline} className="w-8 h-8 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        </div>
                                        <div className="flex-1 w-full relative">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-dark uppercase tracking-widest">{f.airline}</span>
                                                <span className="text-[10px] text-dark-400 bg-sand-100 px-2 py-0.5 rounded-full">{f.duration}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="text-center">
                                                    <p className="text-lg font-serif text-dark">{new Date(f.departure.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    <p className="text-xs text-dark-300 font-medium">{f.departure.iata}</p>
                                                </div>
                                                <div className="flex-1 px-4 flex items-center">
                                                    <div className="h-[2px] w-full bg-sand-200 rounded-full relative">
                                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                                                            <Plane className="w-4 h-4 text-gold" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-lg font-serif text-dark">{new Date(f.arrival.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    <p className="text-xs text-dark-300 font-medium">{f.arrival.iata}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 flex flex-col items-center md:items-end md:pl-6 border-t md:border-t-0 md:border-l border-sand-100 pt-4 md:pt-0 w-full md:w-auto mt-4 md:mt-0">
                                            <p className="text-2xl font-serif text-dark mb-3">{f.price} €</p>
                                            <button onClick={() => handleSelectFlight(f)} className="w-full md:w-auto px-6 py-2 bg-dark text-white text-xs font-bold rounded-xl hover:bg-gold transition-colors shadow-lg">
                                                Sélectionner
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Hotels Render */}
                                {activeTab === 'hotel' && hotels.map(h => (
                                    <div key={h.id} className="bg-white rounded-2xl border border-sand-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row overflow-hidden h-auto md:h-48 group">
                                        <div className="md:w-64 h-48 flex-shrink-0 relative overflow-hidden">
                                            <img src={h.image} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 flex items-center gap-1 rounded-lg text-xs font-bold shadow-sm">
                                                ⭐ {h.rating} <span className="text-dark-300 text-[10px] font-normal">({h.reviewsCount})</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 p-5 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-dark">{h.name}</h3>
                                                    <p className="text-xs flex items-center gap-1 text-dark-400 mt-1"><MapPin className="w-3 h-3" /> {h.location}</p>
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/10 px-2 py-1 rounded">
                                                    Via {h.provider}
                                                </span>
                                            </div>

                                            <div className="flex gap-2 mt-auto mb-4 flex-wrap">
                                                {h.amenities.map((am: string, i: number) => (
                                                    <span key={i} className="text-[10px] border border-sand-200 text-dark-400 px-2 py-1 rounded-md">{am}</span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between border-t border-sand-100 pt-3 mt-auto">
                                                <p className="text-xl font-serif text-dark">{h.pricePerNight} € <span className="text-xs font-sans text-dark-300">/nuit</span></p>
                                                <button onClick={() => handleSelectHotel(h)} className="px-5 py-2 btn-gold text-xs shadow-lg shadow-gold/20">
                                                    Réserver
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Activities Render */}
                                {activeTab === 'activity' && activities.map(a => (
                                    <div key={a.id} className="bg-white rounded-2xl border border-sand-200 shadow-sm hover:shadow-md transition-shadow flex overflow-hidden h-32 group">
                                        <div className="w-32 h-32 flex-shrink-0 relative">
                                            <img src={a.image} alt={a.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1 p-4 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-sm font-bold text-dark line-clamp-1">{a.name}</h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-xs flex items-center gap-1 text-dark-400"><Clock className="w-3 h-3" /> {a.duration}</span>
                                                        <span className="text-xs text-orange-400 font-bold">⭐ {a.rating}</span>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-dark-300 font-bold uppercase">{a.provider}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-lg font-serif text-dark">{a.price} €</p>
                                                <button onClick={() => handleSelectActivity(a)} className="px-4 py-1.5 bg-dark text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-gold transition-colors">
                                                    Ajouter
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {!isSearching && flights.length === 0 && hotels.length === 0 && activities.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-10 opacity-70">
                                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                            {activeTab === 'flight' ? <Plane className="w-6 h-6 text-sand-300" /> : activeTab === 'hotel' ? <Hotel className="w-6 h-6 text-sand-300" /> : <Backpack className="w-6 h-6 text-sand-300" />}
                                        </div>
                                        <p className="text-dark-400 text-sm font-medium">Recherchez avec les champs à gauche pour voir les recommandations en temps réel.</p>
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
