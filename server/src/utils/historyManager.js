export const getRelevantHistory = (
  history,
  firstCount = 20,
  recentCount = 10
) => {
  if (history.length <= firstCount + recentCount) {
    return history;
  }

  const firstMessages = history.slice(0, firstCount);

  const recentMessages = history.slice(-recentCount);

  return [...firstMessages, ...recentMessages];
};

