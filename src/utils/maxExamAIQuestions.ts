const maxExamAIQuestions = (firstTime: boolean, tokens?: number) => {
  if (!firstTime && tokens !== undefined) {
    const max = Number((tokens / 300).toFixed(0));
    if (max > 25) {
      return 25;
    }
    return max;
  } else {
    return 5;
  }
};

export { maxExamAIQuestions };
