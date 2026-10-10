import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { MemberCountsProvider } from "@/lib/memberCounts";
import { ContentProvider } from "@/lib/content";
import "./index.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <ContentProvider>
          <MemberCountsProvider>
            <App />
          </MemberCountsProvider>
        </ContentProvider>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
);
