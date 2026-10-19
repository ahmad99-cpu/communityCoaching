import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/admin/AdminLayout";
import { ADMIN_BASE } from "@/admin/basePath";
import { Students } from "@/admin/pages/Students";
import { GiveawayEditor } from "@/admin/pages/GiveawayEditor";
import { PricingEditor } from "@/admin/pages/PricingEditor";
import { FaqEditor } from "@/admin/pages/FaqEditor";
import { WheelTestEditor } from "@/admin/pages/WheelTestEditor";
import { NextSessionEditor } from "@/admin/pages/NextSessionEditor";

/** Admin dashboard routes, mounted at ADMIN_BASE (/adminDashboard) and lazy-loaded so visitors never download it. */
export default function AdminApp() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Students />} />
        <Route path="next-session" element={<NextSessionEditor />} />
        <Route path="giveaway" element={<GiveawayEditor />} />
        <Route path="pricing" element={<PricingEditor />} />
        <Route path="faq" element={<FaqEditor />} />
        <Route path="wheel-test" element={<WheelTestEditor />} />
        <Route path="*" element={<Navigate to={ADMIN_BASE} replace />} />
      </Route>
    </Routes>
  );
}
