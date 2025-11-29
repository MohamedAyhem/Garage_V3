import { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export const useSetGarageOwnerMetadata = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();
  const attemptCountRef = useRef(0);
  const maxAttemptsRef = useRef(10);

  useEffect(() => {
    const setMetadata = async () => {
      if (isLoaded && isSignedIn && user) {
        const isGarageFlow = sessionStorage.getItem("isGarageOwnerFlow");

        if (isGarageFlow && !user.publicMetadata?.userType) {
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
              attemptCountRef.current = 0;
              await user.reload();
              setTimeout(() => {
                navigate("/dashboard");
              }, 1000);
            } else {
              if (attemptCountRef.current < maxAttemptsRef.current) {
                setTimeout(() => {
                  if (user.reload) {
                    user.reload();
                  }
                }, 1000);
              }
            }
          } catch {
            if (attemptCountRef.current < maxAttemptsRef.current) {
              setTimeout(() => {
                if (user.reload) {
                  user.reload();
                }
              }, 1000);
            }
          }
        } else if (
          isGarageFlow &&
          user.publicMetadata?.userType === "garageOwner"
        ) {
          sessionStorage.removeItem("isGarageOwnerFlow");
          navigate("/dashboard");
        }
      }
    };

    setMetadata();
  }, [isLoaded, isSignedIn, user, navigate]);
};
