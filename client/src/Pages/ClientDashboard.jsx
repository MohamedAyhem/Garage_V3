import React, { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
import { carApiService, setAuthToken } from "../utils/apiService";

const ClientDashboard = () => {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("reservations");
  const [reservationSearchTerm, setReservationSearchTerm] = useState("");
  const [carSearchTerm, setCarSearchTerm] = useState("");
  const [reservationCurrentPage, setReservationCurrentPage] = useState(1);
  const [carCurrentPage, setCarCurrentPage] = useState(1);
  const [reservations, setReservations] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showCarHistory, setShowCarHistory] = useState(false);
  const [carHistoryPage, setCarHistoryPage] = useState(1);
  const carHistoryPerPage = 5;

  const reservationsPerPage = 3;
  const carsPerPage = 2;

  const fetchReservations = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"
        }/api/Reservation/reservations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.reservations) {
        setReservations(response.data.reservations);
      }
    } catch (error) {
      setReservations([]);
    }
  };

  const fetchCars = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      setAuthToken(token);
      const userCars = await carApiService.getUserVehicles();
      setCars(userCars || []);
    } catch (error) {
      setCars([]);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchReservations(), fetchCars()]);
        setLoading(false);
      };
      loadData();

      const refreshInterval = setInterval(() => {
        fetchReservations();
      }, 10000);

      return () => clearInterval(refreshInterval);
    }
  }, [isLoaded, user]);

  const filteredReservations = reservations.filter((reservation) => {
    const searchLower = reservationSearchTerm.toLowerCase();
    const serviceName = reservation.serviceId?.name?.toLowerCase() || "";
    const date = reservation.reservationDate
      ? new Date(reservation.reservationDate).toLocaleDateString()
      : "";
    const carInfo = reservation.carId
      ? `${reservation.carId.brand || ""} ${reservation.carId.model || ""} ${
          reservation.carId.year || ""
        }`.toLowerCase()
      : "";

    return (
      serviceName.includes(searchLower) ||
      date.includes(searchLower) ||
      carInfo.includes(searchLower) ||
      reservation.status?.toLowerCase().includes(searchLower)
    );
  });

  const filteredCars = cars.filter((car) => {
    const searchLower = carSearchTerm.toLowerCase();
    return (
      car.brand?.toLowerCase().includes(searchLower) ||
      car.model?.toLowerCase().includes(searchLower) ||
      car.plate?.toLowerCase().includes(searchLower)
    );
  });

  const totalReservationPages = Math.ceil(
    filteredReservations.length / reservationsPerPage
  );
  const indexOfLastReservation = reservationCurrentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = filteredReservations.slice(
    indexOfFirstReservation,
    indexOfLastReservation
  );

  const totalCarPages = Math.ceil(filteredCars.length / carsPerPage);
  const indexOfLastCar = carCurrentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = filteredCars.slice(indexOfFirstCar, indexOfLastCar);

  React.useEffect(() => {
    setReservationCurrentPage(1);
  }, [reservationSearchTerm]);

  React.useEffect(() => {
    setCarCurrentPage(1);
  }, [carSearchTerm]);

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-500";
    switch (status.toLowerCase()) {
      case "pending":
      case "waiting":
        return "bg-yellow-500";
      case "accepted":
        return "bg-green-500";
      case "rejected":
      case "declined":
        return "bg-red-500";
      case "getting fixed":
      case "in progress":
        return "bg-blue-500";
      case "ready to go":
      case "completed":
        return "bg-green-500";
      case "reserved":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleReservationPageChange = (pageNumber) => {
    setReservationCurrentPage(pageNumber);
  };

  const handleCarPageChange = (pageNumber) => {
    setCarCurrentPage(pageNumber);
  };

  const handleCarClick = (car) => {
    setSelectedCar(car);
    setShowCarHistory(true);
    setCarHistoryPage(1);
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      const response = await axios.delete(
        `${
          import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"
        }/api/Reservation/cancel`,
        {
          data: { reservationId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setReservations((prev) => prev.filter((r) => r._id !== reservationId));
        toast.success("Reservation cancelled successfully!");
      }
    } catch (error) {
      toast.error("Failed to cancel reservation. Please try again.");
    }
  };

  const handleDeleteCarHistory = async () => {
    if (!selectedCar) return;

    if (
      !window.confirm(
        `Are you sure you want to delete all service history for ${selectedCar.brand} ${selectedCar.model}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      const carReservations = reservations.filter(
        (r) => r.carId?._id === selectedCar._id
      );
      const reservationIds = carReservations.map((r) => r._id);

      await Promise.all(
        reservationIds.map((id) =>
          axios.delete(
            `${
              import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"
            }/api/Reservation/cancel`,
            {
              data: { reservationId: id },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        )
      );

      setReservations((prev) =>
        prev.filter((r) => r.carId?._id !== selectedCar._id)
      );
      toast.success("Car history deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete car history. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] pt-[180px] pb-20 w-full flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] pt-[180px] pb-20 w-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold mb-4">
            Please sign in to access your dashboard
          </h2>
          <p className="text-gray-400">
            You need to be logged in to view your reservations and vehicles.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] pt-[180px] pb-20 w-full flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] pt-[180px] pb-20 w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="my-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
            {user?.firstName} <span className="text-[#FFDE01]">Dashboard</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your reservations and vehicles
          </p>
        </div>

        <div className="flex gap-4 mb-8 border-b border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab("reservations")}
            className={`px-6 py-3 font-bold transition-colors whitespace-nowrap ${
              activeTab === "reservations"
                ? "text-[#FFDE01] border-b-4 border-[#FFDE01]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <i className="fa-solid fa-calendar-check mr-2"></i>
            Reservations
          </button>
          <button
            onClick={() => setActiveTab("cars")}
            className={`px-6 py-3 font-bold transition-colors whitespace-nowrap ${
              activeTab === "cars"
                ? "text-[#FFDE01] border-b-4 border-[#FFDE01]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <i className="fa-solid fa-car mr-2"></i>
            My Cars
          </button>
        </div>

        {/* Reservations Tab */}
        {activeTab === "reservations" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white">
                Your Reservations
              </h2>

              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search by service, date, or car..."
                  value={reservationSearchTerm}
                  onChange={(e) => setReservationSearchTerm(e.target.value)}
                  className="w-full bg-[#2A2A2A] text-white px-4 py-3 pl-12 rounded-lg border-2 border-gray-700 focus:border-[#FFDE01] focus:outline-none"
                />
                <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* Results count */}
            <p className="text-gray-400 mb-4">
              Showing {currentReservations.length} of{" "}
              {filteredReservations.length} reservations
            </p>

            <div className="grid grid-cols-1 gap-4">
              {currentReservations.length > 0 ? (
                currentReservations.map((reservation) => (
                  <div
                    key={reservation._id}
                    className="bg-[#2A2A2A] p-6 rounded-lg border-l-4 border-[#FFDE01] hover:bg-[#333] transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">
                            {reservation.serviceId?.name || "Unknown Service"}
                          </h3>
                          <span
                            className={`${getStatusColor(
                              reservation.status
                            )} text-white text-xs px-3 py-1 rounded-full font-bold`}
                          >
                            {reservation.status || "Waiting"}
                          </span>
                        </div>
                        <p className="text-gray-400 mb-1">
                          <i className="fa-solid fa-car mr-2 text-[#FFDE01]"></i>
                          {reservation.carId
                            ? `${reservation.carId.brand || ""} ${
                                reservation.carId.model || ""
                              } ${reservation.carId.year || ""}`.trim()
                            : "Unknown Car"}
                        </p>
                        <p className="text-gray-300 font-semibold mb-1">
                          <i className="fa-solid fa-warehouse mr-2 text-[#FFDE01]"></i>
                          {reservation.garageId?.name ||
                            reservation.garageId ||
                            "Unknown Garage"}
                        </p>
                        <p className="text-gray-400">
                          <i className="fa-solid fa-calendar mr-2 text-[#FFDE01]"></i>
                          {formatDate(reservation.reservationDate)} at{" "}
                          {formatTime(reservation.reservationDate)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCancelReservation(reservation._id)}
                        disabled={
                          reservation.status === "Completed" ||
                          reservation.status === "Declined"
                        }
                        className="bg-red-600 text-white px-6 py-2 font-bold rounded hover:bg-red-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancel Reservation
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#2A2A2A] p-10 rounded-lg text-center">
                  <i className="fa-solid fa-search text-6xl text-gray-600 mb-4"></i>
                  <p className="text-gray-400 text-lg">
                    {filteredReservations.length === 0 &&
                    reservations.length === 0
                      ? "No reservations found."
                      : "No reservations found matching your search."}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalReservationPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() =>
                    handleReservationPageChange(reservationCurrentPage - 1)
                  }
                  disabled={reservationCurrentPage === 1}
                  className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                    reservationCurrentPage === 1
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-[#FFDE01] text-black hover:bg-white"
                  }`}
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>

                {[...Array(totalReservationPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handleReservationPageChange(index + 1)}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                      reservationCurrentPage === index + 1
                        ? "bg-[#FFDE01] text-black"
                        : "bg-[#2A2A2A] text-white hover:bg-[#333]"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    handleReservationPageChange(reservationCurrentPage + 1)
                  }
                  disabled={reservationCurrentPage === totalReservationPages}
                  className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                    reservationCurrentPage === totalReservationPages
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-[#FFDE01] text-black hover:bg-white"
                  }`}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cars Tab */}
        {activeTab === "cars" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white">Your Vehicles</h2>

              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search by make, model, or plate..."
                  value={carSearchTerm}
                  onChange={(e) => setCarSearchTerm(e.target.value)}
                  className="w-full bg-[#2A2A2A] text-white px-4 py-3 pl-12 rounded-lg border-2 border-gray-700 focus:border-[#FFDE01] focus:outline-none"
                />
                <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* Results count */}
            <p className="text-gray-400 mb-4">
              Showing {currentCars.length} of {filteredCars.length} vehicles
            </p>

            {currentCars.length > 0 ? (
              currentCars.map((car) => (
                <div
                  key={car._id}
                  onClick={() => handleCarClick(car)}
                  className="bg-[#2A2A2A] p-6 rounded-lg border-2 border-[#FFDE01] cursor-pointer hover:bg-[#333] transition-colors"
                >
                  {/* Car Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b border-gray-700">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {car.brand} {car.model} {car.year}
                      </h3>
                      <p className="text-gray-400">
                        <i className="fa-solid fa-id-card mr-2 text-[#FFDE01]"></i>
                        Plate: {car.plate}
                      </p>
                      {car.mileage && (
                        <p className="text-gray-400 mt-1">
                          <i className="fa-solid fa-tachometer-alt mr-2 text-[#FFDE01]"></i>
                          Mileage: {car.mileage.toLocaleString()} miles
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-gray-400 text-sm text-center">
                        Click to view history
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex gap-4">
                    <div className="bg-[#1A1A1A] p-3 rounded-lg flex-1">
                      <p className="text-gray-400 text-sm">Reservations</p>
                      <p className="text-[#FFDE01] font-bold text-xl">
                        {
                          reservations.filter((r) => r.carId?._id === car._id)
                            .length
                        }
                      </p>
                    </div>
                    <div className="bg-[#1A1A1A] p-3 rounded-lg flex-1">
                      <p className="text-gray-400 text-sm">Service History</p>
                      <p className="text-[#FFDE01] font-bold text-xl">
                        {
                          reservations.filter(
                            (r) =>
                              r.carId?._id === car._id &&
                              r.status?.toLowerCase() === "completed"
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#2A2A2A] p-10 rounded-lg text-center">
                <i className="fa-solid fa-search text-6xl text-gray-600 mb-4"></i>
                <p className="text-gray-400 text-lg">
                  {filteredCars.length === 0 && cars.length === 0
                    ? "No vehicles found. Add a vehicle to get started."
                    : "No vehicles found matching your search."}
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalCarPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handleCarPageChange(carCurrentPage - 1)}
                  disabled={carCurrentPage === 1}
                  className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                    carCurrentPage === 1
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-[#FFDE01] text-black hover:bg-white"
                  }`}
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>

                {[...Array(totalCarPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handleCarPageChange(index + 1)}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                      carCurrentPage === index + 1
                        ? "bg-[#FFDE01] text-black"
                        : "bg-[#2A2A2A] text-white hover:bg-[#333]"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => handleCarPageChange(carCurrentPage + 1)}
                  disabled={carCurrentPage === totalCarPages}
                  className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                    carCurrentPage === totalCarPages
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-[#FFDE01] text-black hover:bg-white"
                  }`}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Car History Modal/Popup */}
      {showCarHistory && selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2A2A2A] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {selectedCar.brand} {selectedCar.model} {selectedCar.year} -
                Service History
              </h2>
              <div className="flex gap-2 items-center">
                {reservations.filter((r) => r.carId?._id === selectedCar._id)
                  .length > 0 && (
                  <button
                    onClick={handleDeleteCarHistory}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors text-sm"
                  >
                    <i className="fa-solid fa-trash mr-2"></i>
                    Delete History
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowCarHistory(false);
                    setSelectedCar(null);
                    setCarHistoryPage(1);
                  }}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-400">
                  <i className="fa-solid fa-id-card mr-2 text-[#FFDE01]"></i>
                  Plate: {selectedCar.plate}
                </p>
                {selectedCar.mileage && (
                  <p className="text-gray-400 mt-1">
                    <i className="fa-solid fa-tachometer-alt mr-2 text-[#FFDE01]"></i>
                    Mileage: {selectedCar.mileage.toLocaleString()} miles
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#FFDE01]">
                  <i className="fa-solid fa-history mr-2"></i>
                  Service History
                </h3>
                <p className="text-gray-400 text-sm">
                  {
                    reservations.filter((r) => r.carId?._id === selectedCar._id)
                      .length
                  }{" "}
                  total records
                </p>
              </div>

              <div className="space-y-3">
                {(() => {
                  const carReservations = reservations.filter(
                    (r) => r.carId?._id === selectedCar._id
                  );
                  const totalHistoryPages = Math.ceil(
                    carReservations.length / carHistoryPerPage
                  );
                  const indexOfLastHistory = carHistoryPage * carHistoryPerPage;
                  const indexOfFirstHistory =
                    indexOfLastHistory - carHistoryPerPage;
                  const currentHistory = carReservations.slice(
                    indexOfFirstHistory,
                    indexOfLastHistory
                  );

                  return (
                    <>
                      {currentHistory.map((reservation, index) => (
                        <div
                          key={reservation._id || index}
                          className="bg-[#1A1A1A] p-4 rounded-lg"
                        >
                          <div className="flex flex-col md:flex-row md:justify-between gap-2 mb-2">
                            <h5 className="text-white font-bold">
                              {reservation.serviceId?.name || "Unknown Service"}
                            </h5>
                            <span
                              className={`${getStatusColor(
                                reservation.status
                              )} text-white text-xs px-3 py-1 rounded-full font-bold inline-block`}
                            >
                              {reservation.status || "Waiting"}
                            </span>
                          </div>
                          <p className="text-gray-200 font-semibold text-sm mb-2">
                            <i className="fa-solid fa-warehouse mr-2 text-[#FFDE01]"></i>
                            {reservation.garageId?.name ||
                              reservation.garageId ||
                              "Unknown Garage"}
                          </p>
                          <p className="text-gray-400 text-sm mb-2">
                            <i className="fa-solid fa-calendar mr-2 text-[#FFDE01]"></i>
                            {formatDate(reservation.reservationDate)} at{" "}
                            {formatTime(reservation.reservationDate)}
                          </p>
                          {reservation.description && (
                            <p className="text-gray-300 mt-2">
                              {reservation.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </>
                  );
                })()}

                {reservations.filter((r) => r.carId?._id === selectedCar._id)
                  .length === 0 && (
                  <div className="bg-[#1A1A1A] p-8 rounded-lg text-center">
                    <i className="fa-solid fa-wrench text-4xl text-gray-600 mb-4"></i>
                    <p className="text-gray-400">
                      No service history available yet.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Service records will appear here once repairs are
                      completed.
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination for Car History */}
              {(() => {
                const carReservations = reservations.filter(
                  (r) => r.carId?._id === selectedCar._id
                );
                const totalHistoryPages = Math.ceil(
                  carReservations.length / carHistoryPerPage
                );

                if (totalHistoryPages > 1) {
                  return (
                    <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-700">
                      <button
                        onClick={() => setCarHistoryPage(carHistoryPage - 1)}
                        disabled={carHistoryPage === 1}
                        className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                          carHistoryPage === 1
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                            : "bg-[#FFDE01] text-black hover:bg-white"
                        }`}
                      >
                        <i className="fa-solid fa-chevron-left"></i>
                      </button>

                      {[...Array(totalHistoryPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => setCarHistoryPage(index + 1)}
                          className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                            carHistoryPage === index + 1
                              ? "bg-[#FFDE01] text-black"
                              : "bg-[#1A1A1A] text-white hover:bg-[#333]"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setCarHistoryPage(carHistoryPage + 1)}
                        disabled={carHistoryPage === totalHistoryPages}
                        className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                          carHistoryPage === totalHistoryPages
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                            : "bg-[#FFDE01] text-black hover:bg-white"
                        }`}
                      >
                        <i className="fa-solid fa-chevron-right"></i>
                      </button>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
