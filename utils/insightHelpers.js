exports.analyzeTechnologies = (jobs) => {
  const skillStats = {};
  jobs.forEach((job) => {
    (job.skills || []).forEach((skill) => {
      if (!skillStats[skill]) {
        skillStats[skill] = { name: skill, total: 0, success: 0 };
      }
      skillStats[skill].total++;
      if (job.status === "Success") {
        skillStats[skill].success++;
      }
    });
  });
  // Calculate success rate
  return Object.values(skillStats).map((stat) => ({
    ...stat,
    successRate: stat.total ? stat.success / stat.total : 0,
  }));
};

exports.analyzeStatusChanges = (jobs) => {
  let transitions = {
    Pending: {
      "In Process": 0,
      Rejected: 0,
      Success: 0,
    },
    "In Process": {
      Rejected: 0,
      Success: 0,
      Pending: 0,
    },
    Rejected: {
      Success: 0,
      "In Process": 0,
      Pending: 0,
    },
    Success: {
      Rejected: 0,
      "In Process": 0,
      Pending: 0,
    },
  };

  jobs.forEach((job) => {
    if (Array.isArray(job.statusHistory) && job.statusHistory.length > 1) {
      for (let i = 1; i < job.statusHistory.length; i++) {
        const prev = job.statusHistory[i - 1];
        const curr = job.statusHistory[i];

        if (
          transitions[prev.status] &&
          transitions[prev.status][curr.status] !== undefined
        ) {
          transitions[prev.status][curr.status]++;
        }
      }
    }
  });
  return transitions;
};

exports.generateSuggestions = (techStats, statusChanges) => {
  const suggestions = [];
  if (techStats.length) {
    const sorted = [...techStats].sort((a, b) => b.successRate - a.successRate);
    if (sorted[0].successRate > 0) {
      suggestions.push(
        `You are most successful with "${sorted[0].name}" skills. Focus more on these for better results.`
      );
    }
    if (sorted[sorted.length - 1].successRate < 0.2) {
      suggestions.push(
        `Consider improving your skills in "${
          sorted[sorted.length - 1].name
        }" as your success rate is low.`
      );
    }
  }
  if (statusChanges && statusChanges.Pending) {
    const total = Object.values(statusChanges.Pending).reduce(
      (a, b) => a + b,
      0
    );
    if (total === 0) {
      suggestions.push(
        "No status transitions from Pending yet. Try following up on your applications."
      );
    } else {
      if (statusChanges.Pending.Success > 0) {
        suggestions.push(
          `Congratulations! ${statusChanges.Pending.Success} of your applications moved to Success.`
        );
      }
      if (statusChanges.Pending.Rejected > 0) {
        suggestions.push(
          `${statusChanges.Pending.Rejected} applications were rejected. Review those job requirements and improve accordingly.`
        );
      }
    }
  }
  if (!suggestions.length)
    suggestions.push(
      "Keep applying and updating your skills for better results!"
    );
  return suggestions;
};
