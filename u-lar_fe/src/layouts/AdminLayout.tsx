import { Outlet } from "react-router-dom";
import { ThemeProvider } from "../components/common/theme";
import Nav from "../components/common/Nav";

export default function AdminLayout() {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-surface-muted">
        <Nav />

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  );
}
