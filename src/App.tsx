import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SalesPage } from "@/pages/SalesPage";

// Secondary pages get their own small chunks so the sales page loads only what it shows.
const loadWheelTest = () => import("@/pages/WheelTest");
const loadPositionTest = () => import("@/pages/PositionTest");
const loadThankYou = () => import("@/pages/ThankYou");
const loadPolicy = () => import("@/pages/Policy");
const WheelTest = lazy(() => loadWheelTest().then((mod) => ({ default: mod.WheelTest })));
const PositionTest = lazy(() => loadPositionTest().then((mod) => ({ default: mod.PositionTest })));
const ThankYou = lazy(() => loadThankYou().then((mod) => ({ default: mod.ThankYou })));
const Policy = lazy(() => loadPolicy().then((mod) => ({ default: mod.Policy })));

// Admin dashboard: separate bundle, only downloaded when someone opens /admin.
const AdminApp = lazy(() => import("@/admin/AdminApp"));

// Phase 1 site map (brief §2). Free tools and policies are linked from the footer only.
export function App() {
  // Once the page is idle, warm the secondary pages so footer links still open instantly.
  useEffect(() => {
    const warm = () => [loadWheelTest, loadPositionTest, loadThankYou, loadPolicy].forEach((load) => load().catch(() => {}));
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(warm, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(warm, 2500); // Safari has no requestIdleCallback
    return () => clearTimeout(id);
  }, []);

  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<SalesPage />} />
        <Route path="how-built-are-you" element={<WheelTest />} />
        <Route path="position-test" element={<PositionTest />} />
        <Route path="thank-you" element={<ThankYou />} />
        <Route path="policies/:slug" element={<Policy />} />
      </Route>
      <Route
        path="admin/*"
        element={
          <Suspense fallback={null}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
