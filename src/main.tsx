import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LazyMotion, MotionConfig } from "framer-motion";
import { MemberCountsProvider } from "@/lib/memberCounts";
import { ContentProvider } from "@/lib/content";
import "./index.css";
import { App } from "./App";

// Components use the lightweight `m` instead of `motion`; the engine arrives in its own chunk.
const loadMotionFeatures = () => import("@/lib/motionFeatures").then((mod) => mod.default);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LazyMotion features={loadMotionFeatures} strict>
        <MotionConfig reducedMotion="user">
          <ContentProvider>
            <MemberCountsProvider>
              <App />
            </MemberCountsProvider>
          </ContentProvider>
        </MotionConfig>
      </LazyMotion>
    </BrowserRouter>
  </StrictMode>,
);
