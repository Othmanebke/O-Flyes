"use client";
import Image, { type ImageLoaderProps } from "next/image";
import { useState, type CSSProperties } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { commonsUrl, isCommons, photoBase, type PhotoKey } from "@/lib/photos";

// Les photos sources sont en paysage (environ 3:2). Dans un cadre carré ou vertical,
// object-cover les recadre, donc les agrandit : on demande alors un fichier plus large.
const TALL_FACTOR = 1.6;

interface Props {
  k: PhotoKey;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
  /** cadre carré ou vertical : image plus large pour rester nette après recadrage */
  tall?: boolean;
}

/* Photo en object-cover qui remplit son conteneur. En cas d'erreur de chargement,
   il reste le fond sable #D9D2C4. */
export default function Photo({
  k,
  alt = "",
  sizes = "100vw",
  priority,
  className,
  imgClassName,
  style,
  imgStyle,
  tall,
}: Props) {
  const [failed, setFailed] = useState(false);
  // Unsplash et Wikimedia Commons redimensionnent eux-mêmes : on leur demande la bonne
  // largeur au lieu de faire passer l'image par l'optimiseur Next.
  const loader = ({ src, width }: ImageLoaderProps) => {
    const w = tall ? Math.min(3840, Math.round(width * TALL_FACTOR)) : width;
    return isCommons(k) ? commonsUrl(k, w) : `${src}&w=${w}`;
  };
  return (
    // twMerge : un « absolute » passé en className remplace bien le « relative » par défaut
    <div className={twMerge("relative overflow-hidden bg-placeholder", className)} style={style}>
      {!failed && (
        <Image
          loader={loader}
          src={isCommons(k) ? commonsUrl(k, 960) : photoBase(k)}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className={clsx("object-cover", imgClassName)}
          style={imgStyle}
        />
      )}
    </div>
  );
}
