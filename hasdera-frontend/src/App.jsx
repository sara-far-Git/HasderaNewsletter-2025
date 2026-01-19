import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { GlobalStyles } from "./styles/HasederaTheme";
import { AuthProvider } from "./contexts/AuthContext";
import { readerRoutes } from "./routes/readerRoutes";
import { advertiserRoutes } from "./routes/advertiserRoutes";
import { adminRoutes } from "./routes/adminRoutes";

// 🎨 הגדרת סטיילים גלובליים
const GlobalStyleComponent = createGlobalStyle`
  ${GlobalStyles}
`;

// 🎯 קומפוננט פנימי שמטען את כל ה-routes
// ההגנות (ProtectedRoute, AdminProtectedRoute) מטפלות בהרשאות
function AppRoutes() {
  let appMode = String(import.meta.env.VITE_APP_MODE || "all").toLowerCase();
  const host = typeof window !== "undefined" ? window.location.hostname : "";

  if (host.includes("hasdera-magazine.co.il") || host.includes("hasderanewsletter-2025.pages.dev")) {
    appMode = "reader";
  } else if (host.includes("hasdera-advertiser.pages.dev")) {
    appMode = "advertiser";
  }
  const loginRoute = readerRoutes.filter(route => route.path === "/login");

  let allRoutesInOrder;
  if (appMode === "reader") {
    allRoutesInOrder = [...readerRoutes];
  } else if (appMode === "advertiser") {
    allRoutesInOrder = [
      ...loginRoute,
      ...advertiserRoutes,
      ...adminRoutes,
    ];
  } else if (appMode === "admin") {
    allRoutesInOrder = [
      ...loginRoute,
      ...adminRoutes,
    ];
  } else {
    // "all" (default): reader -> advertiser -> admin
    allRoutesInOrder = [
      ...readerRoutes,
      ...advertiserRoutes,
      ...adminRoutes,
    ];
  }

  // יצירת מפה של routes לפי path כדי למנוע כפילויות
  const routesMap = new Map();
  allRoutesInOrder.forEach(route => {
    routesMap.set(route.path, route);
  });

  const uniqueRoutes = Array.from(routesMap.values());

  console.log(`🚀 Loaded ${uniqueRoutes.length} unique routes (mode=${appMode})`);
  
  return (
    <Routes>
      {uniqueRoutes.map((route, index) => (
        <Route 
          key={`route-${index}-${route.path}`} 
          path={route.path} 
          element={route.element} 
        />
      ))}
    </Routes>
  );
}

// 🎯 App - קומפוננט ראשי
function App() {
  return (
    <>
      {/* 🎨 סטיילים גלובליים */}
      <GlobalStyleComponent />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;