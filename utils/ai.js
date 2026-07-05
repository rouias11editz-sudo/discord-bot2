const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function moderateConfession(text) {
    try {
        const response = await openai.moderations.create({
            model: "omni-moderation-latest",
            input: text
        });

        const result = response.results[0];
        const categories = result.categories;
        const scores = result.category_scores;

        let severity = "LOW";
        let reason = "No issues detected";
        let confidence = 0;

        const check = (name, score, level) => {
            if (score > confidence) {
                confidence = score;
                reason = name;
                severity = level;
            }
        };

        if (categories.self_harm)
            check("Possible self-harm", scores.self_harm, "HIGH");

        if (categories.harassment)
            check("Harassment", scores.harassment, "MEDIUM");

        if (categories.hate)
            check("Hate Speech / Slurs", scores.hate, "HIGH");

        if (categories.sexual)
            check("Sexual Content", scores.sexual, "MEDIUM");

        if (categories.violence)
            check("Violence", scores.violence, "HIGH");

        if (categories.illicit)
            check("Illegal Activity", scores.illicit, "HIGH");

        return {
            flagged: result.flagged,
            severity,
            reason,
            confidence: Math.round(confidence * 100)
        };

    } catch (err) {
        console.error(err);

        return {
            flagged: false,
            severity: "LOW",
            reason: "Moderation API Error",
            confidence: 0
        };
    }
}

module.exports = {
    moderateConfession
};
