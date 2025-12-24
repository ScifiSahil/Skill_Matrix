import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useSkillMatrixStore } from "../../reducers/skillMatrixStore";
import { useUIStore } from "../../reducers/uiStore";
import {
  Filter,
  Download,
  Upload,
  Plus,
  Edit2,
  Trash2,
  Save,
  X as XIcon,
  CheckCircle,
  AlertCircle,
  Search,
  RefreshCw,
  Loader,
  ChevronDown,
  Users,
  ChevronLeft,
  ChevronRight,
  Target,
  Grid3x3,
  Copy,
  Check,
} from "lucide-react";

// ✅ Optimized Table Row Component with Larger Fonts
const SkillTableRow = memo(
  ({
    skill,
    editMode,
    onCheckboxChange,
    onEdit,
    onDelete,
    getTypeColor,
    getCellBackground,
    dynamicLines,
  }) => (
    <tr className="border-b border-gray-200 hover:bg-blue-50 transition-all duration-200 hover:shadow-sm">
      <td className="px-4 py-4 sticky left-0 bg-white z-10 hover:bg-blue-50 transition-colors">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${getTypeColor(
                skill.type
              )}`}
            >
              {skill.type}
            </span>
            <span className="font-semibold text-gray-800 text-base">
              {skill.labour_name || skill.name}
            </span>
          </div>
          {skill.labour_code && (
            <span className="text-sm text-gray-600 font-mono ml-14 bg-gray-100 px-2 py-0.5 rounded inline-block w-fit">
              Code: {skill.labour_code}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-blue-600 text-base">
            {skill.department || skill.applicability || "-"}
          </span>
          {skill.line && (
            <span className="text-sm text-gray-600 bg-purple-100 px-3 py-1 rounded-full inline-block w-fit mx-auto font-medium">
              Line: {skill.line}
            </span>
          )}
        </div>
      </td>

      {dynamicLines.map((line) => {
        const isChecked = skill.lines?.[line.line] || false;
        return (
          <td
            key={line.cdb_object_id}
            className={`px-4 py-4 text-center transition-all duration-200 ${getCellBackground(
              isChecked
            )}`}
          >
            <div className="flex items-center justify-center gap-2">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onCheckboxChange(skill.id, line.line)}
                disabled={!editMode}
                className="w-6 h-6 rounded-md border-2 border-gray-400 text-green-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 cursor-pointer transition-all checked:scale-110"
              />
              {isChecked && (
                <CheckCircle className="w-5 h-5 text-green-600 animate-in fade-in zoom-in duration-200" />
              )}
            </div>
          </td>
        );
      })}

      <td className="px-4 py-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit(skill.id)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all hover:scale-110"
            title="Edit"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(skill.id)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-110"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  )
);

// ✅ Optimized Pagination Component with Larger Fonts
const Pagination = memo(
  ({ currentPage, totalPages, onPageChange, onPrev, onNext }) => {
    if (totalPages <= 1) return null;

    const pages = useMemo(() => {
      const result = [];
      for (let i = 1; i <= totalPages; i++) {
        if (
          i === 1 ||
          i === totalPages ||
          (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
          result.push({ type: "page", value: i });
        } else if (i === currentPage - 2 || i === currentPage + 2) {
          result.push({ type: "ellipsis", value: i });
        }
      }
      return result;
    }, [currentPage, totalPages]);

    return (
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-lg font-bold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-purple-700 transition text-base"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        <div className="flex items-center gap-2">
          {pages.map((item, index) =>
            item.type === "page" ? (
              <button
                key={item.value}
                onClick={() => onPageChange(item.value)}
                className={`px-4 py-3 rounded-lg font-bold transition text-base ${
                  currentPage === item.value
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {item.value}
              </button>
            ) : (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-gray-500 text-base"
              >
                ...
              </span>
            )
          )}
        </div>

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-lg font-bold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-purple-700 transition text-base"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }
);

