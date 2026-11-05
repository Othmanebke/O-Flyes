import type { Metadata } from "next";
import Link from "next/link";
import { DESTINATIONS } from "@/lib/catalog";
import { CITY_PHOTOS } from "@/lib/world/cityPhotos";

export const metadata: Metadata = {
  title: "Crédits photo",
  description: "Auteurs et licences des photos utilisées sur AIVANA.",
};

/* Crédits des photos : obligatoires pour les licences Creative Commons (CC BY, CC BY-SA). */
export default function CreditsPage() {
  const rows = Object.entries(CITY_PHOTOS)
    .map(([code, p]) => ({ code, p, dest: DESTINATIONS.find(d => d.code === code) }))
    .sort((a, b) => (a.dest?.name || a.code).localeCompare(b.dest?.name || b.code, "fr"));

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-8 px-6 pb-24 pt-12">
      <div className="flex flex-col gap-3">
        <h1 className="m-0 text-[clamp(34px,4.4vw,52px)] leading-[1.05]">
          Crédits <em className="accent">photo</em>
        </h1>
        <p className="m-0 max-w-[640px] text-base leading-relaxed text-muted-2">
          Les photos des destinations d&apos;origine et les illustrations du site viennent d&apos;
          <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer">
            Unsplash
          </a>{" "}
          (licence Unsplash, utilisation libre). Les photos des villes ci-dessous viennent de{" "}
          <a href="https://commons.wikimedia.org" target="_blank" rel="noopener noreferrer">
            Wikimedia Commons
          </a>
          , sous licence libre : merci à leurs auteurs.
        </p>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted">
            <th className="py-2 pr-3 font-semibold">Destination</th>
            <th className="py-2 pr-3 font-semibold">Auteur</th>
            <th className="py-2 font-semibold">Licence</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ code, p, dest }) => (
            <tr key={code} className="border-b border-line align-top">
              <td className="py-2.5 pr-3 font-semibold">
                {dest ? <Link href={`/destination/${dest.id}`}>{dest.name}</Link> : code}
              </td>
              <td className="py-2.5 pr-3 text-muted-2">
                <a href={p.page} target="_blank" rel="noopener noreferrer" className="!text-muted-2">
                  {p.author}
                </a>
              </td>
              <td className="py-2.5 text-muted-2">
                {p.licenseUrl ? (
                  <a href={p.licenseUrl} target="_blank" rel="noopener noreferrer" className="!text-muted-2">
                    {p.license}
                  </a>
                ) : (
                  p.license
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
