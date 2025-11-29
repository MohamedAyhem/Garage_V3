import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useContext,
} from "react";
import axios from "axios";
import { Search } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/clerk-react";
import { GarageContext } from "../Contexts/GarageContext";

const Reservations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const [viewingDescription, setViewingDescription] = useState("");

  const [editMechanic, setEditMechanic] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const [mechanics, setMechanics] = useState([]);
  const [reservations, setReservations] = useState([]);

  const { getToken } = useAuth();
  const { selectedGarageId } = useContext(GarageContext);
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  // Fetch reservations + mechanics
  const fetchReservations = useCallback(async () => {
    const token = await getToken();
    if (!token) return;

    try {
      let url = `${backendUrl}/api/garage-owner/reservations/all`;
      if (selectedGarageId) {
        url += `?garageId=${selectedGarageId}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReservations(res.data.reservations || []);
      setMechanics(res.data.mechanics || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Failed to load reservations");
    }
  }, [getToken, selectedGarageId, backendUrl]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Decline reservation
  const declineReservation = async (id) => {
    const token = await getToken();
    if (!token) return;

    try {
      await axios.put(
        `${backendUrl}/api/garage-owner/reservation/decline`,
        { reservationId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove declined item from UI
      setReservations((prev) => prev.filter((r) => r._id !== id));
      toast.success("Reservation declined");
    } catch (error) {
      console.error("Error declining reservation:", error);
      toast.error(
        error.response?.data?.message || "Unable to decline reservation"
      );
    }
  };

  // Save changes from modal
  const saveChanges = async () => {
    const token = await getToken();
    if (!token || !selected) return;

    if (!editStatus) {
      toast.error("Please select a status before saving");
      return;
    }

    try {
      const res = await axios.put(
        `${backendUrl}/api/garage-owner/reservations/update`,
        {
          reservationId: selected._id,
          mechanicId: editMechanic || null,
          status: editStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data.reservation;

      // Update UI, preserving computed fields that backend omits
      setReservations((prev) =>
        prev.map((r) =>
          r._id === updated._id
            ? {
                ...r,
                ...updated,
                customerName: r.customerName,
                customerEmail: r.customerEmail,
              }
            : r
        )
      );

      // Refetch mechanics to update task counts
      await fetchReservations();

      toast.success("Reservation updated");
      setModalOpen(false);
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error(
        error.response?.data?.message ||
          "Unable to update reservation. Please try again."
      );
    }
  };

  // Open modal
  const openModal = (reservation) => {
    setSelected(reservation);
    setEditMechanic(reservation.mechanicId?._id || "");
    setEditStatus(reservation.status || "Waiting");
    setModalOpen(true);
  };

  // Filtering reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      const customer = res.customerName?.toLowerCase() || "";
      const mechanic = res.mechanicId?.name?.toLowerCase() || "unassigned";
      const date = res.reservationDate || "";
      const status = res.status?.toLowerCase() || "";

      return (
        customer.includes(searchTerm.toLowerCase()) ||
        mechanic.includes(searchTerm.toLowerCase()) ||
        date.toString().includes(searchTerm.toLowerCase()) ||
        status.includes(searchTerm.toLowerCase())
      );
    });
  }, [searchTerm, reservations]);

  // Pagination
  const paginatedReservations = filteredReservations.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  const statusStyles = {
    waiting: "bg-amber-100 text-amber-800",
    pending: "bg-yellow-100 text-yellow-800",
    "in progress": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-800",
    default: "bg-gray-100 text-gray-700",
  };

  const renderStatusChip = (status) => {
    const key = status?.toLowerCase() || "default";
    const style = statusStyles[key] || statusStyles.default;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${style}`}>
        {status || "Unknown"}
      </span>
    );
  };

  return (
    <div className="p-2 sm:p-6 bg-[#F5F5F5] min-h-screen space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reservations</h1>

      {/* Search */}
      <div className="bg-white shadow rounded-2xl p-4 flex">
        <div className="flex items-center w-full bg-gray-100 px-3 py-2 rounded-xl">
          <Search className="text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search reservations..."
            className="bg-transparent w-full outline-none ml-2"
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="font-semibold text-lg mb-4">All Reservations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-sm">
                <th className="p-2">No</th>
                <th className="p-2">Customer</th>
                <th className="p-2">Vehicle</th>
                <th className="p-2">Date</th>
                <th className="p-2">Mechanic</th>
                <th className="p-2">Status</th>
                <th className="p-2">Description</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedReservations.map((r, index) => (
                <tr key={r._id} className="border-b border-gray-200 text-sm">
                  <td className="p-2">
                    {(page - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="p-2">{r.customerName}</td>
                  <td className="p-2">
                    {r.carId
                      ? `${r.carId.brand || ""} ${r.carId.model || ""}`.trim()
                      : "N/A"}
                  </td>
                  <td className="p-2">
                    {new Date(r.reservationDate).toLocaleString()}
                  </td>
                  <td className="p-2">{r.mechanicId?.name || "Unassigned"}</td>

                  <td className="p-2">{renderStatusChip(r.status)}</td>
                  <td className="p-2 max-w-xs">
                    {r.description ? (
                      <button
                        onClick={() => {
                          setViewingDescription(r.description);
                          setDescriptionModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                      >
                        {r.description.length > 30
                          ? r.description.substring(0, 20) + "..."
                          : r.description}
                      </button>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => openModal(r)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => declineReservation(r._id)}
                      disabled={r.status === "Declined"}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm disabled:opacity-40"
                    >
                      Decline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-3 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="px-4 py-2 font-semibold text-gray-700">
            Page {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Edit Reservation</h3>

            {/* Mechanic */}
            <label className="font-medium text-sm">Mechanic</label>
            <select
              value={editMechanic}
              onChange={(e) => setEditMechanic(e.target.value)}
              className="w-full p-2 border rounded-lg mt-1 mb-4"
            >
              <option value="">Unassigned</option>
              {mechanics.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>

            {/* Status */}
            <label className="font-medium text-sm">Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="w-full p-2 border rounded-lg mt-1 mb-4"
            >
              <option value="Waiting">Waiting</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Declined">Declined</option>
            </select>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Description View Modal */}
      {descriptionModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Description</h3>
            <p className="text-gray-700 mb-6 leading-relaxed whitespace-pre-wrap">
              {viewingDescription}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDescriptionModalOpen(false);
                  setViewingDescription("");
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
