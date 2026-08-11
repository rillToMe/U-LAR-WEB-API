import { Outlet, Link } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-surface-muted">
      <aside className="w-64 border-r bg-surface p-6">
        <h1 className="text-xl font-bold">
          U-LAR Admin
        </h1>

        <nav className="mt-8 space-y-2">
          <Link
            to="/admin"
            className="block rounded-lg px-3 py-2 hover:bg-surface-hover"
          >
            Dashboard
          </Link>

          <Link
            to="/admin/students"
            className="block rounded-lg px-3 py-2 hover:bg-surface-hover"
          >
            Mahasiswa
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}