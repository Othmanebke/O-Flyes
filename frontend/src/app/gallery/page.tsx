"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Maximize2, Plane, X, MapPin } from "lucide-react";

// Add country and location to photos for the modal
const photos = [
  { id: 1, src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=90", alt: "Montagne enneigée", location: "Aoraki / Mount Cook", country: "Nouvelle-Zélande", height: "h-[60vh] md:h-[80vh]", span: "md:col-span-2" },
  { id: 2, src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80", alt: "Dunes de sable", location: "Désert de Namib", country: "Namibie", height: "h-[40vh]", span: "" },
  { id: 3, src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80", alt: "Route de voyage", location: "Death Valley", country: "États-Unis", height: "h-[40vh]", span: "" },
  { id: 4, src: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80", alt: "Santorini Oia", location: "Santonin", country: "Grèce", height: "h-[50vh]", span: "" },
  { id: 5, src: "https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=800&q=80", alt: "Aurores boréales", location: "Tromsø", country: "Norvège", height: "h-[50vh]", span: "" },
  { id: 6, src: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1200&q=90", alt: "Médina Marrakech", location: "Marrakech", country: "Maroc", height: "h-[60vh]", span: "md:col-span-2" },
  { id: 7, src: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&q=80", alt: "Temple Japon", location: "Kyoto", country: "Japon", height: "h-[45vh]", span: "" },
  { id: 8, src: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80", alt: "Voyageur", location: "Machu Picchu", country: "Pérou", height: "h-[45vh]", span: "" },
  { id: 9, src: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80", alt: "Ciel étoilé", location: "Atacama", country: "Chili", height: "h-[40vh]", span: "" },
];

export default function GalleryPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<typeof photos[0] | null>(null);

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden -mt-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Decorative planes */}
      <div className="absolute top-40 left-12 opacity-[0.03] rotate-[-30deg] pointer-events-none">
        <Plane className="w-32 h-32 text-white" />
      </div>
      <div className="absolute top-[60vh] right-12 opacity-[0.02] rotate-[45deg] pointer-events-none">
        <Plane className="w-48 h-48 text-white" />
      </div>
      <div className="absolute bottom-[20vh] left-10 opacity-[0.04] rotate-[15deg] pointer-events-none z-0">
        <Plane className="w-64 h-64 text-white" />
      </div>

      {/* ═══ HERO IMAGE ════════════════════════════════════════════════════════════ */}
      <div className="relative min-h-[580px] md:min-h-[70vh] overflow-hidden mb-16">
        <div className="absolute inset-0">
          <img
            src="https://plus.unsplash.com/premium_photo-1697730034915-1a8b88f57257?q=80&w=1814&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Coucher de soleil majestueux sur le désert (4K)"
            className="w-full h-full object-cover"
          />
          {/* Enhanced overlay: Darker transition to protect the text areas */}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0D14]/80 via-[#0A0D14]/50 to-[#0A0D14]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 pt-40 pb-0">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <Plane className="w-3.5 h-3.5 text-gold" />
            <span className="text-white text-xs font-medium tracking-wide">AIVANA Vision</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white leading-tight mb-4 max-w-2xl drop-shadow-xl">
            L'Évasion<br /><span className="italic text-gold">en images.</span>
          </h1>
          <p className="text-white text-sm md:text-base max-w-lg mb-8 font-bold leading-relaxed drop-shadow-md">
            Une curation d'images saisissantes pour inspirer vos prochains voyages. La beauté du monde se trouve dans les détails.
          </p>
          <div className="flex flex-wrap gap-4 md:gap-8 pb-24 md:pb-32">
            {[
              { v: "15k+", l: "Photos" },
              { v: "120", l: "Destinations" },
              { v: "100%", l: "Inspiration" }
            ].map(s => (
              <div key={s.l}>
                <p className="text-xl md:text-3xl font-bold text-gold drop-shadow-sm">{s.v}</p>
                <p className="text-white/50 text-[10px] uppercase tracking-widest font-black">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editorial Header */}
      <div className="pt-12 pb-16 px-6 md:px-12 max-w-[1400px] mx-auto z-10 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-12">
          <div className="max-w-2xl">
            <p className="text-gold uppercase tracking-[0.3em] text-xs font-bold mb-6 flex items-center gap-4">
              <span className="w-12 h-px bg-gold"></span> L'Œil AIVANA
            </p>
            <h2 className="font-serif text-3xl md:text-6xl text-white leading-[1.1] tracking-tight">
              Instants<br />
              <span className="italic text-white/60">Mémorables.</span>
            </h2>
          </div>
          <p className="text-white/60 text-sm md:text-base max-w-sm md:text-right font-medium leading-relaxed">
            Cliquez sur une image pour en découvrir le lieu et l'afficher en format majestueux. Laissez-vous porter.
          </p>
        </div>
      </div>

      {/* Asymmetrical Gallery Grid */}
      <div className="px-4 md:px-8 max-w-[1600px] mx-auto z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className={`relative overflow-hidden rounded-xl border border-white/5 group cursor-pointer ${photo.span} ${photo.height}`}
            >
              {/* Image Container with slow zoom and pan overlay */}
              <div className="absolute inset-0" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s] ease-out"
                  loading={i < 2 ? "eager" : "lazy"}
                />
              </div>

              {/* Luxury Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14]/90 via-[#0A0D14]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Gold Border Highlight on Hover */}
              <div className="absolute inset-4 border border-gold/0 group-hover:border-gold/30 transition-colors duration-700 pointer-events-none rounded-xl" />

              {/* Caption & Icon */}
              <div className="absolute inset-x-0 bottom-0 p-8 flex items-end justify-between translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                <div>
                  <p className="text-gold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {photo.country}
                  </p>
                  <p className="text-white font-serif text-2xl">{photo.alt}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 group-hover:text-gold transition-colors">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editorial Footer CTA */}
      <div className="mt-32 px-6 md:px-12 max-w-[1400px] mx-auto z-10 relative">
        <div className="bg-[#141822] border border-white/10 rounded-3xl text-white p-12 md:p-24 flex flex-col items-center text-center relative overflow-hidden group shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
          {/* Subtle background image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80"
              className="w-full h-full object-cover opacity-10 group-hover:opacity-20 group-hover:scale-105 transition-all duration-1000 saturate-0 group-hover:saturate-50"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0D14]/80 to-[#141822]/90" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <p className="text-gold text-xs uppercase tracking-[0.2em] font-bold mb-6">Passez à l'action</p>
            <h2 className="font-serif text-4xl md:text-6xl mb-8 leading-tight">
              L'art de voyager,<br />
              <span className="italic text-gold">réinventé.</span>
            </h2>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link href="/explore" className="btn-gold shadow-[0_0_30px_rgba(201,168,76,0.2)]">
                Écrire mon histoire
              </Link>
              <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))} className="text-white hover:text-gold border-b border-white/30 hover:border-gold pb-1 font-medium text-sm transition-colors flex items-center gap-2">
                Consulter l'IA <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ LUXURY PHOTO MODAL ════════════════════════════════════════════ */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0D14]/95 backdrop-blur-xl transition-all duration-500
        ${selectedPhoto ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSelectedPhoto(null)}
      >
        <button
          onClick={() => setSelectedPhoto(null)}
          className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2 bg-white/10 border border-white/20 rounded-full z-50 hover:bg-white/20"
        >
          <X className="w-8 h-8" />
        </button>

        {selectedPhoto && (
          <div
            className="w-full max-w-6xl mx-auto px-6 max-h-screen flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 pt-12 md:pt-0"
            onClick={e => e.stopPropagation()}
          >
            {/* Image display */}
            <div className={`w-full md:w-2/3 h-[40vh] sm:h-[50vh] md:h-[80vh] relative transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]
              ${selectedPhoto ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"}`}>
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
                className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              />
            </div>

            {/* Information panel */}
            <div className={`w-full md:w-1/3 text-left transition-all duration-700 delay-150 ease-[cubic-bezier(0.19,1,0.22,1)]
              ${selectedPhoto ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"}`}>
              <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-1.5 mb-6">
                <MapPin className="w-4 h-4 text-gold" />
                <span className="text-gold text-xs font-semibold tracking-widest uppercase">{selectedPhoto.country}</span>
              </div>
              <h3 className="font-serif text-4xl md:text-5xl text-white mb-4">{selectedPhoto.location}</h3>
              <p className="text-white/60 text-lg mb-8 italic">{selectedPhoto.alt}</p>

              <div className="h-px w-full bg-white/10 mb-8" />

              <Link
                href="/explore"
                className="btn-gold w-full text-center hover:bg-[#b58f4a] group"
              >
                Planifier un voyage similaire
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
