"use client";

interface Brand { id: string; name: string; slug: string }
interface Props  { brands: Brand[] }

export function BrandMarquee({ brands }: Props) {
  if (!brands.length) return null;

  const doubled = [...brands, ...brands];

  return (
    <div className="w-full py-4" style={{ backgroundColor: "#f97316" }}>
      <div
        className="relative overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
        }}
      >
        <div className="animate-marquee flex w-max items-center">
          {doubled.map((brand, i) => (
            <div key={`${brand.id}-${i}`} className="flex flex-shrink-0 items-center">
              <span className="px-8 font-serif text-base italic font-bold tracking-wide text-white uppercase">
                {brand.name}
              </span>
              <svg viewBox="0 0 8 8" className="h-2 w-2 flex-shrink-0 fill-white/60">
                <path d="M4 0L8 4L4 8L0 4Z" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
