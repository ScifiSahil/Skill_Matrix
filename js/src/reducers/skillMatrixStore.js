// reducers/skillMatrixStore.js - UPDATED TO MATCH API FORMAT
import { create } from 'zustand';

const API_BASE_URL = 'http://localhost:8080/internal/hr_machining_skills';
const PLANT_CODE_API = 'http://localhost:8080/internal/plant_code';
const DEFAULT_PLANT_CODE = 2021;

export const useSkillMatrixStore = create((set, get) => ({
  // 📊 STATE
  skills: [],
  loading: false,
  error: null,
  filters: {
    skillType: 'all',
    applicability: 'all',
    searchTerm: ''
  },
  
  totalSkills: 0,
  functionalCount: 0,
  criticalCount: 0,
  genericCount: 0,

  // 🆕 Plant Code State
  plantCode: null,
  loadingPlantCode: false,
  plantCodeError: null,
  usingFallbackPlantCode: false,
  plantLocation: null,

  // ✅ Plant Code to Location Mapping
  getLocationForPlantCode: (plantCode) => {
    const plantLocationMap = {
      '2021': 'Baramati',
      '2022': 'Baramati',
      '2023': 'Pune',
    };
    
    return plantLocationMap[String(plantCode)] || null;
  },

  // API Options State
  skillsOptions: [],
  categoryOptions: [],
  departmentOptions: [],
  lineOptions: [],
  loadingOptions: false,

  // Hierarchical Selection State
  departments: [],
  selectedDepartment: '',
  lines: [],
  selectedLine: '',
  subDepartments: [],
  selectedSubDepartments: [],
  skillTypeMap: {}, 
  labourSkillsData: [],
  filteredLabourData: [],
  loadingSubDepts: false,
  loadingLabourData: false,
  loadingLines: false,

  // Labour Names State
  labourNames: [],
  selectedLabourNames: [],
  loadingLabourNames: false,

  // Pagination State
  currentPage: 1,
  itemsPerPage: 20,

  // ========================================
  // 🆕 Fetch Plant Code
  // ========================================
  fetchPlantCode: async () => {
    set({ loadingPlantCode: true, plantCodeError: null });
    
    try {
      console.log('🏭 Fetching Plant Code from:', PLANT_CODE_API);

      const response = await fetch(PLANT_CODE_API, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Plant Code API Response:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      let plantCode = data.plant_code;
      
      if (!plantCode) {
        throw new Error('Plant code not found in response');
      }
      
      plantCode = Number(plantCode);
      
      const location = get().getLocationForPlantCode(plantCode);
      
      localStorage.setItem('plantCode', String(plantCode));
      if (location) {
        localStorage.setItem('plantLocation', location);
      }
      
      set({ 
        plantCode: plantCode,
        plantLocation: location,
        loadingPlantCode: false,
        usingFallbackPlantCode: false
      });
      
      console.log('✅ Plant Code loaded successfully:', plantCode);
      console.log('✅ Plant Location:', location);
      return { success: true, plantCode, location };
      
    } catch (error) {
      console.error('❌ Error fetching plant code:', error);
      
      const storedPlantCode = localStorage.getItem('plantCode');
      const storedLocation = localStorage.getItem('plantLocation');
      const fallbackPlantCode = Number(storedPlantCode || DEFAULT_PLANT_CODE);
      const fallbackLocation = storedLocation || get().getLocationForPlantCode(fallbackPlantCode);
      
      console.warn('⚠️ Using fallback plant code:', fallbackPlantCode);
      console.warn('⚠️ Using fallback location:', fallbackLocation);
      
      set({ 
        plantCode: fallbackPlantCode,
        plantLocation: fallbackLocation,
        plantCodeError: error.message, 
        loadingPlantCode: false,
        usingFallbackPlantCode: true
      });
      
      return { 
        success: true, 
        plantCode: fallbackPlantCode,
        location: fallbackLocation,
        usingFallback: true,
        error: error.message
      };
    }
  },

  // ========================================
  // 1️⃣ GET - Fetch all skills (UPDATED TO MATCH NEW API FORMAT)
  // ========================================
  fetchSkills: async (apiFilters = {}) => {
    set({ loading: true, error: null });
    
    try {
      const { plantCode, usingFallbackPlantCode } = get();
      
      if (!plantCode) {
        console.warn('⚠️ No plant code available, fetching all data');
      }
      
      if (usingFallbackPlantCode) {
        console.warn('⚠️ Using fallback plant code:', plantCode);
      }

      const params = new URLSearchParams();
      
      // ✅ Use plantt_code (with double 't') as per API format
      if (plantCode) {
        params.append('plantt_code', plantCode);
      }
      
      if (apiFilters.skill_type) {
        params.append('skill_type', apiFilters.skill_type);
      }
      if (apiFilters.applicability) {
        params.append('applicability', apiFilters.applicability);
      }

      const url = params.toString() 
        ? `${API_BASE_URL}?${params.toString()}`
        : API_BASE_URL;

      console.log('🔍 Fetching skills from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch skills: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Skills fetched:', data.length, 'records');
      console.log('📋 Sample API record:', data[0]);
      
      // ✅ Transform data according to new API format
      // Filter out "None" values and map fields correctly
      const transformedSkills = data
        .filter(obj => 
          obj.machining_skills_names !== "None" && 
          obj.person_name !== "None" &&
          obj.machining_skills_names &&
          obj.person_name
        )
        .map(obj => ({
          id: obj.cdb_object_id,
          labour_name: obj.person_name,
          labour_code: obj.labour_code || '',
          name: obj.machining_skills_names,
          type: obj.f_c_g,
          department: obj.department,
          line: obj.liness, // ✅ Note: API uses 'liness' with double 's'
          applicability: obj.applicability,
          skill_required: obj.skill_required,

          actual: obj.actual || 0, // ✅ Add actual skill level from database
          education: obj.education,
          plant_code: obj.plantt_code, // ✅ Note: API uses 'plantt_code' with double 't'
          // ✅ Create lines object for checkbox display
          lines: obj.liness ? { [obj.liness]: true } : {}
        }));
      
// const transformedSkills = data.map((obj) => ({
//   id: obj.cdb_object_id,
//   labour_name: obj.person_name,
//   labour_code: obj.labour_code || "",
//   name: obj.machining_skills_names,
//   type: obj.f_c_g,
//   department: obj.department,
//   line: obj.liness,
//   applicability: obj.department || "All",
//   skill_required: obj.skill_required,   // naam bhi consistent rakho
//   actual: obj.actual || 0,
//   plant_code: obj.plantt_code,
//   lines: obj.liness ? { [obj.liness]: true } : {},
// }));

      
      const functional = transformedSkills.filter(s => s.type === 'F').length;
      const critical = transformedSkills.filter(s => s.type === 'C').length;
      const generic = transformedSkills.filter(s => s.type === 'G').length;
      
      set({ 
        skills: transformedSkills,
        totalSkills: transformedSkills.length,
        functionalCount: functional,
        criticalCount: critical,
        genericCount: generic,
        loading: false 
      });
      
      console.log('✅ Transformed skills:', transformedSkills.length);
      console.log('📋 Sample transformed:', transformedSkills[0]);
      
      return { success: true, data: transformedSkills };
      
    } catch (error) {
      console.error('❌ Error fetching skills:', error);
      set({ 
        error: error.message, 
        loading: false 
      });
      return { success: false, error: error.message };
    }
  },

  // ========================================
  // 3️⃣ Fetch Departments
  // ========================================
  fetchDepartmentsFromAPI: async () => {
    try {
      const { plantCode } = get();
      
      let url = "http://localhost:8080/api/v1/collection/kln_hr_department?$select=department,plant_code";
      
      if (plantCode) {
        const numPlantCode = Number(plantCode);
        url += `&$filter=plant_code eq ${numPlantCode}`;
        console.log(`🔍 Fetching Departments for plant ${numPlantCode}`);
      } else {
        console.warn('⚠️ Fetching all departments (no plant filter)');
      }

      const response = await fetch(url);
      const data = await response.json();
      console.log("✅ Department API Response:", data);

      const uniqueDepts = [
        ...new Set(
          data?.objects
            ?.map((item) => item.department)
            .filter((dept) => dept && dept.trim() !== "" && dept !== "None")
        ),
      ];

      set({ departments: uniqueDepts });
      console.log('📋 Unique Departments:', uniqueDepts);
      return { success: true, data: uniqueDepts };
    } catch (error) {
      console.error("❌ Error fetching departments:", error);
      return { success: false, error: error.message };
    }
  },

  // ========================================
  // 4️⃣ Fetch Lines
  // ========================================
  fetchLinesFromAPI: async () => {
    set({ loadingLines: true });
    try {
      const { plantCode } = get();
      
      let url = "http://localhost:8080/api/v1/collection/kln_hr_line?$select=line,plant_code";
      
      if (plantCode) {
        const numPlantCode = Number(plantCode);
        url += `&$filter=plant_code eq ${numPlantCode}`;
        console.log(`🔍 Fetching Lines for plant ${numPlantCode}`);
      }

      const response = await fetch(url);
      const data = await response.json();

      const uniqueLines = [
        ...new Set(
          data?.objects
            ?.map((item) => item.line)
            .filter((line) => line && line.trim() !== "" && line !== "None")
        ),
      ];

      set({ lines: uniqueLines, loadingLines: false });
      console.log('📋 Unique Lines:', uniqueLines);
      return { success: true, data: uniqueLines };
    } catch (error) {
      console.error("❌ Error fetching lines:", error);
      set({ loadingLines: false });
      return { success: false, error: error.message };
    }
  },

  // ========================================
  // 5️⃣ Fetch Labour Names
  // ========================================
  fetchLabourNamesForDepartment: async (department) => {
    if (!department) {
      set({ labourNames: [], selectedLabourNames: [] });
      return { success: true, data: [] };
    }

    set({ loadingLabourNames: true });
    try {
      const { plantLocation } = get();
      
      let filters = [`dept_desc eq '${department}'`];
      
      if (plantLocation) {
        filters.push(`locn eq '${plantLocation}'`);
        console.log(`🔍 Fetching labour for dept: ${department}, location: '${plantLocation}'`);
      } else {
        console.log(`🔍 Fetching labour for dept: ${department} (no location filter)`);
      }
      
      const filterString = filters.join(' and ');
      const encodedFilter = encodeURIComponent(filterString);
      const apiUrl = `http://localhost:8080/api/v1/collection/hr_labour_master?$filter=${encodedFilter}`;

      console.log("🔍 Labour Master API URL:", apiUrl);
      console.log("📝 Raw filter:", filterString);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Labour Names Response:", data);

      if (data?.objects && data.objects.length > 0) {
        const labourData = data.objects;

        const uniqueLabourNames = [
          ...new Set(
            labourData
              .map((item) => item.labour_name)
              .filter((name) => name && name.trim() !== "")
          ),
        ];

        set({ 
          labourNames: labourData,
          selectedLabourNames: uniqueLabourNames,
          loadingLabourNames: false
        });

        console.log(`✅ Found ${labourData.length} labour records`);
        console.log(`📋 Unique labour names: ${uniqueLabourNames.length}`);

        return { success: true, data: labourData, uniqueNames: uniqueLabourNames };
      } else {
        console.warn(`⚠️ No labour data found for filters:`, filters);
        set({ 
          labourNames: [], 
          selectedLabourNames: [],
          loadingLabourNames: false
        });

        return { success: false, error: `No labour names found` };
      }
    } catch (error) {
      console.error("❌ Error fetching labour names:", error);
      set({ 
        labourNames: [], 
        selectedLabourNames: [],
        loadingLabourNames: false
      });
      return { success: false, error: error.message };
    }
  },

  // ========================================
  // 6️⃣ Fetch Skills for Department
  // ========================================
  fetchSkillsForDepartment: async (department) => {
    if (!department) {
      set({ 
        subDepartments: [], 
        selectedSubDepartments: [],
        filteredLabourData: [],
        skillTypeMap: {}
      });
      return { success: true, data: [] };
    }

    set({ loadingSubDepts: true });
    try {
      const { plantCode } = get();
      
      let filters = [`department eq '${department}'`];
      if (plantCode) {
        const numPlantCode = Number(plantCode);
        filters.push(`plant_code eq ${numPlantCode}`);
      }
      
      const filterString = filters.join(' and ');
      const encodedFilter = encodeURIComponent(filterString);
      const apiUrl = `http://localhost:8080/api/v1/collection/kln_hr_skill?$filter=${encodedFilter}&$select=cdb_object_id,skill,plant_code,department,type`;

      console.log("🔍 Fetching Skills:", apiUrl);
      console.log("📝 Raw filter:", filterString);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Skills Response:", data);

      if (data?.objects && data.objects.length > 0) {
        const skills = data.objects;

        const uniqueSkills = [
          ...new Set(
            skills
              .map((item) => item.skill)
              .filter((skill) => skill && skill.trim() !== "" && skill !== "None")
          ),
        ];

        const skillTypeMap = {};
        skills.forEach((item) => {
          if (item.skill) {
            skillTypeMap[item.skill] = item.type;
          }
        });

        set({
          subDepartments: uniqueSkills,
          selectedSubDepartments: uniqueSkills,
          labourSkillsData: skills,
          filteredLabourData: skills,
          skillTypeMap: skillTypeMap,
          loadingSubDepts: false
        });

        console.log(`✅ Found ${skills.length} skills`);
        console.log('📋 Skill Type Map:', skillTypeMap);

        return { success: true, data: skills, uniqueSkills };
      } else {
        set({ 
          subDepartments: [], 
          selectedSubDepartments: [],
          labourSkillsData: [],
          filteredLabourData: [],
          skillTypeMap: {},
          loadingSubDepts: false
        });

        return { success: false, error: `No skills found` };
      }
    } catch (error) {
      console.error("❌ Error fetching skills:", error);
      set({ 
        subDepartments: [], 
        selectedSubDepartments: [],
        skillTypeMap: {},
        loadingSubDepts: false
      });
      return { success: false, error: error.message };
    }
  },

  // ========================================
  // 7️⃣ Add New Department
  // ========================================
  addNewDepartment: async (deptName) => {
    try {
      const { plantCode } = get();

      const body = {
        department: deptName,
        plant_code: Number(plantCode || DEFAULT_PLANT_CODE)
      };

      console.log('📤 Adding new department:', body);

      const response = await fetch(
        "http://localhost:8080/api/v1/collection/kln_hr_department",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('❌ API Error Response:', errorData);
        throw new Error(errorData?.message || "Failed to add department");
      }

      console.log('✅ Department added successfully');
      await get().fetchDepartmentsFromAPI();

      return { success: true };
    } catch (error) {
      console.error('❌ Error adding department:', error);
      return { success: false, error: error.message };
    }
  },

  // ========================================
  // 8️⃣ Add New Line
  // ========================================
  addNewLine: async (lineName) => {
    try {
      const { plantCode } = get();

      const body = { 
        line: lineName,
        plant_code: Number(plantCode || DEFAULT_PLANT_CODE)
      };

      console.log('📤 Adding new line:', body);

      const response = await fetch(
        "http://localhost:8080/api/v1/collection/kln_hr_line",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('❌ API Error Response:', errorData);
        throw new Error(errorData?.message || "Failed to add new line");
      }

      console.log('✅ Line added successfully');
      await get().fetchLinesFromAPI();

      return { success: true };
    } catch (error) {
      console.error('❌ Error adding line:', error);
      return { success: false, error: error.message };
    }
  },

  // ========================================
  // 2️⃣ POST - Create new skill (UPDATED TO USE CORRECT API FIELDS)
  // ========================================
  addSkill: async (skillData) => {
    set({ loading: true, error: null });
    
    try {
      console.log('🔍 DEBUG - addSkill called with:', skillData);

      if (!skillData.entries || skillData.entries.length === 0) {
        throw new Error('No skill entries provided');
      }

      const { plantCode, skillTypeMap } = get();
      const recordsToCreate = [];

      // ✅ Process entries from the matrix
      for (const entry of skillData.entries) {
        for (const skill of entry.skills) {
          const fCgType = skillTypeMap[skill.name] || 'G';
          
          // ✅ UPDATED: Use correct API field names
          const backendData = {
            machining_skills_names: skill.name,
            f_c_g: fCgType,
            person_name: entry.labour_name,
            skill_required: Number(skill.level) || 4,
            liness: entry.line || "",           // ✅ Use 'liness' (double 's')
            department: entry.department || "",
            plantt_code: Number(plantCode || DEFAULT_PLANT_CODE), // ✅ Use 'plantt_code' (double 't')
            applicability: entry.department || "",
            education: "",
            labour_code: entry.labour_code || ""
          };

          recordsToCreate.push(backendData);
        }
      }

      console.log('📤 Creating skills - Total Records:', recordsToCreate.length);
      console.log('📤 Plant Code:', plantCode);
      console.log('📤 Sample records:', recordsToCreate.slice(0, 3));

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordsToCreate)
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        let errorText;
        let errorData;
        
        try {
          errorText = await response.text();
          console.error('❌ API Error Response (text):', errorText);
          
          try {
            errorData = JSON.parse(errorText);
            console.error('❌ API Error Response (parsed):', errorData);
          } catch (e) {
            console.error('❌ Could not parse error as JSON');
          }
        } catch (e) {
          console.error('❌ Could not read error response');
        }
        
        throw new Error(
          errorData?.message || 
          errorData?.error || 
          errorText || 
          `Failed to create skills: ${response.status}`
        );
      }
      
      const result = await response.json();
      console.log('✅ Skills created:', result);
      
      await get().fetchSkills();
      
      set({ loading: false });
      return { 
        success: true, 
        message: `Successfully added ${recordsToCreate.length} skill entries!`,
        count: recordsToCreate.length
      };
      
    } catch (error) {
      console.error('❌ Error creating skills:', error);
      console.error('❌ Error stack:', error.stack);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // ========================================
  // UPDATE - Update skill department/line
  // ========================================
  updateSkillDepartment: async (skillId, lineName, value) => {
    const currentSkills = get().skills;
    const skill = currentSkills.find(s => s.id === skillId);
    
    if (!skill) {
      return { success: false, error: 'Skill not found' };
    }

    // Update local state optimistically
    const updatedSkills = currentSkills.map(s => {
      if (s.id === skillId) {
        const newLines = { ...s.lines, [lineName]: value };
        return { ...s, lines: newLines };
      }
      return s;
    });
    
    set({ skills: updatedSkills });
    
    try {
      // ✅ UPDATED: Use correct API field names
      const patchData = {
        cdb_object_id: skillId,
        liness: value ? lineName : "",  // ✅ Use 'liness' (double 's')
      };

      const response = await fetch(API_BASE_URL, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patchData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Skill updated:', result);
      return { success: true, message: result.message };
      
    } catch (error) {
      console.error('❌ Error updating:', error);
      set({ skills: currentSkills, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // ========================================
  // DELETE - Delete skill
  // ========================================
  deleteSkill: async (skillId) => {
    set({ loading: true, error: null });
    
    try {
      const deleteData = {
        cdb_object_id: skillId,
        is_delete: true
      };

      const response = await fetch(API_BASE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deleteData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.status}`);
      }
      
      const result = await response.json();
      
      set((state) => ({
        skills: state.skills.filter(s => s.id !== skillId),
        loading: false
      }));
      
      return { success: true, message: result.message };
      
    } catch (error) {
      console.error('❌ Error deleting:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // ========================================
  // Fetch All Options
  // ========================================
  fetchAllOptions: async () => {
    set({ loadingOptions: true });
    try {
      const { plantCode } = get();
      
      const plantFilter = plantCode ? `plant_code eq ${Number(plantCode)}` : '';

      const skillsResponse = await fetch(
        plantFilter 
          ? `http://localhost:8080/api/v1/collection/kln_hr_skill?$filter=${plantFilter}`
          : `http://localhost:8080/api/v1/collection/kln_hr_skill`
      );
      const skillsData = await skillsResponse.json();

      const categoryResponse = await fetch(
        "http://localhost:8080/api/v1/collection/kln_hr_category"
      );
      const categoryData = await categoryResponse.json();

      const departmentResponse = await fetch(
        plantFilter
          ? `http://localhost:8080/api/v1/collection/kln_hr_department?$filter=${plantFilter}`
          : `http://localhost:8080/api/v1/collection/kln_hr_department`
      );
      const departmentData = await departmentResponse.json();

      const lineResponse = await fetch(
        plantFilter
          ? `http://localhost:8080/api/v1/collection/kln_hr_line?$filter=${plantFilter}`
          : `http://localhost:8080/api/v1/collection/kln_hr_line`
      );
      const lineData = await lineResponse.json();

      set({
        skillsOptions: skillsData?.objects || [],
        categoryOptions: categoryData?.objects || [],
        departmentOptions: departmentData?.objects || [],
        lineOptions: lineData?.objects || [],
        loadingOptions: false
      });

      console.log('✅ All options loaded');
      return { success: true };
    } catch (error) {
      console.error("❌ Error fetching options:", error);
      set({ loadingOptions: false });
      return { success: false, error: error.message };
    }
  },

  // Setters
  setSelectedDepartment: (department) => set({ selectedDepartment: department }),
  setSelectedLine: (line) => set({ selectedLine: line }),
  setSelectedSubDepartments: (subDepts) => set({ selectedSubDepartments: subDepts }),
  
  toggleSubDepartment: (subDept) => {
    set((state) => {
      const isSelected = state.selectedSubDepartments.includes(subDept);
      return {
        selectedSubDepartments: isSelected
          ? state.selectedSubDepartments.filter(sd => sd !== subDept)
          : [...state.selectedSubDepartments, subDept]
      };
    });
  },

  toggleAllSubDepartments: () => {
    set((state) => ({
      selectedSubDepartments: 
        state.selectedSubDepartments.length === state.subDepartments.length
          ? []
          : [...state.subDepartments]
    }));
  },

  setSelectedLabourNames: (names) => set({ selectedLabourNames: names }),
  
  toggleLabourName: (labourName) => {
    set((state) => {
      const isSelected = state.selectedLabourNames.includes(labourName);
      return {
        selectedLabourNames: isSelected
          ? state.selectedLabourNames.filter(name => name !== labourName)
          : [...state.selectedLabourNames, labourName]
      };
    });
  },

  toggleAllLabourNames: () => {
    set((state) => {
      const uniqueLabourNames = [
        ...new Set(
          state.labourNames
            .map((item) => item.labour_name)
            .filter((name) => name && name.trim() !== "")
        ),
      ];

      return {
        selectedLabourNames: 
          state.selectedLabourNames.length === uniqueLabourNames.length
            ? []
            : uniqueLabourNames
      };
    });
  },

  setCurrentPage: (page) => set({ currentPage: page }),
  
  getCurrentPageData: () => {
    const { filteredLabourData, currentPage, itemsPerPage } = get();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredLabourData.slice(indexOfFirstItem, indexOfLastItem);
  },

  getTotalPages: () => {
    const { filteredLabourData, itemsPerPage } = get();
    return Math.ceil(filteredLabourData.length / itemsPerPage);
  },

  resetModalState: () => {
    set({
      selectedDepartment: '',
      selectedLine: '',
      subDepartments: [],
      selectedSubDepartments: [],
      filteredLabourData: [],
      labourNames: [],
      selectedLabourNames: [],
      skillTypeMap: {},
      currentPage: 1
    });
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  resetFilters: () => {
    set({
      filters: {
        skillType: 'all',
        applicability: 'all',
        searchTerm: ''
      }
    });
  },

  getFilteredSkills: () => {
    const { skills, filters } = get();
    
    return skills.filter(skill => {
      if (filters.skillType !== 'all' && skill.type !== filters.skillType) 
        return false;
      
      if (filters.applicability !== 'all' && skill.applicability !== filters.applicability) 
        return false;
      
      if (filters.searchTerm && !skill.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) 
        return false;
      
      return true;
    });
  },

  clearData: () => {
    set({
      skills: [],
      loading: false,
      error: null,
      totalSkills: 0,
      functionalCount: 0,
      criticalCount: 0,
      genericCount: 0,
      departments: [],
      lines: [],
      subDepartments: [],
      labourNames: [],
      selectedLabourNames: [],
      selectedDepartment: '',
      selectedLine: '',
      selectedSubDepartments: [],
      filteredLabourData: [],
      currentPage: 1
    });
  },
}));


// // reducers/skillMatrixStore.js - UPDATED WITH PROPER PLANT CODE FILTER
// import { create } from 'zustand';

// const API_BASE_URL = 'http://localhost:8080/internal/hr_machining_skills';
// const PLANT_CODE_API = 'http://localhost:8080/internal/plant_code';
// const DEFAULT_PLANT_CODE = 2021; // 🆕 Number instead of String

// export const useSkillMatrixStore = create((set, get) => ({
//   // 📊 STATE
//   skills: [],
//   loading: false,
//   error: null,
//   filters: {
//     skillType: 'all',
//     applicability: 'all',
//     searchTerm: ''
//   },
  
//   totalSkills: 0,
//   functionalCount: 0,
//   criticalCount: 0,
//   genericCount: 0,

//   // 🆕 Plant Code State
//   plantCode: null,
//   loadingPlantCode: false,
//   plantCodeError: null,
//   usingFallbackPlantCode: false,
//   plantLocation: null, // ✅ NEW: Store location based on plant code

//   // ✅ NEW: Plant Code to Location Mapping
//   getLocationForPlantCode: (plantCode) => {
//     const plantLocationMap = {
//       '2021': 'Baramati',
//       '2022': 'Baramati',
//       '2023': 'Pune',
//       // Add more mappings as needed
//     };
    
//     return plantLocationMap[String(plantCode)] || null;
//   },

//   // API Options State
//   skillsOptions: [],
//   categoryOptions: [],
//   departmentOptions: [],
//   lineOptions: [],
//   loadingOptions: false,

//   // Hierarchical Selection State
//   departments: [],
//   selectedDepartment: '',
//   lines: [],
//   selectedLine: '',
//   subDepartments: [],
//   selectedSubDepartments: [],
//   skillTypeMap: {}, 
//   labourSkillsData: [],
//   filteredLabourData: [],
//   loadingSubDepts: false,
//   loadingLabourData: false,
//   loadingLines: false,

//   // Labour Names State
//   labourNames: [],
//   selectedLabourNames: [],
//   loadingLabourNames: false,

//   // Pagination State
//   currentPage: 1,
//   itemsPerPage: 20,

//   // ========================================
//   // 🆕 ENHANCED Fetch Plant Code with Fallback
//   // ========================================
//   fetchPlantCode: async () => {
//     set({ loadingPlantCode: true, plantCodeError: null });
    
//     try {
//       console.log('🏭 Fetching Plant Code from:', PLANT_CODE_API);

//       const response = await fetch(PLANT_CODE_API, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//       });
      
//       if (!response.ok) {
//         throw new Error(`API returned status ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('✅ Plant Code API Response:', data);
      
//       if (data.error) {
//         throw new Error(data.error);
//       }
      
//       let plantCode = data.plant_code;
      
//       if (!plantCode) {
//         throw new Error('Plant code not found in response');
//       }
      
//       // ✅ FIXED: Handle both string "2021" and number 2021
//       plantCode = Number(plantCode);
      
//       // ✅ NEW: Get location for this plant code
//       const location = get().getLocationForPlantCode(plantCode);
      
//       // Save to localStorage for future use
//       localStorage.setItem('plantCode', String(plantCode));
//       if (location) {
//         localStorage.setItem('plantLocation', location);
//       }
      
//       set({ 
//         plantCode: plantCode,
//         plantLocation: location, // ✅ Store location
//         loadingPlantCode: false,
//         usingFallbackPlantCode: false
//       });
      
//       console.log('✅ Plant Code loaded successfully:', plantCode);
//       console.log('✅ Plant Location:', location);
//       return { success: true, plantCode, location };
      
//     } catch (error) {
//       console.error('❌ Error fetching plant code:', error);
      
//       const storedPlantCode = localStorage.getItem('plantCode');
//       const storedLocation = localStorage.getItem('plantLocation');
//       const fallbackPlantCode = Number(storedPlantCode || DEFAULT_PLANT_CODE);
//       const fallbackLocation = storedLocation || get().getLocationForPlantCode(fallbackPlantCode);
      
//       console.warn('⚠️ Using fallback plant code:', fallbackPlantCode);
//       console.warn('⚠️ Using fallback location:', fallbackLocation);
      
//       set({ 
//         plantCode: fallbackPlantCode,
//         plantLocation: fallbackLocation,
//         plantCodeError: error.message, 
//         loadingPlantCode: false,
//         usingFallbackPlantCode: true
//       });
      
//       return { 
//         success: true, 
//         plantCode: fallbackPlantCode,
//         location: fallbackLocation,
//         usingFallback: true,
//         error: error.message
//       };
//     }
//   },

//   // ========================================
//   // 1️⃣ GET - Fetch all skills with filters
//   // ========================================
//   fetchSkills: async (apiFilters = {}) => {
//     set({ loading: true, error: null });
    
//     try {
//       const { plantCode, usingFallbackPlantCode } = get();
      
//       if (!plantCode) {
//         console.warn('⚠️ No plant code available, fetching all data');
//       }
      
//       if (usingFallbackPlantCode) {
//         console.warn('⚠️ Using fallback plant code:', plantCode);
//       }

//       const params = new URLSearchParams();
      
//       if (plantCode) {
//         params.append('plant_code', plantCode);
//       }
      
//       if (apiFilters.skill_type) {
//         params.append('skill_type', apiFilters.skill_type);
//       }
//       if (apiFilters.applicability) {
//         params.append('applicability', apiFilters.applicability);
//       }

//       const url = params.toString() 
//         ? `${API_BASE_URL}?${params.toString()}`
//         : API_BASE_URL;

//       console.log('🔍 Fetching skills from:', url);

//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error(`Failed to fetch skills: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('✅ Skills fetched:', data.length, 'records');
      
//       const transformedSkills = data.map(obj => ({
//         id: obj.cdb_object_id,
//         name: obj.machining_skills_names,
//         type: obj.f_c_g,
//         applicability: obj.applicability,
//         production: obj.production_4du === 1,
//         quality: obj.quality_4du === 1,
//         maintenance: obj.maintenance === 1,
//         heatTreatment: obj.heat_treatment === 1,
//         skill_required: obj.skill_required,

//         education: obj.education,
//         personName: obj.person_name,
//         skillType: obj.skill_type
//       }));
      
//       const functional = transformedSkills.filter(s => s.type === 'F').length;
//       const critical = transformedSkills.filter(s => s.type === 'C').length;
//       const generic = transformedSkills.filter(s => s.type === 'G').length;
      
//       set({ 
//         skills: transformedSkills,
//         totalSkills: transformedSkills.length,
//         functionalCount: functional,
//         criticalCount: critical,
//         genericCount: generic,
//         loading: false 
//       });
      
//       return { success: true, data: transformedSkills };
      
//     } catch (error) {
//       console.error('❌ Error fetching skills:', error);
//       set({ 
//         error: error.message, 
//         loading: false 
//       });
//       return { success: false, error: error.message };
//     }
//   },

//   // ========================================
//   // 3️⃣ Fetch Departments
//   // ========================================
//   fetchDepartmentsFromAPI: async () => {
//     try {
//       const { plantCode } = get();
      
//       let url = "http://localhost:8080/api/v1/collection/kln_hr_department?$select=department,plant_code";
      
//       if (plantCode) {
//         const numPlantCode = Number(plantCode);
//         url += `&$filter=plant_code eq ${numPlantCode}`;
//         console.log(`🔍 Fetching Departments for plant ${numPlantCode}`);
//       } else {
//         console.warn('⚠️ Fetching all departments (no plant filter)');
//       }

//       const response = await fetch(url);
//       const data = await response.json();
//       console.log("✅ Department API Response:", data);

//       const uniqueDepts = [
//         ...new Set(
//           data?.objects
//             ?.map((item) => item.department)
//             .filter((dept) => dept && dept.trim() !== "")
//         ),
//       ];

//       set({ departments: uniqueDepts });
//       console.log('📋 Unique Departments:', uniqueDepts);
//       return { success: true, data: uniqueDepts };
//     } catch (error) {
//       console.error("❌ Error fetching departments:", error);
//       return { success: false, error: error.message };
//     }
//   },

//   // ========================================
//   // 4️⃣ Fetch Lines
//   // ========================================
//   fetchLinesFromAPI: async () => {
//     set({ loadingLines: true });
//     try {
//       const { plantCode } = get();
      
//       let url = "http://localhost:8080/api/v1/collection/kln_hr_line?$select=line,plant_code";
      
//       if (plantCode) {
//         const numPlantCode = Number(plantCode);
//         url += `&$filter=plant_code eq ${numPlantCode}`;
//         console.log(`🔍 Fetching Lines for plant ${numPlantCode}`);
//       }

//       const response = await fetch(url);
//       const data = await response.json();

//       const uniqueLines = [
//         ...new Set(
//           data?.objects
//             ?.map((item) => item.line)
//             .filter((line) => line && line.trim() !== "")
//         ),
//       ];

//       set({ lines: uniqueLines, loadingLines: false });
//       console.log('📋 Unique Lines:', uniqueLines);
//       return { success: true, data: uniqueLines };
//     } catch (error) {
//       console.error("❌ Error fetching lines:", error);
//       set({ loadingLines: false });
//       return { success: false, error: error.message };
//     }
//   },

//   // ========================================
//   // 5️⃣ ✅ FIXED: Fetch Labour Names - Only dept_desc and locn filters
//   // ========================================
//   fetchLabourNamesForDepartment: async (department) => {
//     if (!department) {
//       set({ labourNames: [], selectedLabourNames: [] });
//       return { success: true, data: [] };
//     }

//     set({ loadingLabourNames: true });
//     try {
//       const { plantLocation } = get();
      
//       let filters = [`dept_desc eq '${department}'`];
      
//       // ✅ ONLY location filter (NO plant_code filter)
//       if (plantLocation) {
//         filters.push(`locn eq '${plantLocation}'`);
//         console.log(`🔍 Fetching labour for dept: ${department}, location: '${plantLocation}'`);
//       } else {
//         console.log(`🔍 Fetching labour for dept: ${department} (no location filter)`);
//       }
      
//       // ✅ Properly encode the filter string
//       const filterString = filters.join(' and ');
//       const encodedFilter = encodeURIComponent(filterString);
//       const apiUrl = `http://localhost:8080/api/v1/collection/hr_labour_master?$filter=${encodedFilter}`;

//       console.log("🔍 Labour Master API URL:", apiUrl);
//       console.log("📝 Raw filter:", filterString);

//       const response = await fetch(apiUrl);

//       if (!response.ok) {
//         throw new Error(`API returned status ${response.status}`);
//       }

//       const data = await response.json();
//       console.log("✅ Labour Names Response:", data);

//       if (data?.objects && data.objects.length > 0) {
//         const labourData = data.objects;

//         // ✅ Extract unique names
//         const uniqueLabourNames = [
//           ...new Set(
//             labourData
//               .map((item) => item.labour_name)
//               .filter((name) => name && name.trim() !== "")
//           ),
//         ];

//         set({ 
//           labourNames: labourData,
//           selectedLabourNames: uniqueLabourNames,
//           loadingLabourNames: false
//         });

//         console.log(`✅ Found ${labourData.length} labour records`);
//         console.log(`📋 Unique labour names: ${uniqueLabourNames.length}`);

//         return { success: true, data: labourData, uniqueNames: uniqueLabourNames };
//       } else {
//         console.warn(`⚠️ No labour data found for filters:`, filters);
//         set({ 
//           labourNames: [], 
//           selectedLabourNames: [],
//           loadingLabourNames: false
//         });

//         return { success: false, error: `No labour names found` };
//       }
//     } catch (error) {
//       console.error("❌ Error fetching labour names:", error);
//       set({ 
//         labourNames: [], 
//         selectedLabourNames: [],
//         loadingLabourNames: false
//       });
//       return { success: false, error: error.message };
//     }
//   },

//   // ========================================
//   // 6️⃣ Fetch Skills for Department with Proper Encoding
//   // ========================================
// fetchSkillsForDepartment: async (department) => {
//   if (!department) {
//     set({ 
//       subDepartments: [], 
//       selectedSubDepartments: [],
//       filteredLabourData: [],
//       skillTypeMap: {}
//     });
//     return { success: true, data: [] };
//   }

//   set({ loadingSubDepts: true });
//   try {
//     const { plantCode } = get();
    
//     let filters = [`department eq '${department}'`];
//     if (plantCode) {
//       const numPlantCode = Number(plantCode);
//       filters.push(`plant_code eq ${numPlantCode}`);
//     }
    
//     // ✅ FIXED: Properly encode the filter
//     const filterString = filters.join(' and ');
//     const encodedFilter = encodeURIComponent(filterString);
//     const apiUrl = `http://localhost:8080/api/v1/collection/kln_hr_skill?$filter=${encodedFilter}&$select=cdb_object_id,skill,plant_code,department,type`;

//     console.log("🔍 Fetching Skills:", apiUrl);
//     console.log("📝 Raw filter:", filterString);

//     const response = await fetch(apiUrl);

//     if (!response.ok) {
//       throw new Error(`API returned status ${response.status}`);
//     }

//     const data = await response.json();
//     console.log("✅ Skills Response:", data);

//     if (data?.objects && data.objects.length > 0) {
//       const skills = data.objects;

//       const uniqueSkills = [
//         ...new Set(
//           skills
//             .map((item) => item.skill)
//             .filter((skill) => skill && skill.trim() !== "")
//         ),
//       ];

//       // ✅ CREATE SKILL TO F/C/G MAPPING
//       const skillTypeMap = {};
//       skills.forEach((item) => {
//         if (item.skill) {
//           skillTypeMap[item.skill] = item.type;
//         }
//       });

//       set({
//         subDepartments: uniqueSkills,
//         selectedSubDepartments: uniqueSkills,
//         labourSkillsData: skills,
//         filteredLabourData: skills,
//         skillTypeMap: skillTypeMap,
//         loadingSubDepts: false
//       });

//       console.log(`✅ Found ${skills.length} skills`);
//       console.log('📋 Skill Type Map:', skillTypeMap);

//       return { success: true, data: skills, uniqueSkills };
//     } else {
//       set({ 
//         subDepartments: [], 
//         selectedSubDepartments: [],
//         labourSkillsData: [],
//         filteredLabourData: [],
//         skillTypeMap: {},
//         loadingSubDepts: false
//       });

//       return { success: false, error: `No skills found` };
//     }
//   } catch (error) {
//     console.error("❌ Error fetching skills:", error);
//     set({ 
//       subDepartments: [], 
//       selectedSubDepartments: [],
//       skillTypeMap: {},
//       loadingSubDepts: false
//     });
//     return { success: false, error: error.message };
//   }
// },

//   // ========================================
//   // 7️⃣ Add New Department
//   // ========================================
//   addNewDepartment: async (deptName) => {
//     try {
//       const { plantCode } = get();

//       const body = {
//         department: deptName,
//         plant_code: Number(plantCode || DEFAULT_PLANT_CODE)
//       };

//       console.log('📤 Adding new department:', body);

//       const response = await fetch(
//         "http://localhost:8080/api/v1/collection/kln_hr_department",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(body)
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => null);
//         console.error('❌ API Error Response:', errorData);
//         throw new Error(errorData?.message || "Failed to add department");
//       }

//       console.log('✅ Department added successfully');
//       await get().fetchDepartmentsFromAPI();

//       return { success: true };
//     } catch (error) {
//       console.error('❌ Error adding department:', error);
//       return { success: false, error: error.message };
//     }
//   },

//   // ========================================
//   // 8️⃣ Add New Line
//   // ========================================
//   addNewLine: async (lineName) => {
//     try {
//       const { plantCode } = get();

//       const body = { 
//         line: lineName,
//         plant_code: Number(plantCode || DEFAULT_PLANT_CODE)
//       };

//       console.log('📤 Adding new line:', body);

//       const response = await fetch(
//         "http://localhost:8080/api/v1/collection/kln_hr_line",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(body)
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => null);
//         console.error('❌ API Error Response:', errorData);
//         throw new Error(errorData?.message || "Failed to add new line");
//       }

//       console.log('✅ Line added successfully');
//       await get().fetchLinesFromAPI();

//       return { success: true };
//     } catch (error) {
//       console.error('❌ Error adding line:', error);
//       return { success: false, error: error.message };
//     }
//   },

// // ========================================
// // 2️⃣ POST - Create new skill (ENHANCED ERROR HANDLING)
// // ========================================
// addSkill: async (skillData) => {
//   set({ loading: true, error: null });
  
//   try {
//     const { selectedSubDepartments, selectedLabourNames, skillTypeMap, plantCode } = get();

//     console.log('🔍 DEBUG - addSkill called with:', {
//       skillData,
//       selectedSubDepartments,
//       selectedLabourNames,
//       skillTypeMap,
//       plantCode
//     });

//     if (selectedSubDepartments.length === 0) {
//       throw new Error('Please select at least one skill');
//     }

//     if (selectedLabourNames.length === 0) {
//       throw new Error('Please select at least one labour name');
//     }

//     const recordsToCreate = [];

//     // ✅ SIMPLIFIED - Core required fields only
//     for (const skill of skillData.skills || []) {
//       for (const labourName of selectedLabourNames) {
        
//         // ✅ GET F/C/G FROM SKILL MAPPING
//         const fCgType = skillTypeMap[skill.name] || 'G';
        
//         const backendData = {
//           machining_skills_names: skill.name,
//           f_c_g: fCgType,
//           person_name: labourName,
//           skill_required: Number(skill.level) || 1,
//           liness: skillData.line || "",              // ✅ This is the important one
//           department: skillData.department || "",
//           plant_code: Number(plantCode || DEFAULT_PLANT_CODE)
//         };

//         recordsToCreate.push(backendData);
//       }
//     }

//     console.log('📤 Creating skills - Total Records:', recordsToCreate.length);
//     console.log('📤 Plant Code:', plantCode);
//     console.log('📤 First 3 records:', recordsToCreate.slice(0, 3));

//     const response = await fetch(API_BASE_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(recordsToCreate)
//     });
    
//     console.log('📥 Response status:', response.status);
//     console.log('📥 Response ok:', response.ok);
    
//     if (!response.ok) {
//       // ✅ ENHANCED: Try to get detailed error message
//       let errorText;
//       let errorData;
      
//       try {
//         errorText = await response.text();
//         console.error('❌ API Error Response (text):', errorText);
        
//         // Try to parse as JSON
//         try {
//           errorData = JSON.parse(errorText);
//           console.error('❌ API Error Response (parsed):', errorData);
//         } catch (e) {
//           console.error('❌ Could not parse error as JSON');
//         }
//       } catch (e) {
//         console.error('❌ Could not read error response');
//       }
      
//       throw new Error(
//         errorData?.message || 
//         errorData?.error || 
//         errorText || 
//         `Failed to create skills: ${response.status}`
//       );
//     }
    
//     const result = await response.json();
//     console.log('✅ Skills created:', result);
    
//     await get().fetchSkills();
    
//     set({ loading: false });
//     return { 
//       success: true, 
//       message: `Successfully added ${recordsToCreate.length} skill entries!`,
//       count: recordsToCreate.length
//     };
    
//   } catch (error) {
//     console.error('❌ Error creating skills:', error);
//     console.error('❌ Error stack:', error.stack);
//     set({ error: error.message, loading: false });
//     return { success: false, error: error.message };
//   }
// },

//   // ========================================
//   // Fetch Labour Skills for SubDepts - FIXED: Use plantLocation only
//   // ========================================
//   fetchLabourSkillsForSubDepts: async () => {
//     const { selectedSubDepartments, selectedDepartment, plantCode, plantLocation } = get();
    
//     if (selectedSubDepartments.length === 0) {
//       set({ filteredLabourData: [] });
//       return { success: true, data: [] };
//     }

//     set({ loadingLabourData: true });
//     try {
//       const filters = [];

//       // ✅ Only dept_desc and locn (plant location)
//       if (selectedDepartment) {
//         filters.push(`dept_desc eq '${selectedDepartment}'`);
//       }

//       // ✅ FIXED: Always use plantLocation (Khed/Baramati), NOT selectedLine
//       if (plantLocation) {
//         filters.push(`locn eq '${plantLocation}'`);
//         console.log(`🔍 Using plant location: ${plantLocation}`);
//       }

//       // ✅ Properly encode filter
//       const filterString = filters.join(" and ");
//       const encodedFilter = encodeURIComponent(filterString);
//       const url = `http://localhost:8080/api/v1/collection/hr_labour_master?$filter=${encodedFilter}`;
      
//       console.log('🔍 Fetching Labour Skills:', url);
//       console.log('📝 Raw filter:', filterString);

//       const response = await fetch(url);
//       const data = await response.json();
//       console.log("✅ Labour Master Response:", data);

//       if (data?.objects) {
//         const filtered = data.objects.filter((item) =>
//           selectedSubDepartments.includes(item.sub_dept_desc)
//         );

//         // ✅ Skills API - use plant_code here (this is kln_hr_skill, not labour_master)
//         const skillFilters = [`department eq '${selectedDepartment}'`];
//         if (plantCode) {
//           const numPlantCode = Number(plantCode);
//           skillFilters.push(`plant_code eq ${numPlantCode}`);
//         }
//         const skillFilterString = skillFilters.join(' and ');
//         const encodedSkillFilter = encodeURIComponent(skillFilterString);
//         const skillsUrl = `http://localhost:8080/api/v1/collection/kln_hr_skill?$filter=${encodedSkillFilter}`;
        
//         console.log('🔍 Fetching Skills:', skillsUrl);
//         console.log('📝 Skills filter:', skillFilterString);
        
//         const skillsResponse = await fetch(skillsUrl);
//         const skillsData = await skillsResponse.json();

//         const mappedData = filtered.map((labour) => {
//           const relatedSkills = skillsData?.objects || [];
//           return {
//             labour_name: labour.labour_name,
//             labour_code: labour.labour_code,
//             skill_name: labour.sub_dept_desc,
//             skill_level: 1,
//             relatedSkills: relatedSkills,
//           };
//         });

//         set({ 
//           filteredLabourData: mappedData,
//           currentPage: 1,
//           loadingLabourData: false
//         });
        
//         console.log(`✅ Filtered ${mappedData.length} labour records`);
//         return { success: true, data: mappedData };
//       }
      
//       set({ loadingLabourData: false });
//       return { success: true, data: [] };
//     } catch (error) {
//       console.error("❌ Error fetching labour skills:", error);
//       set({ loadingLabourData: false });
//       return { success: false, error: error.message };
//     }
//   },

//   fetchAllOptions: async () => {
//     set({ loadingOptions: true });
//     try {
//       const { plantCode } = get();
      
//       const plantFilter = plantCode ? `plant_code eq ${Number(plantCode)}` : '';

//       const skillsResponse = await fetch(
//         plantFilter 
//           ? `http://localhost:8080/api/v1/collection/kln_hr_skill?$filter=${plantFilter}`
//           : `http://localhost:8080/api/v1/collection/kln_hr_skill`
//       );
//       const skillsData = await skillsResponse.json();

//       const categoryResponse = await fetch(
//         "http://localhost:8080/api/v1/collection/kln_hr_category"
//       );
//       const categoryData = await categoryResponse.json();

//       const departmentResponse = await fetch(
//         plantFilter
//           ? `http://localhost:8080/api/v1/collection/kln_hr_department?$filter=${plantFilter}`
//           : `http://localhost:8080/api/v1/collection/kln_hr_department`
//       );
//       const departmentData = await departmentResponse.json();

//       const lineResponse = await fetch(
//         plantFilter
//           ? `http://localhost:8080/api/v1/collection/kln_hr_line?$filter=${plantFilter}`
//           : `http://localhost:8080/api/v1/collection/kln_hr_line`
//       );
//       const lineData = await lineResponse.json();

//       set({
//         skillsOptions: skillsData?.objects || [],
//         categoryOptions: categoryData?.objects || [],
//         departmentOptions: departmentData?.objects || [],
//         lineOptions: lineData?.objects || [],
//         loadingOptions: false
//       });

//       console.log('✅ All options loaded');
//       return { success: true };
//     } catch (error) {
//       console.error("❌ Error fetching options:", error);
//       set({ loadingOptions: false });
//       return { success: false, error: error.message };
//     }
//   },

//   // PATCH/DELETE operations
//   updateSkillDepartment: async (skillId, department, value) => {
//     const currentSkills = get().skills;
//     const updatedSkills = currentSkills.map(skill =>
//       skill.id === skillId 
//         ? { ...skill, [department]: value }
//         : skill
//     );
    
//     set({ skills: updatedSkills });
    
//     try {
//       const departmentMapping = {
//         'production': 'production_4du',
//         'quality': 'quality_4du',
//         'maintenance': 'maintenance',
//         'heatTreatment': 'heat_treatment'
//       };

//       const backendField = departmentMapping[department];
      
//       const patchData = {
//         cdb_object_id: skillId,
//         [backendField]: value ? 1 : 0
//       };

//       const response = await fetch(API_BASE_URL, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(patchData)
//       });
      
//       if (!response.ok) {
//         throw new Error(`Failed to update: ${response.status}`);
//       }
      
//       const result = await response.json();
//       return { success: true, message: result.message };
      
//     } catch (error) {
//       console.error('❌ Error updating:', error);
//       set({ skills: currentSkills, error: error.message });
//       return { success: false, error: error.message };
//     }
//   },

//   deleteSkill: async (skillId) => {
//     set({ loading: true, error: null });
    
//     try {
//       const deleteData = {
//         cdb_object_id: skillId,
//         is_delete: true
//       };

//       const response = await fetch(API_BASE_URL, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(deleteData)
//       });
      
//       if (!response.ok) {
//         throw new Error(`Failed to delete: ${response.status}`);
//       }
      
//       const result = await response.json();
      
//       set((state) => ({
//         skills: state.skills.filter(s => s.id !== skillId),
//         loading: false
//       }));
      
//       return { success: true, message: result.message };
      
//     } catch (error) {
//       console.error('❌ Error deleting:', error);
//       set({ error: error.message, loading: false });
//       return { success: false, error: error.message };
//     }
//   },

//   // Setters
//   setSelectedDepartment: (department) => set({ selectedDepartment: department }),
//   setSelectedLine: (line) => set({ selectedLine: line }),
//   setSelectedSubDepartments: (subDepts) => set({ selectedSubDepartments: subDepts }),
  
//   toggleSubDepartment: (subDept) => {
//     set((state) => {
//       const isSelected = state.selectedSubDepartments.includes(subDept);
//       return {
//         selectedSubDepartments: isSelected
//           ? state.selectedSubDepartments.filter(sd => sd !== subDept)
//           : [...state.selectedSubDepartments, subDept]
//       };
//     });
//   },

//   toggleAllSubDepartments: () => {
//     set((state) => ({
//       selectedSubDepartments: 
//         state.selectedSubDepartments.length === state.subDepartments.length
//           ? []
//           : [...state.subDepartments]
//     }));
//   },

//   setSelectedLabourNames: (names) => set({ selectedLabourNames: names }),
  
//   toggleLabourName: (labourName) => {
//     set((state) => {
//       const isSelected = state.selectedLabourNames.includes(labourName);
//       return {
//         selectedLabourNames: isSelected
//           ? state.selectedLabourNames.filter(name => name !== labourName)
//           : [...state.selectedLabourNames, labourName]
//       };
//     });
//   },

//   toggleAllLabourNames: () => {
//     set((state) => {
//       const uniqueLabourNames = [
//         ...new Set(
//           state.labourNames
//             .map((item) => item.labour_name)
//             .filter((name) => name && name.trim() !== "")
//         ),
//       ];

//       return {
//         selectedLabourNames: 
//           state.selectedLabourNames.length === uniqueLabourNames.length
//             ? []
//             : uniqueLabourNames
//       };
//     });
//   },

//   setCurrentPage: (page) => set({ currentPage: page }),
  
//   getCurrentPageData: () => {
//     const { filteredLabourData, currentPage, itemsPerPage } = get();
//     const indexOfLastItem = currentPage * itemsPerPage;
//     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//     return filteredLabourData.slice(indexOfFirstItem, indexOfLastItem);
//   },

//   getTotalPages: () => {
//     const { filteredLabourData, itemsPerPage } = get();
//     return Math.ceil(filteredLabourData.length / itemsPerPage);
//   },

// resetModalState: () => {
//   set({
//     selectedDepartment: '',
//     selectedLine: '',
//     subDepartments: [],
//     selectedSubDepartments: [],
//     filteredLabourData: [],
//     labourNames: [],
//     selectedLabourNames: [],
//     skillTypeMap: {},
//     currentPage: 1
//   });
// },

//   setFilters: (newFilters) => {
//     set((state) => ({
//       filters: { ...state.filters, ...newFilters }
//     }));
//   },

//   resetFilters: () => {
//     set({
//       filters: {
//         skillType: 'all',
//         applicability: 'all',
//         searchTerm: ''
//       }
//     });
//   },

//   getFilteredSkills: () => {
//     const { skills, filters } = get();
    
//     return skills.filter(skill => {
//       if (filters.skillType !== 'all' && skill.type !== filters.skillType) 
//         return false;
      
//       if (filters.applicability !== 'all' && skill.applicability !== filters.applicability) 
//         return false;
      
//       if (filters.searchTerm && !skill.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) 
//         return false;
      
//       return true;
//     });
//   },

//   getDepartmentCount: (department) => {
//     const skills = get().skills;
//     return skills.filter(s => s[department]).length;
//   },

//   exportSkills: (format = 'json') => {
//     const skills = get().skills;
    
//     if (format === 'json') {
//       const dataStr = JSON.stringify(skills, null, 2);
//       const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
//       const exportFileDefaultName = `skills_export_${new Date().toISOString()}.json`;
//       const linkElement = document.createElement('a');
//       linkElement.setAttribute('href', dataUri);
//       linkElement.setAttribute('download', exportFileDefaultName);
//       linkElement.click();
//     } else if (format === 'csv') {
//       const headers = ['ID', 'Name', 'Type', 'Applicability', 'Production', 'Quality', 'Maintenance', 'Heat Treatment'];
//       const csvData = skills.map(s => [
//         s.id,
//         s.name,
//         s.type,
//         s.applicability,
//         s.production ? 'Yes' : 'No',
//         s.quality ? 'Yes' : 'No',
//         s.maintenance ? 'Yes' : 'No',
//         s.heatTreatment ? 'Yes' : 'No'
//       ]);
      
//       const csvContent = [
//         headers.join(','),
//         ...csvData.map(row => row.join(','))
//       ].join('\n');
      
//       const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
//       const exportFileDefaultName = `skills_export_${new Date().toISOString()}.csv`;
//       const linkElement = document.createElement('a');
//       linkElement.setAttribute('href', dataUri);
//       linkElement.setAttribute('download', exportFileDefaultName);
//       linkElement.click();
//     }
    
//     return { success: true };
//   },

//   clearData: () => {
//     set({
//       skills: [],
//       loading: false,
//       error: null,
//       totalSkills: 0,
//       functionalCount: 0,
//       criticalCount: 0,
//       genericCount: 0,
//       departments: [],
//       lines: [],
//       subDepartments: [],
//       labourNames: [],
//       selectedLabourNames: [],
//       selectedDepartment: '',
//       selectedLine: '',
//       selectedSubDepartments: [],
//       filteredLabourData: [],
//       currentPage: 1
//     });
//   },

//   initializeMockData: () => {
//     console.log('initializeMockData called - Use fetchSkills() instead');
//   }
// }));


// // reducers/skillMatrixStore.js - UPDATED WITH PROPER PLANT CODE FILTER
// import { create } from 'zustand';

// const API_BASE_URL = 'http://localhost:8080/internal/hr_machining_skills';
// const PLANT_CODE_API = 'http://localhost:8080/internal/plant_code';
// const DEFAULT_PLANT_CODE = 2021; // 🆕 Number instead of String

// export const useSkillMatrixStore = create((set, get) => ({
//   // 📊 STATE
//   skills: [],
//   loading: false,
//   error: null,
//   filters: {
//     skillType: 'all',
//     applicability: 'all',
//     searchTerm: ''
//   },
  
//   totalSkills: 0,
//   functionalCount: 0,
//   criticalCount: 0,
//   genericCount: 0,

//   // 🆕 Plant Code State
//   plantCode: null,
//   loadingPlantCode: false,
//   plantCodeError: null,
//   usingFallbackPlantCode: false,
//   plantLocation: null, // ✅ NEW: Store location based on plant code

//   // ✅ NEW: Plant Code to Location Mapping
//   getLocationForPlantCode: (plantCode) => {
//     const plantLocationMap = {
//       '2021': 'Baramati',
//       '2022': 'Baramati',
//       '2023': 'Pune',
//       // Add more mappings as needed
//     };
    
//     return plantLocationMap[String(plantCode)] || null;
//   },

//   // API Options State
//   skillsOptions: [],
//   categoryOptions: [],
//   departmentOptions: [],
//   lineOptions: [],
//   loadingOptions: false,

//   // Hierarchical Selection State
//   departments: [],
//   selectedDepartment: '',
//   lines: [],
//   selectedLine: '',
//   subDepartments: [],
//   selectedSubDepartments: [],
//   skillTypeMap: {}, 
//   labourSkillsData: [],
//   filteredLabourData: [],
//   loadingSubDepts: false,
//   loadingLabourData: false,
//   loadingLines: false,

//   // Labour Names State
//   labourNames: [],
//   selectedLabourNames: [],
//   loadingLabourNames: false,

//   // Pagination State
//   currentPage: 1,
//   itemsPerPage: 20,

//   // ========================================
//   // 🆕 ENHANCED Fetch Plant Code with Fallback
//   // ========================================
//   fetchPlantCode: async () => {
//     set({ loadingPlantCode: true, plantCodeError: null });
    
//     try {
//       console.log('🏭 Fetching Plant Code from:', PLANT_CODE_API);

//       const response = await fetch(PLANT_CODE_API, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//       });
      
//       if (!response.ok) {
//         throw new Error(`API returned status ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('✅ Plant Code API Response:', data);
      
//       if (data.error) {
//         throw new Error(data.error);
//       }
      
//       let plantCode = data.plant_code;
      
//       if (!plantCode) {
//         throw new Error('Plant code not found in response');
//       }
      
//       // ✅ FIXED: Handle both string "2021" and number 2021
//       plantCode = Number(plantCode);
      
//       // ✅ NEW: Get location for this plant code
//       const location = get().getLocationForPlantCode(plantCode);
      
//       // Save to localStorage for future use
//       localStorage.setItem('plantCode', String(plantCode));
//       if (location) {
//         localStorage.setItem('plantLocation', location);
//       }
      
//       set({ 
//         plantCode: plantCode,
//         plantLocation: location, // ✅ Store location
//         loadingPlantCode: false,
//         usingFallbackPlantCode: false
//       });
      
//       console.log('✅ Plant Code loaded successfully:', plantCode);
//       console.log('✅ Plant Location:', location);
//       return { success: true, plantCode, location };
      
//     } catch (error) {
//       console.error('❌ Error fetching plant code:', error);
      
//       const storedPlantCode = localStorage.getItem('plantCode');
//       const storedLocation = localStorage.getItem('plantLocation');
//       const fallbackPlantCode = Number(storedPlantCode || DEFAULT_PLANT_CODE);
//       const fallbackLocation = storedLocation || get().getLocationForPlantCode(fallbackPlantCode);
      
//       console.warn('⚠️ Using fallback plant code:', fallbackPlantCode);
//       console.warn('⚠️ Using fallback location:', fallbackLocation);
      
//       set({ 
//         plantCode: fallbackPlantCode,
//         plantLocation: fallbackLocation,
//         plantCodeError: error.message, 
//         loadingPlantCode: false,
//         usingFallbackPlantCode: true
//       });
      
//       return { 
//         success: true, 
//         plantCode: fallbackPlantCode,
//         location: fallbackLocation,
//         usingFallback: true,
//         error: error.message
//       };
//     }
//   },

//   // ========================================
//   // 1️⃣ GET - Fetch all skills with filters
//   // ========================================
//   fetchSkills: async (apiFilters = {}) => {
//     set({ loading: true, error: null });
    
//     try {
//       const { plantCode, usingFallbackPlantCode } = get();
      
//       if (!plantCode) {
//         console.warn('⚠️ No plant code available, fetching all data');
//       }
      
//       if (usingFallbackPlantCode) {
//         console.warn('⚠️ Using fallback plant code:', plantCode);
//       }

//       const params = new URLSearchParams();
      
//       if (plantCode) {
//         params.append('plant_code', plantCode);
//       }
      
//       if (apiFilters.skill_type) {
//         params.append('skill_type', apiFilters.skill_type);
//       }
//       if (apiFilters.applicability) {
//         params.append('applicability', apiFilters.applicability);
//       }

//       const url = params.toString() 
//         ? `${API_BASE_URL}?${params.toString()}`
//         : API_BASE_URL;

//       console.log('🔍 Fetching skills from:', url);

//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error(`Failed to fetch skills: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('✅ Skills fetched:', data.length, 'records');
      
//       const transformedSkills = data.map(obj => ({
//         id: obj.cdb_object_id,
//         name: obj.machining_skills_names,
//         type: obj.f_c_g,
//         applicability: obj.applicability,
//         production: obj.production_4du === 1,
//         quality: obj.quality_4du === 1,
//         maintenance: obj.maintenance === 1,
//         heatTreatment: obj.heat_treatment === 1,
//         skill_required: obj.skill_required,

//         education: obj.education,
//         personName: obj.person_name,
//         skillType: obj.skill_type
//       }));
      
//       const functional = transformedSkills.filter(s => s.type === 'F').length;
//       const critical = transformedSkills.filter(s => s.type === 'C').length;
//       const generic = transformedSkills.filter(s => s.type === 'G').length;
      
//       set({ 
//         skills: transformedSkills,
//         totalSkills: transformedSkills.length,
//         functionalCount: functional,
//         criticalCount: critical,
//         genericCount: generic,
//         loading: false 
//       });
      
//       return { success: true, data: transformedSkills };
      
//     } catch (error) {
//       console.error('❌ Error fetching skills:', error);
//       set({ 
//         error: error.message, 
//         loading: false 
//       });
//       return { success: false, error: error.message };
//     }
//   },

//   // ========================================
//   // 3️⃣ Fetch Departments
//   // ========================================
//   fetchDepartmentsFromAPI: async () => {
//     try {
//       const { plantCode } = get();
      
//       let url = "http://localhost:8080/api/v1/collection/kln_hr_department?$select=department,plant_code";
      
//       if (plantCode) {
//         const numPlantCode = Number(plantCode);
//         url += `&$filter=plant_code eq ${numPlantCode}`;
//         console.log(`🔍 Fetching Departments for plant ${numPlantCode}`);
//       } else {
//         console.warn('⚠️ Fetching all departments (no plant filter)');
//       }

//       const response = await fetch(url);
//       const data = await response.json();
//       console.log("✅ Department API Response:", data);

//       const uniqueDepts = [
//         ...new Set(
//           data?.objects
//             ?.map((item) => item.department)
//             .filter((dept) => dept && dept.trim() !== "")
//         ),
//       ];

//       set({ departments: uniqueDepts });
//       console.log('📋 Unique Departments:', uniqueDepts);
//       return { success: true, data: uniqueDepts };
//     } catch (error) {
//       console.error("❌ Error fetching departments:", error);
//       return { success: false, error: error.message };
//     }
//   },

//   // ========================================
//   // 4️⃣ Fetch Lines
//   // ========================================
//   fetchLinesFromAPI: async () => {
//     set({ loadingLines: true });
//     try {
//       const { plantCode } = get();
      
//       let url = "http://localhost:8080/api/v1/collection/kln_hr_line?$select=line,plant_code";
      
//       if (plantCode) {
//         const numPlantCode = Number(plantCode);
//         url += `&$filter=plant_code eq ${numPlantCode}`;
//         console.log(`🔍 Fetching Lines for plant ${numPlantCode}`);
//       }

//       const response = await fetch(url);
//       const data = await response.json();

//       const uniqueLines = [
//         ...new Set(
//           data?.objects
//             ?.map((item) => item.line)
//             .filter((line) => line && line.trim() !== "")
//         ),
//       ];

//       set({ lines: uniqueLines, loadingLines: false });
//       console.log('📋 Unique Lines:', uniqueLines);
//       return { success: true, data: uniqueLines };
//     } catch (error) {
//       console.error("❌ Error fetching lines:", error);
//       set({ loadingLines: false });
//       return { success: false, error: error.message };
//     }
//   },

//   // ========================================
//   // 5️⃣ ✅ FIXED: Fetch Labour Names - Only dept_desc and locn filters
//   // ========================================
//   fetchLabourNamesForDepartment: async (department) => {
//     if (!department) {
//       set({ labourNames: [], selectedLabourNames: [] });
//       return { success: true, data: [] };
//     }

//     set({ loadingLabourNames: true });
//     try {
//       const { plantLocation } = get();
      
//       let filters = [`dept_desc eq '${department}'`];
      
//       // ✅ ONLY location filter (NO plant_code filter)
//       if (plantLocation) {
//         filters.push(`locn eq '${plantLocation}'`);
//         console.log(`🔍 Fetching labour for dept: ${department}, location: '${plantLocation}'`);
//       } else {
//         console.log(`🔍 Fetching labour for dept: ${department} (no location filter)`);
//       }
      
//       // ✅ Properly encode the filter string
//       const filterString = filters.join(' and ');
//       const encodedFilter = encodeURIComponent(filterString);
//       const apiUrl = `http://localhost:8080/api/v1/collection/hr_labour_master?$filter=${encodedFilter}`;

//       console.log("🔍 Labour Master API URL:", apiUrl);
//       console.log("📝 Raw filter:", filterString);

//       const response = await fetch(apiUrl);

//       if (!response.ok) {
//         throw new Error(`API returned status ${response.status}`);
//       }

//       const data = await response.json();
//       console.log("✅ Labour Names Response:", data);

//       if (data?.objects && data.objects.length > 0) {
//         const labourData = data.objects;

//         // ✅ Extract unique names
//         const uniqueLabourNames = [
//           ...new Set(
//             labourData
//               .map((item) => item.labour_name)
//               .filter((name) => name && name.trim() !== "")
//           ),
//         ];

//         set({ 
//           labourNames: labourData,
//           selectedLabourNames: uniqueLabourNames,
//           loadingLabourNames: false
//         });

//         console.log(`✅ Found ${labourData.length} labour records`);
//         console.log(`📋 Unique labour names: ${uniqueLabourNames.length}`);

//         return { success: true, data: labourData, uniqueNames: uniqueLabourNames };
//       } else {
//         console.warn(`⚠️ No labour data found for filters:`, filters);
//         set({ 
//           labourNames: [], 
//           selectedLabourNames: [],
//           loadingLabourNames: false
//         });

//         return { success: false, error: `No labour names found` };
//       }
//     } catch (error) {
//       console.error("❌ Error fetching labour names:", error);
//       set({ 
//         labourNames: [], 
//         selectedLabourNames: [],
//         loadingLabourNames: false
//       });
//       return { success: false, error: error.message };
//     }
//   },

//   // ========================================
//   // 6️⃣ Fetch Skills for Department with Proper Encoding
//   // ========================================
// fetchSkillsForDepartment: async (department) => {
//   if (!department) {
//     set({ 
//       subDepartments: [], 
//       selectedSubDepartments: [],
//       filteredLabourData: [],
//       skillTypeMap: {}
//     });
//     return { success: true, data: [] };
//   }

//   set({ loadingSubDepts: true });
//   try {
//     const { plantCode } = get();
    
//     let filters = [`department eq '${department}'`];
//     if (plantCode) {
//       const numPlantCode = Number(plantCode);
//       filters.push(`plant_code eq ${numPlantCode}`);
//     }
    
//     // ✅ FIXED: Properly encode the filter
//     const filterString = filters.join(' and ');
//     const encodedFilter = encodeURIComponent(filterString);
//     const apiUrl = `http://localhost:8080/api/v1/collection/kln_hr_skill?$filter=${encodedFilter}&$select=cdb_object_id,skill,plant_code,department,type`;

//     console.log("🔍 Fetching Skills:", apiUrl);
//     console.log("📝 Raw filter:", filterString);

//     const response = await fetch(apiUrl);

//     if (!response.ok) {
//       throw new Error(`API returned status ${response.status}`);
//     }

//     const data = await response.json();
//     console.log("✅ Skills Response:", data);

//     if (data?.objects && data.objects.length > 0) {
//       const skills = data.objects;

//       const uniqueSkills = [
//         ...new Set(
//           skills
//             .map((item) => item.skill)
//             .filter((skill) => skill && skill.trim() !== "")
//         ),
//       ];

//       // ✅ CREATE SKILL TO F/C/G MAPPING
//       const skillTypeMap = {};
//       skills.forEach((item) => {
//         if (item.skill) {
//           skillTypeMap[item.skill] = item.type;
//         }
//       });

//       set({
//         subDepartments: uniqueSkills,
//         selectedSubDepartments: uniqueSkills,
//         labourSkillsData: skills,
//         filteredLabourData: skills,
//         skillTypeMap: skillTypeMap,
//         loadingSubDepts: false
//       });

//       console.log(`✅ Found ${skills.length} skills`);
//       console.log('📋 Skill Type Map:', skillTypeMap);

//       return { success: true, data: skills, uniqueSkills };
//     } else {
//       set({ 
//         subDepartments: [], 
//         selectedSubDepartments: [],
//         labourSkillsData: [],
//         filteredLabourData: [],
//         skillTypeMap: {},
//         loadingSubDepts: false
//       });

//       return { success: false, error: `No skills found` };
//     }
//   } catch (error) {
//     console.error("❌ Error fetching skills:", error);
//     set({ 
//       subDepartments: [], 
//       selectedSubDepartments: [],
//       skillTypeMap: {},
//       loadingSubDepts: false
//     });
//     return { success: false, error: error.message };
//   }
// },

//   // ========================================
//   // 7️⃣ Add New Department
//   // ========================================
//   addNewDepartment: async (deptName) => {
//     try {
//       const { plantCode } = get();

//       const body = {
//         department: deptName,
//         plant_code: Number(plantCode || DEFAULT_PLANT_CODE)
//       };

//       console.log('📤 Adding new department:', body);

//       const response = await fetch(
//         "http://localhost:8080/api/v1/collection/kln_hr_department",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(body)
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => null);
//         console.error('❌ API Error Response:', errorData);
//         throw new Error(errorData?.message || "Failed to add department");
//       }

//       console.log('✅ Department added successfully');
//       await get().fetchDepartmentsFromAPI();

//       return { success: true };
//     } catch (error) {
//       console.error('❌ Error adding department:', error);
//       return { success: false, error: error.message };
//     }
//   },

//   // ========================================
//   // 8️⃣ Add New Line
//   // ========================================
//   addNewLine: async (lineName) => {
//     try {
//       const { plantCode } = get();

//       const body = { 
//         line: lineName,
//         plant_code: Number(plantCode || DEFAULT_PLANT_CODE)
//       };

//       console.log('📤 Adding new line:', body);

//       const response = await fetch(
//         "http://localhost:8080/api/v1/collection/kln_hr_line",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(body)
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => null);
//         console.error('❌ API Error Response:', errorData);
//         throw new Error(errorData?.message || "Failed to add new line");
//       }

//       console.log('✅ Line added successfully');
//       await get().fetchLinesFromAPI();

//       return { success: true };
//     } catch (error) {
//       console.error('❌ Error adding line:', error);
//       return { success: false, error: error.message };
//     }
//   },

// // ========================================
// // 2️⃣ POST - Create new skill (ENHANCED ERROR HANDLING)
// // ========================================
// addSkill: async (skillData) => {
//   set({ loading: true, error: null });
  
//   try {
//     const { selectedSubDepartments, selectedLabourNames, skillTypeMap, plantCode } = get();

//     console.log('🔍 DEBUG - addSkill called with:', {
//       skillData,
//       selectedSubDepartments,
//       selectedLabourNames,
//       skillTypeMap,
//       plantCode
//     });

//     if (selectedSubDepartments.length === 0) {
//       throw new Error('Please select at least one skill');
//     }

//     if (selectedLabourNames.length === 0) {
//       throw new Error('Please select at least one labour name');
//     }

//     const recordsToCreate = [];

//     // ✅ SIMPLIFIED - Core required fields only
//     for (const skill of skillData.skills || []) {
//       for (const labourName of selectedLabourNames) {
        
//         // ✅ GET F/C/G FROM SKILL MAPPING
//         const fCgType = skillTypeMap[skill.name] || 'G';
        
//         const backendData = {
//           machining_skills_names: skill.name,
//           f_c_g: fCgType,
//           person_name: labourName,
//           skill_required: Number(skill.level) || 1,
//           liness: skillData.line || "",              // ✅ This is the important one
//           department: skillData.department || "",
//           plant_code: Number(plantCode || DEFAULT_PLANT_CODE)
//         };

//         recordsToCreate.push(backendData);
//       }
//     }

//     console.log('📤 Creating skills - Total Records:', recordsToCreate.length);
//     console.log('📤 Plant Code:', plantCode);
//     console.log('📤 First 3 records:', recordsToCreate.slice(0, 3));

//     const response = await fetch(API_BASE_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(recordsToCreate)
//     });
    
//     console.log('📥 Response status:', response.status);
//     console.log('📥 Response ok:', response.ok);
    
//     if (!response.ok) {
//       // ✅ ENHANCED: Try to get detailed error message
//       let errorText;
//       let errorData;
      
//       try {
//         errorText = await response.text();
//         console.error('❌ API Error Response (text):', errorText);
        
//         // Try to parse as JSON
//         try {
//           errorData = JSON.parse(errorText);
//           console.error('❌ API Error Response (parsed):', errorData);
//         } catch (e) {
//           console.error('❌ Could not parse error as JSON');
//         }
//       } catch (e) {
//         console.error('❌ Could not read error response');
//       }
      
//       throw new Error(
//         errorData?.message || 
//         errorData?.error || 
//         errorText || 
//         `Failed to create skills: ${response.status}`
//       );
//     }
    
//     const result = await response.json();
//     console.log('✅ Skills created:', result);
    
//     await get().fetchSkills();
    
//     set({ loading: false });
//     return { 
//       success: true, 
//       message: `Successfully added ${recordsToCreate.length} skill entries!`,
//       count: recordsToCreate.length
//     };
    
//   } catch (error) {
//     console.error('❌ Error creating skills:', error);
//     console.error('❌ Error stack:', error.stack);
//     set({ error: error.message, loading: false });
//     return { success: false, error: error.message };
//   }
// },

//   // ========================================
//   // Fetch Labour Skills for SubDepts - FIXED: Use plantLocation only
//   // ========================================
//   fetchLabourSkillsForSubDepts: async () => {
//     const { selectedSubDepartments, selectedDepartment, plantCode, plantLocation } = get();
    
//     if (selectedSubDepartments.length === 0) {
//       set({ filteredLabourData: [] });
//       return { success: true, data: [] };
//     }

//     set({ loadingLabourData: true });
//     try {
//       const filters = [];

//       // ✅ Only dept_desc and locn (plant location)
//       if (selectedDepartment) {
//         filters.push(`dept_desc eq '${selectedDepartment}'`);
//       }

//       // ✅ FIXED: Always use plantLocation (Khed/Baramati), NOT selectedLine
//       if (plantLocation) {
//         filters.push(`locn eq '${plantLocation}'`);
//         console.log(`🔍 Using plant location: ${plantLocation}`);
//       }

//       // ✅ Properly encode filter
//       const filterString = filters.join(" and ");
//       const encodedFilter = encodeURIComponent(filterString);
//       const url = `http://localhost:8080/api/v1/collection/hr_labour_master?$filter=${encodedFilter}`;
      
//       console.log('🔍 Fetching Labour Skills:', url);
//       console.log('📝 Raw filter:', filterString);

//       const response = await fetch(url);
//       const data = await response.json();
//       console.log("✅ Labour Master Response:", data);

//       if (data?.objects) {
//         const filtered = data.objects.filter((item) =>
//           selectedSubDepartments.includes(item.sub_dept_desc)
//         );

//         // ✅ Skills API - use plant_code here (this is kln_hr_skill, not labour_master)
//         const skillFilters = [`department eq '${selectedDepartment}'`];
//         if (plantCode) {
//           const numPlantCode = Number(plantCode);
//           skillFilters.push(`plant_code eq ${numPlantCode}`);
//         }
//         const skillFilterString = skillFilters.join(' and ');
//         const encodedSkillFilter = encodeURIComponent(skillFilterString);
//         const skillsUrl = `http://localhost:8080/api/v1/collection/kln_hr_skill?$filter=${encodedSkillFilter}`;
        
//         console.log('🔍 Fetching Skills:', skillsUrl);
//         console.log('📝 Skills filter:', skillFilterString);
        
//         const skillsResponse = await fetch(skillsUrl);
//         const skillsData = await skillsResponse.json();

//         const mappedData = filtered.map((labour) => {
//           const relatedSkills = skillsData?.objects || [];
//           return {
//             labour_name: labour.labour_name,
//             labour_code: labour.labour_code,
//             skill_name: labour.sub_dept_desc,
//             skill_level: 1,
//             relatedSkills: relatedSkills,
//           };
//         });

//         set({ 
//           filteredLabourData: mappedData,
//           currentPage: 1,
//           loadingLabourData: false
//         });
        
//         console.log(`✅ Filtered ${mappedData.length} labour records`);
//         return { success: true, data: mappedData };
//       }
      
//       set({ loadingLabourData: false });
//       return { success: true, data: [] };
//     } catch (error) {
//       console.error("❌ Error fetching labour skills:", error);
//       set({ loadingLabourData: false });
//       return { success: false, error: error.message };
//     }
//   },

//   fetchAllOptions: async () => {
//     set({ loadingOptions: true });
//     try {
//       const { plantCode } = get();
      
//       const plantFilter = plantCode ? `plant_code eq ${Number(plantCode)}` : '';

//       const skillsResponse = await fetch(
//         plantFilter 
//           ? `http://localhost:8080/api/v1/collection/kln_hr_skill?$filter=${plantFilter}`
//           : `http://localhost:8080/api/v1/collection/kln_hr_skill`
//       );
//       const skillsData = await skillsResponse.json();

//       const categoryResponse = await fetch(
//         "http://localhost:8080/api/v1/collection/kln_hr_category"
//       );
//       const categoryData = await categoryResponse.json();

//       const departmentResponse = await fetch(
//         plantFilter
//           ? `http://localhost:8080/api/v1/collection/kln_hr_department?$filter=${plantFilter}`
//           : `http://localhost:8080/api/v1/collection/kln_hr_department`
//       );
//       const departmentData = await departmentResponse.json();

//       const lineResponse = await fetch(
//         plantFilter
//           ? `http://localhost:8080/api/v1/collection/kln_hr_line?$filter=${plantFilter}`
//           : `http://localhost:8080/api/v1/collection/kln_hr_line`
//       );
//       const lineData = await lineResponse.json();

//       set({
//         skillsOptions: skillsData?.objects || [],
//         categoryOptions: categoryData?.objects || [],
//         departmentOptions: departmentData?.objects || [],
//         lineOptions: lineData?.objects || [],
//         loadingOptions: false
//       });

//       console.log('✅ All options loaded');
//       return { success: true };
//     } catch (error) {
//       console.error("❌ Error fetching options:", error);
//       set({ loadingOptions: false });
//       return { success: false, error: error.message };
//     }
//   },

//   // PATCH/DELETE operations
//   updateSkillDepartment: async (skillId, department, value) => {
//     const currentSkills = get().skills;
//     const updatedSkills = currentSkills.map(skill =>
//       skill.id === skillId 
//         ? { ...skill, [department]: value }
//         : skill
//     );
    
//     set({ skills: updatedSkills });
    
//     try {
//       const departmentMapping = {
//         'production': 'production_4du',
//         'quality': 'quality_4du',
//         'maintenance': 'maintenance',
//         'heatTreatment': 'heat_treatment'
//       };

//       const backendField = departmentMapping[department];
      
//       const patchData = {
//         cdb_object_id: skillId,
//         [backendField]: value ? 1 : 0
//       };

//       const response = await fetch(API_BASE_URL, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(patchData)
//       });
      
//       if (!response.ok) {
//         throw new Error(`Failed to update: ${response.status}`);
//       }
      
//       const result = await response.json();
//       return { success: true, message: result.message };
      
//     } catch (error) {
//       console.error('❌ Error updating:', error);
//       set({ skills: currentSkills, error: error.message });
//       return { success: false, error: error.message };
//     }
//   },

//   deleteSkill: async (skillId) => {
//     set({ loading: true, error: null });
    
//     try {
//       const deleteData = {
//         cdb_object_id: skillId,
//         is_delete: true
//       };

//       const response = await fetch(API_BASE_URL, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(deleteData)
//       });
      
//       if (!response.ok) {
//         throw new Error(`Failed to delete: ${response.status}`);
//       }
      
//       const result = await response.json();
      
//       set((state) => ({
//         skills: state.skills.filter(s => s.id !== skillId),
//         loading: false
//       }));
      
//       return { success: true, message: result.message };
      
//     } catch (error) {
//       console.error('❌ Error deleting:', error);
//       set({ error: error.message, loading: false });
//       return { success: false, error: error.message };
//     }
//   },

//   // Setters
//   setSelectedDepartment: (department) => set({ selectedDepartment: department }),
//   setSelectedLine: (line) => set({ selectedLine: line }),
//   setSelectedSubDepartments: (subDepts) => set({ selectedSubDepartments: subDepts }),
  
//   toggleSubDepartment: (subDept) => {
//     set((state) => {
//       const isSelected = state.selectedSubDepartments.includes(subDept);
//       return {
//         selectedSubDepartments: isSelected
//           ? state.selectedSubDepartments.filter(sd => sd !== subDept)
//           : [...state.selectedSubDepartments, subDept]
//       };
//     });
//   },

//   toggleAllSubDepartments: () => {
//     set((state) => ({
//       selectedSubDepartments: 
//         state.selectedSubDepartments.length === state.subDepartments.length
//           ? []
//           : [...state.subDepartments]
//     }));
//   },

//   setSelectedLabourNames: (names) => set({ selectedLabourNames: names }),
  
//   toggleLabourName: (labourName) => {
//     set((state) => {
//       const isSelected = state.selectedLabourNames.includes(labourName);
//       return {
//         selectedLabourNames: isSelected
//           ? state.selectedLabourNames.filter(name => name !== labourName)
//           : [...state.selectedLabourNames, labourName]
//       };
//     });
//   },

//   toggleAllLabourNames: () => {
//     set((state) => {
//       const uniqueLabourNames = [
//         ...new Set(
//           state.labourNames
//             .map((item) => item.labour_name)
//             .filter((name) => name && name.trim() !== "")
//         ),
//       ];

//       return {
//         selectedLabourNames: 
//           state.selectedLabourNames.length === uniqueLabourNames.length
//             ? []
//             : uniqueLabourNames
//       };
//     });
//   },

//   setCurrentPage: (page) => set({ currentPage: page }),
  
//   getCurrentPageData: () => {
//     const { filteredLabourData, currentPage, itemsPerPage } = get();
//     const indexOfLastItem = currentPage * itemsPerPage;
//     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//     return filteredLabourData.slice(indexOfFirstItem, indexOfLastItem);
//   },

//   getTotalPages: () => {
//     const { filteredLabourData, itemsPerPage } = get();
//     return Math.ceil(filteredLabourData.length / itemsPerPage);
//   },

// resetModalState: () => {
//   set({
//     selectedDepartment: '',
//     selectedLine: '',
//     subDepartments: [],
//     selectedSubDepartments: [],
//     filteredLabourData: [],
//     labourNames: [],
//     selectedLabourNames: [],
//     skillTypeMap: {},
//     currentPage: 1
//   });
// },

//   setFilters: (newFilters) => {
//     set((state) => ({
//       filters: { ...state.filters, ...newFilters }
//     }));
//   },

//   resetFilters: () => {
//     set({
//       filters: {
//         skillType: 'all',
//         applicability: 'all',
//         searchTerm: ''
//       }
//     });
//   },

//   getFilteredSkills: () => {
//     const { skills, filters } = get();
    
//     return skills.filter(skill => {
//       if (filters.skillType !== 'all' && skill.type !== filters.skillType) 
//         return false;
      
//       if (filters.applicability !== 'all' && skill.applicability !== filters.applicability) 
//         return false;
      
//       if (filters.searchTerm && !skill.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) 
//         return false;
      
//       return true;
//     });
//   },

//   getDepartmentCount: (department) => {
//     const skills = get().skills;
//     return skills.filter(s => s[department]).length;
//   },

//   exportSkills: (format = 'json') => {
//     const skills = get().skills;
    
//     if (format === 'json') {
//       const dataStr = JSON.stringify(skills, null, 2);
//       const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
//       const exportFileDefaultName = `skills_export_${new Date().toISOString()}.json`;
//       const linkElement = document.createElement('a');
//       linkElement.setAttribute('href', dataUri);
//       linkElement.setAttribute('download', exportFileDefaultName);
//       linkElement.click();
//     } else if (format === 'csv') {
//       const headers = ['ID', 'Name', 'Type', 'Applicability', 'Production', 'Quality', 'Maintenance', 'Heat Treatment'];
//       const csvData = skills.map(s => [
//         s.id,
//         s.name,
//         s.type,
//         s.applicability,
//         s.production ? 'Yes' : 'No',
//         s.quality ? 'Yes' : 'No',
//         s.maintenance ? 'Yes' : 'No',
//         s.heatTreatment ? 'Yes' : 'No'
//       ]);
      
//       const csvContent = [
//         headers.join(','),
//         ...csvData.map(row => row.join(','))
//       ].join('\n');
      
//       const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
//       const exportFileDefaultName = `skills_export_${new Date().toISOString()}.csv`;
//       const linkElement = document.createElement('a');
//       linkElement.setAttribute('href', dataUri);
//       linkElement.setAttribute('download', exportFileDefaultName);
//       linkElement.click();
//     }
    
//     return { success: true };
//   },

//   clearData: () => {
//     set({
//       skills: [],
//       loading: false,
//       error: null,
//       totalSkills: 0,
//       functionalCount: 0,
//       criticalCount: 0,
//       genericCount: 0,
//       departments: [],
//       lines: [],
//       subDepartments: [],
//       labourNames: [],
//       selectedLabourNames: [],
//       selectedDepartment: '',
//       selectedLine: '',
//       selectedSubDepartments: [],
//       filteredLabourData: [],
//       currentPage: 1
//     });
//   },

//   initializeMockData: () => {
//     console.log('initializeMockData called - Use fetchSkills() instead');
//   }
// }));