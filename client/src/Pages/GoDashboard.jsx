import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Wallet, CalendarDays, Wrench } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { GarageContext } from "../Contexts/GarageContext";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const GoDashboard = () => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const { getToken } = useAuth();
  const { selectedGarageId } = useContext(GarageContext);
  const [totalBookings, setTotalBookings] = useState(0);
  const [mechanicCount, setMechanicCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // === FETCH BOOKINGS FROM API ===
  const fetchBookings = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      let url = `${backendUrl}/api/garage-owner/reservations/all`;
      if (selectedGarageId) {
        url += `?garageId=${selectedGarageId}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setTotalBookings(res.data.totalReservations || 0);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  // === FETCH MECHANIC COUNT FROM API ===
  const fetchMechanicCount = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      let url = `${backendUrl}/api/garage-owner/mechanics/count`;
      if (selectedGarageId) {
        url += `?garageId=${selectedGarageId}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setMechanicCount(res.data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching mechanic count:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBookings(), fetchMechanicCount()]);
      setLoading(false);
    };
    loadData();
  }, [selectedGarageId]);

  const stats = [
    {
      title: "New Net Income",
      value: "£8,245.00",
      change: "-0.5%",
      icon: <Wallet className="w-10 h-10 text-yellow-300" />,
    },
    {
      title: "Total Reservations",
      value: loading ? "..." : totalBookings,
      change: "+10%",
      icon: <CalendarDays className="w-10 h-10 text-yellow-300" />,
    },
    {
      title: "Number of Mechanics",
      value: loading ? "..." : mechanicCount,
      change: "+1",
      icon: <Wrench className="w-10 h-10 text-yellow-300" />,
    },
  ];

  const salesData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Organic",
        data: [40, 45, 50, 55, 48, 52, 60],
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "Professional",
        data: [50, 55, 58, 62, 60, 65, 70],
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const calendarEvents = [
    { title: "Vehicle Repair - John", date: "2025-01-07" },
    { title: "Maintenance - Alex", date: "2025-01-10" },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#F5F5F5] min-h-screen">
      {/* Stats Section */}
      <div className="grid grid-cols-1 mx-auto md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow p-5 min-w-[300px] flex items-center justify-between"
          >
            <div>
              <h3 className="text-black text-sm font-medium">{item.title}</h3>
              <p className="text-2xl sm:text-3xl font-bold mt-1">
                {item.value}
              </p>
              <span className="text-sm text-gray-500">
                {item.change} from last week
              </span>
            </div>
            <div>{item.icon}</div>
          </div>
        ))}
      </div>

      {/* Graph & Calendar */}
      <div className="flex flex-col xl:flex-row gap-5 w-full">
        {/* Sales Graph */}
        <div className="bg-white rounded-2xl shadow p-5 min-w-[300px] xl:w-[70%]">
          <h2 className="font-semibold text-lg mb-4">Overall Sales</h2>
          <div className="w-full overflow-hidden">
            <Line data={salesData} />
          </div>
        </div>

        {/* Calendar Section */}
        <div className="bg-white rounded-2xl shadow p-5 min-w-[300px] xl:w-[30%]">
          <h2 className="font-semibold text-lg mb-4">Calendar</h2>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            height={520}
          />
        </div>
      </div>
    </div>
  );
};

export default GoDashboard;
