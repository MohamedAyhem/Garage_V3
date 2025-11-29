import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { dark } from "@clerk/themes";
import { ClerkProvider } from "@clerk/clerk-react";
import "./index.css";
import App from "./App.jsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")).render(
  <ClerkProvider
    appearance={{
      baseTheme: dark,
    }}
    publishableKey={PUBLISHABLE_KEY}
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>
);
