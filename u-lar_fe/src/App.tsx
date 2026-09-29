import AppRoutes from "./routes/AppRoutes";
import { ToastProvider } from "./components/common/toast";
import ErrorBoundary from "./components/common/ErrorBoundary";

function App() {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </ToastProvider>
  );
}

export default App;