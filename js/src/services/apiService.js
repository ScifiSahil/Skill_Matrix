// skill_matrix/js/src/services/apiService.js

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

const getAuthHeadersWithCSRF = async (method = "GET", contentType = true) => {
  const credentials = btoa("kalyaniadmin:kalyaniadmin@7001");

  // Step 1: Trigger cookie set
  await fetch("http://localhost:8080/internal/hr_training_schedule", {
    method: "GET",
    headers: {
      Authorization: `Basic ${credentials}`,
    },
    credentials: "include",
  });

  const csrfToken = getCookie("CSRFToken");
  console.log("Fetched CSRF Token from cookie:", csrfToken);

  if (!csrfToken) {
    throw new Error("CSRF token not found in cookies.");
  }

  const headers = {
    Authorization: `Basic ${credentials}`,
    "X-CSRF-Token": csrfToken,
  };

  if (contentType) {
    headers["Content-Type"] = "application/json";
  }

  return {
    headers,
    credentials: "include",
  };
};

// Training Schedule APIs
export const trainingScheduleAPI = {
  // Get all scheduled trainings
  getScheduledTrainings: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.skill_id) params.append('skill_id', filters.skill_id);
      if (filters.employee_id) params.append('employee_id', filters.employee_id);
      if (filters.status) params.append('status', filters.status);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await fetch(
        `http://localhost:8080/internal/hr_training_schedule?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa('kalyaniadmin:kalyaniadmin@7001')}`,
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('❌ Get training schedules failed:', error);
      return { success: false, message: error.message, data: [] };
    }
  },

  // Create new training schedule
  createTrainingSchedule: async (scheduleData) => {
    try {
      const authOptions = await getAuthHeadersWithCSRF('POST');

      const response = await fetch(
        'http://localhost:8080/internal/hr_training_schedule',
        {
          method: 'POST',
          ...authOptions,
          body: JSON.stringify(scheduleData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Create training schedule failed:', error);
      return { success: false, message: error.message };
    }
  },

  // Update training schedule
  updateTrainingSchedule: async (cdb_object_id, updateData) => {
    try {
      const authOptions = await getAuthHeadersWithCSRF('PUT');

      const response = await fetch(
        'http://localhost:8080/internal/hr_training_schedule',
        {
          method: 'PUT',
          ...authOptions,
          body: JSON.stringify({
            cdb_object_id,
            ...updateData,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Update training schedule failed:', error);
      return { success: false, message: error.message };
    }
  },

  // Cancel/Delete training schedule
  cancelTrainingSchedule: async (cdb_object_id) => {
    try {
      const authOptions = await getAuthHeadersWithCSRF('DELETE');

      const response = await fetch(
        'http://localhost:8080/internal/hr_training_schedule',
        {
          method: 'DELETE',
          ...authOptions,
          body: JSON.stringify({ cdb_object_id }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Cancel training schedule failed:', error);
      return { success: false, message: error.message };
    }
  },
};

export default trainingScheduleAPI;