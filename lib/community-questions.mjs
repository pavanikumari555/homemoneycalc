const topics = [
  ["mortgage-payoff-calculator", /\bmortgage\b.*\b(extra|payoff|pay off|early|prepay)/i,
    "Compare your existing payoff schedule with one that adds extra principal. Use the same balance, rate and remaining term in both scenarios, then compare payoff dates and total interest. Check how your servicer applies extra payments."],
  ["credit-card-payoff-calculator", /\bcredit card\b.*\b(debt|balance|payoff|pay off|minimum payment)/i,
    "Use your current balance, APR and monthly payment to estimate your payoff date. Compare the same starting balance with a higher payment you can sustain. Leave new charges out of this comparison."],
  ["auto-loan-calculator", /\b(car|auto|vehicle) loan\b|\bcar financing\b/i,
    "Compare the amount financed, APR and term for each loan. Include any taxes and fees rolled into the loan. Look at total interest and total payments alongside the monthly payment."],
];

export function normalizeQuestionUrl(value) {
  if (typeof value !== "string" || value.length > 1000) throw new Error("Enter a Reddit or Quora question link.");
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.port) throw new Error("Use a public HTTPS question URL.");
  if (["reddit.com", "www.reddit.com", "old.reddit.com"].includes(url.hostname)) {
    const match = /^\/(?:r\/[a-z0-9_]+\/)?comments\/([a-z0-9]+)(?:\/|$)/i.exec(url.pathname);
    if (match) return "https://www.reddit.com/comments/" + match[1].toLowerCase() + "/";
  }
  if (["quora.com", "www.quora.com"].includes(url.hostname)) {
    const match = /^\/(?:unanswered\/)?([a-z0-9][a-z0-9-]*-[a-z0-9-]+)(?:\/|$)/i.exec(url.pathname);
    if (match) return "https://www.quora.com/" + match[1];
  }
  throw new Error("Use a Reddit post or Quora question link.");
}

export function prepareQuestion(input) {
  const url = normalizeQuestionUrl(input.url);
  const question = typeof input.question === "string" ? input.question.trim() : "";
  const context = typeof input.context === "string" ? input.context.trim() : "";
  if (!question || question.length > 500 || context.length > 4000) throw new Error("Enter a question up to 500 characters and context up to 4,000 characters.");
  const topic = topics.find(([, pattern]) => pattern.test(question + " " + context));
  const answer = context ? topic?.[2] ?? "" : "";
  return { url, question, context, tool: topic?.[0] ?? "", answer, status: answer ? "review" : "needs_context" };
}
