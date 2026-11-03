import Image from "next/image";
import { MarketingNav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* Full-bleed hero backdrop, behind the nav and hero copy both —
          per the user's reference, the photo sits behind everything at
          the top of the page, not boxed into its own panel. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] overflow-hidden sm:h-[760px] lg:h-[880px]">
        <Image
          src="/brand/backgrounds/barad-citadel-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian from-30% via-obsidian/70 via-55% to-obsidian/10" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-obsidian" />
      </div>

      <MarketingNav />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
