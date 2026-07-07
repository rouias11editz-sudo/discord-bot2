const OpenAI = require("openai");

const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "https://github.com/rouias11editz-sudo/discord-bot2",
        "X-OpenRouter-Title": "Cortisol Bot"
    }
});

async function moderateConfession(text) {

    try {

        const completion = await client.chat.completions.create({

            model: "qwen/qwen3-30b-a3b:free",

            messages: [
                {
                    role: "system",
                    content: `You are a Discord moderation AI.

Return ONLY valid JSON.

{
"flagged":true,
"severity":"LOW",
"confidence":80,
"reason":"Possible self harm"
}

Flag:
- suicide only if they plan doing it
- excessive self harm
- hate speech towards a group of people
- threats
- grooming
- sexual exploitation

Do NOT flag:
- normal venting
- sadness
- relationship problems`
                },
                {
                    role: "user",
                    content: text
                }
            ]

        });

        return JSON.parse(
            completion.choices[0].message.content
        );

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
