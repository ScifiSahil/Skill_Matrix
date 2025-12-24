import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { testAPI } from '../services/testAPI'; // 👉 path adjust karo agar folder structure alag ho

export const useTrainingStore = create(
  persist(
    (set, get) => ({
      // State
      trainings: [],
      userTrainings: {},
      trainingSchedule: {},
      completedTrainings: [],
      upcomingExams: [],
      trainingProgress: {},
      loading: false,
      error: null,
      tests: [],
      testAssignments: [],
      testResults: [],
      
      // Actions
      setTrainings: (trainings) => set({ trainings }),
      
      setUserTrainings: (userId, trainings) => set((state) => ({
        userTrainings: { ...state.userTrainings, [userId]: trainings }
      })),
      
      assignTraining: (userId, trainingId, dueDate) => set((state) => {
        const userSchedule = state.trainingSchedule[userId] || [];
        return {
          trainingSchedule: {
            ...state.trainingSchedule,
            [userId]: [...userSchedule, { 
              trainingId, 
              dueDate, 
              status: 'pending', 
              assignedAt: new Date().toISOString() 
            }]
          }
        };
      }),
      
      startTraining: (userId, trainingId) => set((state) => ({
        trainingProgress: {
          ...state.trainingProgress,
          [`${userId}_${trainingId}`]: { 
            status: 'in-progress', 
            progress: 0, 
            startedAt: new Date().toISOString() 
          }
        }
      })),
      
      updateTrainingProgress: (userId, trainingId, progress) => set((state) => {
        const key = `${userId}_${trainingId}`;
        return {
          trainingProgress: {
            ...state.trainingProgress,
            [key]: { 
              ...(state.trainingProgress[key] || {}), 
              progress, 
              lastUpdated: new Date().toISOString() 
            }
          }
        };
      }),
      
      completeTraining: (userId, trainingId) => set((state) => {
        const userSchedule = state.trainingSchedule[userId] || [];
        const updatedSchedule = userSchedule.map(t =>
          t.trainingId === trainingId 
            ? { ...t, status: 'completed', completedAt: new Date().toISOString() } 
            : t
        );
        
        const key = `${userId}_${trainingId}`;
        
        return {
          trainingSchedule: { 
            ...state.trainingSchedule, 
            [userId]: updatedSchedule 
          },
          completedTrainings: [...state.completedTrainings, trainingId],
          trainingProgress: {
            ...state.trainingProgress,
            [key]: { 
              ...state.trainingProgress[key], 
              status: 'completed', 
              progress: 100, 
              completedAt: new Date().toISOString() 
            }
          }
        };
      }),
      
      scheduleExam: (userId, trainingId, examDate, duration) => set((state) => ({
        upcomingExams: [
          ...state.upcomingExams,
          { 
            id: `exam_${Date.now()}`, 
            userId, 
            trainingId, 
            examDate, 
            duration: duration || 30, 
            status: 'scheduled', 
            scheduledAt: new Date().toISOString() 
          }
        ]
      })),
      
      submitExam: (examId, score, answers) => set((state) => ({
        upcomingExams: state.upcomingExams.map(exam =>
          exam.id === examId
            ? { 
                ...exam, 
                status: score >= 70 ? 'passed' : 'failed', 
                score, 
                answers, 
                completedAt: new Date().toISOString() 
              }
            : exam
        )
      })),
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      getTrainingProgress: (userId, trainingId) => {
        const state = get();
        const key = `${userId}_${trainingId}`;
        return state.trainingProgress[key] || { 
          status: 'not-started', 
          progress: 0 
        };
      },
      
      // ✅ UPDATED TEST FUNCTIONS (WITH API INTEGRATION)

      // Create new test (hr_tests + hr_questions + hr_options)
      createTest: async (testData) => {
        try {
          // main test payload (hr_tests)
          const testPayload = {
            test_id: testData.id,
            skill_id: testData.skillId,
            skill_name: testData.skillName,
            title: testData.title,
            description: testData.description,
            difficulty: testData.difficulty,
            level: testData.level,
            duration: testData.duration,
            passing_marks: testData.passingMarks,
            total_marks: testData.totalMarks,
            question_count: testData.questionCount,
            status: testData.status,
            created_by: testData.createdBy,
            created_at: testData.createdAt,
          };

          await testAPI.createTest(testPayload);

          // questions + options
          for (const q of testData.questions || []) {
            const qPayload = {
              question_id: q.id,
              test_id: testData.id,
              question_type: q.type,
              question_text: q.question,
              marks: q.marks,
              explanation: q.explanation,
              allow_multiple: q.allowMultiple,
            };

            await testAPI.createQuestion(qPayload);

            if (Array.isArray(q.options)) {
              for (let i = 0; i < q.options.length; i++) {
                const opt = q.options[i];
                const oPayload = {
                  option_id: `${q.id}_opt_${i}`,
                  question_id: q.id,
                  option_label: String.fromCharCode(65 + i), // A,B,C,D...
                  option_text: opt,
                  is_correct: q.correctAnswers?.includes(opt) || false,
                };
                await testAPI.createOption(oPayload);
              }
            }
          }

          // local state update
          set((state) => ({
            tests: [...state.tests, testData],
          }));
        } catch (error) {
          console.error("❌ Error creating test:", error);
          set({ error: "Failed to create test" });
          throw error;
        }
      },

      // Get all tests
      getTests: () => {
        const state = get();
        return state.tests;
      },

      // Get specific test by ID
      getTestById: (testId) => {
        const state = get();
        return state.tests.find(t => t.id === testId);
      },

      // Assign test to user (hr_test_assignments)
      assignTestToUser: async (assignmentData) => {
        try {
          const payload = {
            assignment_id: assignmentData.id,
            test_id: assignmentData.testId,
            test_title: assignmentData.testTitle,
            user_id: assignmentData.userId,
            user_name: assignmentData.userName,
            user_email: assignmentData.userEmail,
            department: assignmentData.department,
            due_date: assignmentData.dueDate,
            due_time: assignmentData.dueTime,
            max_attempts: assignmentData.maxAttempts,
            remaining_attempts: assignmentData.remainingAttempts,
            status: assignmentData.status,
            assigned_at: assignmentData.assignedAt,
            assigned_by: assignmentData.assignedBy,
            remarks: assignmentData.remarks,
            question_count: assignmentData.questionCount,
            duration: assignmentData.duration,
            passing_marks: assignmentData.passingMarks,
            total_marks: assignmentData.totalMarks,
            difficulty: assignmentData.difficulty,
          };

          await testAPI.assignTest(payload);

          set((state) => ({
            testAssignments: [...state.testAssignments, assignmentData],
          }));
        } catch (error) {
          console.error("❌ Error assigning test:", error);
          set({ error: "Failed to assign test" });
          throw error;
        }
      },

      // Get user's test assignments
      getUserTestAssignments: (userId) => {
        const state = get();
        return state.testAssignments.filter(a => a.userId === userId);
      },

      // Submit test result
      submitTestResult: (resultData) => set((state) => {
        const updatedAssignments = state.testAssignments.map(assignment =>
          assignment.id === resultData.assignmentId
            ? { 
                ...assignment, 
                status: resultData.results.passed ? 'passed' : 'failed',
                remainingAttempts: assignment.remainingAttempts - 1,
                lastAttemptAt: resultData.submittedAt
              }
            : assignment
        );

        return {
          testResults: [...state.testResults, resultData],
          testAssignments: updatedAssignments
        };
      }),

      // Get user's test results
      getUserTestResults: (userId) => {
        const state = get();
        return state.testResults.filter(r => r.userId === userId);
      },
      
      // Initialize with mock data
      initializeMockData: (currentUserId) => {
        const mockTrainings = [
          { 
            id: 'training_1', 
            skillId: 'skill_1', 
            title: '5S Methodology Training', 
            description: 'Learn the fundamentals of 5S workplace organization', 
            duration: 45, 
            videoUrl: 'https://www.youtube.com/embed/example1', 
            content: 'Sort, Set in Order, Shine, Standardize, Sustain', 
            examAvailable: true, 
            level: 'L1' 
          },
          { 
            id: 'training_2', 
            skillId: 'skill_2', 
            title: 'IATF & QMS Awareness', 
            description: 'Quality Management Systems and IATF standards', 
            duration: 60, 
            videoUrl: 'https://www.youtube.com/embed/example2', 
            content: 'Quality management principles and IATF requirements', 
            examAvailable: true, 
            level: 'L2' 
          },
          { 
            id: 'training_3', 
            skillId: 'skill_3', 
            title: 'Total Productive Maintenance (TPM)', 
            description: 'Comprehensive TPM principles and practices', 
            duration: 90, 
            videoUrl: 'https://www.youtube.com/embed/example3', 
            content: 'Eight pillars of TPM and implementation', 
            examAvailable: true, 
            level: 'L3' 
          },
          { 
            id: 'training_4', 
            skillId: 'skill_4', 
            title: 'EHS Safety Training', 
            description: 'Environmental, Health and Safety standards', 
            duration: 50, 
            videoUrl: 'https://www.youtube.com/embed/example4', 
            content: 'Safety protocols and emergency procedures', 
            examAvailable: true, 
            level: 'L2' 
          },
          { 
            id: 'training_5', 
            skillId: 'skill_7', 
            title: 'Heat Treatment Process', 
            description: 'Advanced heat treatment procedures', 
            duration: 120, 
            videoUrl: 'https://www.youtube.com/embed/example5', 
            content: 'Annealing, hardening, tempering processes', 
            examAvailable: true, 
            level: 'L4' 
          }
        ];
        
        const now = new Date();
        const userSchedule = [
          { 
            trainingId: 'training_1', 
            dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            status: 'pending', 
            assignedAt: now.toISOString() 
          },
          { 
            trainingId: 'training_2', 
            dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            status: 'pending', 
            assignedAt: now.toISOString() 
          },
          { 
            trainingId: 'training_4', 
            dueDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            status: 'pending', 
            assignedAt: now.toISOString() 
          }
        ];
        
        const trainingProgress = {
          [`${currentUserId}_training_1`]: { 
            status: 'in-progress', 
            progress: 65, 
            startedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
            lastUpdated: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString() 
          }
        };
        
        const upcomingExams = [
          { 
            id: 'exam_1', 
            userId: currentUserId, 
            trainingId: 'training_1', 
            examDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            duration: 30, 
            status: 'scheduled', 
            scheduledAt: now.toISOString() 
          }
        ];
        
        set({ 
          trainings: mockTrainings, 
          trainingSchedule: { [currentUserId]: userSchedule }, 
          trainingProgress, 
          upcomingExams 
        });
      },
      
      // Get pending trainings for user
      getPendingTrainings: (userId) => {
        const state = get();
        const userSchedule = state.trainingSchedule[userId] || [];
        const pendingSchedule = userSchedule.filter(t => t.status === 'pending');
        
        return pendingSchedule.map(schedule => {
          const training = state.trainings.find(t => t.id === schedule.trainingId);
          const progressKey = `${userId}_${schedule.trainingId}`;
          const progress = state.trainingProgress[progressKey]?.progress || 0;
          return { ...training, ...schedule, progress };
        });
      },
      
      // Get upcoming exams for user
      getUpcomingExams: (userId) => {
        const state = get();
        return state.upcomingExams
          .filter(exam => exam.userId === userId && exam.status === 'scheduled')
          .map(exam => {
            const training = state.trainings.find(t => t.id === exam.trainingId);
            return { ...exam, trainingTitle: training?.title || 'Unknown Training' };
          });
      }
    }),
    { 
      name: 'training-storage', 
      partialize: (state) => ({ 
        trainingSchedule: state.trainingSchedule, 
        completedTrainings: state.completedTrainings, 
        trainingProgress: state.trainingProgress, 
        upcomingExams: state.upcomingExams,
        tests: state.tests,
        testAssignments: state.testAssignments,
        testResults: state.testResults
      }) 
    }
  )
);
