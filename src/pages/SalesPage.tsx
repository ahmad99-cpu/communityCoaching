import { Hero } from "@/components/sales/Hero";
import { Giveaway } from "@/components/sales/Giveaway";
import { WhatYouGet } from "@/components/sales/WhatYouGet";
import { MeetCoach } from "@/components/sales/MeetCoach";
import { ForYou } from "@/components/sales/ForYou";
import { Pricing } from "@/components/sales/Pricing";
import { Referral } from "@/components/sales/Referral";
import { Faq } from "@/components/sales/Faq";
import { FinalCta } from "@/components/sales/FinalCta";

/** Sales page, sections in the order of brief §3. One job: get people to join. */
export function SalesPage() {
  return (
    <>
      <Hero />
      <Giveaway />
      <WhatYouGet />
      <MeetCoach />
      <ForYou />
      <Pricing />
      <Referral />
      <Faq />
      <FinalCta />
    </>
  );
}
