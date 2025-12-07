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
  // יצירת מפה של routes לפי path כדי למנוע כפילויות
  // React Router יבחר את ה-route הראשון שהוא מוצא, אז נשמור את הסדר הנכון
  const routesMap = new Map();
  
  // נטען את ה-routes בסדר הזה: reader -> advertiser -> admin
  // כך routes של admin יגברו על routes של advertiser אם יש כפילויות
  const allRoutesInOrder = [
    ...readerRoutes,
    ...advertiserRoutes,
    ...adminRoutes,
  ];
  
  // נשמור רק את ה-route האחרון לכל path (כך admin routes יגברו)
  allRoutesInOrder.forEach(route => {
    routesMap.set(route.path, route);
  });
  
  const uniqueRoutes = Array.from(routesMap.values());
  
  console.log(`🚀 Loaded ${uniqueRoutes.length} unique routes (${readerRoutes.length} reader + ${advertiserRoutes.length} advertiser + ${adminRoutes.length} admin, removed ${allRoutesInOrder.length - uniqueRoutes.length} duplicates)`);
  
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