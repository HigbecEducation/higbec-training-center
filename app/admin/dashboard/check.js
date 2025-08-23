"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  LogOut,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Home,
  RefreshCw,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Settings,
  Star,
  Award,
  Target,
  User,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBatchType, setFilterBatchType] = useState("");
  const [filterRegistrationType, setFilterRegistrationType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedRows, setSelectedRows] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchRegistrations();
  }, [
    currentPage,
    searchTerm,
    filterStatus,
    filterBatchType,
    filterRegistrationType,
  ]);

  useEffect(() => {
    setShowBulkActions(selectedRows.length > 0);
  }, [selectedRows]);

  const fetchRegistrations = async () => {
    try {
      setIsRefreshing(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        status: filterStatus,
        batchType: filterBatchType,
        registrationType: filterRegistrationType,
      });

      const response = await fetch(`/api/register?${queryParams}`);

      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.registrations);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);

        // Fetch separate stats
        await fetchStats();
      } else if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        router.push("/admin");
      } else {
        toast.error("Failed to fetch registrations");
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("Failed to fetch registrations");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const statsData = await response.json();
        setStats({
          total: parseInt(statsData.total) || 0,
          pending: parseInt(statsData.pending) || 0,
          approved: parseInt(statsData.approved) || 0,
          rejected: parseInt(statsData.rejected) || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const updateRegistrationStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/registration/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Registration ${newStatus} successfully`, {
          icon: newStatus === "approved" ? "✅" : "❌",
        });
        fetchRegistrations();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const bulkUpdateStatus = async (newStatus) => {
    if (selectedRows.length === 0) {
      toast.error("No registrations selected");
      return;
    }

    const confirmMessage = `Are you sure you want to ${newStatus} ${selectedRows.length} registration(s)?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const promises = selectedRows.map((id) =>
        fetch(`/api/registration/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter((r) => r.ok).length;

      if (successCount === selectedRows.length) {
        toast.success(
          `${successCount} registrations ${newStatus} successfully`
        );
      } else {
        toast.warning(
          `${successCount} of ${selectedRows.length} registrations updated`
        );
      }

      setSelectedRows([]);
      fetchRegistrations();
    } catch (error) {
      console.error("Error in bulk update:", error);
      toast.error("Failed to update registrations");
    }
  };

  const deleteRegistration = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this registration? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/registration/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Registration deleted successfully");
        fetchRegistrations();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to delete registration");
      }
    } catch (error) {
      console.error("Error deleting registration:", error);
      toast.error("Failed to delete registration");
    }
  };

  const bulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error("No registrations selected");
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedRows.length} registration(s)? This action cannot be undone.`;
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const promises = selectedRows.map((id) =>
        fetch(`/api/registration/${id}`, {
          method: "DELETE",
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter((r) => r.ok).length;

      if (successCount === selectedRows.length) {
        toast.success(`${successCount} registrations deleted successfully`);
      } else {
        toast.warning(
          `${successCount} of ${selectedRows.length} registrations deleted`
        );
      }

      setSelectedRows([]);
      fetchRegistrations();
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Failed to delete registrations");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/auth", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Logged out successfully");
        router.push("/admin");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  const exportToCSV = () => {
    if (registrations.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csvData = registrations.map((reg) => ({
      ID: reg.id,
      "Full Name": reg.fullName,
      Email: reg.email,
      Phone: reg.phoneNumber,
      College: reg.collegeName,
      Branch: reg.branch,
      Semester: reg.semester,
      "Batch Type": reg.batchType,
      "Registration Type": reg.registrationType,
      "Project Title": reg.projectTitle,
      "Group Members Count": reg.groupMembers ? reg.groupMembers.length : 0,
      "Group Members": reg.groupMembers
        ? reg.groupMembers.map((m) => `${m.name} (${m.phoneNumber})`).join("; ")
        : "",
      Status: reg.status,
      "Registration Date": new Date(reg.createdAt).toLocaleDateString(),
      "Last Updated": new Date(reg.updatedAt).toLocaleDateString(),
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `higbec_registrations_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("CSV exported successfully");
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(registrations.map((reg) => reg.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterBatchType("");
    setFilterRegistrationType("");
    setCurrentPage(1);
    toast.success("Filters cleared");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getPaginationInfo = () => {
    if (totalCount === 0) return "No registrations found";
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalCount);
    return `Showing ${start}-${end} of ${totalCount} registrations`;
  };

  const getRegistrationTypeIcon = (type) => {
    return type === "Group Project" ? (
      <Users className="w-4 h-4 text-blue-500" />
    ) : (
      <User className="w-4 h-4 text-green-500" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">
            Please wait while we fetch the latest data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
            fontSize: "14px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container-custom">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-gray-800"
              >
                Admin <span className="text-gradient">Dashboard</span>
              </motion.h1>
              {isRefreshing && (
                <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push("/")}
                className="btn-secondary text-sm py-2 px-4 flex items-center hover:shadow-md transition-all duration-300"
              >
                <Home className="w-4 h-4 mr-2" />
                View Site
              </button>

              <button
                onClick={fetchRegistrations}
                className="btn-secondary text-sm py-2 px-4 flex items-center hover:shadow-md transition-all duration-300"
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>

              <button
                onClick={handleLogout}
                className="btn-secondary text-sm py-2 px-4 flex items-center text-red-600 border-red-600 hover:bg-red-600 hover:text-white transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Registrations
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.total}
                </p>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  All time
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-yellow-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Pending Review
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Needs attention
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Approved
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.approved}
                </p>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <Target className="w-3 h-3 mr-1" />
                  Active projects
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-red-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Rejected
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.rejected}
                </p>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <XCircle className="w-3 h-3 mr-1" />
                  Not approved
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                <XCircle className="w-7 h-7 text-red-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-lg mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, project..."
                  className="pl-10 form-input w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <select
                  className="form-input w-full sm:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Status</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="approved">✅ Approved</option>
                  <option value="rejected">❌ Rejected</option>
                </select>

                <select
                  className="form-input w-full sm:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterBatchType}
                  onChange={(e) => {
                    setFilterBatchType(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Batch Types</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="B.Sc.">B.Sc.</option>
                  <option value="M.Sc.">M.Sc.</option>
                  <option value="MCA">MCA</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Polytechnic">Polytechnic</option>
                </select>

                <select
                  className="form-input w-full sm:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterRegistrationType}
                  onChange={(e) => {
                    setFilterRegistrationType(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Types</option>
                  <option value="Individual Project">👤 Individual</option>
                  <option value="Group Project">👥 Group</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full lg:w-auto">
              {(searchTerm ||
                filterStatus ||
                filterBatchType ||
                filterRegistrationType) && (
                <button
                  onClick={clearFilters}
                  className="btn-secondary text-sm py-2 px-4 flex items-center hover:shadow-md transition-all duration-300"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Clear Filters
                </button>
              )}

              <button
                onClick={exportToCSV}
                disabled={registrations.length === 0}
                className="btn-primary flex items-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {showBulkActions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {selectedRows.length} registration(s) selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => bulkUpdateStatus("approved")}
                    className="btn-secondary text-sm py-1 px-3 text-green-600 border-green-600 hover:bg-green-600 hover:text-white transition-all duration-300"
                  >
                    ✅ Approve Selected
                  </button>
                  <button
                    onClick={() => bulkUpdateStatus("rejected")}
                    className="btn-secondary text-sm py-1 px-3 text-red-600 border-red-600 hover:bg-red-600 hover:text-white transition-all duration-300"
                  >
                    ❌ Reject Selected
                  </button>
                  <button
                    onClick={bulkDelete}
                    className="btn-secondary text-sm py-1 px-3 text-red-600 border-red-600 hover:bg-red-600 hover:text-white transition-all duration-300"
                  >
                    🗑️ Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedRows([])}
                    className="btn-secondary text-sm py-1 px-3 text-gray-600 border-gray-600 hover:bg-gray-600 hover:text-white transition-all duration-300"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Registrations Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Project Registrations
              </h3>
              <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                {getPaginationInfo()}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.length === registrations.length &&
                        registrations.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => handleSort("fullName")}
                  >
                    <div className="flex items-center">
                      Student Details
                      {sortField === "fullName" &&
                        (sortDirection === "asc" ? (
                          <ArrowUp className="w-4 h-4 ml-1" />
                        ) : (
                          <ArrowDown className="w-4 h-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academic Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Details
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      {sortField === "status" &&
                        (sortDirection === "asc" ? (
                          <ArrowUp className="w-4 h-4 ml-1" />
                        ) : (
                          <ArrowDown className="w-4 h-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center">
                      Registration Date
                      {sortField === "createdAt" &&
                        (sortDirection === "asc" ? (
                          <ArrowUp className="w-4 h-4 ml-1" />
                        ) : (
                          <ArrowDown className="w-4 h-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((registration, index) => (
                  <motion.tr
                    key={registration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`hover:bg-gray-50 transition-all duration-200 ${
                      selectedRows.includes(registration.id)
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(registration.id)}
                        onChange={(e) =>
                          handleSelectRow(registration.id, e.target.checked)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold text-sm">
                            {registration.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {registration.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {registration.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            📱 {registration.phoneNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        🏫 {registration.collegeName}
                      </div>
                      <div className="text-sm text-gray-500">
                        📚 {registration.branch} - {registration.semester}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 mt-1">
                          {registration.batchType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs">
                        <div
                          className="truncate mb-1"
                          title={registration.projectTitle}
                        >
                          📋 {registration.projectTitle}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        {getRegistrationTypeIcon(registration.registrationType)}
                        <span className="ml-1">
                          {registration.registrationType}
                        </span>
                      </div>
                      {registration.groupMembers &&
                        registration.groupMembers.length > 0 && (
                          <div className="text-xs">
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                              👥 {registration.groupMembers.length} member(s)
                            </span>
                          </div>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            registration.status
                          )}`}
                        >
                          {getStatusIcon(registration.status)}
                          <span className="ml-1 capitalize">
                            {registration.status}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="font-medium">
                        📅{" "}
                        {new Date(registration.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        🕐{" "}
                        {new Date(registration.createdAt).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </div>
                      {registration.updatedAt !== registration.createdAt && (
                        <div className="text-xs text-blue-600 mt-1">
                          Updated:{" "}
                          {new Date(
                            registration.updatedAt
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Quick Status Update Buttons */}
                        {registration.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                updateRegistrationStatus(
                                  registration.id,
                                  "approved"
                                )
                              }
                              className="text-green-600 hover:text-green-900 hover:bg-green-100 p-2 rounded-full transition-all duration-200 group"
                              title="Approve Registration"
                            >
                              <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                            </button>
                            <button
                              onClick={() =>
                                updateRegistrationStatus(
                                  registration.id,
                                  "rejected"
                                )
                              }
                              className="text-red-600 hover:text-red-900 hover:bg-red-100 p-2 rounded-full transition-all duration-200 group"
                              title="Reject Registration"
                            >
                              <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                            </button>
                          </>
                        )}

                        {/* View Details */}
                        <button
                          onClick={() => {
                            toast.success(
                              `Viewing details for ${registration.fullName}`
                            );
                          }}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-100 p-2 rounded-full transition-all duration-200 group"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => deleteRegistration(registration.id)}
                          className="text-red-600 hover:text-red-900 hover:bg-red-100 p-2 rounded-full transition-all duration-200 group"
                          title="Delete Registration"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {registrations.length === 0 && (
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No registrations found
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchTerm ||
                  filterStatus ||
                  filterBatchType ||
                  filterRegistrationType
                    ? "No registrations match your current search and filter criteria. Try adjusting your filters or search terms."
                    : "No project registrations have been submitted yet. Once students start registering, they will appear here."}
                </p>
                {(searchTerm ||
                  filterStatus ||
                  filterBatchType ||
                  filterRegistrationType) && (
                  <button onClick={clearFilters} className="btn-primary">
                    Clear All Filters
                  </button>
                )}
              </motion.div>
            </div>
          )}

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  {getPaginationInfo()}
                </div>

                <div className="flex items-center space-x-2">
                  {/* First Page */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    First
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md transition-all duration-200 ${
                            currentPage === page
                              ? "bg-blue-600 text-white border-blue-600 shadow-md"
                              : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Page */}
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Last
                  </button>
                </div>
              </div>

              {/* Page Size Info */}
              <div className="flex items-center justify-center mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  Showing {itemsPerPage} items per page
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Actions Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Quick Approve
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Quickly approve all pending registrations that meet standard
              criteria.
            </p>
            <button
              onClick={() => {
                const pendingIds = registrations
                  .filter((r) => r.status === "pending")
                  .map((r) => r.id);
                if (pendingIds.length > 0) {
                  setSelectedRows(pendingIds);
                  toast.info(
                    `${pendingIds.length} pending registrations selected for bulk approval`
                  );
                } else {
                  toast.info("No pending registrations to approve");
                }
              }}
              className="btn-secondary text-sm w-full"
            >
              Select All Pending
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Export Reports
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Generate detailed reports with current registration data and
              statistics.
            </p>
            <button
              onClick={exportToCSV}
              disabled={registrations.length === 0}
              className="btn-secondary text-sm w-full disabled:opacity-50"
            >
              Generate Report
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                System Stats
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              View detailed analytics and system performance metrics.
            </p>
            <button
              onClick={() => {
                toast.success("System stats feature coming soon!");
              }}
              className="btn-secondary text-sm w-full"
            >
              View Analytics
            </button>
          </div>
        </motion.div>

        {/* Recent Activity Summary */}
        {registrations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 bg-white p-6 rounded-xl shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Activity Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {
                    registrations.filter((r) => {
                      const today = new Date();
                      const regDate = new Date(r.createdAt);
                      return regDate.toDateString() === today.toDateString();
                    }).length
                  }
                </div>
                <div className="text-sm text-gray-600">
                  Today's Registrations
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {
                    registrations.filter((r) => {
                      const weekAgo = new Date(
                        Date.now() - 7 * 24 * 60 * 60 * 1000
                      );
                      const regDate = new Date(r.createdAt);
                      return regDate >= weekAgo;
                    }).length
                  }
                </div>
                <div className="text-sm text-gray-600">This Week</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {
                    registrations.filter(
                      (r) => r.registrationType === "Group Project"
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">Group Projects</div>
              </div>

              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {Math.round((stats.approved / (stats.total || 1)) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Approval Rate</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
