import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const { getToken } = useAuth();
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const fetchCustomers = async () => {
    try {
      const token = await getToken();

      const res = await axios.get(
        `${backendUrl}/api/garage-owner/clients`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCustomers(res.data.clients || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, customers]);

  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  return (
    <div className="p-2 sm:p-6 bg-[#F5F5F5] min-h-screen space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Customers</h1>

      {/* Search */}
      <div className="bg-white shadow rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center w-full bg-gray-100 px-3 py-2 rounded-xl">
          <Search className="text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search customers..."
            className="bg-transparent w-full outline-none ml-2"
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow py-4 px-1 sm:p-5">
        <table className="w-full min-w-[300px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 pb-5">
              <th className="p-1 md:p-2 text-xs sm:text-sm md:text-base">
                #
              </th>
              <th className="p-1 md:p-2 text-xs sm:text-sm md:text-base">
                Name
              </th>
              <th className="p-1 md:p-2 text-xs sm:text-sm md:text-base">
                Email
              </th>
              <th className="p-1 md:p-2 text-xs sm:text-sm md:text-base">
                Phone
              </th>
              <th className="p-1 md:p-2 text-xs sm:text-sm md:text-base">
                Reservations
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((customer, index) => (
                <tr
                  key={customer.userId || index}
                  className="border-b border-gray-200"
                >
                  <td className="p-5 text-xs sm:text-sm md:text-base">
                    {(page - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="p-1 md:p-5 text-xs sm:text-sm md:text-base">
                    {customer.name}
                  </td>
                  <td className="p-1 md:p-5 text-xs sm:text-sm md:text-base">
                    {customer.email}
                  </td>
                  <td className="p-1 md:p-5 text-xs sm:text-sm md:text-base">
                    {customer.phone || "N/A"}
                  </td>
                  <td className="p-1 md:p-5 text-xs sm:text-sm md:text-base font-semibold text-gray-700">
                    {customer.totalReservations}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={5}>
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center gap-1 sm:gap-3 mt-10">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-2 py-0 sm:px-4 sm:py-2 rounded-lg bg-gray-200 disabled:opacity-40"
          >
            Prev
          </button>

          <span className="px-1 sm:px-4 sm:py-2 font-semibold text-gray-700">
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-2 py-0 sm:px-4 sm:py-2 rounded-lg bg-gray-200 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Customers;
