import { AppHeader } from "@/components/app-shell/app-header";
import { DemoBanner } from "@/components/app-shell/demo-banner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <DemoBanner />
      <AppHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
    </div>
  );
}
