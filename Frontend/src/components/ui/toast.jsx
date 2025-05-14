import * as React from "react";
import { X } from "lucide-react";

const ToastContext = React.createContext({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const addToast = React.useCallback(
    ({ title, description, variant = "default", duration = 5000 }) => {
      const id = Date.now().toString();
      const toast = { id, title, description, variant, duration };
      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = React.useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const contextValue = React.useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return {
    toast: context.addToast,
    dismissToast: context.removeToast,
  };
};

function ToastContainer() {
  const { toasts, removeToast } = React.useContext(ToastContext);

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`bg-white rounded-lg border shadow-lg p-4 flex items-start transition-all duration-300 transform translate-y-0 opacity-100 ${
            toast.variant === "destructive"
              ? "border-red-600"
              : "border-gray-200"
          }`}
          role="alert"
        >
          <div className="flex-1">
            {toast.title && (
              <h3
                className={`font-medium ${
                  toast.variant === "destructive"
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                {toast.title}
              </h3>
            )}
            {toast.description && (
              <div
                className={`text-sm mt-1 ${
                  toast.variant === "destructive"
                    ? "text-red-700"
                    : "text-gray-500"
                }`}
              >
                {toast.description}
              </div>
            )}
          </div>
          <button
            type="button"
            className="ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={() => removeToast(toast.id)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
} 