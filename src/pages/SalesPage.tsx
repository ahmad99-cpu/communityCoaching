import { Hero } from "@/components/sales/Hero";
import { Reviews } from "@/components/sales/Reviews";
import { Giveaway } from "@/components/sales/Giveaway";
import { WhatYouGet } from "@/components/sales/WhatYouGet";
import { MeetCoach } from "@/components/sales/MeetCoach";
import { Imagine } from "@/components/sales/Imagine";
import { Pricing } from "@/components/sales/Pricing";
import { Faq } from "@/components/sales/Faq";
import { FinalCta } from "@/components/sales/FinalCta";

/** Sales page, sections in the order of brief §3. One job: get people to join. */
export function SalesPage() {
  return (
    <>
      <Hero />
      <Reviews />
      <WhatYouGet />
      <MeetCoach />
      <Imagine />
      <Giveaway />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
