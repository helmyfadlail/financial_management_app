import Image from "next/image";

interface ResponsiveImgProps {
  src: string;
  alt: string;
  aspectRatio?: "square" | "video" | "portrait" | "wide";
  objectFit?: "cover" | "contain" | "fill";
  priority?: boolean;
  className?: string;
}

const aspectRatios = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  wide: "aspect-[21/9]",
};

export const ResponsiveImg = ({ src, alt, aspectRatio = "video", objectFit = "cover", priority = false, className = "" }: ResponsiveImgProps) => {
  return (
    <div className={`relative ${aspectRatios[aspectRatio]} ${className}`}>
      <Image src={src} alt={alt} fill className={`object-${objectFit}`} priority={priority} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
    </div>
  );
};

interface AvatarImgProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-base",
  xl: "w-24 h-24 text-xl",
  "2xl": "w-28 h-28 text-2xl",
  "3xl": "w-32 h-32 text-2xl",
};

export const AvatarImg = ({ src, alt, size = "md", className = "" }: AvatarImgProps) => {
  return (
    <div className={`${sizeClasses[size]} ${className} relative rounded-full overflow-hidden`}>
      <Image src={src} alt={alt} fill objectFit="cover" objectPosition="center" sizes="(max-width: 96px) 100vw, 96px" priority />
    </div>
  );
};

interface BackgroundImgProps {
  src: string;
  alt: string;
  overlay?: boolean;
  overlayOpacity?: number;
  children?: React.ReactNode;
  className?: string;
}

export const BackgroundImg = ({ src, alt, overlay = true, overlayOpacity = 0.5, children, className = "" }: BackgroundImgProps) => {
  return (
    <div className={`relative ${className}`}>
      <Image src={src} alt={alt} fill className="object-cover" priority sizes="100vw" />
      {overlay && <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
};
