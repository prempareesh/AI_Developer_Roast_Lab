const { OpenAI } = require('openai');
require('dotenv').config();

const nvidiaClient = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

async function main() {
    try {
        const completion = await nvidiaClient.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a helpful assistant. Reply in JSON: {"reply": "..."}' },
                { role: 'user', content: 'Say hello world \n\n' }
            ],
            model: 'meta/llama3-8b-instruct',
            temperature: 0.9,
            response_format: { type: 'json_object' }
        });
        console.log("SUCCESS:");
        console.log(completion.choices[0].message.content);
    } catch (e) {
        console.error("ERROR:");
        console.error(e.message);
    }
}
main();
