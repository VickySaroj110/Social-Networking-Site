import axios from "axios";

// ✅ Google Fact Check API
async function googleFactCheck(text) {
  try {
    const res = await axios.get(
      "https://factchecktools.googleapis.com/v1alpha1/claims:search",
      {
        params: {
          query: text,
          key: process.env.GOOGLE_FACT_KEY,
        },
      }
    );

    // If claims found → potentially misleading
    return res.data.claims && res.data.claims.length > 0;
  } catch (error) {
    console.error("Google Fact Check error:", error.message);
    return false;
  }
}

// ✅ ClaimBuster API - Check claim score
async function claimBusterCheck(text) {
  try {
    const res = await axios.post(
      "https://idir.uta.edu/claimbuster/api/v2/score/text/",
      { text },
      {
        headers: { "x-api-key": process.env.CLAIMBUSTER_KEY },
        timeout: 5000,
      }
    );

    // Return score (0-1)
    if (res.data.results && res.data.results[0]) {
      return res.data.results[0].score;
    }
    return 0;
  } catch (error) {
    console.error("ClaimBuster error:", error.message);
    return 0;
  }
}

// ✅ MAIN LOGIC - Decide TRUE/FALSE
function getVerdict(isFactChecked, claimScore) {
  // If found in fact-check database → FALSE (misleading)
  if (isFactChecked) return "FALSE";

  // If ClaimBuster score is high → FALSE (suspicious claim)
  if (claimScore > 0.6) return "FALSE";

  // Otherwise → TRUE (not misleading)
  return "TRUE";
}

// ✅ EXPORT Main Function
export async function checkTweetVerdict(text) {
  try {
    // Run both checks in parallel
    const [isFactChecked, claimScore] = await Promise.all([
      googleFactCheck(text),
      claimBusterCheck(text),
    ]);

    // Determine verdict
    const verdict = getVerdict(isFactChecked, claimScore);

    return verdict;
  } catch (error) {
    console.error("checkTweetVerdict error:", error);
    return "TRUE"; // Default to TRUE on error
  }
}
