import Photo from "@/components/ui/Photo";
import type { PhotoKey } from "@/lib/photos";

/* Bannière photo arrondie sous la navbar des pages internes */
export default function PageBanner({ k }: { k: PhotoKey }) {
  return (
    <div className="mx-auto mt-4 max-w-[1240px] px-6">
      <Photo
        k={k}
        priority
        sizes="(max-width: 1240px) 100vw, 1240px"
        className="h-[clamp(160px,24vw,280px)] rounded-[28px]"
      />
    </div>
  );
}
