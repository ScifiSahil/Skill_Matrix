import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Save,
  X,
  FileText,
  CheckSquare,
  Circle,
  Type,
  Clock,
  Award,
  Copy,
  Edit2,
  Users,
  Loader,
  Sparkles,
  CheckCheck,
  Download,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import { useTrainingStore } from "../../reducers/trainingStore";

const TestCreation = ({ isOpen, onClose, skillData }) => {
  const { createTest, assignTestToUser } = useTrainingStore();

  const [testDetails, setTestDetails] = useState({
    title: "",
    description: "",
    skillId: skillData?.id || "",
    skillName: skillData?.name || "",
    duration: 30,
    passingMarks: 70,
    instructions: "",
    level: "L1",
    difficulty: "Medium",
  });

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    type: "mcq",
    question: "",
    options: ["", "", "", ""],
    correctAnswers: [],
    marks: 1,
    explanation: "",
    allowMultiple: false,
  });

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [autoAssign, setAutoAssign] = useState(true);
  const [assignmentSettings, setAssignmentSettings] = useState({
    dueDate: "",
    dueTime: "",
    maxAttempts: 2,
    remarks: "",
  });
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [importingExcel, setImportingExcel] = useState(false);

  const questionTypes = [
    { value: "mcq", label: "Multiple Choice (MCQ)", icon: CheckSquare },
    { value: "true-false", label: "True/False", icon: Circle },
    { value: "short-answer", label: "Short Answer", icon: Type },
    { value: "practical", label: "Practical Task", icon: FileText },
  ];

  // ✅ DEFAULT 20 QUESTIONS WITH PROPER OPTIONS & ANSWERS
  const DEFAULT_20_QUESTIONS = [
    {
      id: 1,
      type: "mcq",
      question: "What does 5S stand for in workplace organization?",
      options: [
        "Sort, Set in Order, Shine, Standardize, Sustain",
        "Safety, Security, Speed, Strength, Success",
        "Skill, Strategy, System, Support, Service",
        "Start, Stop, Store, Stack, Save",
      ],
      correctAnswers: ["Sort, Set in Order, Shine, Standardize, Sustain"],
      marks: 2,
      explanation: "5S is a Japanese workplace organization methodology.",
      allowMultiple: false,
    },
    {
      id: 2,
      type: "mcq",
      question: "Which of the following are principles of TPM? (Select all)",
      options: [
        "Autonomous Maintenance",
        "Planned Maintenance",
        "Quality Maintenance",
        "Random Inspection",
      ],
      correctAnswers: [
        "Autonomous Maintenance",
        "Planned Maintenance",
        "Quality Maintenance",
      ],
      marks: 3,
      explanation:
        "TPM includes autonomous, planned, and quality maintenance principles.",
      allowMultiple: true,
    },
    {
      id: 3,
      type: "mcq",
      question: "What is the primary goal of Kaizen?",
      options: [
        "Continuous Improvement",
        "Cost Reduction Only",
        "Employee Reduction",
        "Automation",
      ],
      correctAnswers: ["Continuous Improvement"],
      marks: 2,
      explanation: "Kaizen focuses on continuous, incremental improvements.",
      allowMultiple: false,
    },
    {
      id: 4,
      type: "mcq",
      question: "In CNC programming, what does G00 command do?",
      options: [
        "Rapid positioning movement",
        "Linear interpolation",
        "Circular interpolation clockwise",
        "Dwell/pause",
      ],
      correctAnswers: ["Rapid positioning movement"],
      marks: 2,
      explanation: "G00 is used for rapid, non-cutting movements.",
      allowMultiple: false,
    },
    {
      id: 5,
      type: "mcq",
      question: "Which PPE is mandatory in a machine shop? (Select all)",
      options: [
        "Safety Glasses",
        "Steel-toe Boots",
        "Hearing Protection",
        "Wedding Ring",
      ],
      correctAnswers: [
        "Safety Glasses",
        "Steel-toe Boots",
        "Hearing Protection",
      ],
      marks: 3,
      explanation:
        "All safety equipment except jewelry (like rings) is mandatory.",
      allowMultiple: true,
    },
    {
      id: 6,
      type: "mcq",
      question: "What does OEE stand for?",
      options: [
        "Overall Equipment Effectiveness",
        "Operational Efficiency Evaluation",
        "Output Efficiency Enhancement",
        "Operational Equipment Excellence",
      ],
      correctAnswers: ["Overall Equipment Effectiveness"],
      marks: 2,
      explanation: "OEE measures manufacturing productivity.",
      allowMultiple: false,
    },
    {
      id: 7,
      type: "true-false",
      question: "FIFO stands for First In First Out inventory method.",
      options: ["True", "False"],
      correctAnswers: ["True"],
      marks: 1,
      explanation: "FIFO ensures oldest inventory is used first.",
      allowMultiple: false,
    },
    {
      id: 8,
      type: "mcq",
      question: "What is the purpose of SMED?",
      options: [
        "Reduce setup/changeover time",
        "Increase machine speed",
        "Reduce workforce",
        "Increase inventory",
      ],
      correctAnswers: ["Reduce setup/changeover time"],
      marks: 2,
      explanation:
        "SMED (Single Minute Exchange of Die) reduces changeover time.",
      allowMultiple: false,
    },
    {
      id: 9,
      type: "mcq",
      question: "Which quality tools are part of the 7 QC Tools? (Select all)",
      options: [
        "Pareto Chart",
        "Fishbone Diagram",
        "Control Chart",
        "Gantt Chart",
      ],
      correctAnswers: ["Pareto Chart", "Fishbone Diagram", "Control Chart"],
      marks: 3,
      explanation: "Gantt Chart is a project management tool, not a QC tool.",
      allowMultiple: true,
    },
    {
      id: 10,
      type: "mcq",
      question: "What does JIT stand for in manufacturing?",
      options: [
        "Just In Time",
        "Job Instruction Training",
        "Joint Industrial Team",
        "Japan Industrial Technology",
      ],
      correctAnswers: ["Just In Time"],
      marks: 2,
      explanation: "JIT is a production strategy to reduce inventory waste.",
      allowMultiple: false,
    },
    {
      id: 11,
      type: "true-false",
      question: "Six Sigma aims for 3.4 defects per million opportunities.",
      options: ["True", "False"],
      correctAnswers: ["True"],
      marks: 1,
      explanation: "Six Sigma quality level is 3.4 DPMO.",
      allowMultiple: false,
    },
    {
      id: 12,
      type: "mcq",
      question: "What is the first step in the PDCA cycle?",
      options: ["Plan", "Do", "Check", "Act"],
      correctAnswers: ["Plan"],
      marks: 2,
      explanation: "PDCA starts with planning (Plan-Do-Check-Act).",
      allowMultiple: false,
    },
    {
      id: 13,
      type: "mcq",
      question: "Which are types of waste in Lean Manufacturing? (Select all)",
      options: [
        "Overproduction",
        "Waiting",
        "Transportation",
        "Quality Improvement",
      ],
      correctAnswers: ["Overproduction", "Waiting", "Transportation"],
      marks: 3,
      explanation:
        "The 7 wastes (TIMWOOD) include these; quality improvement is not waste.",
      allowMultiple: true,
    },
    {
      id: 14,
      type: "mcq",
      question: "What does FMEA stand for?",
      options: [
        "Failure Mode and Effects Analysis",
        "Fast Manufacturing Efficiency Assessment",
        "Factory Maintenance Engineering Analysis",
        "Flexible Manufacturing Equipment Automation",
      ],
      correctAnswers: ["Failure Mode and Effects Analysis"],
      marks: 2,
      explanation: "FMEA is a risk assessment methodology.",
      allowMultiple: false,
    },
    {
      id: 15,
      type: "mcq",
      question: "In machining, what does RPM stand for?",
      options: [
        "Revolutions Per Minute",
        "Rapid Process Method",
        "Rotary Power Motor",
        "Real Production Measure",
      ],
      correctAnswers: ["Revolutions Per Minute"],
      marks: 2,
      explanation: "RPM measures spindle speed in machining.",
      allowMultiple: false,
    },
    {
      id: 16,
      type: "true-false",
      question:
        "Andon is a visual management tool to indicate production status.",
      options: ["True", "False"],
      correctAnswers: ["True"],
      marks: 1,
      explanation: "Andon boards display real-time production status.",
      allowMultiple: false,
    },
    {
      id: 17,
      type: "mcq",
      question:
        "Which certifications are related to quality management? (Select all)",
      options: ["ISO 9001", "ISO 14001", "TS 16949", "ISO 45001"],
      correctAnswers: ["ISO 9001", "TS 16949"],
      marks: 3,
      explanation:
        "ISO 9001 and TS 16949 are quality standards; 14001 is environmental, 45001 is safety.",
      allowMultiple: true,
    },
    {
      id: 18,
      type: "mcq",
      question: "What is Poka-Yoke?",
      options: [
        "Error-proofing mechanism",
        "Speed control device",
        "Quality inspection tool",
        "Safety equipment",
      ],
      correctAnswers: ["Error-proofing mechanism"],
      marks: 2,
      explanation: "Poka-Yoke prevents errors through design.",
      allowMultiple: false,
    },
    {
      id: 19,
      type: "mcq",
      question: "What does KPI stand for?",
      options: [
        "Key Performance Indicator",
        "Knowledge Process Integration",
        "Kaizen Process Improvement",
        "Kinetic Production Index",
      ],
      correctAnswers: ["Key Performance Indicator"],
      marks: 2,
      explanation: "KPIs measure organizational performance.",
      allowMultiple: false,
    },
    {
      id: 20,
      type: "true-false",
      question:
        "Gemba walk means going to the actual workplace to observe processes.",
      options: ["True", "False"],
      correctAnswers: ["True"],
      marks: 1,
      explanation:
        "Gemba (actual place) walks involve observing work firsthand.",
      allowMultiple: false,
    },
  ];

  // ✅ Auto-fill on modal open
  useEffect(() => {
    if (isOpen && skillData) {
      setTestDetails((prev) => ({
        ...prev,
        title: `${skillData.name} - Level ${prev.level} Test`,
        skillId: skillData.id,
        skillName: skillData.name,
      }));

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      setAssignmentSettings((prev) => ({
        ...prev,
        dueDate: dueDate.toISOString().split("T")[0],
        dueTime: "17:00",
      }));

      fetchUsers();
    }
  }, [isOpen, skillData]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/collection/hr_machining_skills"
      );
      const data = await response.json();

      if (data && data.objects) {
        const uniqueUsers = [];
        const seenIds = new Set();

        data.objects.forEach((obj) => {
          const empId = obj.employee_id;
          const empName = obj.employee_name;
          const dept = obj.department || "Unknown";

          if (!seenIds.has(empId) && empId) {
            seenIds.add(empId);
            uniqueUsers.push({
              id: String(empId),
              name: empName,
              department: dept,
              email: `${empId}@company.com`,
              role: "Operator",
            });
          }
        });

        setUsers(uniqueUsers);
      }
    } catch (error) {
      console.error("❌ Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // ✅ Load Default 20 Questions
  const loadDefault20Questions = () => {
    if (
      questions.length > 0 &&
      !confirm("Replace current questions with default 20?")
    ) {
      return;
    }
    setQuestions(DEFAULT_20_QUESTIONS);
    alert("✅ Loaded 20 default questions!");
  };

  // ✅ Download Sample Excel Template
  const downloadSampleExcel = () => {
    const sampleData = [
      [
        "Question Number",
        "Question Type",
        "Question Text",
        "Option A",
        "Option B",
        "Option C",
        "Option D",
        "Correct Answer(s)",
        "Marks",
        "Explanation",
        "Allow Multiple",
      ],
      [
        "1",
        "mcq",
        "What does 5S stand for?",
        "Sort, Set, Shine, Standardize, Sustain",
        "Safety, Speed, Success",
        "Skill, Strategy, Service",
        "Start, Stop, Save",
        "A",
        "2",
        "5S is a workplace organization method",
        "FALSE",
      ],
      [
        "2",
        "mcq",
        "Which are TPM principles?",
        "Autonomous Maintenance",
        "Planned Maintenance",
        "Quality Maintenance",
        "Random Inspection",
        "A,B,C",
        "3",
        "TPM includes autonomous, planned, and quality maintenance",
        "TRUE",
      ],
      [
        "3",
        "true-false",
        "FIFO means First In First Out",
        "True",
        "False",
        "",
        "",
        "A",
        "1",
        "FIFO ensures oldest inventory is used first",
        "FALSE",
      ],
      [
        "4",
        "mcq",
        "What is Kaizen?",
        "Continuous Improvement",
        "Cost Reduction",
        "Automation",
        "Employee Reduction",
        "A",
        "2",
        "Kaizen focuses on continuous improvement",
        "FALSE",
      ],
    ];

    let csvContent = "data:text/csv;charset=utf-8,";
    sampleData.forEach((row) => {
      csvContent += row.map((cell) => `"${cell}"`).join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Test_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("✅ Sample Excel template downloaded!");
  };

  // ✅ Import Questions from Excel
  const handleExcelImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImportingExcel(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = text
          .split("\n")
          .map((row) =>
            row.split(",").map((cell) => cell.replace(/^"|"$/g, "").trim())
          );

        const importedQuestions = [];

        // Skip header row
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length < 8 || !row[2]) continue; // Skip empty rows

          const [
            qNum,
            qType,
            qText,
            optA,
            optB,
            optC,
            optD,
            correctAns,
            marks,
            explanation,
            allowMultiple,
          ] = row;

          // Parse correct answers (e.g., "A,B,C" -> ["Option A", "Option B", "Option C"])
          const correctLetters = correctAns.split(",").map((l) => l.trim());
          const options = [optA, optB, optC, optD].filter(Boolean);
          const correctAnswers = correctLetters
            .map((letter) => {
              const index = letter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
              return options[index];
            })
            .filter(Boolean);

          importedQuestions.push({
            id: Date.now() + i,
            type: qType || "mcq",
            question: qText,
            options: qType === "true-false" ? ["True", "False"] : options,
            correctAnswers: correctAnswers,
            marks: parseInt(marks) || 1,
            explanation: explanation || "",
            allowMultiple: allowMultiple?.toUpperCase() === "TRUE",
          });
        }

        if (importedQuestions.length > 0) {
          setQuestions(importedQuestions);
          alert(
            `✅ Successfully imported ${importedQuestions.length} questions!`
          );
        } else {
          alert("⚠️ No valid questions found in file.");
        }
      } catch (error) {
        console.error("Import error:", error);
        alert("❌ Failed to import Excel file. Please check the format.");
      } finally {
        setImportingExcel(false);
        event.target.value = ""; // Reset input
      }
    };

    reader.readAsText(file);
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.question.trim()) {
      alert("Please enter a question");
      return;
    }

    if (
      currentQuestion.type === "mcq" &&
      currentQuestion.options.some((opt) => !opt.trim())
    ) {
      alert("Please fill all options for MCQ");
      return;
    }

    if (
      currentQuestion.correctAnswers.length === 0 &&
      currentQuestion.type !== "practical"
    ) {
      alert("Please select at least one correct answer");
      return;
    }

    if (editingIndex !== null) {
      const updated = [...questions];
      updated[editingIndex] = { ...currentQuestion, id: Date.now() };
      setQuestions(updated);
      setEditingIndex(null);
    } else {
      setQuestions([...questions, { ...currentQuestion, id: Date.now() }]);
    }

    setCurrentQuestion({
      type: "mcq",
      question: "",
      options: ["", "", "", ""],
      correctAnswers: [],
      marks: 1,
      explanation: "",
      allowMultiple: false,
    });
    setShowQuestionForm(false);
  };

  const handleEditQuestion = (index) => {
    setCurrentQuestion(questions[index]);
    setEditingIndex(index);
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = (index) => {
    if (confirm("Are you sure you want to delete this question?")) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const toggleCorrectAnswer = (option) => {
    if (currentQuestion.allowMultiple) {
      const isSelected = currentQuestion.correctAnswers.includes(option);
      if (isSelected) {
        setCurrentQuestion({
          ...currentQuestion,
          correctAnswers: currentQuestion.correctAnswers.filter(
            (ans) => ans !== option
          ),
        });
      } else {
        setCurrentQuestion({
          ...currentQuestion,
          correctAnswers: [...currentQuestion.correctAnswers, option],
        });
      }
    } else {
      setCurrentQuestion({
        ...currentQuestion,
        correctAnswers: [option],
      });
    }
  };

  const handleSaveTest = async () => {
    if (!testDetails.title.trim()) {
      alert("Please enter test title");
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    if (
      autoAssign &&
      (!assignmentSettings.dueDate || !assignmentSettings.dueTime)
    ) {
      alert("Please set due date and time");
      return;
    }

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    const testId = `test_${Date.now()}`;

    const testData = {
      test_id: testId,
      skill_id: testDetails.skillId,
      skill_name: testDetails.skillName,

      title: testDetails.title,
      description: testDetails.description,

      difficulty: testDetails.difficulty,
      level: testDetails.level,

      duration: testDetails.duration,
      passing_marks: testDetails.passingMarks,

      total_marks: totalMarks,
      question_count: questions.length,

      instructions: testDetails.instructions,

      status: "active",
      created_by: "Admin",
      created_at: new Date().toISOString(),

      // Full questions array for frontend / backend batch insert
      questions: questions,
    };

    await createTest(testData);

    // SAVE QUESTIONS IN CONTACT API
    for (const q of questions) {
      const questionPayload = [
        {
          question_id: 1,
          question_type: "mcq",
          question_text: "What does 5S stand for in workplace organization?",
          marks: 2,
          explanation: "5S is a Japanese workplace organization methodology.",
          allow_multiple: false,
        },
      ];

      await fetch("http://localhost:8080/api/v1/collection/hr_questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionPayload),
      });

      // SAVE OPTIONS
      for (let i = 0; i < q.options.length; i++) {
        const opt = q.options[i];

        const optionPayload = [
          {
            term: "http://localhost:8080/api/v1/hr_options/attrib/question_id",
            type: "http://schema.org/Text",
            value: q.id.toString(),
          },
          {
            term: "http://localhost:8080/api/v1/hr_options/attrib/option_label",
            type: "http://schema.org/Text",
            value: ["A", "B", "C", "D"][i],
          },
          {
            term: "http://localhost:8080/api/v1/hr_options/attrib/option_text",
            type: "http://schema.org/Text",
            value: opt,
          },
          {
            term: "http://localhost:8080/api/v1/hr_options/attrib/is_correct",
            type: "http://schema.org/Text",
            value: q.correctAnswers.includes(opt) ? "TRUE" : "FALSE",
          },
        ];

        await fetch("http://localhost:8080/api/v1/hr_options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(optionPayload),
        });
      }
    }

    console.log("✅ Test created:", testData);

    if (autoAssign && users.length > 0) {
      let successCount = 0;

      users.forEach((user, index) => {
        const assignment = {
          id: `assign_${Date.now()}_${user.id}_${index}`,
          testId: testData.id,
          testTitle: testData.title,
          userId: String(user.id),
          userName: user.name,
          userEmail: user.email,
          department: user.department,
          dueDate: assignmentSettings.dueDate,
          dueTime: assignmentSettings.dueTime,
          maxAttempts: assignmentSettings.maxAttempts,
          remainingAttempts: assignmentSettings.maxAttempts,
          status: "assigned",
          assignedAt: new Date().toISOString(),
          assignedBy: "Admin",
          notifyUser: true,
          remarks: assignmentSettings.remarks,
          questionCount: testData.questionCount,
          duration: testData.duration,
          passingMarks: testData.passingMarks,
          totalMarks: testData.totalMarks,
          difficulty: testData.difficulty,
        };

        try {
          assignTestToUser(assignment);
          successCount++;
        } catch (error) {
          console.error(`❌ Failed to assign to ${user.name}:`, error);
        }
      });

      alert(`✅ Test created and assigned to ${successCount} users!`);
    } else {
      alert("✅ Test created successfully!");
    }

    setTestDetails({
      title: "",
      description: "",
      skillId: "",
      skillName: "",
      duration: 30,
      passingMarks: 70,
      instructions: "",
      level: "L1",
      difficulty: "Medium",
    });
    setQuestions([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <FileText className="w-8 h-8" />
                Create Test / Exam
              </h2>
              <p className="text-purple-100 mt-2">
                {skillData
                  ? `For Skill: ${skillData.name} (ID: ${skillData.id})`
                  : "General Test"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* ✅ QUICK ACTIONS - ENHANCED */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-5 rounded-xl">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={loadDefault20Questions}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition font-semibold shadow-lg"
              >
                <FileText className="w-5 h-5" />
                Load 20 Default Questions
              </button>

              <button
                onClick={downloadSampleExcel}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-semibold shadow-lg"
              >
                <Download className="w-5 h-5" />
                Download Excel Template
              </button>

              <label className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition font-semibold shadow-lg cursor-pointer">
                <Upload className="w-5 h-5" />
                {importingExcel ? "Importing..." : "Import from Excel"}
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleExcelImport}
                  className="hidden"
                  disabled={importingExcel}
                />
              </label>
            </div>
            <div className="mt-3 p-3 bg-blue-100 rounded-lg border border-blue-300">
              <p className="text-xs text-blue-800 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                <strong>Tip:</strong> Download the template, fill questions in
                Excel, then import!
              </p>
            </div>
          </div>

          {/* AUTO-ASSIGNMENT */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 p-6 rounded-xl">
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={autoAssign}
                onChange={(e) => setAutoAssign(e.target.checked)}
                className="w-6 h-6 text-green-600 rounded"
              />
              <div className="flex-1">
                <span className="text-lg font-bold text-green-900 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Auto-Assign to All Users
                  {loadingUsers && <Loader className="w-4 h-4 animate-spin" />}
                </span>
                <p className="text-sm text-green-700 mt-1">
                  {loadingUsers
                    ? "Loading users..."
                    : `Ready to assign to ${users.length} users`}
                </p>
              </div>
            </label>

            {autoAssign && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t-2 border-green-200">
                <div>
                  <label className="block text-sm font-bold text-green-900 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={assignmentSettings.dueDate}
                    onChange={(e) =>
                      setAssignmentSettings({
                        ...assignmentSettings,
                        dueDate: e.target.value,
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-green-900 mb-2">
                    Due Time *
                  </label>
                  <input
                    type="time"
                    value={assignmentSettings.dueTime}
                    onChange={(e) =>
                      setAssignmentSettings({
                        ...assignmentSettings,
                        dueTime: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-green-900 mb-2">
                    Max Attempts
                  </label>
                  <input
                    type="number"
                    value={assignmentSettings.maxAttempts}
                    onChange={(e) =>
                      setAssignmentSettings({
                        ...assignmentSettings,
                        maxAttempts: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    max="5"
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* TEST DETAILS */}
          <div className="bg-gray-50 p-6 rounded-xl space-y-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Test Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Test Title *
                </label>
                <input
                  type="text"
                  value={testDetails.title}
                  onChange={(e) =>
                    setTestDetails({ ...testDetails, title: e.target.value })
                  }
                  placeholder="e.g., CNC Programming - Level 2 Test"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Skill Name (Auto-filled)
                </label>
                <input
                  type="text"
                  value={testDetails.skillName}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-green-300 bg-green-50 rounded-lg font-semibold text-green-700"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Skill Level *
                </label>
                <select
                  value={testDetails.level}
                  onChange={(e) => {
                    setTestDetails({ ...testDetails, level: e.target.value });
                    if (skillData) {
                      setTestDetails((prev) => ({
                        ...prev,
                        title: `${skillData.name} - Level ${e.target.value} Test`,
                      }));
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                >
                  <option value="L1">Level 1 (Basic)</option>
                  <option value="L2">Level 2 (Intermediate)</option>
                  <option value="L3">Level 3 (Advanced)</option>
                  <option value="L4">Level 4 (Expert)</option>
                  <option value="L5">Level 5 (Master)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Difficulty Level *
                </label>
                <select
                  value={testDetails.difficulty}
                  onChange={(e) =>
                    setTestDetails({
                      ...testDetails,
                      difficulty: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                >
                  <option value="Easy">Easy (1 mark each)</option>
                  <option value="Medium">Medium (2 marks each)</option>
                  <option value="Hard">Hard (3 marks each)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={testDetails.duration}
                  onChange={(e) =>
                    setTestDetails({
                      ...testDetails,
                      duration: parseInt(e.target.value),
                    })
                  }
                  min="5"
                  max="180"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Passing Marks (%)
                </label>
                <input
                  type="number"
                  value={testDetails.passingMarks}
                  onChange={(e) =>
                    setTestDetails({
                      ...testDetails,
                      passingMarks: parseInt(e.target.value),
                    })
                  }
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={testDetails.description}
                onChange={(e) =>
                  setTestDetails({
                    ...testDetails,
                    description: e.target.value,
                  })
                }
                rows="2"
                placeholder="Brief description..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* QUESTIONS SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                Questions ({questions.length})
              </h3>
              {!showQuestionForm && (
                <button
                  onClick={() => setShowQuestionForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Add Question
                </button>
              )}
            </div>

            {/* QUESTION FORM */}
            {showQuestionForm && (
              <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-purple-900">
                    {editingIndex !== null ? "Edit Question" : "New Question"}
                  </h4>
                  <button
                    onClick={() => {
                      setShowQuestionForm(false);
                      setEditingIndex(null);
                      setCurrentQuestion({
                        type: "mcq",
                        question: "",
                        options: ["", "", "", ""],
                        correctAnswers: [],
                        marks: 1,
                        explanation: "",
                        allowMultiple: false,
                      });
                    }}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Question Type *
                    </label>
                    <select
                      value={currentQuestion.type}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          type: e.target.value,
                          options:
                            e.target.value === "true-false"
                              ? ["True", "False"]
                              : ["", "", "", ""],
                          correctAnswers: [],
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                    >
                      {questionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Marks
                    </label>
                    <input
                      type="number"
                      value={currentQuestion.marks}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          marks: parseInt(e.target.value) || 1,
                        })
                      }
                      min="1"
                      max="10"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {currentQuestion.type === "mcq" && (
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentQuestion.allowMultiple}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            allowMultiple: e.target.checked,
                            correctAnswers: [],
                          })
                        }
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <div>
                        <span className="text-sm font-bold text-blue-900 flex items-center gap-2">
                          <CheckCheck className="w-4 h-4" />
                          Allow Multiple Correct Answers
                        </span>
                        <p className="text-xs text-blue-700 mt-1">
                          Enable for questions with more than one correct answer
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    value={currentQuestion.question}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        question: e.target.value,
                      })
                    }
                    rows="3"
                    placeholder="Enter your question..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                  />
                </div>

                {(currentQuestion.type === "mcq" ||
                  currentQuestion.type === "true-false") && (
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">
                      Options *{" "}
                      {currentQuestion.allowMultiple && (
                        <span className="text-blue-600">
                          (Multiple correct allowed)
                        </span>
                      )}
                    </label>
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-gray-600 font-bold">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options];
                            newOptions[index] = e.target.value;
                            setCurrentQuestion({
                              ...currentQuestion,
                              options: newOptions,
                            });
                          }}
                          disabled={currentQuestion.type === "true-false"}
                          placeholder={`Option ${String.fromCharCode(
                            65 + index
                          )}`}
                          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg disabled:bg-gray-100"
                        />
                        <label className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                          <input
                            type={
                              currentQuestion.allowMultiple
                                ? "checkbox"
                                : "radio"
                            }
                            name={`correct_${Date.now()}`}
                            checked={currentQuestion.correctAnswers.includes(
                              option
                            )}
                            onChange={() => toggleCorrectAnswer(option)}
                            className="w-5 h-5 text-green-600"
                          />
                          <span className="text-sm text-green-700 font-semibold">
                            ✓ Correct
                          </span>
                        </label>
                      </div>
                    ))}
                    {currentQuestion.correctAnswers.length > 1 && (
                      <div className="bg-blue-100 p-3 rounded-lg border border-blue-300">
                        <p className="text-sm text-blue-800 font-semibold">
                          ✅ Multiple correct answers selected:{" "}
                          {currentQuestion.correctAnswers.length}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {currentQuestion.type === "short-answer" && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Expected Answer *
                    </label>
                    <textarea
                      value={currentQuestion.correctAnswers[0] || ""}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          correctAnswers: [e.target.value],
                        })
                      }
                      rows="2"
                      placeholder="Expected answer..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                )}

                {currentQuestion.type === "practical" && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Task Description *
                    </label>
                    <textarea
                      value={currentQuestion.correctAnswers[0] || ""}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          correctAnswers: [e.target.value],
                        })
                      }
                      rows="3"
                      placeholder="Describe the task..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Explanation *
                  </label>
                  <textarea
                    value={currentQuestion.explanation}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        explanation: e.target.value,
                      })
                    }
                    rows="2"
                    placeholder="Explain why this is the correct answer..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddQuestion}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold"
                  >
                    {editingIndex !== null ? "Update Question" : "Add Question"}
                  </button>
                  <button
                    onClick={() => {
                      setShowQuestionForm(false);
                      setEditingIndex(null);
                    }}
                    className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* QUESTIONS LIST */}
            {questions.length > 0 ? (
              <div className="space-y-3">
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                            Q{index + 1}
                          </span>
                          <span className="text-sm text-gray-500 capitalize">
                            {q.type.replace("-", " ")}
                          </span>
                          <span className="text-sm text-gray-500">
                            {q.marks} {q.marks === 1 ? "mark" : "marks"}
                          </span>
                          {q.allowMultiple && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                              <CheckCheck className="w-3 h-3" />
                              Multiple Correct
                            </span>
                          )}
                        </div>
                        <p className="text-gray-800 font-medium mb-2">
                          {q.question}
                        </p>
                        {(q.type === "mcq" || q.type === "true-false") && (
                          <div className="ml-4 space-y-1 text-sm">
                            {q.options.map((opt, i) => (
                              <div
                                key={i}
                                className={`${
                                  q.correctAnswers &&
                                  q.correctAnswers.includes(opt)
                                    ? "text-green-600 font-semibold"
                                    : "text-gray-600"
                                }`}
                              >
                                {String.fromCharCode(65 + i)}. {opt}
                                {q.correctAnswers &&
                                  q.correctAnswers.includes(opt) &&
                                  " ✓"}
                              </div>
                            ))}
                          </div>
                        )}
                        {q.explanation && (
                          <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                            <p className="text-xs text-yellow-800">
                              <strong>Explanation:</strong> {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditQuestion(index)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No questions added yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Click "Load 20 Default Questions" or "Import from Excel"
                </p>
              </div>
            )}
          </div>

          {/* SUMMARY */}
          {questions.length > 0 && (
            <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
              <h4 className="font-bold text-purple-900 mb-3">Test Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-purple-700">Questions</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {questions.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-purple-700">Total Marks</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {questions.reduce((sum, q) => sum + q.marks, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-purple-700">Duration</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {testDetails.duration} min
                  </p>
                </div>
                <div>
                  <p className="text-sm text-purple-700">Passing</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {testDetails.passingMarks}%
                  </p>
                </div>
              </div>
              {autoAssign && users.length > 0 && (
                <div className="mt-4 pt-4 border-t-2 border-purple-200">
                  <p className="text-sm font-bold text-purple-900 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Will be auto-assigned to {users.length} users
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 bg-gray-50 px-8 py-6 rounded-b-2xl border-t border-gray-200 flex gap-4">
          <button
            onClick={handleSaveTest}
            disabled={questions.length === 0}
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            <Save className="w-5 h-5" />
            {autoAssign && users.length > 0
              ? `Save & Auto-Assign to ${users.length} Users`
              : "Save Test"}
          </button>
          <button
            onClick={onClose}
            className="px-8 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-lg font-bold transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestCreation;
