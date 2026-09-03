import { Navigate, Route, Routes } from "react-router-dom";
import { DEFAULT_LANGUAGE } from "@/i18n";
import { Layout } from "@/components/layout/Layout";
import { PagePlaceholder } from "@/pages/PagePlaceholder";

// Route list mirrors SPEC.md §7 (Site structure) and src/components/layout/Nav.tsx.
// Keep all three in sync when a page is added.
const PAGE_KEYS = [
  "coaches",
  "learn",
  "matches",
  "scene",
  "league",
  "community",
  "coaching",
  "pricing",
  "wrapped",
] as const;

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${DEFAULT_LANGUAGE}`} replace />} />

      <Route path="/:lang" element={<Layout />}>
        <Route index element={<PagePlaceholder pageKey="home" />} />
        {PAGE_KEYS.map((key) => (
          <Route key={key} path={key} element={<PagePlaceholder pageKey={key} />} />
        ))}
      </Route>

      <Route path="*" element={<Navigate to={`/${DEFAULT_LANGUAGE}`} replace />} />
    </Routes>
  );
}
