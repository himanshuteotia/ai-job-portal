exports.mockAITechnologyExtraction = (jobDescription) => {
  const techStack = [
    "Node.js",
    "React",
    "MongoDB",
    "Express.js",
    "Python",
    "Java",
    "AWS",
  ];
  return techStack.filter(() => Math.random() > 0.5);
};

exports.mockAIExperienceExtraction = (jobDescription) => {
  const experiences = [1, 2, 3, 4, 5];
  return experiences[Math.floor(Math.random() * experiences.length)];
};
