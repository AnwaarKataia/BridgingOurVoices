import Image from "next/image";
import { isUploaded } from "@/lib/content";

type Props = { src: string; alt: string; sizes: string; className?: string; priority?: boolean };

/**
 * An "image" field from the page content, filling its (positioned) parent.
 * Images uploaded in the dashboard (/media/…) are proxied from the API and served as uploaded;
 * images shipped with the site go through Next's optimiser.
 */
export function ContentImage({ src, alt, sizes, className = "object-cover", priority }: Props) {
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={isUploaded(src)} className={className} />;
}
