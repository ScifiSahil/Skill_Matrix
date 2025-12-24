export const testAPI = {
  createTest: async (test) => {
    const res = await fetch("http://localhost:8080/api/v1/collection/hr_tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(test),
    });
    return res.json();
  },

  createQuestion: async (question) => {
    const res = await fetch("http://localhost:8080/api/v1/collection/hr_questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(question),
    });
    return res.json();
  },

  createOption: async (triples) => {
  const res = await fetch("http://localhost:8080/api/v1/collection/hr_options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(triples),
  });
  return res.json();
},


  
};
