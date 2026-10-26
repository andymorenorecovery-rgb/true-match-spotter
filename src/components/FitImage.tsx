/** Shows the whole photo (nothing cropped), with a soft blurred copy filling any empty space. */
export function FitImage({ src, alt, className = "", lazy }: { src: string; alt: string; className?: string; lazy?: boolean }) {
  return (
    <div className={`relative h-full w-full overflow-hidden bg-muted ${className}`}>
      <img src={src} alt="" aria-hidden loading={lazy ? "lazy" : undefined} className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-xl" />
      <img src={src} alt={alt} loading={lazy ? "lazy" : undefined} className="relative h-full w-full object-contain" />
    </div>
  );
}
