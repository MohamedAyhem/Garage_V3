import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useUser,
} from "@clerk/clerk-react";
import Home from "./Pages/Home";
import Navbar from "./Components/Navbar";
import Services from "./Pages/Services";
import { GarageProvider } from "./Contexts/GarageContext";
import "react-toastify/dist/ReactToastify.css";
import ServiceDetails from "./Pages/ServiceDetails";
import Garage_Details from "./Pages/Garage_Details";
import { ToastContainer } from "react-toastify";
import GarageOwnerAuth from "./Pages/GarageOwnerAuth";
import GarageOwnerDashboard from "./Pages/GarageOwnerDashboard";
import { ProtectedRoute } from "./Components/ProtectedRoute";
import Layout from "./Components/Layout";
import GoDashboard from "./Pages/GoDashboard";
import Customers from "./Pages/Customers";
import Reservations from "./Pages/Reservations";
import MyGarages from "./Pages/MyGarages";
import Mechanics from "./Pages/Mechanics";
import ClientDashboard from "./Pages/ClientDashboard";

const ClientRoutes = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  const userRole = user?.publicMetadata?.userType;

  if (user && userRole === "garageOwner") {
    return <Navigate to="/dashboard" />;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Service/:id" element={<ServiceDetails />}></Route>
        <Route path="/garage/:id" element={<Garage_Details />}></Route>
        <Route
          path="/Services"
          element={
            <>
              <SignedIn>
                <Services />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/client-dashboard"
          element={
            <>
              <SignedIn>
                <ClientDashboard />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/sign-in/*"
          element={<SignIn routing="path" signUpUrl="/sign-up" />}
        />
        <Route
          path="/sign-up/*"
          element={<SignUp routing="path" signInUrl="/sign-in" />}
        />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <GarageProvider>
      <div className="z-10">
        <ToastContainer />
        <Routes>
          {/* Garage Owner Routes - must come before the catch-all */}
          <Route path="/garage-auth" element={<GarageOwnerAuth />} />
          <Route path="/garage-auth/*" element={<GarageOwnerAuth />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="garageOwner">
                <Layout>
                  <GoDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute requiredRole="garageOwner">
                <Layout>
                  <Customers />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute requiredRole="garageOwner">
                <Layout>
                  <Reservations />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/myGarages"
            element={
              <ProtectedRoute requiredRole="garageOwner">
                <Layout>
                  <MyGarages />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mechanics"
            element={
              <ProtectedRoute requiredRole="garageOwner">
                <Layout>
                  <Mechanics />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Client Routes */}
          <Route path="/*" element={<ClientRoutes />} />
        </Routes>
      </div>
    </GarageProvider>
  );
};

export default App;
