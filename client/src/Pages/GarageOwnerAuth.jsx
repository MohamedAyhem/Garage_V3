import { useEffect, useState } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { useSetGarageOwnerMetadata } from "../hooks/useSetGarageOwnerMetadata";

const GarageOwnerAuth = () => {
  const [mode, setMode] = useState("signin");

  useEffect(() => {
    sessionStorage.setItem("isGarageOwnerFlow", "true");
  }, []);

  useSetGarageOwnerMetadata();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f0f0f",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <style>{`
        .toggle-button {
          transition: background-color 0.2s ease, color 0.2s ease;
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: "450px" }}>
        <h1
          style={{
            textAlign: "center",
            color: "#FFDE01",
            marginBottom: "30px",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          <img src="/logo.png" alt="Logo" className="w-70 block mx-auto" />
        </h1>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "30px",
            gap: "0",
          }}
        >
          <button
            className="toggle-button"
            onClick={() => setMode("signin")}
            style={{
              padding: "10px 20px",
              backgroundColor: mode === "signin" ? "#FFDE01" : "#1a1a1a",
              color: mode === "signin" ? "#000" : "#fff",
              border: "1px solid #FFDE01",
              cursor: "pointer",
              fontWeight: "bold",
              borderRadius: "4px 0 0 4px",
              fontSize: "14px",
            }}
          >
            Sign In
          </button>
          <button
            className="toggle-button"
            onClick={() => setMode("signup")}
            style={{
              padding: "10px 20px",
              backgroundColor: mode === "signup" ? "#FFDE01" : "#1a1a1a",
              color: mode === "signup" ? "#000" : "#fff",
              border: "1px solid #FFDE01",
              borderLeft: "none",
              cursor: "pointer",
              fontWeight: "bold",
              borderRadius: "0 4px 4px 0",
              fontSize: "14px",
            }}
          >
            Sign Up
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          {mode === "signin" ? (
            <SignIn redirectUrl="/dashboard" />
          ) : (
            <SignUp redirectUrl="/dashboard" />
          )}
        </div>
      </div>
    </div>
  );
};

export default GarageOwnerAuth;
