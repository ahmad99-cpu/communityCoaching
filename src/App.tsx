import { Navigate, Route, Routes } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SalesPage } from "@/pages/SalesPage";
import { WheelTest } from "@/pages/WheelTest";
import { PositionTest } from "@/pages/PositionTest";
import { ThankYou } from "@/pages/ThankYou";
import { Policy } from "@/pages/Policy";

// Phase 1 site map (brief §2). Free tools and policies are linked from the footer only.
export function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<SalesPage />} />
        <Route path="how-built-are-you" element={<WheelTest />} />
        <Route path="position-test" element={<PositionTest />} />
        <Route path="thank-you" element={<ThankYou />} />
        <Route path="policies/:slug" element={<Policy />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
