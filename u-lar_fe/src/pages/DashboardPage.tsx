export default function DashboardPage() {
  const user = JSON.parse(
    localStorage.getItem("user") ?? "{}"
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Dashboard
      </h1>

      <p className="mt-2 text-fg-subtle">
        Selamat datang, {user.name}.
      </p>
    </div>
  );
}