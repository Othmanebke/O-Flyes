"use client";
import Image, { type ImageLoaderProps } from "next/image";
import { useState, type CSSProperties } from "react";
import { clsx } from "clsx";
import { photoBase, type PhotoKey } from "@/lib/photos";

// Unsplash redimensionne lui-même : on lui demande la bonne largeur au lieu de
// faire passer l'image par l'optimiseur Next.
const unsplashLoader = ({ src, width }: ImageLoaderProps) => `${src}&w=${width}`;

interface Props {
    k: PhotoKey;
    alt?: string;
    sizes?: string;
    priority?: boolean;
    className?: string;
    imgClassName?: string;
    style?: CSSProperties;
    imgStyle?: CSSProperties;
}

/* Photo en object-cover qui remplit son conteneur. En cas d'erreur de chargement,
   il reste le fond sable #D9D2C4. */
export default function Photo({ k, alt = "", sizes = "100vw", priority, className, imgClassName, style, imgStyle }: Props) {
    const [failed, setFailed] = useState(false);
    return (
        <div className={clsx("relative overflow-hidden bg-placeholder", className)} style={style}>
            {!failed && (
                <Image
                    loader={unsplashLoader}
                    src={photoBase(k)}
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
