const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function moderateConfession(text) {
    try {

        const response = await client.responses.create({
            model: "gpt-4.1-mini",
            input: `
You are a Discord moderation AI.

Analyze this anonymous confession.

Determine if moderators should be alerted.

Return ONLY valid JSON.

{
"flagged": true,
"severity":"LOW",
"confidence":85,
"reason":"Possible self harm"
}

Rules:

Flag if:
- Credible self harm
- Suicide risk
- Threats
- Hate speech/slurs
- Grooming
- Sexual exploitation
- Violence
- Criminal activity

DO NOT flag:
- Normal venting
- Breakups
- Depression without danger
- Swearing
- Relationship problems
- General sadness

Severity must be:
LOW
MEDIUM
HIGH
CRITICAL

Confession:

${text}
`
        });

        const result = JSON.parse(response.output_text);

        return result;

    } catch (err) {

        console.error(err);

        return {
            flagged: false,
            severity: "LOW",
            confidence: 0,
            reason: "AI unavailable"
        };

    }
}

module.exports = {
    moderateConfession
};
