import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
import PageTransition from "./components/PageTransition.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import RouteLoading from "./components/RouteLoading.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import "./index.css";

// Eagerly loaded — landing page is the most-hit route
import Home from "./pages/Home.jsx";

// Lazy-loaded routes — split into separate chunks
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const Generator = lazy(() => import("./pages/Generator.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Pricing = lazy(() => import("./pages/Pricing.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 transition-colors">
                <ScrollProgress />
                <Navbar />
                <main className="flex-1">
                  <PageTransition>
                    <Suspense fallback={<RouteLoading />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <Dashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/generator"
                          element={
                            <ProtectedRoute>
                              <Generator />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/settings"
                          element={
                            <ProtectedRoute>
                              <Settings />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </PageTransition>
                </main>
                <Footer />
              </div>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
