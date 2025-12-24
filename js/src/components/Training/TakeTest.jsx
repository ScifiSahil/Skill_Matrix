import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Send,
  FileText,
  Award,
  TrendingUp
} from "lucide-react";

/**
 * Take Test Component
 * Users can take assigned tests with timer, navigation, and submission
 */
const TakeTest = ({ testData, assignmentData, onSubmit, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(testData.duration * 60); // in seconds
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [results, setResults] = useState(null);

  const currentQuestion = testData.questions[currentQuestionIndex];
  const totalQuestions = testData.questions.length;
  const answeredCount = Object.keys(answers).length;

  // Timer effect
  useEffect(() => {
    if (!testStarted || testCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testCompleted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartTest = () => {
    setShowInstructions(false);
    setTestStarted(true);
  };

  const handleAnswerChange = (answer) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: answer
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionJump = (index) => {
    setCurrentQuestionIndex(index);
  };

  const calculateResults = () => {
    let correctAnswers = 0;
    let totalMarks = 0;
    let earnedMarks = 0;

    const detailedResults = testData.questions.map((question) => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
        earnedMarks += question.marks;
      }
      
      totalMarks += question.marks;

      return {
        questionId: question.id,
        question: question.question,
        type: question.type,
        userAnswer: userAnswer || "Not Answered",
        correctAnswer: question.correctAnswer,
        isCorrect,
        marks: question.marks,
        earnedMarks: isCorrect ? question.marks : 0,
        explanation: question.explanation
      };
    });

    const percentage = (earnedMarks / totalMarks) * 100;
    const passed = percentage >= testData.passingMarks;

    return {
      totalQuestions: testData.questions.length,
      answeredQuestions: Object.keys(answers).length,
      correctAnswers,
      totalMarks,
      earnedMarks,
      percentage: percentage.toFixed(2),
      passed,
      detailedResults,
      timeTaken: testData.duration * 60 - timeRemaining
    };
  };

  const handleSubmitTest = () => {
    if (!testStarted || testCompleted) return;

    const unanswered = totalQuestions - answeredCount;
    if (unanswered > 0 && timeRemaining > 0) {
      if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) {
        return;
      }
    }

    setTestStarted(false);
    setTestCompleted(true);
    
    const calculatedResults = calculateResults();
    setResults(calculatedResults);

    // Submit to parent component
    if (onSubmit) {
      onSubmit({
        testId: testData.id,
        assignmentId: assignmentData.id,
        userId: assignmentData.userId,
        answers,
        results: calculatedResults,
        submittedAt: new Date().toISOString()
      });
    }
  };

  // Instructions Screen
  if (showInstructions) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-6 rounded-t-2xl">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="w-8 h-8" />
              {testData.title}
            </h2>
            <p className="text-indigo-100 mt-2">{testData.description}</p>
          </div>

          <div className="p-8 space-y-6">
            {/* Test Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg text-center">
                <p className="text-sm text-indigo-600 font-semibold">Questions</p>
                <p className="text-2xl font-bold text-indigo-900">{testData.questionCount}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-sm text-purple-600 font-semibold">Duration</p>
                <p className="text-2xl font-bold text-purple-900">{testData.duration} min</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-green-600 font-semibold">Total Marks</p>
                <p className="text-2xl font-bold text-green-900">{testData.totalMarks}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-sm text-yellow-600 font-semibold">Passing %</p>
                <p className="text-2xl font-bold text-yellow-900">{testData.passingMarks}%</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-yellow-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Important Instructions
              </h3>
              <ul className="space-y-2 text-yellow-900">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>You have <strong>{testData.duration} minutes</strong> to complete this test.</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>The timer will start as soon as you click "Start Test".</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>You can navigate between questions using the navigation panel.</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Make sure to answer all questions before submitting.</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>The test will auto-submit when time runs out.</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>You need to score <strong>{testData.passingMarks}%</strong> to pass this test.</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Remaining attempts: <strong>{assignmentData.remainingAttempts}</strong></span>
                </li>
              </ul>
              
              {testData.instructions && (
                <div className="mt-4 pt-4 border-t-2 border-yellow-200">
                  <p className="text-sm font-semibold mb-2">Additional Instructions:</p>
                  <p className="text-sm">{testData.instructions}</p>
                </div>
              )}
            </div>

            {/* Assignment Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Due Date:</strong> {assignmentData.dueDate} at {assignmentData.dueTime}
              </p>
              {assignmentData.remarks && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Remarks:</strong> {assignmentData.remarks}
                </p>
              )}
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartTest}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg flex items-center justify-center gap-3"
            >
              <Clock className="w-6 h-6" />
              Start Test Now
              <ArrowRight className="w-6 h-6" />
            </button>

            <button
              onClick={onClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (testCompleted && results) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className={`${results.passed ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-red-600 to-red-700'} text-white px-8 py-6 rounded-t-2xl`}>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              {results.passed ? (
                <>
                  <CheckCircle className="w-8 h-8" />
                  Congratulations! You Passed
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8" />
                  Test Completed
                </>
              )}
            </h2>
            <p className="text-white/90 mt-2">Test: {testData.title}</p>
          </div>

          <div className="p-8 space-y-6">
            {/* Score Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg text-center">
                <Award className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <p className="text-sm text-indigo-600 font-semibold">Score</p>
                <p className="text-3xl font-bold text-indigo-900">{results.percentage}%</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-600 font-semibold">Correct</p>
                <p className="text-3xl font-bold text-green-900">{results.correctAnswers}/{results.totalQuestions}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-purple-600 font-semibold">Marks</p>
                <p className="text-3xl font-bold text-purple-900">{results.earnedMarks}/{results.totalMarks}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-yellow-600 font-semibold">Time Taken</p>
                <p className="text-3xl font-bold text-yellow-900">{Math.floor(results.timeTaken / 60)} min</p>
              </div>
            </div>

            {/* Pass/Fail Status */}
            <div className={`${results.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-2 p-6 rounded-xl`}>
              <div className="flex items-center gap-4">
                {results.passed ? (
                  <CheckCircle className="w-12 h-12 text-green-600" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-600" />
                )}
                <div>
                  <h3 className={`text-xl font-bold ${results.passed ? 'text-green-900' : 'text-red-900'}`}>
                    {results.passed ? 'Test Passed!' : 'Test Not Passed'}
                  </h3>
                  <p className={`text-sm ${results.passed ? 'text-green-700' : 'text-red-700'}`}>
                    {results.passed 
                      ? `You scored ${results.percentage}% which is above the passing threshold of ${testData.passingMarks}%.`
                      : `You scored ${results.percentage}%. The passing threshold is ${testData.passingMarks}%. ${assignmentData.remainingAttempts - 1 > 0 ? `You have ${assignmentData.remainingAttempts - 1} attempt(s) remaining.` : 'No attempts remaining.'}`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-800">Detailed Results</h3>
              {results.detailedResults.map((result, index) => (
                <div key={result.questionId} className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                  <div className="flex items-start gap-3">
                    {result.isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-800">Question {index + 1}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${result.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {result.earnedMarks}/{result.marks} marks
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{result.question}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex gap-2">
                          <span className="font-semibold text-gray-600">Your Answer:</span>
                          <span className={result.isCorrect ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                            {result.userAnswer}
                          </span>
                        </div>
                        {!result.isCorrect && (
                          <div className="flex gap-2">
                            <span className="font-semibold text-gray-600">Correct Answer:</span>
                            <span className="text-green-700 font-semibold">{result.correctAnswer}</span>
                          </div>
                        )}
                        {result.explanation && (
                          <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                            <p className="text-blue-900 text-sm">
                              <strong>Explanation:</strong> {result.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Test Taking Screen
  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with Timer */}
        <div className="bg-white shadow-lg px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{testData.title}</h2>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
              <Clock className="w-5 h-5" />
              <span className="font-bold text-lg">{formatTime(timeRemaining)}</span>
            </div>
            <button
              onClick={handleSubmitTest}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-lg font-bold transition flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Submit Test
            </button>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6">
                <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-bold">
                  Question {currentQuestionIndex + 1}
                </span>
                <span className="text-sm text-gray-600 font-semibold">
                  {currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'}
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-2xl font-bold text-gray-800 mb-8">{currentQuestion.question}</h3>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.type === "mcq" || currentQuestion.type === "true-false" ? (
                  currentQuestion.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${
                        answers[currentQuestion.id] === option
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-300 hover:border-indigo-400 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question_${currentQuestion.id}`}
                        value={option}
                        checked={answers[currentQuestion.id] === option}
                        onChange={() => handleAnswerChange(option)}
                        className="w-5 h-5 text-indigo-600"
                      />
                      <span className="ml-4 text-lg text-gray-800 font-medium">
                        {String.fromCharCode(65 + index)}. {option}
                      </span>
                    </label>
                  ))
                ) : (
                  <textarea
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    rows="6"
                    placeholder="Type your answer here..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition text-lg"
                  />
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === totalQuestions - 1}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Question Navigator */}
      <div className="w-80 bg-white shadow-2xl p-6 overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Question Navigator</h3>
        
        {/* Progress Stats */}
        <div className="bg-indigo-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-indigo-700 font-semibold">Progress</span>
            <span className="text-indigo-900 font-bold">{answeredCount}/{totalQuestions}</span>
          </div>
          <div className="w-full bg-indigo-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Grid */}
        <div className="grid grid-cols-5 gap-2">
          {testData.questions.map((q, index) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = index === currentQuestionIndex;
            
            return (
              <button
                key={q.id}
                onClick={() => handleQuestionJump(index)}
                className={`aspect-square rounded-lg font-bold text-sm transition ${
                  isCurrent
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-300"
                    : isAnswered
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded"></div>
            <span className="text-gray-700">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded"></div>
            <span className="text-gray-700">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <span className="text-gray-700">Not Answered</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeTest;
