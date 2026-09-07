import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const notify = useCallback((message, type = "success") => {
    setNotification({ message, type });
    window.setTimeout(() => setNotification(null), 4000);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {notification && (
        <div className={`fixed right-5 top-24 z-[60] flex max-w-sm items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl ${notification.type === "error" ? "bg-red-50 text-red-800 ring-1 ring-red-100" : "bg-gray-950 text-white"}`} role="status">
          <CheckCircle2 className={`h-5 w-5 shrink-0 ${notification.type === "error" ? "text-red-600" : "text-lime-400"}`} />
          <span>{notification.message}</span>
          <button type="button" aria-label="Dismiss notification" onClick={() => setNotification(null)} className="ml-auto p-1 opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
}
