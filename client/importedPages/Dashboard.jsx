import React, { useState } from "react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("reservations");
  const [reservationSearchTerm, setReservationSearchTerm] = useState("");
  const [carSearchTerm, setCarSearchTerm] = useState("");
  const [reservationCurrentPage, setReservationCurrentPage] = useState(1);
  const [carCurrentPage, setCarCurrentPage] = useState(1);
  const reservationsPerPage = 3;
  const carsPerPage = 2;

  // Fake reservation data
  const allReservations = [
    {
      id: 1,
      service: "Advanced Diagnostics",
      date: "2024-11-20",
      time: "10:00 AM",
      status: "Pending",
      car: "BMW X5 2020",
    },
    {
      id: 2,
      service: "Oil Change",
      date: "2024-11-18",
      time: "2:00 PM",
      status: "Accepted",
      car: "Mercedes C-Class 2019",
    },
    {
      id: 3,
      service: "Brake Repair",
      date: "2024-11-15",
      time: "11:30 AM",
      status: "Rejected",
      car: "Audi A4 2021",
    },
    {
      id: 4,
      service: "ECU Remapping",
      date: "2024-11-22",
      time: "9:00 AM",
      status: "Accepted",
      car: "BMW X5 2020",
    },
    {
      id: 5,
      service: "Transmission Service",
      date: "2024-11-10",
      time: "3:00 PM",
      status: "Pending",
      car: "Audi A4 2021",
    },
    {
      id: 6,
      service: "Battery Replacement",
      date: "2024-11-05",
      time: "1:00 PM",
      status: "Accepted",
      car: "Mercedes C-Class 2019",
    },
  ];

  // Fake cars data
  const allCars = [
    {
      id: 1,
      make: "BMW",
      model: "X5",
      year: 2020,
      plate: "ABC123",
      status: "Getting Fixed",
      currentService: "ECU Remapping in progress",
      history: [
        {
          date: "2024-10-15",
          service: "Oil Change",
          garage: "Perfect Garage Ltd",
          mechanic: "John Smith",
          problem: "Regular maintenance - oil and filter replacement",
          cost: "£85.00",
        },
        {
          date: "2024-09-10",
          service: "Brake Inspection",
          garage: "Perfect Garage Ltd",
          mechanic: "Mike Johnson",
          problem: "Brake pads worn, replaced front and rear pads",
          cost: "£245.00",
        },
      ],
    },
    {
      id: 2,
      make: "Mercedes",
      model: "C-Class",
      year: 2019,
      plate: "XYZ789",
      status: "Ready to Go",
      currentService: "Oil Change Completed",
      history: [
        {
          date: "2024-11-18",
          service: "Oil Change",
          garage: "Perfect Garage Ltd",
          mechanic: "David Brown",
          problem: "Regular service - oil, filter, and fluid top-up",
          cost: "£95.00",
        },
        {
          date: "2024-08-22",
          service: "AC Repair",
          garage: "Perfect Garage Ltd",
          mechanic: "John Smith",
          problem: "AC not cooling - refrigerant refill and compressor check",
          cost: "£180.00",
        },
      ],
    },
    {
      id: 3,
      make: "Audi",
      model: "A4",
      year: 2021,
      plate: "LMN456",
      status: "Reserved",
      currentService: "Scheduled for Diagnostics on Nov 25",
      history: [
        {
          date: "2024-07-30",
          service: "Transmission Service",
          garage: "Perfect Garage Ltd",
          mechanic: "Mike Johnson",
          problem: "Transmission fluid change and filter replacement",
          cost: "£320.00",
        },
      ],
    },
    {
      id: 4,
      make: "Toyota",
      model: "Camry",
      year: 2022,
      plate: "DEF456",
      status: "Ready to Go",
      currentService: "Inspection Completed",
      history: [
        {
          date: "2024-10-20",
          service: "Annual Inspection",
          garage: "Perfect Garage Ltd",
          mechanic: "John Smith",
          problem: "Routine annual inspection - all systems checked",
          cost: "£120.00",
        },
      ],
    },
    {
      id: 5,
      make: "Ford",
      model: "Focus",
      year: 2018,
      plate: "GHI789",
      status: "Getting Fixed",
      currentService: "Brake System Repair",
      history: [
        {
          date: "2024-11-12",
          service: "Brake Pad Replacement",
          garage: "Perfect Garage Ltd",
          mechanic: "Mike Johnson",
          problem: "Front brake pads worn, replaced with new ones",
          cost: "£200.00",
        },
      ],
    },
  ];

  // Filter reservations based on search
  const filteredReservations = allReservations.filter((reservation) => {
    const searchLower = reservationSearchTerm.toLowerCase();
    return (
      reservation.service.toLowerCase().includes(searchLower) ||
      reservation.date.includes(searchLower) ||
      reservation.car.toLowerCase().includes(searchLower)
    );
  });

  // Filter cars based on search
  const filteredCars = allCars.filter((car) => {
    const searchLower = carSearchTerm.toLowerCase();
    return (
      car.make.toLowerCase().includes(searchLower) ||
      car.model.toLowerCase().includes(searchLower) ||
      car.plate.toLowerCase().includes(searchLower) ||
      car.status.toLowerCase().includes(searchLower)
    );
  });

  // Pagination logic for reservations
  const totalReservationPages = Math.ceil(filteredReservations.length / reservationsPerPage);
  const indexOfLastReservation = reservationCurrentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = filteredReservations.slice(indexOfFirstReservation, indexOfLastReservation);

  // Pagination logic for cars
  const totalCarPages = Math.ceil(filteredCars.length / carsPerPage);
  const indexOfLastCar = carCurrentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = filteredCars.slice(indexOfFirstCar, indexOfLastCar);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setReservationCurrentPage(1);
  }, [reservationSearchTerm]);

  React.useEffect(() => {
    setCarCurrentPage(1);
  }, [carSearchTerm]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500";
      case "accepted":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "getting fixed":
        return "bg-blue-500";
      case "ready to go":
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

  return (
    <div className="min-h-screen bg-[#1A1A1A] pt-[180px] pb-20 w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
            Client <span className="text-[#FFDE01]">Dashboard</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your reservations and vehicles
          </p>
        </div>

        {/* Navigation Tabs */}
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
              Showing {currentReservations.length} of {filteredReservations.length} reservations
            </p>

            <div className="grid grid-cols-1 gap-4">
              {currentReservations.length > 0 ? (
                currentReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="bg-[#2A2A2A] p-6 rounded-lg border-l-4 border-[#FFDE01] hover:bg-[#333] transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">
                            {reservation.service}
                          </h3>
                          <span
                            className={`${getStatusColor(
                              reservation.status
                            )} text-white text-xs px-3 py-1 rounded-full font-bold`}
                          >
                            {reservation.status}
                          </span>
                        </div>
                        <p className="text-gray-400 mb-1">
                          <i className="fa-solid fa-car mr-2 text-[#FFDE01]"></i>
                          {reservation.car}
                        </p>
                        <p className="text-gray-400">
                          <i className="fa-solid fa-calendar mr-2 text-[#FFDE01]"></i>
                          {reservation.date} at {reservation.time}
                        </p>
                      </div>
                      <button className="bg-[#FFDE01] text-black px-6 py-2 font-bold rounded hover:bg-white transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#2A2A2A] p-10 rounded-lg text-center">
                  <i className="fa-solid fa-search text-6xl text-gray-600 mb-4"></i>
                  <p className="text-gray-400 text-lg">No reservations found matching your search.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalReservationPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handleReservationPageChange(reservationCurrentPage - 1)}
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
                  onClick={() => handleReservationPageChange(reservationCurrentPage + 1)}
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
              <h2 className="text-2xl font-bold text-white">
                Your Vehicles
              </h2>
              
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search by make, model, plate, or status..."
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
                  key={car.id}
                  className="bg-[#2A2A2A] p-6 rounded-lg border-2 border-[#FFDE01]"
                >
                  {/* Car Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b border-gray-700">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {car.make} {car.model} {car.year}
                      </h3>
                      <p className="text-gray-400">
                        <i className="fa-solid fa-id-card mr-2 text-[#FFDE01]"></i>
                        Plate: {car.plate}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span
                        className={`${getStatusColor(
                          car.status
                        )} text-white px-4 py-2 rounded-full font-bold text-center`}
                      >
                        {car.status}
                      </span>
                      <p className="text-gray-400 text-sm text-center">
                        {car.currentService}
                      </p>
                    </div>
                  </div>

                  {/* Service History */}
                  <div>
                    <h4 className="text-xl font-bold text-[#FFDE01] mb-4">
                      <i className="fa-solid fa-history mr-2"></i>
                      Service History
                    </h4>
                    <div className="space-y-3">
                      {car.history.map((record, index) => (
                        <div
                          key={index}
                          className="bg-[#1A1A1A] p-4 rounded-lg hover:bg-[#333] transition-colors"
                        >
                          <div className="flex flex-col md:flex-row md:justify-between gap-2 mb-2">
                            <h5 className="text-white font-bold">
                              {record.service}
                            </h5>
                            <span className="text-[#FFDE01] font-bold">
                              {record.cost}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">
                            <i className="fa-solid fa-calendar mr-2"></i>
                            {record.date}
                          </p>
                          <p className="text-gray-300 mb-2">{record.problem}</p>
                          <div className="flex flex-col sm:flex-row gap-2 text-sm">
                            <p className="text-gray-400">
                              <i className="fa-solid fa-building mr-2 text-[#FFDE01]"></i>
                              {record.garage}
                            </p>
                            <p className="text-gray-400">
                              <i className="fa-solid fa-user-gear mr-2 text-[#FFDE01]"></i>
                              Mechanic: {record.mechanic}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#2A2A2A] p-10 rounded-lg text-center">
                <i className="fa-solid fa-search text-6xl text-gray-600 mb-4"></i>
                <p className="text-gray-400 text-lg">No vehicles found matching your search.</p>
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
    </div>
  );
};

export default Dashboard;