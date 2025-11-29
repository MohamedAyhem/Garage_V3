import { useUser, UserButton } from "@clerk/clerk-react";

const GarageOwnerDashboard = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px", marginTop: "200px" }}>
      <h1>Garage Owner Dashboard</h1>
      <p>
        Welcome, {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}
      </p>
      <div style={{ marginTop: "20px" }}>
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default GarageOwnerDashboard;
