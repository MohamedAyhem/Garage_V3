import React, { useState, useMemo, useEffect, useContext } from "react";
import { Search } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import MechanicModal from "../Components/MechanicModal";
import MechanicTable from "../Components/MechanicTable";
import { GarageContext } from "../Contexts/GarageContext";

const Mechanics = () => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const { getToken } = useAuth();
  const { selectedGarageId } = useContext(GarageContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editSalary, setEditSalary] = useState("");
  const [editHours, setEditHours] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showPassword, setShowPassword] = useState({});
  const [copiedPassword, setCopiedPassword] = useState({});
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generatePassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const password = Array.from(crypto.getRandomValues(new Uint32Array(length)))
      .map((x) => charset[x % charset.length])
      .join("");
    setGeneratedPassword(password);
    return password;
  };

  const copyPassword = async (password, mechanicId) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedPassword({ ...copiedPassword, [mechanicId]: true });
      setTimeout(() => {
        setCopiedPassword({ ...copiedPassword, [mechanicId]: false });
      }, 2000);
    } catch (error) {
      console.error("Failed to copy password:", error);
      toast.error("Failed to copy password");
    }
  };

  const fetchMechanics = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        console.error("No token available");
        setLoading(false);
        return;
      }

      let url = `${backendUrl}/api/garage-owner/mechanics`;
      if (selectedGarageId) {
        url += `?garageId=${selectedGarageId}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setMechanics(res.data.mechanics || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching mechanics:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMechanics();
  }, [selectedGarageId, getToken, backendUrl]);

  const openModal = (m) => {
    setIsAddMode(false);
    setSelected(m);
    setEditName(m.name);
    setEditEmail(m.email);
    setEditSalary(m.salary?.toString() || "");
    setEditHours(m.hours?.toString() || "");
    setGeneratedPassword("");
    setModalOpen(true);
  };

  const openAddModal = () => {
    setIsAddMode(true);
    setSelected(null);
    setEditName("");
    setEditEmail("");
    setEditSalary("");
    setEditHours("");
    setGeneratedPassword("");
    setModalOpen(true);
  };

  const saveChanges = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required. Please sign in again.");
        setIsSubmitting(false);
        return;
      }

      // Validation
      if (!editName.trim()) {
        toast.error("Name is required");
        setIsSubmitting(false);
        return;
      }

      if (!editEmail.trim()) {
        toast.error("Email is required");
        setIsSubmitting(false);
        return;
      }

      const salaryNum = parseFloat(editSalary);
      if (isNaN(salaryNum) || salaryNum < 0) {
        toast.error("Salary must be a positive number");
        setIsSubmitting(false);
        return;
      }

      const hoursNum = parseFloat(editHours);
      if (isNaN(hoursNum) || hoursNum < 0) {
        toast.error("Hours must be a positive number");
        setIsSubmitting(false);
        return;
      }

      if (isAddMode) {
        if (!generatedPassword) {
          toast.error("Please generate a password first");
          setIsSubmitting(false);
          return;
        }

        const res = await axios.post(
          `${backendUrl}/api/garage-owner/create-mechanic`,
          {
            name: editName.trim(),
            email: editEmail.trim(),
            salary: salaryNum,
            hours: hoursNum,
            password: generatedPassword,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          await fetchMechanics();
          setModalOpen(false);
          toast.success("Mechanic created successfully!");
        }
      } else {
        const res = await axios.put(
          `${backendUrl}/api/garage-owner/mechanic/${selected._id}`,
          {
            name: editName.trim(),
            email: editEmail.trim(),
            salary: salaryNum,
            hours: hoursNum,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          await fetchMechanics();
          setModalOpen(false);
          toast.success("Mechanic updated successfully!");
        }
      }
    } catch (error) {
      console.error("Error saving mechanic:", error);
      toast.error(error.response?.data?.message || "Failed to save mechanic");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteMechanic = async (id) => {
    if (!window.confirm("Are you sure you want to delete this mechanic?")) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required. Please sign in again.");
        return;
      }

      const res = await axios.delete(
        `${backendUrl}/api/garage-owner/mechanic/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        await fetchMechanics();
        toast.success("Mechanic deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting mechanic:", error);
      toast.error(error.response?.data?.message || "Failed to delete mechanic");
    }
  };

  const togglePasswordVisibility = (mechanicId) => {
    setShowPassword({
      ...showPassword,
      [mechanicId]: !showPassword[mechanicId],
    });
  };

  const filteredMechanics = useMemo(() => {
    return mechanics.filter(
      (m) =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, mechanics]);

  const paginatedMechanics = filteredMechanics.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredMechanics.length / itemsPerPage);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-[#F5F5F5] min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-800">
          Loading mechanics...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-[#F5F5F5] min-h-screen space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Mechanic Management
        </h1>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Add Mechanic
        </button>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center w-full bg-gray-100 px-3 py-2 rounded-xl">
          <Search className="text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search mechanic..."
            className="bg-transparent w-full outline-none ml-2"
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="font-semibold text-lg mb-4">All Mechanics</h2>
        <MechanicTable
          mechanics={paginatedMechanics}
          page={page}
          itemsPerPage={itemsPerPage}
          showPassword={showPassword}
          onTogglePassword={togglePasswordVisibility}
          copiedPassword={copiedPassword}
          onCopyPassword={copyPassword}
          onEdit={openModal}
          onDelete={deleteMechanic}
        />

        {/* Pagination */}
        {totalPages > 1 && (
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
        )}
      </div>

      {/* Modal */}
      <MechanicModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isAddMode={isAddMode}
        editName={editName}
        setEditName={setEditName}
        editEmail={editEmail}
        setEditEmail={setEditEmail}
        editSalary={editSalary}
        setEditSalary={setEditSalary}
        editHours={editHours}
        setEditHours={setEditHours}
        generatedPassword={generatedPassword}
        onGeneratePassword={generatePassword}
        showPassword={showPassword}
        onTogglePassword={togglePasswordVisibility}
        copiedPassword={copiedPassword}
        onCopyPassword={copyPassword}
        onSubmit={saveChanges}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Mechanics;
