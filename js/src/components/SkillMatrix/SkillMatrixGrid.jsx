import React, { useState, useCallback, memo, useEffect, useMemo } from "react";
import {
  Download,
  RefreshCw,
  UserPlus,
  AlertCircle,
  Loader,
  BookOpen,
  X,
} from "lucide-react";
import { trainingScheduleAPI } from "../../services/apiService";
import { useSkillMatrixStore } from "../../reducers/skillMatrixStore";
import { useUIStore } from "../../reducers/uiStore";
import TestCreation from "../Training/TestCreation"; // path project structure ke hisaab se adjust kar lena

// ✅ All existing memoized components remain EXACTLY THE SAME
const SkillLevelChart = memo(
  ({ required, actual, onScheduleTraining, skillInfo, operatorInfo }) => {
    const percentage = (actual / 4) * 100;
    const isDeficient = actual < required;

    const barColor =
      actual === 0
        ? "bg-gray-300"
        : actual >= required
        ? "bg-green-500"
        : actual >= required - 1
        ? "bg-yellow-500"
        : "bg-red-500";

    return (
      <div
        className={`relative group cursor-pointer p-2.5 rounded-lg transition-all ${
          isDeficient ? "hover:bg-red-50" : "hover:bg-gray-50"
        }`}
        onClick={
          isDeficient
            ? () => onScheduleTraining(operatorInfo, skillInfo)
            : undefined
        }
        title={
          isDeficient ? "⚠️ Click to schedule training" : "✅ Skill level met"
        }
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center justify-center space-x-1.5">
            <span
              className={`font-bold text-base ${
                actual >= required ? "text-green-600" : "text-red-600"
              }`}
            >
              {actual}
            </span>
            <span className="text-gray-400 font-medium">/</span>
            <span className="text-gray-600 font-semibold text-sm">
              {required}
            </span>
          </div>

          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${barColor} relative`}
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            </div>
          </div>

          {isDeficient && (
            <>
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 rounded-full animate-pulse shadow-lg border-2 border-white" />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap font-medium">
                  Schedule Training
                </div>
              </div>
            </>
          )}

          {actual >= required && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-md">
              <svg
                className="w-2.5 h-2.5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {isDeficient && (
          <div className="absolute inset-0 bg-orange-100 opacity-0 group-hover:opacity-20 transition-opacity rounded-lg pointer-events-none" />
        )}
      </div>
    );
  }
);

const RadialProgress = memo(({ value, max, size = 45 }) => {
  const percentage = (value / max) * 100;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const strokeColor =
    percentage >= 70 ? "#10b981" : percentage >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute text-sm font-bold text-gray-700">{value}</span>
    </div>
  );
});

// 🎨 COMPACT Pie Chart Component (Stats Only)
const SkillDistributionPieChart = memo(({ stats }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const data = [
    {
      name: "Functional",
      value: stats.functional,
      color: "#2563eb",
      short: "F",
    },
    { name: "Critical", value: stats.critical, color: "#dc2626", short: "C" },
    { name: "Generic", value: stats.generic, color: "#4a5568", short: "G" },
  ];

  const total = stats.total || 1;

  const segments = data.map((item, index) => {
    const percentage = ((item.value / total) * 100).toFixed(1);
    const startAngle = data
      .slice(0, index)
      .reduce((acc, curr) => acc + (curr.value / total) * 360, 0);
    const angle = (item.value / total) * 360;

    return { ...item, percentage, startAngle, angle };
  });

  const createArc = (startAngle, endAngle, outerRadius = 45) => {
    const centerX = 60;
    const centerY = 60;
    const start = polarToCartesian(centerX, centerY, outerRadius, endAngle);
    const end = polarToCartesian(centerX, centerY, outerRadius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M",
      centerX,
      centerY,
      "L",
      start.x,
      start.y,
      "A",
      outerRadius,
      outerRadius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "Z",
    ].join(" ");
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-4">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Pie Chart + Title */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                className="transform hover:scale-105 transition-transform"
              >
                {segments.map((segment, index) => (
                  <path
                    key={index}
                    d={createArc(
                      segment.startAngle,
                      segment.startAngle + segment.angle,
                      hoveredSegment === index ? 48 : 45
                    )}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredSegment(index)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    className="cursor-pointer transition-all duration-200"
                  />
                ))}

                <circle
                  cx="60"
                  cy="60"
                  r="28"
                  fill="white"
                  stroke="#e5e7eb"
                  strokeWidth="1.5"
                />
                <text
                  x="60"
                  y="58"
                  textAnchor="middle"
                  className="text-xl font-bold"
                  fill="#374151"
                >
                  {stats.total}
                </text>
                <text
                  x="60"
                  y="68"
                  textAnchor="middle"
                  className="text-[9px]"
                  fill="#6b7280"
                >
                  Skills
                </text>
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Skill Distribution
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Overall Matrix Summary
              </p>
            </div>
          </div>

          {/* Center: Stats Cards */}
          <div className="flex-1 grid grid-cols-3 gap-3">
            {segments.map((segment, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  hoveredSegment === index
                    ? "shadow-lg scale-105"
                    : "shadow-sm hover:shadow-md"
                }`}
                style={{
                  borderColor: segment.color,
                  backgroundColor:
                    hoveredSegment === index ? `${segment.color}10` : "white",
                }}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="text-xs font-semibold text-gray-700">
                      {segment.name}
                    </span>
                  </div>
                  <span
                    className="text-xs font-medium px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${segment.color}20`,
                      color: segment.color,
                    }}
                  >
                    {segment.short}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: segment.color }}
                  >
                    {segment.value}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({segment.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

const OperatorRow = memo(
  ({
    operator,
    opIdx,
    matrixSkills,
    multiSkilled,
    completion,
    onScheduleTraining,
  }) => (
    <tr
      className={`border-b border-gray-200 hover:bg-blue-50 transition ${
        opIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
      }`}
    >
      {/* ✅ REMOVED T.No column */}
      <td className="px-4 py-4 text-left border-r border-gray-300">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
            {operator.name.charAt(0)}
          </div>
          <span className="text-sm font-semibold text-gray-800">
            {operator.name}
          </span>
        </div>
      </td>

      {matrixSkills.map((skill, skillIdx) => (
        <td
          key={skill.id}
          className="px-3 py-3 border-r border-gray-200 bg-white align-middle"
        >
          <SkillLevelChart
            required={skill.required}
            actual={operator.skills[skillIdx] || 0}
            skillInfo={skill}
            operatorInfo={operator}
            onScheduleTraining={onScheduleTraining}
          />
        </td>
      ))}

      <td className="px-4 py-4 text-center border-r border-gray-300 bg-purple-50">
        <RadialProgress value={multiSkilled} max={10} size={45} />
      </td>
      <td className="px-4 py-4 text-center bg-purple-50">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="text-xl font-bold text-purple-600">
            {completion.toFixed(0)}%
          </div>
          <div className="w-full max-w-[90px] bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </td>
    </tr>
  )
);

// ✅ UPDATED: Skill Header - showing only skill name, NO CODE
const SkillHeader = memo(({ skill }) => {
  return (
    <th className="px-3 py-4 text-center border-r border-gray-300 min-w-[120px] bg-gradient-to-b from-gray-50 to-white">
      <div className="flex flex-col items-center justify-center space-y-2">
        <div
          className="text-sm font-bold text-gray-800 leading-tight text-center px-2"
          title={skill.name}
          style={{ minHeight: "44px", display: "flex", alignItems: "center" }}
        >
          {skill.name}
        </div>
      </div>
    </th>
  );
});

// ✅ Training Scheduler Modal (remains exactly the same)
const TrainingSchedulerModal = memo(
  ({
    selectedSkillForTraining,
    employeesNeedingSkill,
    scheduledTrainings,
    onCancel,
    onSubmit,
    loading,
  }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [selectedDate, setSelectedDate] = useState(null);
    const [trainingDetails, setTrainingDetails] = useState({
      date: "",
      day: "",
      time: "09:00",
      duration: "8",
      trainer: "",
      notes: "",
    });

    useEffect(() => {
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1200;
    const modalMaxWidth = isMobile ? "95%" : isTablet ? "90%" : "1400px";
    const modalMaxHeight = isMobile ? "95vh" : "90vh";
    const gridColumns = isMobile || isTablet ? "1fr" : "1fr 1fr";

    const generateCalendarDates = useCallback(() => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const firstDayOfWeek = firstDay.getDay();
      const daysInMonth = lastDay.getDate();

      const dates = [];

      for (let i = 0; i < firstDayOfWeek; i++) {
        dates.push({ isEmpty: true, date: null });
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = date.toLocaleDateString("en-GB");
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const trainingsOnThisDate = scheduledTrainings.filter(
          (training) => training.schedule.date === dateString
        );

        dates.push({
          isEmpty: false,
          date: day,
          fullDate: date,
          dateString: dateString,
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          isToday: date.toDateString() === today.toDateString(),
          isPast: date < today,
          isFuture: date > today,
          hasTraining: trainingsOnThisDate.length > 0,
          trainings: trainingsOnThisDate,
        });
      }

      return dates;
    }, [currentMonth, scheduledTrainings]);

    const calendarDates = useMemo(
      () => generateCalendarDates(),
      [generateCalendarDates]
    );

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const goToPreviousMonth = () => {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      );
    };

    const goToNextMonth = () => {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
      );
    };

    const goToToday = () => {
      setCurrentMonth(new Date());
    };

    const handleDateSelect = (dateObj) => {
      if (dateObj.isEmpty || dateObj.isPast) return;

      if (dateObj.hasTraining) {
        alert("⚠️ Training already scheduled on this date!");
        return;
      }

      setSelectedDate(dateObj);
      setTrainingDetails({
        date: dateObj.dateString,
        day: dateObj.day,
        time: "09:00",
        duration: "8",
        trainer: "",
        notes: "",
      });
    };

    const handleSubmit = () => {
      if (!selectedDate) {
        alert("⚠️ Please select a training date");
        return;
      }

      if (!trainingDetails.trainer.trim()) {
        alert("⚠️ Please enter trainer name");
        return;
      }

      onSubmit({
        date: trainingDetails,
        skill: selectedSkillForTraining,
        employees: employeesNeedingSkill,
      });
    };

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2000,
          padding: isMobile ? "10px" : "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: isMobile ? "12px" : "16px",
            width: "100%",
            maxWidth: modalMaxWidth,
            maxHeight: modalMaxHeight,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              padding: isMobile ? "12px 16px" : "20px 24px",
              borderRadius: isMobile ? "12px 12px 0 0" : "16px 16px 0 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: isMobile ? "16px" : "22px",
                  fontWeight: "700",
                }}
              >
                🎓 Schedule Training
              </h2>
              <p
                style={{
                  margin: "6px 0 0 0",
                  fontSize: isMobile ? "11px" : "14px",
                  opacity: 0.9,
                  display: isMobile ? "none" : "block",
                }}
              >
                {selectedSkillForTraining?.name}
              </p>
            </div>
            <button
              onClick={onCancel}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: "6px",
                padding: isMobile ? "6px" : "8px",
                cursor: "pointer",
                color: "white",
              }}
            >
              <X size={isMobile ? 20 : 24} />
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: gridColumns,
              gap: isMobile ? "16px" : isTablet ? "20px" : "24px",
              padding: isMobile ? "16px" : isTablet ? "20px" : "24px",
              overflow: "auto",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? "12px" : "16px",
                minHeight: 0,
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)",
                  padding: isMobile ? "12px" : "16px",
                  borderRadius: isMobile ? "8px" : "12px",
                  border: "2px solid #fc8181",
                  flexShrink: 0,
                }}
              >
                <h3
                  style={{
                    margin: "0 0 10px 0",
                    fontSize: isMobile ? "12px" : "14px",
                    fontWeight: "600",
                    color: "#c53030",
                  }}
                >
                  👥 Employees ({employeesNeedingSkill.length})
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: isMobile ? "6px" : "8px",
                    maxHeight: isMobile ? "120px" : "150px",
                    overflow: "auto",
                  }}
                >
                  {employeesNeedingSkill.map((emp) => (
                    <div
                      key={emp.id}
                      style={{
                        background: "white",
                        padding: isMobile ? "8px" : "10px",
                        borderRadius: isMobile ? "6px" : "8px",
                        border: "1px solid #fc8181",
                        display: "flex",
                        alignItems: "center",
                        gap: isMobile ? "8px" : "10px",
                      }}
                    >
                      <div
                        style={{
                          width: isMobile ? "28px" : "32px",
                          height: isMobile ? "28px" : "32px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          fontSize: isMobile ? "11px" : "13px",
                          flexShrink: 0,
                        }}
                      >
                        {emp.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: "600",
                            fontSize: isMobile ? "11px" : "12px",
                            color: "#2d3748",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {emp.name}
                        </div>
                        <div
                          style={{
                            fontSize: isMobile ? "9px" : "10px",
                            color: "#718096",
                          }}
                        >
                          Lvl: {emp.currentLevel}/
                          {selectedSkillForTraining?.required} | Gap: {emp.gap}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: isMobile ? "8px" : "12px",
                    padding: isMobile ? "8px 10px" : "10px 12px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: isMobile ? "8px" : "10px",
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  <button
                    onClick={goToPreviousMonth}
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      border: "none",
                      borderRadius: "6px",
                      padding: isMobile ? "4px 8px" : "6px 12px",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: isMobile ? "11px" : "12px",
                    }}
                  >
                    ←
                  </button>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: isMobile ? "13px" : "16px",
                        fontWeight: "700",
                      }}
                    >
                      {monthNames[currentMonth.getMonth()].substring(
                        0,
                        isMobile ? 3 : 10
                      )}{" "}
                      {currentMonth.getFullYear()}
                    </div>
                    <button
                      onClick={goToToday}
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        border: "none",
                        borderRadius: "4px",
                        padding: "2px 8px",
                        color: "white",
                        cursor: "pointer",
                        fontSize: isMobile ? "8px" : "9px",
                        marginTop: "2px",
                      }}
                    >
                      Today
                    </button>
                  </div>
                  <button
                    onClick={goToNextMonth}
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      border: "none",
                      borderRadius: "6px",
                      padding: isMobile ? "4px 8px" : "6px 12px",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: isMobile ? "11px" : "12px",
                    }}
                  >
                    →
                  </button>
                </div>

                <div
                  style={{
                    background: "#f7fafc",
                    borderRadius: isMobile ? "8px" : "10px",
                    padding: isMobile ? "8px" : "12px",
                    border: "2px solid #e2e8f0",
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: isMobile ? "4px" : "6px",
                      marginBottom: isMobile ? "6px" : "8px",
                      flexShrink: 0,
                    }}
                  >
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                      <div
                        key={idx}
                        style={{
                          textAlign: "center",
                          fontWeight: "700",
                          fontSize: isMobile ? "9px" : "11px",
                          color: "#4a5568",
                          padding: isMobile ? "4px" : "6px",
                          background: "#e2e8f0",
                          borderRadius: isMobile ? "4px" : "6px",
                        }}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: isMobile ? "4px" : "6px",
                      flex: 1,
                    }}
                  >
                    {calendarDates.map((dateObj, index) => {
                      if (dateObj.isEmpty) {
                        return (
                          <div
                            key={`empty-${index}`}
                            style={{ background: "transparent" }}
                          />
                        );
                      }

                      const cellSize = isMobile ? "38px" : "50px";

                      return (
                        <button
                          key={`${dateObj.date}`}
                          onClick={() => handleDateSelect(dateObj)}
                          disabled={dateObj.isPast}
                          style={{
                            height: cellSize,
                            padding: isMobile ? "4px" : "6px",
                            borderRadius: isMobile ? "6px" : "8px",
                            border: dateObj.isToday
                              ? "2px solid #3182ce"
                              : selectedDate?.dateString === dateObj.dateString
                              ? "2px solid #667eea"
                              : dateObj.hasTraining
                              ? "2px solid #48bb78"
                              : "1px solid #e2e8f0",
                            background:
                              selectedDate?.dateString === dateObj.dateString
                                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                : dateObj.hasTraining
                                ? "linear-gradient(135deg, #48bb78 0%, #38a169 100%)"
                                : dateObj.isPast
                                ? "#e2e8f0"
                                : "white",
                            color:
                              selectedDate?.dateString === dateObj.dateString ||
                              dateObj.hasTraining
                                ? "white"
                                : dateObj.isPast
                                ? "#a0aec0"
                                : "#2d3748",
                            cursor: dateObj.isPast ? "not-allowed" : "pointer",
                            fontSize: isMobile ? "11px" : "13px",
                            fontWeight:
                              selectedDate?.dateString === dateObj.dateString ||
                              dateObj.hasTraining
                                ? "700"
                                : "600",
                            opacity: dateObj.isPast ? 0.5 : 1,
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {dateObj.date}
                          {dateObj.hasTraining && (
                            <div
                              style={{
                                position: "absolute",
                                top: "2px",
                                right: "2px",
                                width: isMobile ? "4px" : "6px",
                                height: isMobile ? "4px" : "6px",
                                borderRadius: "50%",
                                background: "white",
                              }}
                            ></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{ minHeight: 0, display: "flex", flexDirection: "column" }}
            >
              {selectedDate ? (
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)",
                    padding: isMobile ? "16px" : "20px",
                    borderRadius: isMobile ? "8px" : "12px",
                    border: "2px solid #48bb78",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    minHeight: 0,
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: isMobile ? "14px" : "16px",
                      fontWeight: "600",
                      color: "#22543d",
                      flexShrink: 0,
                    }}
                  >
                    ⏰ Schedule Details
                  </h3>

                  <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                        gap: isMobile ? "12px" : "16px",
                        marginBottom: isMobile ? "12px" : "16px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            fontSize: isMobile ? "11px" : "13px",
                            fontWeight: "600",
                            color: "#2d3748",
                            marginBottom: "4px",
                            display: "block",
                          }}
                        >
                          📅 Date
                        </label>
                        <input
                          type="text"
                          value={trainingDetails.date}
                          readOnly
                          style={{
                            width: "100%",
                            padding: isMobile ? "8px 10px" : "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e0",
                            background: "#f7fafc",
                            fontSize: isMobile ? "12px" : "14px",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            fontSize: isMobile ? "11px" : "13px",
                            fontWeight: "600",
                            color: "#2d3748",
                            marginBottom: "4px",
                            display: "block",
                          }}
                        >
                          📆 Day
                        </label>
                        <input
                          type="text"
                          value={trainingDetails.day}
                          readOnly
                          style={{
                            width: "100%",
                            padding: isMobile ? "8px 10px" : "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e0",
                            background: "#f7fafc",
                            fontSize: isMobile ? "12px" : "14px",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            fontSize: isMobile ? "11px" : "13px",
                            fontWeight: "600",
                            color: "#2d3748",
                            marginBottom: "4px",
                            display: "block",
                          }}
                        >
                          ⏰ Start Time
                        </label>
                        <input
                          type="time"
                          value={trainingDetails.time}
                          onChange={(e) =>
                            setTrainingDetails({
                              ...trainingDetails,
                              time: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: isMobile ? "8px 10px" : "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e0",
                            fontSize: isMobile ? "12px" : "14px",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            fontSize: isMobile ? "11px" : "13px",
                            fontWeight: "600",
                            color: "#2d3748",
                            marginBottom: "4px",
                            display: "block",
                          }}
                        >
                          ⏱️ Duration (hrs)
                        </label>
                        <input
                          type="number"
                          value={trainingDetails.duration}
                          onChange={(e) =>
                            setTrainingDetails({
                              ...trainingDetails,
                              duration: e.target.value,
                            })
                          }
                          min="1"
                          max="12"
                          style={{
                            width: "100%",
                            padding: isMobile ? "8px 10px" : "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e0",
                            fontSize: isMobile ? "12px" : "14px",
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: isMobile ? "12px" : "16px" }}>
                      <label
                        style={{
                          fontSize: isMobile ? "11px" : "13px",
                          fontWeight: "600",
                          color: "#2d3748",
                          marginBottom: "4px",
                          display: "block",
                        }}
                      >
                        👨‍🏫 Trainer Name *
                      </label>
                      <input
                        type="text"
                        value={trainingDetails.trainer}
                        onChange={(e) =>
                          setTrainingDetails({
                            ...trainingDetails,
                            trainer: e.target.value,
                          })
                        }
                        placeholder="Enter trainer name"
                        style={{
                          width: "100%",
                          padding: isMobile ? "8px 10px" : "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e0",
                          fontSize: isMobile ? "12px" : "14px",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: isMobile ? "11px" : "13px",
                          fontWeight: "600",
                          color: "#2d3748",
                          marginBottom: "4px",
                          display: "block",
                        }}
                      >
                        📝 Notes
                      </label>
                      <textarea
                        value={trainingDetails.notes}
                        onChange={(e) =>
                          setTrainingDetails({
                            ...trainingDetails,
                            notes: e.target.value,
                          })
                        }
                        placeholder="Additional notes..."
                        rows={isMobile ? "3" : "4"}
                        style={{
                          width: "100%",
                          padding: isMobile ? "8px 10px" : "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e0",
                          fontSize: isMobile ? "12px" : "14px",
                          resize: "vertical",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
                    borderRadius: isMobile ? "8px" : "12px",
                    border: "2px dashed #cbd5e0",
                    padding: isMobile ? "20px" : "40px",
                    textAlign: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: isMobile ? "32px" : "48px",
                        marginBottom: isMobile ? "8px" : "16px",
                      }}
                    >
                      📅
                    </div>
                    <div
                      style={{
                        fontSize: isMobile ? "13px" : "16px",
                        fontWeight: "600",
                        color: "#4a5568",
                        marginBottom: isMobile ? "4px" : "8px",
                      }}
                    >
                      Select a Date
                    </div>
                    <div
                      style={{
                        fontSize: isMobile ? "11px" : "13px",
                        color: "#718096",
                      }}
                    >
                      Choose from calendar
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              padding: isMobile ? "12px 16px" : "16px 24px",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "flex-end",
              gap: isMobile ? "8px" : "12px",
              flexShrink: 0,
            }}
          >
            <button
              onClick={onCancel}
              style={{
                padding: isMobile ? "8px 16px" : "10px 24px",
                borderRadius: "8px",
                border: "1px solid #cbd5e0",
                background: "white",
                color: "#4a5568",
                fontSize: isMobile ? "12px" : "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedDate || loading}
              style={{
                padding: isMobile ? "8px 16px" : "10px 24px",
                borderRadius: "8px",
                border: "none",
                background:
                  selectedDate && !loading
                    ? "linear-gradient(135deg, #48bb78 0%, #38a169 100%)"
                    : "#cbd5e0",
                color: "white",
                fontSize: isMobile ? "12px" : "14px",
                fontWeight: "600",
                cursor: selectedDate && !loading ? "pointer" : "not-allowed",
              }}
            >
              {loading
                ? "Scheduling..."
                : isMobile
                ? `Schedule (${employeesNeedingSkill.length})`
                : `📅 Schedule for ${employeesNeedingSkill.length} Employee(s)`}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

const SkillMatrixGrid = () => {
  const skills = useSkillMatrixStore((state) => state.skills);
  const fetchSkills = useSkillMatrixStore((state) => state.fetchSkills);
  const addNotification = useUIStore((state) => state.addNotification);

  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedLine] = useState("4DU");
  const [showTrainingScheduler, setShowTrainingScheduler] = useState(false);
  const [selectedSkillForTraining, setSelectedSkillForTraining] =
    useState(null);
  const [employeesNeedingSkill, setEmployeesNeedingSkill] = useState([]);
  const [scheduledTrainings, setScheduledTrainings] = useState([]);
  const [trainingsLoaded, setTrainingsLoaded] = useState(false);

  // 👉 NEW
  const [showModeSelector, setShowModeSelector] = useState(false); // Training vs Test popup
  const [selectedOperatorForSkill, setSelectedOperatorForSkill] =
    useState(null);
  const [showTestModal, setShowTestModal] = useState(false); // TestCreation modal

  useEffect(() => {
    if (trainingsLoaded) return;

    const loadScheduledTrainings = async () => {
      try {
        const result = await trainingScheduleAPI.getScheduledTrainings({
          status: "Scheduled",
        });

        if (result.success && result.data) {
          const transformed = result.data.map((training) => ({
            id: training.training_id,
            cdb_object_id: training.cdb_object_id,
            skill: {
              id: training.skill_id,
              name: training.skill_name,
              code: training.skill_code,
              type: training.skill_type,
            },
            employees: JSON.parse(training.employee_names || "[]").map(
              (name, idx) => ({
                id: JSON.parse(training.employee_ids || "[]")[idx],
                name: name,
              })
            ),
            schedule: {
              date: training.training_date,
              day: training.training_day,
              time: training.training_time,
              duration: training.duration_hours,
              trainer: training.trainer_name,
              notes: training.notes,
            },
            status: training.status,
            scheduledBy: training.scheduled_by,
            scheduledAt: training.scheduled_at,
          }));

          setScheduledTrainings(transformed);
        }
      } catch (error) {
        console.error("❌ Error loading trainings:", error);
      } finally {
        setTrainingsLoaded(true);
      }
    };

    loadScheduledTrainings();
  }, [trainingsLoaded]);

  useEffect(() => {
    if (dataLoaded) return;

    const loadData = async () => {
      setLoading(true);
      const result = await fetchSkills();
      setLoading(false);

      if (result.success) {
        setDataLoaded(true);
        addNotification({
          type: "success",
          message: "Skills loaded successfully!",
        });
      } else {
        addNotification({
          type: "error",
          message: result.error || "Failed to load skills",
        });
      }
    };

    if (skills.length === 0) {
      loadData();
    } else {
      setDataLoaded(true);
    }
  }, [dataLoaded, skills.length, fetchSkills, addNotification]);

  // 🔹 matrixSkills - Create unique skill list with normalized names
  const matrixSkills = useMemo(() => {
    if (!skills || skills.length === 0) return [];

    const uniqueSkills = [];
    const seenNames = new Set();

    skills.forEach((skill) => {
      // ✅ FIXED: Get skill name and normalize it
      const rawName =
        skill.name || skill.machining_skills_names || "Unknown Skill";
      const normalizedName = rawName.trim(); // Remove extra spaces
      const compareKey = normalizedName.toLowerCase(); // For case-insensitive comparison

      // ✅ Check if we've seen this skill before (case-insensitive)
      if (!seenNames.has(compareKey)) {
        seenNames.add(compareKey);
        uniqueSkills.push({
          id: skill.id,
          name: normalizedName, // Store clean name
          type: skill.type || "G",
          required: 4,
        });
      }
    });

    return uniqueSkills.slice(0, 15);
  }, [skills]);

  // 🔹 matrixOperators - Map skills to operators with fast lookup
  const matrixOperators = useMemo(() => {
    if (!skills || skills.length === 0) return [];

    const operatorMap = new Map();

    // ✅ FIXED: Create fast lookup map (skill name → index)
    const skillNameToIndex = new Map();
    matrixSkills.forEach((skill, index) => {
      const normalizedName = skill.name.trim().toLowerCase();
      skillNameToIndex.set(normalizedName, index);
    });

    skills.forEach((skill) => {
      const empName = skill.labour_name || "Unknown Employee";
      const empCode = skill.employee_id || skill.id;

      // Create operator entry if doesn't exist
      if (!operatorMap.has(empCode)) {
        operatorMap.set(empCode, {
          id: empCode,
          name: empName,
          skills: new Array(matrixSkills.length).fill(0),
        });
      }

      // ✅ FIXED: Normalize skill name for matching
      const rawSkillName = skill.name || skill.machining_skills_names || "";
      const normalizedSkillName = rawSkillName.trim().toLowerCase();

      // ✅ FIXED: Use Map lookup (faster than findIndex)
      const skillIndex = skillNameToIndex.get(normalizedSkillName);

      if (skillIndex !== undefined && operatorMap.has(empCode)) {
        const operator = operatorMap.get(empCode);

        // ✅ FIXED: Use 'actual' field from API (most important fix!)
        const actualLevel = skill.actual || 0;

        operator.skills[skillIndex] = actualLevel;
      }
    });

    return Array.from(operatorMap.values()).slice(0, 10);
  }, [skills, matrixSkills]);

  const calculateMultiSkilled = useCallback(
    (operatorSkills) => {
      let count = 0;
      operatorSkills.forEach((level, idx) => {
        if (level === 4 && matrixSkills[idx]) {
          const skill = matrixSkills[idx];
          if (skill?.type === "F" || skill?.type === "C") count++;
        }
      });
      return count;
    },
    [matrixSkills]
  );

  const getSkillCompletion = useCallback(
    (operatorSkills) => {
      let completed = 0;
      operatorSkills.forEach((level, idx) => {
        if (matrixSkills[idx] && level >= matrixSkills[idx].required)
          completed++;
      });
      return matrixSkills.length > 0
        ? (completed / matrixSkills.length) * 100
        : 0;
    },
    [matrixSkills]
  );

  const operatorsWithStats = useMemo(
    () =>
      matrixOperators.map((operator) => ({
        ...operator,
        multiSkilled: calculateMultiSkilled(operator.skills),
        completion: getSkillCompletion(operator.skills),
      })),
    [matrixOperators, calculateMultiSkilled, getSkillCompletion]
  );

  const stats = useMemo(() => {
    // ✅ Count UNIQUE skill names only (not person-wise)
    const uniqueSkillsMap = new Map();

    skills.forEach((skill) => {
      const skillName = skill.name || skill.machining_skills_names;
      if (skillName && !uniqueSkillsMap.has(skillName)) {
        // Store skill name with its type
        uniqueSkillsMap.set(skillName, skill.type || "G");
      }
    });

    // Now count by type from unique skills only
    let functional = 0;
    let critical = 0;
    let generic = 0;

    uniqueSkillsMap.forEach((type) => {
      if (type === "F") functional++;
      else if (type === "C") critical++;
      else if (type === "G") generic++;
    });

    return {
      functional,
      critical,
      generic,
      total: uniqueSkillsMap.size, // ✅ Total unique skills
    };
  }, [skills]);

  const handleScheduleTraining = useCallback(
    (operator, skillInfo) => {
      const employeesNeedingThisSkill = matrixOperators
        .map((emp) => ({
          ...emp,
          // yahan tum jo logic already use kar rahe ho woh hi rahe
          currentLevel: emp.skills[skillInfo.id - 1] || 0,
          gap: skillInfo.required - (emp.skills[skillInfo.id - 1] || 0),
        }))
        .filter((emp) => emp.currentLevel < skillInfo.required);

      setSelectedSkillForTraining(skillInfo);
      setEmployeesNeedingSkill(employeesNeedingThisSkill);
      setShowTrainingScheduler(true);
    },
    [matrixOperators]
  );

  const handleSkillClick = useCallback((operator, skillInfo) => {
    // Jo skill pe click hua woh store
    setSelectedSkillForTraining(skillInfo);
    setSelectedOperatorForSkill(operator);

    // Pehle chhota choice modal kholenge
    setShowModeSelector(true);
  }, []);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    const result = await fetchSkills();
    setLoading(false);

    if (result.success) {
      addNotification({
        type: "success",
        message: "Data refreshed successfully!",
      });
    }
  }, [fetchSkills, addNotification]);

  const handleCancelTraining = useCallback(() => {
    setShowTrainingScheduler(false);
    setSelectedSkillForTraining(null);
    setEmployeesNeedingSkill([]);
  }, []);

  const handleSubmitTraining = useCallback(
    async ({ date, skill, employees }) => {
      try {
        setLoading(true);

        const scheduleData = {
          training_id: `TRN_${Date.now()}`,
          skill_id: skill.id,
          skill_name: skill.name,
          skill_code: skill.code || "",
          skill_type: skill.type,
          employee_ids: employees.map((emp) => emp.id),
          employee_names: employees.map((emp) => emp.name),
          training_date: date.date,
          training_day: date.day,
          training_time: date.time,
          duration_hours: parseInt(date.duration),
          trainer_name: date.trainer,
          notes: date.notes,
          status: "Scheduled",
          scheduled_by: "Admin",
        };

        const result = await trainingScheduleAPI.createTrainingSchedule(
          scheduleData
        );

        if (result.success) {
          const trainingSchedule = {
            id: result.data.training_id,
            cdb_object_id: result.data.cdb_object_id,
            skill: skill,
            employees: employees,
            schedule: date,
            scheduledBy: "Admin",
            scheduledAt: new Date().toISOString(),
            status: "Scheduled",
          };

          setScheduledTrainings((prev) => [...prev, trainingSchedule]);

          addNotification({
            type: "success",
            message: `Training scheduled successfully for ${employees.length} employee(s)!`,
          });

          handleCancelTraining();
        } else {
          addNotification({
            type: "error",
            message: result.message || "Failed to schedule training",
          });
        }
      } catch (error) {
        console.error("❌ Error:", error);
        addNotification({
          type: "error",
          message: error.message || "Failed to schedule training",
        });
      } finally {
        setLoading(false);
      }
    },
    [addNotification, handleCancelTraining]
  );

  if (loading && !dataLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading skill matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Skill Matrix - {selectedLine}
            </h1>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-700">
                  Functional:{" "}
                  <strong className="text-blue-600">{stats.functional}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-700">
                  Critical:{" "}
                  <strong className="text-red-600">{stats.critical}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span className="text-gray-700">
                  Generic:{" "}
                  <strong className="text-gray-600">{stats.generic}</strong>
                </span>
              </div>
              <div className="h-5 w-px bg-gray-300"></div>
              <span className="text-gray-700">
                Total Skills:{" "}
                <strong className="text-purple-600">{stats.total}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all shadow-md disabled:opacity-50 text-sm font-medium"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md text-sm font-medium">
              <UserPlus className="w-4 h-4" />
              <span>Add New</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md text-sm font-medium">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div> */}
      {/* 🎨 Compact Pie Chart Header */}
      <SkillDistributionPieChart stats={stats} />

      {/* Title Row with Action Buttons */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-200 p-3 mb-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                Skill Matrix - {selectedLine}
              </h1>
              <p className="text-xs text-gray-600">Employee Skills Overview</p>
            </div>
          </div>

          {/* Action Buttons - Now with access to parent functions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all shadow-sm disabled:opacity-50 text-xs font-medium"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm text-xs font-medium">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-sm text-xs font-medium">
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              {/* ✅ Row 1: Type Icons */}
              <tr className="bg-gradient-to-r from-blue-50 via-white to-blue-50 border-b border-gray-300">
                {/* ✅ REMOVED T.No column from colspan */}
                <th
                  className="px-5 py-4 border-r-2 border-gray-400"
                  style={{
                    background:
                      "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                  }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{ minHeight: "40px" }}
                  >
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Employee
                    </div>
                  </div>
                </th>

                {matrixSkills.map((skill) => {
                  const getIconStyle = (type) => {
                    switch (type) {
                      case "G":
                        return { backgroundColor: "#4a5568" };
                      case "F":
                        return { backgroundColor: "#2563eb" };
                      case "C":
                        return { backgroundColor: "#dc2626" };
                      default:
                        return { backgroundColor: "#6b7280" };
                    }
                  };

                  return (
                    <th
                      key={`icon-${skill.id}`}
                      className="px-3 py-4 text-center border-r border-gray-200 bg-white"
                    >
                      <div
                        className="flex items-center justify-center"
                        style={{ minHeight: "40px" }}
                      >
                        <div
                          className="inline-flex items-center justify-center rounded-full text-white font-bold text-base shadow-lg"
                          style={{
                            width: "40px",
                            height: "40px",
                            ...getIconStyle(skill.type),
                          }}
                        >
                          {skill.type}
                        </div>
                      </div>
                    </th>
                  );
                })}

                <th
                  colSpan="2"
                  className="px-5 py-4 border-l-2 border-gray-400"
                  style={{
                    background:
                      "linear-gradient(135deg, #f3e7ff 0%, #e9d5ff 100%)",
                  }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{ minHeight: "40px" }}
                  >
                    <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                      Metrics
                    </div>
                  </div>
                </th>
              </tr>

              {/* ✅ Row 2: Skill Names */}
              <tr className="bg-gradient-to-r from-blue-50 via-white to-blue-50 border-b-2 border-gray-300">
                <th className="px-5 py-4 text-left text-base font-bold border-r-2 border-gray-400 text-gray-800 align-middle">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    <span className="text-base">Name</span>
                  </div>
                </th>
                {matrixSkills.map((skill) => (
                  <SkillHeader key={skill.id} skill={skill} />
                ))}
                <th
                  colSpan="2"
                  className="px-5 py-4 text-center text-base font-bold text-gray-800 bg-gradient-to-l from-purple-50 via-white to-purple-50 align-middle border-l-2 border-gray-400"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-base">Performance</span>
                    <span className="text-xs text-gray-500 font-normal">
                      Metrics
                    </span>
                  </div>
                </th>
              </tr>

              {/* ✅ Row 3: Level Labels - REMOVED T.No */}
              <tr className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-400">
                <th className="px-4 py-3 text-left text-sm font-bold border-r-2 border-gray-400 text-blue-700">
                  Employee Name
                </th>

                {matrixSkills.map((skill) => (
                  <th
                    key={`level-${skill.id}`}
                    className="px-3 py-3 text-center border-r border-gray-200"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm text-gray-800 font-bold">
                        Level
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        (A/R)
                      </span>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-sm font-bold border-r border-l-2 border-gray-400 text-purple-700">
                  Multi
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-purple-700">
                  Complete
                </th>
              </tr>
            </thead>

            <tbody>
              {operatorsWithStats.length === 0 ? (
                <tr>
                  <td
                    colSpan={matrixSkills.length + 3}
                    className="px-4 py-12 text-center"
                  >
                    <div className="text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">No operators found</p>
                      <p className="text-sm">Add skills to see operator data</p>
                    </div>
                  </td>
                </tr>
              ) : (
                operatorsWithStats.map((operator, opIdx) => (
                  <OperatorRow
                    key={operator.id}
                    operator={operator}
                    opIdx={opIdx}
                    matrixSkills={matrixSkills}
                    multiSkilled={operator.multiSkilled}
                    completion={operator.completion}
                    onScheduleTraining={handleSkillClick}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModeSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-indigo-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Select Mode
            </h3>

            <div className="space-y-4">
              <button
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "16px",
                  transition: "all 0.3s",
                  cursor: "pointer",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 6px 16px rgba(79, 70, 229, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 4px 12px rgba(79, 70, 229, 0.3)";
                }}
                onClick={() => {
                  setShowModeSelector(false);
                  if (selectedOperatorForSkill && selectedSkillForTraining) {
                    handleScheduleTraining(
                      selectedOperatorForSkill,
                      selectedSkillForTraining
                    );
                  }
                }}
              >
                📅 Training Schedule
              </button>

              <button
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #9333ea 0%, #a855f7 100%)",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "16px",
                  transition: "all 0.3s",
                  cursor: "pointer",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(147, 51, 234, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 6px 16px rgba(147, 51, 234, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 4px 12px rgba(147, 51, 234, 0.3)";
                }}
                onClick={() => {
                  setShowModeSelector(false);
                  setShowTestModal(true);
                }}
              >
                📝 Exam Create
              </button>
            </div>

            <button
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                marginTop: "20px",
                backgroundColor: "#ffffff",
                color: "#6b7280",
                fontWeight: 600,
                border: "2px solid #e5e7eb",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f3f4f6";
                e.target.style.borderColor = "#d1d5db";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#ffffff";
                e.target.style.borderColor = "#e5e7eb";
              }}
              onClick={() => {
                setShowModeSelector(false);
                setSelectedOperatorForSkill(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {showTrainingScheduler && (
        <TrainingSchedulerModal
          selectedSkillForTraining={selectedSkillForTraining}
          employeesNeedingSkill={employeesNeedingSkill}
          scheduledTrainings={scheduledTrainings}
          onCancel={handleCancelTraining}
          onSubmit={handleSubmitTraining}
          loading={loading}
        />
      )}

      {showTestModal && (
        <TestCreation
          isOpen={showTestModal}
          onClose={() => setShowTestModal(false)}
          skillData={selectedSkillForTraining}
        />
      )}
    </div>
  );
};

export default memo(SkillMatrixGrid);
