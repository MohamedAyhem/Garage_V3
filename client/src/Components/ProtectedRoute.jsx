import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { useEffect, useRef } from "react";

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isLoaded } = useUser();
  const metadataSetRef = useRef(false);
  const attemptCountRef = useRef(0);

  useEffect(() => {
    const setMetadata = async () => {
      if (
        isLoaded &&
        user &&
        requiredRole === "garageOwner" &&
        !user.publicMetadata?.userType &&
        !metadataSetRef.current
      ) {
        metadataSetRef.current = true;
        const isGarageFlow = sessionStorage.getItem("isGarageOwnerFlow");

        if (isGarageFlow && attemptCountRef.current < 10) {
          attemptCountRef.current += 1;

          try {
            const response = await fetch(
              `${
                import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"
              }/api/user/set-garage-owner`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  clerkUserId: user.id,
                }),
              }
            );

            if (response.ok) {
              sessionStorage.removeItem("isGarageOwnerFlow");
              await user.reload();
            } else {
              metadataSetRef.current = false;
            }
          } catch {
            metadataSetRef.current = false;
          }
        }
      }
    };

    setMetadata();
  }, [isLoaded, user, requiredRole]);

  if (!isLoaded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0f0f0f",
          color: "#FFDE01",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  const userRole = user?.publicMetadata?.userType;

  if (requiredRole && !userRole) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0f0f0f",
          color: "#FFDE01",
        }}
      >
        Setting up your account...
      </div>
    );
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};