const SkillListPage = () => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [plantCodeLoaded, setPlantCodeLoaded] = useState(false);
  const [dynamicDepartments, setDynamicDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [dynamicLines, setDynamicLines] = useState([]);
  const [linesLoading, setLinesLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [newSkillData, setNewSkillData] = useState({
    machining_skills_names: "",
    applicability: "All",
    departments: {},
    person_name: "",
    skill_required: "",
    education: "",
    department: "",
    line: "",
    sub_departments: [],
    labour_names: [],
  });

  const pageSize = 25;

  // ✅ Zustand Store Selectors (Optimized)
  const {
    skills,
    loading,
    error,
    filters,
    totalSkills,
    functionalCount,
    criticalCount,
    genericCount,
    fetchSkills,
    fetchPlantCode,
    updateSkillDepartment,
    deleteSkill,
    setFilters,
    fetchAllOptions,
    fetchDepartmentsFromAPI,
    fetchLinesFromAPI,
    resetModalState,
  } = useSkillMatrixStore();

  const addNotification = useUIStore((state) => state.addNotification);

  // ✅ Fetch Plant Code
  useEffect(() => {
    if (plantCodeLoaded) return;
    const loadPlantCode = async () => {
      const result = await fetchPlantCode();
      setPlantCodeLoaded(true);
      if (result.success) {
        console.log("✅ Plant code loaded:", result.plantCode);
      }
    };
    loadPlantCode();
  }, [plantCodeLoaded, fetchPlantCode]);

  // ✅ Fetch Departments
  const fetchDynamicDepartments = useCallback(async () => {
    setDepartmentsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/collection/kln_hr_department"
      );
      if (!response.ok) throw new Error("Failed to fetch departments");

      const data = await response.json();
      if (data?.objects && Array.isArray(data.objects)) {
        const departments = data.objects
          .map((obj) => ({
            department: obj.department,
            cdb_object_id: obj.cdb_object_id,
            plantt_code: obj.plantt_code,
          }))
          .filter((dept) => dept.department?.trim());

        setDynamicDepartments(departments);
        addNotification({
          type: "success",
          message: `Loaded ${departments.length} departments`,
        });
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      addNotification({ type: "error", message: "Failed to load departments" });
      setDynamicDepartments([]);
    } finally {
      setDepartmentsLoading(false);
    }
  }, [addNotification]);

  // ✅ Fetch Lines
  const fetchDynamicLines = useCallback(async () => {
    setLinesLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/collection/kln_hr_line"
      );
      if (!response.ok) throw new Error("Failed to fetch lines");

      const data = await response.json();
      if (data?.objects && Array.isArray(data.objects)) {
        const lines = data.objects
          .map((obj) => ({ line: obj.line, cdb_object_id: obj.cdb_object_id }))
          .filter((line) => line.line?.trim());

        setDynamicLines(lines);
        addNotification({
          type: "success",
          message: `Loaded ${lines.length} lines`,
        });
      }
    } catch (error) {
      console.error("Error fetching lines:", error);
      addNotification({ type: "error", message: "Failed to load lines" });
      setDynamicLines([]);
    } finally {
      setLinesLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchDynamicDepartments();
  }, [fetchDynamicDepartments]);
  useEffect(() => {
    fetchDynamicLines();
  }, [fetchDynamicLines]);

  // ✅ Fetch Skills
  useEffect(() => {
    if (dataLoaded || skills.length > 0 || loading) return;

    const loadData = async () => {
      const result = await fetchSkills();
      if (!result.success) {
        addNotification({
          type: "error",
          message: result.error || "Failed to load skills",
        });
      }
      setDataLoaded(true);
    };
    loadData();
  }, [dataLoaded, skills.length, loading, fetchSkills, addNotification]);

  // ✅ Global Search Filter (Optimized)
  const filteredSkills = useMemo(() => {
    if (!skills?.length) return [];

    const search = filters.searchTerm?.toLowerCase().trim() || "";

    return skills.filter((skill) => {
      if (!search) return true;

      const searchableText = [
        skill.name,
        skill.labour_name,
        skill.labour_code,
        skill.department,
        skill.line,
        skill.type,
        skill.person_name,
        skill.skill_required,
        ...Object.keys(skill?.lines || {}),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [skills, filters.searchTerm]);

  const paginatedSkills = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSkills.slice(start, start + pageSize);
  }, [filteredSkills, page]);

  // ✅ Helper Functions
  const getTypeColor = useCallback((type) => {
    const colors = {
      F: "bg-blue-100 text-blue-700 border border-blue-300",
      C: "bg-red-100 text-red-700 border border-red-300",
      G: "bg-gray-100 text-gray-700 border border-gray-300",
    };
    return colors[type] || "bg-gray-50 text-gray-600 border border-gray-200";
  }, []);

  const getCellBackground = useCallback(
    (value) =>
      value
        ? "bg-gradient-to-br from-green-100 to-green-200 border-l-4 border-l-green-600 shadow-inner"
        : "bg-white hover:bg-gray-50",
    []
  );

  const getDepartmentColor = useCallback((index) => {
    const colors = [
      "bg-blue-50",
      "bg-green-50",
      "bg-orange-50",
      "bg-red-50",
      "bg-purple-50",
      "bg-yellow-50",
      "bg-pink-50",
      "bg-indigo-50",
      "bg-teal-50",
      "bg-cyan-50",
    ];
    return colors[index % colors.length];
  }, []);

  // ✅ Event Handlers (Optimized)
  const handleCheckboxChange = useCallback(
    async (skillId, lineName) => {
      if (!editMode) return;

      const skill = skills.find((s) => s.id === skillId);
      if (!skill) return;

      const currentValue = skill.lines?.[lineName] || false;
      const newValue = !currentValue;

      const result = await updateSkillDepartment(skillId, lineName, newValue);

      if (result.success) {
        addNotification({
          type: "success",
          message: `${
            skill.labour_name || skill.name
          } updated for ${lineName}!`,
        });
      } else {
        addNotification({
          type: "error",
          message: result.error || "Failed to update skill",
        });
      }
    },
    [editMode, skills, updateSkillDepartment, addNotification]
  );

  const handleEditSkill = useCallback((skillId) => {
    setSelectedSkillId(skillId);
    setEditMode(true);
  }, []);

  const handleDeleteSkill = useCallback(
    async (skillId) => {
      const skill = skills.find((s) => s.id === skillId);
      if (
        !skill ||
        !window.confirm(`Are you sure you want to delete "${skill.name}"?`)
      )
        return;

      const result = await deleteSkill(skillId);
      if (result.success) {
        addNotification({
          type: "success",
          message: "Skill deleted successfully!",
        });
      } else {
        addNotification({
          type: "error",
          message: result.error || "Failed to delete skill",
        });
      }
    },
    [skills, deleteSkill, addNotification]
  );

  const toggleEditAll = useCallback(() => {
    setEditMode((prev) => !prev);
    setSelectedSkillId(null);
  }, []);

  const handleSaveChanges = useCallback(() => {
    setEditMode(false);
    setSelectedSkillId(null);
    addNotification({
      type: "success",
      message: "All changes saved successfully!",
    });
  }, [addNotification]);

  const handleFilterChange = useCallback(
    (filterType, value) => {
      setFilters({ [filterType]: value });
      setPage(1);
    },
    [setFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters({ skillType: "all", applicability: "all", searchTerm: "" });
    setPage(1);
  }, [setFilters]);

  const handleRefresh = useCallback(async () => {
    setDepartmentsLoading(true);
    setLinesLoading(true);
    await Promise.all([
      fetchDynamicDepartments(),
      fetchDynamicLines(),
      fetchSkills(),
    ]);
    setDepartmentsLoading(false);
    setLinesLoading(false);
    addNotification({
      type: "success",
      message: "Data refreshed successfully!",
    });
  }, [
    fetchSkills,
    fetchDynamicDepartments,
    fetchDynamicLines,
    addNotification,
  ]);

  const handleCloseModal = useCallback(() => {
    setShowAddModal(false);
    resetModalState();
    setNewSkillData({
      machining_skills_names: "",
      applicability: "All",
      departments: {},
      person_name: "",
      skill_required: "",
      education: "",
      department: "",
      line: "",
      sub_departments: [],
      labour_names: [],
    });
  }, [resetModalState]);

  const handleOpenAddModal = useCallback(() => {
    setShowAddModal(true);
    fetchAllOptions();
    fetchDepartmentsFromAPI();
    fetchLinesFromAPI();
  }, [fetchAllOptions, fetchDepartmentsFromAPI, fetchLinesFromAPI]);

  // ✅ Loading States
  if (
    (departmentsLoading || linesLoading) &&
    dynamicDepartments.length === 0 &&
    dynamicLines.length === 0
  ) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-base">
            Loading departments and lines...
          </p>
        </div>
      </div>
    );
  }

  if (loading && skills.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-base">
            Loading skills...
          </p>
        </div>
      </div>
    );
  }

  if (error && skills.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-2 text-base">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      {/* ✅ Compact Header with Inline Stats & Actions */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border">
        {/* Top Row: Stats + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-gray-200">
          {/* Left: Inline Stats Badges (Larger Fonts) */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Skills:
            </span>
            <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {totalSkills}
            </span>
            <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-bold">
              F: {functionalCount}
            </span>
            <span className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-sm font-bold">
              C: {criticalCount}
            </span>
            <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-sm font-bold">
              G: {genericCount}
            </span>
          </div>

          {/* Right: Action Buttons (Larger) */}
          <div className="flex items-center gap-3">
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={loading || departmentsLoading || linesLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold shadow-sm transition 
               disabled:opacity-50 disabled:cursor-not-allowed 
               bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              <RefreshCw
                className={`w-5 h-5 ${
                  loading || departmentsLoading || linesLoading
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </button>

            {/* Export */}
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold shadow-sm transition
               bg-green-600 text-white hover:bg-green-700"
            >
              <Download className="w-5 h-5" />
              Export
            </button>

            {/* Import */}
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold shadow-sm transition
               bg-purple-600 text-white hover:bg-purple-700"
            >
              <Upload className="w-5 h-5" />
              Import
            </button>

            {/* Add Skill */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold shadow-sm transition
               bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add Skill
            </button>
          </div>
        </div>

        {/* Search Bar Row (Larger Font) */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search anything..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base font-medium placeholder:text-gray-500"
            />
            {filters.searchTerm && (
              <button
                onClick={() => handleFilterChange("searchTerm", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition"
                title="Clear search"
              ></button>
            )}
          </div>

          {/* Advanced Filters Toggle Button (Larger) */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-5 py-3 border-2 rounded-lg transition font-semibold text-base ${
              showAdvancedFilters
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                showAdvancedFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Edit Mode Button (Larger) */}
          <button
            onClick={toggleEditAll}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg transition text-base font-semibold ${
              editMode
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <Edit2 className="w-5 h-5" />
            {editMode ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* Collapsible Advanced Filters (Larger Fonts) */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-bold text-gray-600 uppercase">
                Advanced Filters:
              </span>

              <select
                value={filters.skillType}
                onChange={(e) =>
                  handleFilterChange("skillType", e.target.value)
                }
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 text-base font-semibold"
              >
                <option value="all">All Types</option>
                <option value="F">Functional (F)</option>
                <option value="C">Critical (C)</option>
                <option value="G">Generic (G)</option>
              </select>

              <select
                value={filters.applicability}
                onChange={(e) =>
                  handleFilterChange("applicability", e.target.value)
                }
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 text-base font-semibold"
              >
                <option value="all">All Departments</option>
                <option value="Production">Production</option>
                <option value="Quality">Quality</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Heat Treatment">Heat Treatment</option>
              </select>

              <button
                onClick={handleResetFilters}
                className="px-4 py-2.5 text-red-600 hover:bg-red-50 border-2 border-red-200 rounded-lg transition text-base font-semibold flex items-center gap-2"
              >
                <XIcon className="w-5 h-5" />
                Clear All Filters
              </button>

              {editMode && (
                <button
                  onClick={handleSaveChanges}
                  className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-base font-bold"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              )}
            </div>

            {/* Active Filters Summary */}
            {(filters.skillType !== "all" ||
              filters.applicability !== "all") && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-500">
                  Active:
                </span>
                {filters.skillType !== "all" && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                    Type: {filters.skillType}
                    <button
                      onClick={() => handleFilterChange("skillType", "all")}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.applicability !== "all" && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-1">
                    Dept: {filters.applicability}
                    <button
                      onClick={() => handleFilterChange("applicability", "all")}
                      className="hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Results Info (Larger Font) */}
      {filters.searchTerm && (
        <div className="mb-4 px-5 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-blue-600" />
            <span className="text-base text-blue-800 font-medium">
              Found{" "}
              <span className="font-bold text-lg">{filteredSkills.length}</span>{" "}
              results for "
              <span className="font-semibold">{filters.searchTerm}</span>"
            </span>
          </div>
          <button
            onClick={() => handleFilterChange("searchTerm", "")}
            className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1.5"
          >
            <XIcon className="w-4 h-4" />
            Clear
          </button>
        </div>
      )}

      {/* Skills Table (Larger Fonts) */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-300">
                <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide sticky left-0 bg-gradient-to-r from-gray-100 to-gray-200 z-10 shadow-sm">
                  Labour Name
                </th>
                <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Department & Line
                </th>

                {dynamicLines.length > 0 ? (
                  dynamicLines.map((line, index) => (
                    <th
                      key={line.cdb_object_id}
                      className={`px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wide transition-colors hover:bg-opacity-70 ${getDepartmentColor(
                        index
                      )}`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>{line.line}</span>
                      </div>
                    </th>
                  ))
                ) : (
                  <th
                    colSpan="4"
                    className="px-4 py-4 text-center text-sm text-gray-400"
                  >
                    No lines loaded
                  </th>
                )}

                <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wide bg-gradient-to-r from-gray-100 to-gray-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSkills.length === 0 ? (
                <tr>
                  <td
                    colSpan={3 + dynamicLines.length}
                    className="px-4 py-12 text-center"
                  >
                    <div className="text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium text-base">No skills found</p>
                      <p className="text-sm">
                        Try adjusting your filters or add a new skill
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSkills.map((skill) => (
                  <SkillTableRow
                    key={skill.id}
                    skill={skill}
                    editMode={editMode}
                    onCheckboxChange={handleCheckboxChange}
                    onEdit={handleEditSkill}
                    onDelete={handleDeleteSkill}
                    getTypeColor={getTypeColor}
                    getCellBackground={getCellBackground}
                    dynamicLines={dynamicLines}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <p className="text-base text-gray-700 font-semibold">
              Showing{" "}
              <span className="font-bold text-blue-600">
                {paginatedSkills.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-blue-600">
                {filteredSkills.length}
              </span>{" "}
              skills
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="w-4 h-4 bg-gradient-to-br from-green-100 to-green-200 border-l-2 border-l-green-600 rounded"></div>
                <span className="text-gray-600 font-medium">= Assigned</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-600 font-medium">= Active</span>
              </div>
            </div>
          </div>
        </div>
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filteredSkills.length / pageSize)}
          onPageChange={(value) => setPage(value)}
          onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
          onNext={() =>
            setPage((prev) =>
              Math.min(Math.ceil(filteredSkills.length / pageSize), prev + 1)
            )
          }
        />
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <AddSkillModal
          isOpen={showAddModal}
          onClose={handleCloseModal}
          newSkillData={newSkillData}
          setNewSkillData={setNewSkillData}
          addNotification={addNotification}
          dynamicDepartments={dynamicDepartments}
        />
      )}

      {/* Floating Quick Add Button (Mobile) */}
      <button
        onClick={handleOpenAddModal}
        className="fixed bottom-6 right-6 w-14 h-14 md:hidden bg-blue-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 hover:bg-blue-700 transition flex items-center justify-center z-30"
        title="Add New Skill"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
};

// ✅ Complete AddSkillModal Component with Matrix View
const AddSkillModal = memo(
  ({
    isOpen,
    onClose,
    newSkillData,
    setNewSkillData,
    addNotification,
    dynamicDepartments,
  }) => {
    const departments = useSkillMatrixStore((state) => state.departments);
    const selectedDepartment = useSkillMatrixStore(
      (state) => state.selectedDepartment
    );
    const lines = useSkillMatrixStore((state) => state.lines);
    const selectedLine = useSkillMatrixStore((state) => state.selectedLine);
    const subDepartments = useSkillMatrixStore((state) => state.subDepartments);
    const labourNames = useSkillMatrixStore((state) => state.labourNames);
    const loadingOptions = useSkillMatrixStore((state) => state.loadingOptions);
    const loadingSubDepts = useSkillMatrixStore(
      (state) => state.loadingSubDepts
    );
    const loadingLabourNames = useSkillMatrixStore(
      (state) => state.loadingLabourNames
    );
    const loadingLines = useSkillMatrixStore((state) => state.loadingLines);
    const loading = useSkillMatrixStore((state) => state.loading);

    const setSelectedDepartment = useSkillMatrixStore(
      (state) => state.setSelectedDepartment
    );
    const setSelectedLine = useSkillMatrixStore(
      (state) => state.setSelectedLine
    );
    const fetchSkillsForDepartment = useSkillMatrixStore(
      (state) => state.fetchSkillsForDepartment
    );
    const fetchLabourNamesForDepartment = useSkillMatrixStore(
      (state) => state.fetchLabourNamesForDepartment
    );
    const addSkill = useSkillMatrixStore((state) => state.addSkill);
    const addNewDepartment = useSkillMatrixStore(
      (state) => state.addNewDepartment
    );
    const addNewLine = useSkillMatrixStore((state) => state.addNewLine);

    const [showNewDeptModal, setShowNewDeptModal] = useState(false);
    const [newDeptName, setNewDeptName] = useState("");
    const [showNewLineModal, setShowNewLineModal] = useState(false);
    const [newLineName, setNewLineName] = useState("");
    const [labourSearchTerm, setLabourSearchTerm] = useState("");
    const [labourSearchType, setLabourSearchType] = useState("name");
    const [employeePage, setEmployeePage] = useState(1);
    const [skillMatrix, setSkillMatrix] = useState({});
    const [templateEmployee, setTemplateEmployee] = useState(null);

    const employeePageSize = 20;

    // ✅ Unique labour names
    const uniqueLabourNames = useMemo(() => {
      const labourMap = new Map();
      labourNames.forEach((item) => {
        if (item.labour_name?.trim()) {
          const key =
            item.labour_code ||
            `${item.labour_name}_${item.cdb_object_id || Math.random()}`;
          labourMap.set(key, {
            name: item.labour_name,
            code: item.labour_code || "",
            key: key,
          });
        }
      });
      return Array.from(labourMap.values());
    }, [labourNames]);

    // ✅ Filtered labour names
    const filteredLabourNames = useMemo(() => {
      if (!labourSearchTerm) return uniqueLabourNames;
      const searchLower = labourSearchTerm.toLowerCase();
      return uniqueLabourNames.filter((item) => {
        if (labourSearchType === "name") {
          return item.name.toLowerCase().includes(searchLower);
        } else {
          return item.code.toLowerCase().includes(searchLower);
        }
      });
    }, [uniqueLabourNames, labourSearchTerm, labourSearchType]);

    // ✅ Paginated employees
    const paginatedEmployees = useMemo(() => {
      const start = (employeePage - 1) * employeePageSize;
      return filteredLabourNames.slice(start, start + employeePageSize);
    }, [filteredLabourNames, employeePage]);

    const totalEmployeePages = Math.ceil(
      filteredLabourNames.length / employeePageSize
    );

    const handleDepartmentChange = useCallback(
      async (department) => {
        if (department === "__add_new__") {
          setShowNewDeptModal(true);
          return;
        }

        setSelectedDepartment(department);
        setNewSkillData((prev) => ({
          ...prev,
          department: department,
          sub_departments: [],
          labour_names: [],
        }));

        setSkillMatrix({});
        setTemplateEmployee(null);
        setEmployeePage(1);

        const [skillsResult, labourResult] = await Promise.all([
          fetchSkillsForDepartment(department),
          fetchLabourNamesForDepartment(department),
        ]);

        if (skillsResult.success) {
          addNotification({
            type: "success",
            message: `Loaded ${
              skillsResult.uniqueSkills?.length || 0
            } skills for ${department}`,
          });
        }

        if (labourResult.success) {
          setNewSkillData((prev) => ({
            ...prev,
            labour_names: labourResult.uniqueNames || [],
          }));
        }
      },
      [
        setSelectedDepartment,
        setNewSkillData,
        fetchSkillsForDepartment,
        fetchLabourNamesForDepartment,
        addNotification,
      ]
    );

    const handleLineChange = useCallback(
      (value) => {
        if (value === "__add_new_line__") {
          setShowNewLineModal(true);
          return;
        }
        setSelectedLine(value);
        setNewSkillData((prev) => ({ ...prev, line: value }));
      },
      [setSelectedLine, setNewSkillData]
    );

    const handleCellClick = useCallback((employeeKey, skillName) => {
      setSkillMatrix((prev) => {
        const key = `${employeeKey}_${skillName}`;
        const currentValue = prev[key];
        if (!currentValue) {
          return { ...prev, [key]: 4 };
        } else {
          const newMatrix = { ...prev };
          delete newMatrix[key];
          return newMatrix;
        }
      });
    }, []);

    const handleLevelChange = useCallback((employeeKey, skillName, level) => {
      const numLevel = parseInt(level) || 1;
      setSkillMatrix((prev) => ({
        ...prev,
        [`${employeeKey}_${skillName}`]: Math.max(1, Math.min(5, numLevel)),
      }));
    }, []);

    const handleCopySkillsToSelected = useCallback(() => {
      if (!templateEmployee) {
        addNotification({
          type: "error",
          message: "Please select a template employee first",
        });
        return;
      }

      const templateSkills = {};
      Object.entries(skillMatrix).forEach(([key, level]) => {
        if (key.startsWith(templateEmployee.key + "_")) {
          const skillName = key.substring(templateEmployee.key.length + 1);
          templateSkills[skillName] = level;
        }
      });

      if (Object.keys(templateSkills).length === 0) {
        addNotification({
          type: "error",
          message: "Template employee has no skills assigned",
        });
        return;
      }

      const newMatrix = { ...skillMatrix };
      paginatedEmployees.forEach((employee) => {
        if (employee.key !== templateEmployee.key) {
          Object.entries(templateSkills).forEach(([skillName, level]) => {
            newMatrix[`${employee.key}_${skillName}`] = level;
          });
        }
      });

      setSkillMatrix(newMatrix);
      addNotification({
        type: "success",
        message: `Copied ${Object.keys(templateSkills).length} skills to ${
          paginatedEmployees.length - 1
        } employees on this page`,
      });
    }, [templateEmployee, skillMatrix, paginatedEmployees, addNotification]);

    const handleBulkSelectAll = useCallback(() => {
      const newMatrix = { ...skillMatrix };
      paginatedEmployees.forEach((employee) => {
        subDepartments.forEach((skill) => {
          const key = `${employee.key}_${skill}`;
          if (!newMatrix[key]) {
            newMatrix[key] = 4;
          }
        });
      });
      setSkillMatrix(newMatrix);
      addNotification({
        type: "success",
        message: `Selected all skills for ${paginatedEmployees.length} employees with level 4`,
      });
    }, [skillMatrix, paginatedEmployees, subDepartments, addNotification]);

    const handleBulkClearAll = useCallback(() => {
      const newMatrix = { ...skillMatrix };
      paginatedEmployees.forEach((employee) => {
        subDepartments.forEach((skill) => {
          const key = `${employee.key}_${skill}`;
          delete newMatrix[key];
        });
      });
      setSkillMatrix(newMatrix);
      addNotification({
        type: "info",
        message: `Cleared all skills for ${paginatedEmployees.length} employees`,
      });
    }, [skillMatrix, paginatedEmployees, subDepartments, addNotification]);

    const getEmployeeSkillCount = useCallback(
      (employeeKey) => {
        return Object.keys(skillMatrix).filter((key) =>
          key.startsWith(employeeKey + "_")
        ).length;
      },
      [skillMatrix]
    );

    const saveNewDepartment = useCallback(async () => {
      if (!newDeptName.trim()) return;
      const res = await addNewDepartment(newDeptName.trim());
      if (res.success) {
        addNotification({ type: "success", message: "New department added!" });
        setShowNewDeptModal(false);
        setSelectedDepartment(newDeptName);
      } else {
        addNotification({ type: "error", message: res.error });
      }
    }, [newDeptName, addNewDepartment, addNotification, setSelectedDepartment]);

    const saveNewLine = useCallback(async () => {
      if (!newLineName.trim()) return;
      const res = await addNewLine(newLineName.trim());
      if (res.success) {
        addNotification({ type: "success", message: "New Line Added!" });
        setSelectedLine(newLineName.trim());
        setShowNewLineModal(false);
      } else {
        addNotification({ type: "error", message: res.error });
      }
    }, [newLineName, addNewLine, addNotification, setSelectedLine]);

    const handleAddSkill = useCallback(async () => {
      if (!selectedDepartment) {
        addNotification({
          type: "error",
          message: "Please select a department",
        });
        return;
      }

      if (Object.keys(skillMatrix).length === 0) {
        addNotification({
          type: "error",
          message: "Please assign skills to at least one employee",
        });
        return;
      }

      const employeeSkillsMap = {};
      Object.entries(skillMatrix).forEach(([key, level]) => {
        const [employeeKey, skillName] = key.split("_");
        if (!employeeSkillsMap[employeeKey]) {
          employeeSkillsMap[employeeKey] = [];
        }
        employeeSkillsMap[employeeKey].push({ name: skillName, level });
      });

      const entries = Object.entries(employeeSkillsMap).map(
        ([employeeKey, skills]) => {
          const employee = uniqueLabourNames.find((e) => e.key === employeeKey);
          return {
            line: selectedLine,
            department: selectedDepartment,
            labour_name: employee?.name || "",
            labour_code: employee?.code || "",
            skills: skills,
          };
        }
      );

      const result = await addSkill({ entries });

      if (result.success) {
        addNotification({
          type: "success",
          message: `Successfully added skills for ${entries.length} employee(s)!`,
        });
        onClose();
      } else {
        addNotification({
          type: "error",
          message: result.error || "Failed to add skills",
        });
      }
    }, [
      selectedDepartment,
      selectedLine,
      skillMatrix,
      uniqueLabourNames,
      addSkill,
      addNotification,
      onClose,
    ]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 overflow-y-auto">
        <div
          className="bg-white rounded-2xl w-full max-w-[98vw] my-4 flex flex-col shadow-2xl"
          style={{ maxHeight: "calc(100vh - 2rem)" }}
        >
          {/* Modal Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white z-20 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  🎯 Bulk Skill Assignment Matrix
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Quickly assign skills to multiple employees at once
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div
            className="flex-1 overflow-y-auto px-6 py-4"
            style={{ minHeight: 0 }}
          >
            {/* Department & Line Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  disabled={loadingOptions}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition disabled:opacity-50 text-base font-medium"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                  <option value="__add_new__">➕ Add New Department</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">
                  Line
                </label>
                <select
                  value={selectedLine}
                  onChange={(e) => handleLineChange(e.target.value)}
                  disabled={loadingLines}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition disabled:opacity-50 text-base font-medium"
                >
                  <option value="">Select Line</option>
                  {lines.map((line) => (
                    <option key={line} value={line}>
                      {line}
                    </option>
                  ))}
                  <option value="__add_new_line__">➕ Add New Line</option>
                </select>
              </div>
            </div>

            {/* Search & Bulk Actions */}
            {selectedDepartment && (
              <>
                <div className="mb-4 flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Search by ${
                        labourSearchType === "name" ? "name" : "code"
                      }...`}
                      value={labourSearchTerm}
                      onChange={(e) => setLabourSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base"
                    />
                  </div>
                  <select
                    value={labourSearchType}
                    onChange={(e) => {
                      setLabourSearchType(e.target.value);
                      setLabourSearchTerm("");
                    }}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base font-semibold bg-white"
                  >
                    <option value="name">👤 By Name</option>
                    <option value="code">🔢 By Code</option>
                  </select>
                </div>

                {/* Bulk Action Buttons */}
                <div className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border-2 border-purple-200">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-base font-bold text-gray-800">
                      ⚡ Quick Actions:
                    </h3>
                    <button
                      onClick={handleBulkSelectAll}
                      disabled={
                        paginatedEmployees.length === 0 ||
                        subDepartments.length === 0
                      }
                      className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-base font-semibold disabled:opacity-50"
                    >
                      <Check className="w-5 h-5" />
                      Select All Skills (Level 4)
                    </button>
                    <button
                      onClick={handleBulkClearAll}
                      disabled={paginatedEmployees.length === 0}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-base font-semibold disabled:opacity-50"
                    >
                      <XIcon className="w-5 h-5" />
                      Clear All (This Page)
                    </button>
                    <div className="flex items-center gap-2">
                      <select
                        value={templateEmployee?.key || ""}
                        onChange={(e) => {
                          const emp = paginatedEmployees.find(
                            (emp) => emp.key === e.target.value
                          );
                          setTemplateEmployee(emp);
                        }}
                        className="px-3 py-2.5 border-2 border-gray-300 rounded-lg text-base bg-white"
                      >
                        <option value="">Select Template Employee...</option>
                        {paginatedEmployees.map((emp) => (
                          <option key={emp.key} value={emp.key}>
                            {emp.name} {emp.code && `(${emp.code})`}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleCopySkillsToSelected}
                        disabled={!templateEmployee}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-base font-semibold disabled:opacity-50"
                      >
                        <Copy className="w-5 h-5" />
                        Copy to All
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Level 4+ = Required
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-md font-medium">
                      <AlertCircle className="w-4 h-4" />
                      Level 1-3 = Below Required
                    </div>
                    <span className="text-gray-600">
                      💡 Default level is <strong>4 (Required)</strong>
                    </span>
                  </div>
                </div>

                {/* Matrix Table View */}
                {loadingLabourNames || loadingSubDepts ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600 text-base">
                      Loading data...
                    </span>
                  </div>
                ) : filteredLabourNames.length === 0 ||
                  subDepartments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Grid3x3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium text-base">
                      {filteredLabourNames.length === 0
                        ? "No employees found"
                        : "No skills available"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-base font-bold text-gray-700">
                        📊 Skill Assignment Matrix
                      </h3>
                      <div className="text-base text-gray-600">
                        <span className="font-bold">
                          {
                            Object.keys(
                              Object.entries(skillMatrix).reduce(
                                (acc, [key]) => {
                                  const empKey = key.split("_")[0];
                                  acc[empKey] = true;
                                  return acc;
                                },
                                {}
                              )
                            ).length
                          }
                        </span>{" "}
                        / {filteredLabourNames.length} employees configured
                      </div>
                    </div>

                    <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="w-full border-collapse">
                          <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-bold uppercase sticky left-0 bg-blue-600 z-20 border-r-2 border-blue-500">
                                Employee
                              </th>
                              {subDepartments.map((skill) => (
                                <th
                                  key={skill}
                                  className="px-3 py-3 text-center text-sm font-bold uppercase border-r border-blue-500 min-w-[120px]"
                                >
                                  {skill}
                                </th>
                              ))}
                              <th className="px-4 py-3 text-center text-sm font-bold uppercase sticky right-0 bg-blue-600 z-20 border-l-2 border-blue-500">
                                Skills
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedEmployees.map((employee, index) => (
                              <tr
                                key={employee.key}
                                className={`border-b border-gray-200 hover:bg-blue-50 transition ${
                                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                }`}
                              >
                                <td className="px-4 py-2 sticky left-0 bg-inherit z-10 border-r-2 border-gray-200">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                      {employee.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-base font-semibold text-gray-800 truncate">
                                        {employee.name}
                                      </p>
                                      {employee.code && (
                                        <p className="text-sm text-gray-500 font-mono">
                                          {employee.code}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                {subDepartments.map((skill) => {
                                  const key = `${employee.key}_${skill}`;
                                  const level = skillMatrix[key];
                                  const isSelected = !!level;

                                  return (
                                    <td
                                      key={skill}
                                      className={`px-2 py-2 text-center border-r border-gray-200 transition-all duration-200 ${
                                        isSelected
                                          ? "bg-gradient-to-br from-green-100 to-green-200 shadow-inner"
                                          : "hover:bg-gray-50"
                                      }`}
                                    >
                                      <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() =>
                                              handleCellClick(
                                                employee.key,
                                                skill
                                              )
                                            }
                                            className="w-6 h-6 rounded-md border-2 border-gray-400 text-green-600 cursor-pointer transition-all checked:scale-110 focus:ring-2 focus:ring-green-500"
                                          />
                                          {isSelected && (
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                          )}
                                        </div>
                                        {isSelected && (
                                          <input
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={level}
                                            onChange={(e) =>
                                              handleLevelChange(
                                                employee.key,
                                                skill,
                                                e.target.value
                                              )
                                            }
                                            className={`w-14 px-1 py-1 text-center text-sm font-bold border-2 rounded-lg focus:ring-2 ${
                                              level >= 4
                                                ? "border-green-400 bg-green-100 text-green-800 focus:ring-green-500"
                                                : "border-orange-300 bg-orange-50 text-orange-800 focus:ring-orange-500"
                                            }`}
                                            title={`Skill Level (1-5, Default: 4 Required)${
                                              level < 4
                                                ? " ⚠️ Below Required Level"
                                                : " ✅ Required Level Met"
                                            }`}
                                          />
                                        )}
                                      </div>
                                    </td>
                                  );
                                })}
                                <td className="px-4 py-2 text-center sticky right-0 bg-inherit z-10 border-l-2 border-gray-200">
                                  <span
                                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                                      getEmployeeSkillCount(employee.key) > 0
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-500"
                                    }`}
                                  >
                                    {getEmployeeSkillCount(employee.key)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Employee Pagination */}
                    {totalEmployeePages > 1 && (
                      <div className="mt-4">
                        <Pagination
                          currentPage={employeePage}
                          totalPages={totalEmployeePages}
                          onPageChange={setEmployeePage}
                          onPrev={() =>
                            setEmployeePage((prev) => Math.max(1, prev - 1))
                          }
                          onNext={() =>
                            setEmployeePage((prev) =>
                              Math.min(totalEmployeePages, prev + 1)
                            )
                          }
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t-2 border-gray-200 flex gap-3 rounded-b-2xl z-20">
            <button
              onClick={handleAddSkill}
              disabled={
                loading ||
                loadingOptions ||
                !selectedDepartment ||
                Object.keys(skillMatrix).length === 0
              }
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg text-base"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Adding Skills...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Add Skills for{" "}
                  {
                    Object.keys(
                      Object.entries(skillMatrix).reduce((acc, [key]) => {
                        const empKey = key.split("_")[0];
                        acc[empKey] = true;
                        return acc;
                      }, {})
                    ).length
                  }{" "}
                  Employee(s)
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 py-4 rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow text-base"
            >
              <XIcon className="w-5 h-5" />
              Cancel
            </button>
          </div>

          {/* New Department Modal */}
          {showNewDeptModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl w-[400px] shadow-xl">
                <h2 className="text-xl font-bold mb-4">Add New Department</h2>
                <input
                  type="text"
                  placeholder="Enter new department"
                  className="w-full p-3 border-2 rounded-lg mb-4 text-base"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                  <button
                    className="px-5 py-2.5 bg-gray-200 rounded-lg font-semibold text-base"
                    onClick={() => setShowNewDeptModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-base"
                    onClick={saveNewDepartment}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* New Line Modal */}
          {showNewLineModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl w-[400px] shadow-xl">
                <h2 className="text-xl font-bold mb-4">Add New Line</h2>
                <input
                  type="text"
                  placeholder="Enter new line"
                  className="w-full p-3 border-2 rounded-lg mb-4 text-base"
                  value={newLineName}
                  onChange={(e) => setNewLineName(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                  <button
                    className="px-5 py-2.5 bg-gray-200 rounded-lg font-semibold text-base"
                    onClick={() => setShowNewLineModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-base"
                    onClick={saveNewLine}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default memo(SkillListPage);
