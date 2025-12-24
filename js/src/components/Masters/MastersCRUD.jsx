import React, { useState, useEffect, useCallback } from "react";

const API_CONFIG = {
  department: {
    label: "Departments",
    url: "http://localhost:8080/api/v1/collection/kln_hr_department",
    field: "department",
    icon: "🏢",
    color: "emerald",
  },
  line: {
    label: "Lines",
    url: "http://localhost:8080/api/v1/collection/kln_hr_line",
    field: "line",
    icon: "📊",
    color: "blue",
  },
  skill: {
    label: "Skills",
    url: "http://localhost:8080/api/v1/collection/kln_hr_skill",
    field: "skill",
    icon: "⚡",
    color: "purple",
  },
  category: {
    label: "Categories",
    url: "http://localhost:8080/api/v1/collection/kln_hr_category",
    field: "category",
    icon: "📋",
    color: "amber",
  },
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-emerald-500" : "bg-red-500";

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-slideIn z-50`}
    >
      <span className="text-lg">{type === "success" ? "✓" : "✕"}</span>
      <span className="font-medium">{message}</span>
    </div>
  );
};

const DeleteModal = ({ item, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scaleIn">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Confirm Delete
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-800">"{item.name}"</span>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MastersCRUD = () => {
  const [selected, setSelected] = useState("department");
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addName, setAddName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const api = API_CONFIG[selected];

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api.url}?$select=cdb_object_id,${api.field}`);
      const data = await res.json();
      const arr = (data.objects || []).map((x) => ({
        id: x.cdb_object_id,
        name: x[api.field],
        raw: x,
      }));
      setList(arr);
      setFilteredList(arr);
    } catch (e) {
      console.error(e);
      setList([]);
      setFilteredList([]);
      showToast("Failed to load data", "error");
    }
    setLoading(false);
  }, [api]);

  useEffect(() => {
    fetchList();
    setSearchTerm("");
  }, [fetchList]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = list.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredList(filtered);
    } else {
      setFilteredList(list);
    }
  }, [searchTerm, list]);

  const addItem = async () => {
    if (!addName.trim()) {
      showToast("Please enter a name", "error");
      return;
    }
    setActionLoading(true);
    try {
      const body = {
        [api.field]: addName.trim(),
        plant_code: 2021,
      };
      console.log("ADD Request:", { url: api.url, body });
      await fetch(api.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setAddName("");
      await fetchList();
      showToast(`${api.label.slice(0, -1)} added successfully!`);
    } catch (e) {
      console.error("Add error:", e);
      showToast("Failed to add item", "error");
    }
    setActionLoading(false);
  };

  const updateItem = async () => {
    if (!editName.trim() || !editId) return;
    setActionLoading(true);
    try {
      const row = list.find((x) => x.id === editId);
      const body = {
        ...row.raw,
        cdb_object_id: editId,
        [api.field]: editName.trim(),
      };
      // URL mein ID add karna hai for PUT request
      const urlWithId = `${api.url}/${editId}`;
      console.log("UPDATE Request:", { url: urlWithId, body });
      await fetch(urlWithId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setEditId(null);
      setEditName("");
      await fetchList();
      showToast("Updated successfully!");
    } catch (e) {
      console.error("Update error:", e);
      showToast("Failed to update item", "error");
    }
    setActionLoading(false);
  };

  const deleteItem = async (item) => {
    setActionLoading(true);
    try {
      const body = {
        ...item.raw,
        cdb_object_id: item.id,
        is_delete: true,
      };
      // URL mein ID add karna hai for DELETE (PUT with is_delete)
      const urlWithId = `${api.url}/${item.id}`;
      console.log("DELETE Request:", { url: urlWithId, body });
      await fetch(urlWithId, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await fetchList();
      showToast("Deleted successfully!");
    } catch (e) {
      console.error("Delete error:", e);
      showToast("Failed to delete item", "error");
    }
    setDeleteModal(null);
    setActionLoading(false);
  };

  const handleKeyDown = (e, action) => {
    if (e.key === "Enter") {
      action();
    } else if (e.key === "Escape" && editId) {
      setEditId(null);
      setEditName("");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Outfit', sans-serif;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }

        .loading-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }

        .master-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .master-card:hover {
          transform: translateY(-2px);
        }

        input:focus, select:focus, button:focus {
          outline: none;
          ring: 2px;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="w-full">
          {/* Main Content Card */}
          <div className="bg-white shadow-2xl overflow-hidden animate-scaleIn">
            {/* Master Type Selector */}
            <div className="p-6 bg-indigo-600 text-white">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{api.icon}</span>
                <div className="flex-1">
                  <label className="block text-sm font-medium opacity-90 mb-2">
                    Select Master Type
                  </label>
                  <select
                    value={selected}
                    onChange={(e) => {
                      setSelected(e.target.value);
                      setEditId(null);
                      setAddName("");
                      setSearchTerm("");
                    }}
                    className="w-full md:w-auto px-5 py-3 bg-white text-gray-800 rounded-xl font-bold text-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 transition-all duration-200"
                  >
                    {Object.entries(API_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.icon} {config.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Search and Add Section */}
            <div className="p-8 bg-gray-50 border-b border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={`Search ${api.label.toLowerCase()}...`}
                      className="w-full px-5 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                      🔍
                    </span>
                  </div>
                </div>

                {/* Add New */}
                <div className="flex gap-3">
                  <input
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, addItem)}
                    placeholder={`New ${api.label
                      .slice(0, -1)
                      .toLowerCase()}...`}
                    className="px-5 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all duration-200 md:w-64"
                  />
                  <button
                    onClick={addItem}
                    disabled={actionLoading}
                    className={`px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      actionLoading ? "animate-pulse" : ""
                    }`}
                  >
                    {actionLoading ? "..." : "Add"}
                  </button>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="p-8">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="loading-shimmer h-16 rounded-xl"
                    ></div>
                  ))}
                </div>
              ) : filteredList.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-7xl mb-6">📭</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {searchTerm ? "No results found" : "No data yet"}
                  </h3>
                  <p className="text-gray-500 text-lg">
                    {searchTerm
                      ? `Try a different search term`
                      : `Add your first ${api.label.toLowerCase()} to get started`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredList.map((item, index) => (
                    <div
                      key={item.id}
                      className="group flex items-center gap-4 p-5 rounded-xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: "fadeIn 0.4s ease-out backwards",
                      }}
                    >
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-xl ${
                          api.color === "emerald"
                            ? "bg-emerald-500"
                            : api.color === "blue"
                            ? "bg-blue-500"
                            : api.color === "purple"
                            ? "bg-purple-500"
                            : "bg-amber-500"
                        } flex items-center justify-center text-2xl shadow-md`}
                      >
                        {api.icon}
                      </div>

                      {/* Name/Input */}
                      <div className="flex-1">
                        {editId === item.id ? (
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, updateItem)}
                            className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 font-semibold text-lg"
                            autoFocus
                          />
                        ) : (
                          <div className="font-semibold text-lg text-gray-800">
                            {item.name}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {editId === item.id ? (
                          <>
                            <button
                              onClick={updateItem}
                              disabled={actionLoading}
                              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditId(null);
                                setEditName("");
                              }}
                              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all duration-200"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditId(item.id);
                                setEditName(item.name);
                              }}
                              className="px-5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold transition-all duration-200"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => setDeleteModal(item)}
                              className="px-5 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-semibold transition-all duration-200"
                            >
                              🗑️ Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <DeleteModal
          item={deleteModal}
          onConfirm={() => deleteItem(deleteModal)}
          onCancel={() => setDeleteModal(null)}
        />
      )}
    </>
  );
};

export default MastersCRUD;
