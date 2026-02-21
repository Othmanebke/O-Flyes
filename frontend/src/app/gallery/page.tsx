import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const photos = [
  { id: 1, src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85",  alt: "Montagne enneigée",  span: "md:col-span-2 md:row-span-1" },
  { id: 2, src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80",  alt: "Dunes de sable",     span: "" },
  { id: 3, src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",  alt: "Route de voyage",   span: "" },
  { id: 4, src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",  alt: "Lac de montagne",   span: "" },
  { id: 5, src: "https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=600&q=80",  alt: "Aurores boréales",  span: "" },
  { id: 6, src: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=80",  alt: "Médina Marrakech",  span: "" },
  { id: 7, src: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=600&q=80",  alt: "Temple Japon",      span: "" },
  { id: 8, src: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600&q=80",  alt: "Voyageur",          span: "" },
  { id: 9, src: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80",  alt: "Ciel étoilé",       span: "" },
  { id:10, src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=85",  alt: "Forêt verte",       span: "md:col-span-2" },
  { id:11, src: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",  alt: "Bali rizières",     span: "" },
  { id:12, src: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80",     alt: "Hôtel vue mer",     span: "" },
];

export default function GalleryPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-8 py-14">

        {/* Header */}
        <div className="mb-12">
          <p className="section-label mb-2">Nos Stories</p>
          <div className="flex items-end justify-between">
            <h1 className="font-serif text-5xl md:text-6xl text-dark">Galerie Photo</h1>
            <p className="hidden md:block text-dark-400 text-sm max-w-xs text-right">
              Instants captés lors de nos<br />voyages et routes panoramiques.
            </p>
          </div>
        </div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-24">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className={`relative rounded-2xl overflow-hidden group cursor-pointer card-hover ${photo.span}`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className={`w-full object-cover group-hover:scale-105 transition-transform duration-700 ${
                  photo.span?.includes("col-span-2") ? "h-64" : "h-52"
                }`}
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-3.5 h-3.5 text-dark" />
              </div>
              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-medium">{photo.alt}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-sand-50 rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <span className="tag mb-4">Commencer maintenant</span>
            <h2 className="font-serif text-4xl text-dark leading-tight mb-3">
              Découvrez votre prochaine<br />escapade idéale
            </h2>
            <p className="text-dark-400 text-sm mb-8 max-w-sm">
              Planifiez votre voyage en quelques minutes et profitez de chaque instant.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/explore" className="btn-gold">Planifier mon voyage</Link>
              <Link href="/explore" className="w-10 h-10 rounded-full border border-gold flex items-center justify-center hover:bg-gold hover:text-dark transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=260&q=80" alt="" className="rounded-2xl h-48 w-40 object-cover" />
            <img src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=260&q=80" alt="" className="rounded-2xl h-48 w-40 object-cover mt-6" />
          </div>
        </div>

      </div>
    </div>
  );
}
