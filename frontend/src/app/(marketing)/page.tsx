import { Hero } from "@/components/marketing/hero";
import { Problem } from "@/components/marketing/problem";
import { Demo } from "@/components/marketing/demo/demo";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PolicyExample } from "@/components/marketing/policy-example";
import { Tooling } from "@/components/marketing/tooling";
import { WhyNotAlternatives } from "@/components/marketing/why-not-alternatives";
import { SecurityStatus } from "@/components/marketing/security-status";
import { Audience } from "@/components/marketing/audience";
import { Roadmap } from "@/components/marketing/roadmap";
import { Faq } from "@/components/marketing/faq";
import { Closing } from "@/components/marketing/closing";

export default function MarketingHome() {
  return (
    <div className="divide-y divide-line">
      <Hero />
      <Problem />
      <Demo />
      <HowItWorks />
      <PolicyExample />
      <Tooling />
      <WhyNotAlternatives />
      <SecurityStatus />
      <Audience />
      <Roadmap />
      <Faq />
      <Closing />
    </div>
  );
}
