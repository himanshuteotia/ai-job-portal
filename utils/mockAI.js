exports.mockAITechnologyExtraction = (jobDescription) => {
  // This is a mock function. In a real scenario, you'd use AI to extract technologies.
  const commonTechnologies = [
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "React",
    "Node.js",
    "SQL",
  ];
  return commonTechnologies.filter(() => Math.random() > 0.5);
};

exports.mockAIExperienceExtraction = (jobDescription) => {
  // This is a mock function. In a real scenario, you'd use AI to extract experience required.
  return Math.floor(Math.random() * 10) + 1; // Returns a random number between 1 and 10
};
