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
  Phone,
  Mail,
  ImageIcon,
  X,
  ZoomIn,
  Download as DownloadIcon,
  Users as GroupIcon,
  School,
  BookOpen,
  Calendar as CalendarIcon,
  MapPin,
  Briefcase,
  Monitor,
  Activity,
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
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const itemsPerPage = 10;

  // Helper function to format date in IST
  const formatDateIST = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    // Format date in IST
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Helper function to format just date in IST
  const formatDateOnlyIST = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Helper function to format just time in IST
  const formatTimeOnlyIST = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    return date.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper function to get payment screenshot URL
  // Only the modified parts of the admin dashboard - replace the getPaymentScreenshotUrl function

  // Enhanced helper function to get payment screenshot URL for Supabase
  const getPaymentScreenshotUrl = (registration) => {
    console.log("Getting screenshot URL for:", registration.fullName);
    console.log("Available fields:", {
      paymentScreenshot: registration.paymentScreenshot,
      paymentScreenshotPath: registration.paymentScreenshotPath,
      paymentScreenshotFileName: registration.paymentScreenshotFileName,
    });

    // Try different possible field names (Supabase URLs are complete)
    const screenshot =
      registration.paymentScreenshotPath || registration.paymentScreenshot;

    if (!screenshot) {
      console.log("No screenshot found for:", registration.fullName);
      return null;
    }

    // If it's a Supabase URL (starts with https://), return as is
    if (screenshot.startsWith("https://")) {
      console.log("Supabase URL found:", screenshot);
      return screenshot;
    }

    // If it's any other HTTP URL, return as is
    if (screenshot.startsWith("http")) {
      console.log("HTTP URL found:", screenshot);
      return screenshot;
    }

    // For backward compatibility with old file paths
    if (screenshot.startsWith("/")) {
      console.log("Legacy path found, converting:", screenshot);
      return `/api/uploads${screenshot}`;
    }

    // If it's just a filename, assume it's a legacy upload
    console.log("Legacy filename found, converting:", screenshot);
    return `/api/uploads/payment-screenshots/${screenshot}`;
  };

  // Also add this function to handle image errors gracefully
  const handleImageError = (event, registration) => {
    console.error("Image failed to load for:", registration.fullName);
    console.error("Failed URL:", event.target.src);

    // Hide the image and show error message
    event.target.style.display = "none";

    // Create error message element if it doesn't exist
    if (
      !event.target.nextElementSibling ||
      !event.target.nextElementSibling.classList.contains("image-error")
    ) {
      const errorDiv = document.createElement("div");
      errorDiv.className =
        "image-error w-32 h-32 bg-red-900/30 border border-red-600 rounded-lg flex items-center justify-center";
      errorDiv.innerHTML =
        '<span class="text-red-400 text-xs text-center">Image not available</span>';
      event.target.parentNode.insertBefore(errorDiv, event.target.nextSibling);
    }
  };

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
      "Payment Screenshot": getPaymentScreenshotUrl(reg) ? "Yes" : "No",
      "Registration Date (IST)": formatDateIST(reg.createdAt),
      "Last Updated (IST)": formatDateIST(reg.updatedAt),
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

  const openDetailsModal = (registration) => {
    setSelectedRegistration(registration);
    setShowDetailsModal(true);
  };

  const openImageModal = (imageUrl, title) => {
    setSelectedImage({ url: imageUrl, title });
    setShowImageModal(true);
  };

  const downloadImage = (imageUrl, filename) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = filename || "payment-screenshot.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-900/30 text-green-400 border-green-600";
      case "rejected":
        return "bg-red-900/30 text-red-400 border-red-600";
      default:
        return "bg-yellow-900/30 text-yellow-400 border-yellow-600";
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
      <Users className="w-4 h-4 text-blue-400" />
    ) : (
      <User className="w-4 h-4 text-green-400" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg font-medium">
            Loading dashboard...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Please wait while we fetch the latest data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1f2937",
            color: "#f3f4f6",
            fontSize: "14px",
            border: "1px solid #374151",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#1f2937",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#1f2937",
            },
          },
        }}
      />

      {/* Header */}
      <header className="bg-gray-800 shadow-xl border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">
                  Admin{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Dashboard
                  </span>
                </h1>
              </motion.div>
              {isRefreshing && (
                <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push("/")}
                className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 text-sm py-2 px-4 rounded-lg flex items-center hover:shadow-lg transition-all duration-300"
              >
                <Home className="w-4 h-4 mr-2" />
                View Site
              </button>

              <button
                onClick={fetchRegistrations}
                className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 text-sm py-2 px-4 rounded-lg flex items-center hover:shadow-lg transition-all duration-300"
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
                className="bg-red-900/50 hover:bg-red-600 text-red-400 hover:text-white border border-red-600 text-sm py-2 px-4 rounded-lg flex items-center transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-600 border-l-4 border-l-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">
                  Total Registrations
                </p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  All time
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-600 border-l-4 border-l-yellow-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">
                  Pending Review
                </p>
                <p className="text-3xl font-bold text-yellow-400">
                  {stats.pending}
                </p>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Needs attention
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-yellow-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-600 border-l-4 border-l-green-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">
                  Approved
                </p>
                <p className="text-3xl font-bold text-green-400">
                  {stats.approved}
                </p>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <Target className="w-3 h-3 mr-1" />
                  Active projects
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-600 border-l-4 border-l-red-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">
                  Rejected
                </p>
                <p className="text-3xl font-bold text-red-400">
                  {stats.rejected}
                </p>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <XCircle className="w-3 h-3 mr-1" />
                  Not approved
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl flex items-center justify-center">
                <XCircle className="w-7 h-7 text-red-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg mb-8 border border-gray-600"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, project..."
                  className="pl-10 w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm"
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
                  className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto shadow-sm"
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
                  className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto shadow-sm"
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
                  className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto shadow-sm"
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
                  className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 text-sm py-2 px-4 rounded-lg flex items-center hover:shadow-lg transition-all duration-300"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Clear Filters
                </button>
              )}

              <button
                onClick={exportToCSV}
                disabled={registrations.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg flex items-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
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
              className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mt-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <span className="text-sm font-medium text-blue-300 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {selectedRows.length} registration(s) selected
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => bulkUpdateStatus("approved")}
                    className="bg-green-900/50 hover:bg-green-600 text-green-400 hover:text-white border border-green-600 text-sm py-2 px-3 rounded-lg transition-all duration-300"
                  >
                    ✅ Approve Selected
                  </button>
                  <button
                    onClick={() => bulkUpdateStatus("rejected")}
                    className="bg-red-900/50 hover:bg-red-600 text-red-400 hover:text-white border border-red-600 text-sm py-2 px-3 rounded-lg transition-all duration-300"
                  >
                    ❌ Reject Selected
                  </button>
                  <button
                    onClick={bulkDelete}
                    className="bg-red-900/50 hover:bg-red-600 text-red-400 hover:text-white border border-red-600 text-sm py-2 px-3 rounded-lg transition-all duration-300"
                  >
                    🗑️ Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedRows([])}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white border border-gray-600 text-sm py-2 px-3 rounded-lg transition-all duration-300"
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
          className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-xl overflow-hidden border border-gray-600"
        >
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-600 bg-gradient-to-r from-gray-800 to-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Project Registrations
              </h3>
              <span className="text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded-full border border-gray-600">
                {getPaginationInfo()}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.length === registrations.length &&
                        registrations.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-500 bg-gray-600 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600 transition-colors duration-200"
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Academic Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Project Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Payment
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600 transition-colors duration-200"
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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600 transition-colors duration-200"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center">
                      Registration Date (IST)
                      {sortField === "createdAt" &&
                        (sortDirection === "asc" ? (
                          <ArrowUp className="w-4 h-4 ml-1" />
                        ) : (
                          <ArrowDown className="w-4 h-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-600">
                {registrations.map((registration, index) => (
                  <motion.tr
                    key={registration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`hover:bg-gray-700 transition-all duration-200 ${
                      selectedRows.includes(registration.id)
                        ? "bg-blue-900/20 border-l-4 border-blue-500"
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
                        className="rounded border-gray-500 bg-gray-600 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                          <span className="text-white font-bold text-sm">
                            {registration.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {registration.fullName}
                          </div>
                          <div className="text-sm text-gray-400 flex items-center mt-1">
                            <Mail className="w-3 h-3 mr-1" />
                            {registration.email}
                          </div>
                          <div className="text-sm text-gray-400 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {registration.phoneNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white font-medium flex items-center">
                        <School className="w-4 h-4 mr-2 text-blue-400" />
                        {registration.collegeName}
                      </div>
                      <div className="text-sm text-gray-400 flex items-center mt-1">
                        <BookOpen className="w-3 h-3 mr-1" />
                        {registration.branch} - {registration.semester}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300 border border-gray-600">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {registration.batchType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white max-w-xs">
                        <div
                          className="truncate mb-2 flex items-center"
                          title={registration.projectTitle}
                        >
                          <Target className="w-4 h-4 mr-2 text-purple-400" />
                          {registration.projectTitle}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-400 mb-2">
                        {getRegistrationTypeIcon(registration.registrationType)}
                        <span className="ml-1">
                          {registration.registrationType}
                        </span>
                      </div>
                      {registration.groupMembers &&
                        registration.groupMembers.length > 0 && (
                          <div className="text-xs">
                            <button
                              onClick={() => openDetailsModal(registration)}
                              className="inline-flex items-center px-2 py-1 rounded-full bg-blue-900/50 text-blue-300 hover:bg-blue-800/50 transition-colors duration-200 border border-blue-600"
                            >
                              <GroupIcon className="w-3 h-3 mr-1" />
                              {registration.groupMembers.length} member(s)
                            </button>
                          </div>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentScreenshotUrl(registration) ? (
                        <button
                          onClick={() =>
                            openImageModal(
                              getPaymentScreenshotUrl(registration),
                              `Payment Screenshot - ${registration.fullName}`
                            )
                          }
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-600 hover:bg-green-800/50 transition-colors duration-200"
                        >
                          <ImageIcon className="w-3 h-3 mr-1" />
                          View Screenshot
                        </button>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-600">
                          <XCircle className="w-3 h-3 mr-1" />
                          No Screenshot
                        </span>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      <div className="font-medium flex items-center">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {formatDateOnlyIST(registration.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeOnlyIST(registration.createdAt)}
                      </div>
                      {registration.updatedAt !== registration.createdAt && (
                        <div className="text-xs text-blue-400 mt-1">
                          Updated: {formatDateOnlyIST(registration.updatedAt)}
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
                              className="text-green-400 hover:text-green-300 hover:bg-green-900/50 p-2 rounded-full transition-all duration-200 group"
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
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/50 p-2 rounded-full transition-all duration-200 group"
                              title="Reject Registration"
                            >
                              <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                            </button>
                          </>
                        )}

                        {/* View Details */}
                        <button
                          onClick={() => openDetailsModal(registration)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/50 p-2 rounded-full transition-all duration-200 group"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => deleteRegistration(registration.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/50 p-2 rounded-full transition-all duration-200 group"
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
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No registrations found
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
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
                  <button
                    onClick={clearFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Clear All Filters
                  </button>
                )}
              </motion.div>
            </div>
          )}

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-700 px-6 py-4 border-t border-gray-600">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-300 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  {getPaginationInfo()}
                </div>

                <div className="flex items-center space-x-2">
                  {/* First Page */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    First
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                              : "text-gray-300 bg-gray-800 border-gray-600 hover:bg-gray-700"
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
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Last
                  </button>
                </div>
              </div>

              {/* Page Size Info */}
              <div className="flex items-center justify-center mt-4 pt-4 border-t border-gray-600">
                <span className="text-sm text-gray-400">
                  Showing {itemsPerPage} items per page
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Details Modal */}
        {showDetailsModal && selectedRegistration && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-600"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-600">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <User className="w-6 h-6 mr-2" />
                  Registration Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Full Name
                      </label>
                      <p className="text-white font-medium">
                        {selectedRegistration.fullName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </label>
                      <p className="text-white font-medium">
                        {selectedRegistration.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Phone Number
                      </label>
                      <p className="text-white font-medium">
                        {selectedRegistration.phoneNumber}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 flex items-center">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Registration Type
                      </label>
                      <p className="text-white font-medium">
                        {selectedRegistration.registrationType}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <School className="w-5 h-5 mr-2" />
                    Academic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 flex items-center">
                        <School className="w-4 h-4 mr-2" />
                        College/School
                      </label>
                      <p className="text-white font-medium">
                        {selectedRegistration.collegeName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 flex items-center">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Branch
                      </label>
                      <p className="text-white font-medium">
                        {selectedRegistration.branch}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Semester
                      </label>
                      <p className="text-white font-medium">
                        {selectedRegistration.semester}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 flex items-center">
                        <Award className="w-4 h-4 mr-2" />
                        Batch Type
                      </label>
                      <p className="text-white font-medium">
                        {selectedRegistration.batchType}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Project Information */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Project Information
                  </h3>
                  <div>
                    <label className="text-sm text-gray-400 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      Project Title
                    </label>
                    <p className="text-white font-medium">
                      {selectedRegistration.projectTitle}
                    </p>
                  </div>
                </div>

                {/* Group Members */}
                {selectedRegistration.groupMembers &&
                  selectedRegistration.groupMembers.length > 0 && (
                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <GroupIcon className="w-5 h-5 mr-2" />
                        Group Members (
                        {selectedRegistration.groupMembers.length})
                      </h3>
                      <div className="space-y-3">
                        {selectedRegistration.groupMembers.map(
                          (member, index) => (
                            <div
                              key={index}
                              className="bg-gray-800/50 rounded-lg p-3 border border-gray-600"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-white font-medium flex items-center">
                                    <User className="w-4 h-4 mr-2" />
                                    {member.name}
                                  </p>
                                  <p className="text-gray-400 text-sm flex items-center mt-1">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {member.phoneNumber}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded border border-gray-600">
                                  Member {index + 1}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Payment Screenshot */}
                {getPaymentScreenshotUrl(selectedRegistration) && (
                  <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <ImageIcon className="w-5 h-5 mr-2" />
                      Payment Screenshot
                    </h3>
                    <div className="flex items-center space-x-4">
                      <img
                        src={getPaymentScreenshotUrl(selectedRegistration)}
                        alt="Payment Screenshot"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-600 cursor-pointer hover:opacity-80 transition-opacity duration-200 shadow-lg"
                        onClick={() =>
                          openImageModal(
                            getPaymentScreenshotUrl(selectedRegistration),
                            `Payment Screenshot - ${selectedRegistration.fullName}`
                          )
                        }
                      />
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() =>
                            openImageModal(
                              getPaymentScreenshotUrl(selectedRegistration),
                              `Payment Screenshot - ${selectedRegistration.fullName}`
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200 shadow-md"
                        >
                          <ZoomIn className="w-4 h-4 mr-2" />
                          View Full Size
                        </button>
                        <button
                          onClick={() =>
                            downloadImage(
                              getPaymentScreenshotUrl(selectedRegistration),
                              `payment-${selectedRegistration.fullName.replace(
                                /\s+/g,
                                "-"
                              )}.jpg`
                            )
                          }
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200 shadow-md"
                        >
                          <DownloadIcon className="w-4 h-4 mr-2" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Registration Status */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">
                        Current Status
                      </label>
                      <div className="flex items-center mt-1">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            selectedRegistration.status
                          )}`}
                        >
                          {getStatusIcon(selectedRegistration.status)}
                          <span className="ml-1 capitalize">
                            {selectedRegistration.status}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Registration Date (IST)
                      </label>
                      <p className="text-white font-medium">
                        {formatDateIST(selectedRegistration.createdAt)}
                      </p>
                    </div>
                    {selectedRegistration.updatedAt !==
                      selectedRegistration.createdAt && (
                      <div>
                        <label className="text-sm text-gray-400 flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Last Updated (IST)
                        </label>
                        <p className="text-white font-medium">
                          {formatDateIST(selectedRegistration.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  {selectedRegistration.status === "pending" && (
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => {
                          updateRegistrationStatus(
                            selectedRegistration.id,
                            "approved"
                          );
                          setShowDetailsModal(false);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200 shadow-md"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          updateRegistrationStatus(
                            selectedRegistration.id,
                            "rejected"
                          );
                          setShowDetailsModal(false);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200 shadow-md"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && selectedImage && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl overflow-hidden border border-gray-600 shadow-2xl"
            >
              {/* Image Header */}
              <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-600">
                <h3 className="text-lg font-semibold text-white">
                  {selectedImage.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      downloadImage(selectedImage.url, selectedImage.title)
                    }
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors duration-200 shadow-md"
                    title="Download Image"
                  >
                    <DownloadIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Image Content */}
              <div className="p-4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        )}

        {/* Quick Actions Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-600">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Quick Approve
              </h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
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
              className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 text-sm w-full py-2 px-4 rounded-lg transition-colors duration-200 shadow-md"
            >
              Select All Pending
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-600">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Export Reports
              </h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Generate detailed reports with current registration data and
              statistics.
            </p>
            <button
              onClick={exportToCSV}
              disabled={registrations.length === 0}
              className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 text-sm w-full py-2 px-4 rounded-lg disabled:opacity-50 transition-colors duration-200 shadow-md"
            >
              Generate Report
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-600">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">System Stats</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              View detailed analytics and system performance metrics.
            </p>
            <button
              onClick={() => {
                toast.success("System stats feature coming soon!");
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 text-sm w-full py-2 px-4 rounded-lg transition-colors duration-200 shadow-md"
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
            className="mt-8 bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg border border-gray-600"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Activity Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-500/20 rounded-lg border border-blue-600">
                <div className="text-2xl font-bold text-blue-400">
                  {
                    registrations.filter((r) => {
                      const today = new Date();
                      const regDate = new Date(r.createdAt);
                      const todayIST = new Date(
                        today.toLocaleString("en-US", {
                          timeZone: "Asia/Kolkata",
                        })
                      );
                      const regDateIST = new Date(
                        regDate.toLocaleString("en-US", {
                          timeZone: "Asia/Kolkata",
                        })
                      );
                      return (
                        regDateIST.toDateString() === todayIST.toDateString()
                      );
                    }).length
                  }
                </div>
                <div className="text-sm text-gray-400">
                  Today's Registrations
                </div>
              </div>

              <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-600">
                <div className="text-2xl font-bold text-green-400">
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
                <div className="text-sm text-gray-400">This Week</div>
              </div>

              <div className="text-center p-4 bg-purple-500/20 rounded-lg border border-purple-600">
                <div className="text-2xl font-bold text-purple-400">
                  {
                    registrations.filter(
                      (r) => r.registrationType === "Group Project"
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-400">Group Projects</div>
              </div>

              <div className="text-center p-4 bg-yellow-500/20 rounded-lg border border-yellow-600">
                <div className="text-2xl font-bold text-yellow-400">
                  {Math.round((stats.approved / (stats.total || 1)) * 100)}%
                </div>
                <div className="text-sm text-gray-400">Approval Rate</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
