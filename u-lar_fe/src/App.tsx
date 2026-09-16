import AppRoutes from "./routes/AppRoutes";
import { ToastProvider } from "./components/common/toast";

function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}

export default App;