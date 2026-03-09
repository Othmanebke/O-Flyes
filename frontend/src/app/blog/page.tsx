"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const posts = [
  {
    id: 1,
    date: "20 Fév. 2026",
    title: "Meilleure période pour visiter Bali",
    excerpt: "Découvrez les mois idéaux pour profiter de Bali sans la pluie ni les foules touristiques.",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=85",
    tag: "Guide",
    featured: true,
  },
  {
    id: 2,
    date: "18 Fév. 2026",
    title: "Quoi mettre dans sa valise pour un voyage au désert",
    excerpt: "Les essentiels pour survivre (et profiter) en milieu aride.",
    img: "https://images.unsplash.com/photo-1519922639192-e73293ca430e?w=600&q=80",
    tag: "Conseil",
    featured: false,
  },
  {
    id: 3,
    date: "15 Fév. 2026",
    title: "Les plus beaux couchers de soleil au Japon",
    excerpt: "Spots incontournables pour capturer la magie du soleil couchant à Kyoto et Tokyo.",
    img: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=600&q=80",
    tag: "Inspiration",
    featured: false,
  },
  {
    id: 4,
    date: "10 Fév. 2026",
    title: "Comment voyager comme un local au Maroc",
    excerpt: "Astuces et adresses secrètes pour une expérience authentique loin des sentiers battus.",
    img: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=80",
    tag: "Culture",
    featured: false,
  },
];

export default function BlogPage() {
  const [featured, ...rest] = posts;
  return (
    <div className="min-h-screen -mt-20 pt-32" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-8 py-4">

        {/* Header */}
        <div className="mb-12">
          <p className="section-label mb-2 text-gold/80">Blog</p>
          <div className="flex items-end justify-between">
            <h1 className="font-serif text-5xl md:text-6xl text-white">AIVANA Journal</h1>
            <p className="hidden md:block text-white/50 text-sm max-w-xs text-right">
              Votre guide pour explorer le monde —<br />les meilleures saisons et itinéraires.
            </p>
          </div>
        </div>

        {/* Featured post */}
        <div className="relative rounded-3xl overflow-hidden mb-6 card-hover cursor-pointer group border border-white/5">
          <img
            src={featured.img}
            alt={featured.title}
            className="w-full h-[400px] md:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14]/90 via-[#0A0D14]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <p className="text-white/60 text-xs mb-2">{featured.date}</p>
            <h2 className="font-serif text-3xl md:text-4xl text-white leading-tight">{featured.title}</h2>
          </div>
          <div className="absolute top-5 right-5 w-9 h-9 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Grid posts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-24">
          {rest.map((post) => (
            <div key={post.id} className="relative rounded-2xl overflow-hidden card-hover cursor-pointer group border border-white/5">
              <img
                src={post.img}
                alt={post.title}
                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14]/90 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-white/60 text-[10px] mb-1">{post.date}</p>
                <h3 className="font-semibold text-white text-sm leading-snug">{post.title}</h3>
              </div>
              <div className="absolute top-3 right-3 w-7 h-7 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-[#141822] border border-white/10 shadow-2xl rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center gap-10 mb-10">
          <div className="flex-1">
            <span className="tag mb-4 bg-white/5 border-white/10 text-white/80">Commencer maintenant</span>
            <h2 className="font-serif text-4xl text-white leading-tight mb-3">
              Découvrez votre prochaine<br />destination idéale
            </h2>
            <p className="text-white/60 text-sm mb-8 max-w-sm">
              Planifiez votre voyage en quelques minutes avec notre IA.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/explore" className="btn-gold shadow-[0_0_20px_rgba(201,168,76,0.2)]">Planifier mon voyage</Link>
              <Link href="/explore" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-white/30 text-white transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0 relative">
            <div className="absolute inset-0 bg-gold/5 blur-3xl rounded-full" />
            <img src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=260&q=80" alt="" className="relative z-10 border border-white/10 rounded-2xl h-48 w-40 object-cover" />
            <img src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=260&q=80" alt="" className="relative z-10 border border-white/10 rounded-2xl h-48 w-40 object-cover mt-6" />
          </div>
        </div>

      </div>
    </div>
  );
}
