const { OpenAI } = require('openai');
const Groq = require('groq-sdk');

const provider = process.env.AI_PROVIDER || 'antigravity';

let openaiClient = null;
let groqClient = null;
let nvidiaClient = null;
let antigravityClient = null;

// Initialize clients based on provider
if (process.env.ANTIGRAVITY_API_KEY) {
    antigravityClient = new OpenAI({
        apiKey: process.env.ANTIGRAVITY_API_KEY,
        baseURL: 'https://api.antigravity.ai/v1'
    });
}

if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else if (provider === 'groq' && process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
} else if (provider === 'nvidia' && process.env.NVIDIA_API_KEY) {
    nvidiaClient = new OpenAI({
        apiKey: process.env.NVIDIA_API_KEY,
        baseURL: 'https://integrate.api.nvidia.com/v1',
    });
}

/**
 * Safely parses JSON containing unescaped control characters (like newlines inside strings)
 * which frequently breaks standard JSON.parse() on responses from models like Llama3.
 */
const safeJSONParse = (content) => {
    try {
        return JSON.parse(content);
    } catch (e) {
        // Fallback: Manually escape newlines inside double quotes
        let inString = false;
        let escaped = false;
        let newContent = '';
        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            if (char === '"' && !escaped) inString = !inString;

            if (char === '\\' && !escaped) escaped = true;
            else escaped = false;

            if (inString && (char === '\n' || char === '\r' || char === '\t')) {
                if (char === '\n') newContent += '\\n';
                else if (char === '\r') newContent += '\\r';
                else if (char === '\t') newContent += '\\t';
            } else {
                newContent += char;
            }
        }
        return JSON.parse(newContent);
    }
};

/**
 * Generates the roast using the configured AI provider
 * @param {Object} profileData 
 * @param {Object} repoStats 
 * @returns {Promise<Object>}
 */
const generateRoastFromAI = async (profileData, repoStats) => {
    // Determine which client to use
    let useAntigravity = !!antigravityClient;
    let useOpenAI = !!openaiClient;
    let useGroq = !!groqClient;
    let useNvidia = !!nvidiaClient;

    if (provider === 'antigravity' && useAntigravity) {
        useOpenAI = false;
        useGroq = false;
        useNvidia = false;
    } else if (provider === 'nvidia' && useNvidia) {
        useAntigravity = false;
        useOpenAI = false;
        useGroq = false;
    } else if (provider === 'groq' && useGroq) {
        useAntigravity = false;
        useOpenAI = false;
        useNvidia = false;
    } else if (provider === 'openai' && useOpenAI) {
        useAntigravity = false;
        useGroq = false;
        useNvidia = false;
    }

    if (!useAntigravity && !useOpenAI && !useGroq && !useNvidia) {
        // Mock fallback if user hasn't setup keys yet, to allow frontend development to proceed
        return getMockRoastFallback(profileData, repoStats);
    }

    const systemPrompt = `You are an expert developer with a merciless but funny sense of humor. Your job is to analyze a developer's GitHub profile stats and give a highly entertaining, brutally honest "roast" of their coding habits. 

CRITICAL: You MUST make every single roast UNIQUE. Heavily tailor your insults to their specific username, their exact bio, the weird combination of their top languages, and the sample repositories provided. Do NOT use generic templates. Vary your tone, structure, and jokes every single time. Surprise me. 
Also, be sure to use plenty of relevant and funny emojis throughout the roast to make it more expressive! 🤡🔥💀

After the roast, provide 3 actionable, constructive suggestions to improve their profile, career, or coding practices.

Format your response as a JSON object with the following exact structure:
{
  "roast": "The funny, hyper-personalized roast message (2-3 paragraphs)",
  "suggestions": [
    "Suggestion 1",
    "Suggestion 2",
    "Suggestion 3"
  ],
  "score": {
    "codeActivity": 6,
    "projectOriginality": 4,
    "consistency": 3,
    "finalScore": 4.3,
    "verdict": "Your GitHub looks like a graveyard of half-finished side projects."
  }
}`;

    const langNames = Object.keys(repoStats.languageDistribution).join(', ') || 'None';

    const userPrompt = `
Analyze this GitHub profile:
Username: ${profileData.login}
Name: ${profileData.name || 'Unknown'}
Bio: ${profileData.bio || 'None'}
Followers: ${profileData.followers}
Following: ${profileData.following}
Public Repos: ${profileData.public_repos}

Repository Analytics (excluding forks):
Total Original Repos: ${repoStats.originalRepoCount}
Total Stars Received: ${repoStats.totalStars}
Total Forks Received: ${repoStats.totalForks}
Top Languages Used: ${langNames}
Sample Repo Names: ${repoStats.sampleRepos.join(', ')}
`;

    try {
        let content = '';

        if (useAntigravity) {
            const completion = await antigravityClient.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'antigravity-roast-v1',
                temperature: 0.9,
                response_format: { type: 'json_object' }
            });
            content = completion.choices[0].message.content;
        } else if (useNvidia) {
            const completion = await nvidiaClient.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'meta/llama3-70b-instruct',
                temperature: 0.9,
                response_format: { type: 'json_object' }
            });
            content = completion.choices[0].message.content;
        } else if (useGroq) {
            const completion = await groqClient.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'mixtral-8x7b-32768',
                temperature: 0.9,
                response_format: { type: 'json_object' }
            });
            content = completion.choices[0].message.content;
        } else {
            const completion = await openaiClient.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'gpt-4-turbo',
                temperature: 0.9,
                response_format: { type: 'json_object' }
            });
            content = completion.choices[0].message.content;
        }

        return safeJSONParse(content);

    } catch (error) {
        console.error('AI API Error:', error);
        throw new Error('Failed to generate roast from AI provider.');
    }
};

const getMockRoastFallback = (profile, stats) => {
    console.warn('WARNING: No AI API keys configured. Returning mock roast data.');
    const topLang = Object.keys(stats.languageDistribution)[0] || 'Nothing';

    const templates = [
        {
            roast: `Ah, ${profile.login}, I see you have ${stats.originalRepoCount} original repos. Wow. It's almost as if you start a new project every time you learn a print statement in ${topLang}. You have ${stats.totalStars} stars, which I assume are all from your alternate accounts and maybe your mom. Truly, a mastermind of pushing code that runs "on your machine".`,
            suggestions: [
                "Write a proper README for at least ONE of your repositories.",
                "Try committing code more than once every six months.",
                "Stop forking tutorials and passing them off as personal projects."
            ],
            score: {
                codeActivity: 2,
                projectOriginality: 3,
                consistency: 1,
                finalScore: 2.0,
                verdict: "A mastermind of pushing code that runs only 'on your machine'."
            }
        },
        {
            roast: `Looking at ${profile.login}'s profile is like looking at a museum of abandoned ideas. ${stats.originalRepoCount} repos, and I bet most of them are just "Hello World" in ${topLang}. With exactly ${stats.totalStars} stars, the community has clearly spoken: your code is as inspiring as a wet paper towel. Your bio "${profile.bio || 'None'}" screams "I copy paste from StackOverflow".`,
            suggestions: [
                "Finish a project before starting a new one.",
                "Learn git rebase instead of 50 consecutive 'update' commits.",
                "Maybe try a language other than your comfort zone."
            ],
            score: {
                codeActivity: 4,
                projectOriginality: 2,
                consistency: 3,
                finalScore: 3.0,
                verdict: "Your GitHub looks like a graveyard of half-finished side projects."
            }
        },
        {
            roast: `Welcome, ${profile.login}. I see you're proudly rocking ${stats.originalRepoCount} repos. It takes true dedication to write that much ${topLang} code that nobody uses. I mean, ${stats.totalStars} stars? Even accidentally hitting the star button happens more often than that. Between the forks you've collected and your ghost town of a contribution graph, it's a miracle GitHub hasn't archived your account.`,
            suggestions: [
                "Clean up your empty repos from 3 years ago.",
                "Write some tests. Just one. Please.",
                "Open source doesn't mean 'open to being ignored'."
            ],
            score: {
                codeActivity: 3,
                projectOriginality: 1,
                consistency: 2,
                finalScore: 2.0,
                verdict: "It's a miracle GitHub hasn't archived your account."
            }
        },
        {
            roast: `Well well well, if it isn't ${profile.login}. With a bio like "${profile.bio || 'None'}", you'd think we were dealing with a 10x developer. But then we see the ${stats.originalRepoCount} repos made mostly of ${topLang} spaghetti. ${stats.totalStars} stars is cute. Did you bribe your Discord friends? I've seen more impressive code written by a cat walking across a keyboard.`,
            suggestions: [
                "Stop using 'asdfghjkl' as a commit message.",
                "Your node_modules folder should not be pushed to GitHub.",
                "Actually document your APIs."
            ],
            score: {
                codeActivity: 5,
                projectOriginality: 4,
                consistency: 5,
                finalScore: 4.7,
                verdict: "I've seen more impressive code written by a cat walking across a keyboard."
            }
        },
        {
            roast: `${profile.login}... The hero we didn't ask for, and the coder we don't need. ${stats.originalRepoCount} repos of pure, unadulterated "it compiles so I pushed it". You have ${stats.totalStars} stars, proving that the internet is full of generous souls. Your reliance on ${topLang} is starting to look like a hostage situation. Let the language go, it deserves better.`,
            suggestions: [
                "Learn to read documentation instead of guessing.",
                "A 500-line function is not a 'feature'.",
                "Start writing code that actually solves a problem."
            ],
            score: {
                codeActivity: 6,
                projectOriginality: 3,
                consistency: 4,
                finalScore: 4.3,
                verdict: "The hero we didn't ask for, and the coder we don't need."
            }
        }
    ];

    return templates[Math.floor(Math.random() * templates.length)];
};

const generateLinkedInRoastFromAI = async (linkedinData) => {
    let useAntigravity = !!antigravityClient;
    let useOpenAI = !!openaiClient;
    let useGroq = !!groqClient;
    let useNvidia = !!nvidiaClient;

    if (provider === 'antigravity' && useAntigravity) {
        useOpenAI = false;
        useGroq = false;
        useNvidia = false;
    } else if (provider === 'nvidia' && useNvidia) {
        useAntigravity = false;
        useOpenAI = false;
        useGroq = false;
    } else if (provider === 'groq' && useGroq) {
        useAntigravity = false;
        useOpenAI = false;
        useNvidia = false;
    } else if (provider === 'openai' && useOpenAI) {
        useAntigravity = false;
        useGroq = false;
        useNvidia = false;
    }

    if (!useAntigravity && !useOpenAI && !useGroq && !useNvidia) {
        const templates = [
            {
                summary: "Your profile reads like a generic buzzword salad generated by a faulty corporate bot.",
                mainRoast: [
                    "You've been a 'passionate learner' since 2019 but your skills still look like the Java tutorial table of contents.",
                    "Frankly, your entire profile reads like someone threw a dictionary of tech buzzwords into a blender and poured it onto a page. I don't know who you are trying to impress with 'synergistic paradigm shifts', but it is definitely not working.",
                    "It's time to realize that endorsing your friends for 'Microsoft Word' is not going to get either of you a job. At this point, even the LinkedIn algorithm probably scrolls past your posts."
                ],
                analysis: {
                    strengths: ["You managed to spell 'Software Engineer' correctly.", "You have an active pulse."],
                    weaknesses: ["Too many buzzwords without substance.", "Lack of measurable achievements.", "Generic LinkedIn headline."]
                },
                advice: [
                    "Replace generic phrases with measurable results.",
                    "Add real projects solving real problems.",
                    "Write a stronger LinkedIn headline that isn't 'Aspiring Developer'."
                ],
                closingRoast: "If your code is as structured as your career history, I feel sorry for your compiler."
            },
            {
                summary: "Ah, the 'Tech Enthusiast' who hasn't opened an IDE since college.",
                mainRoast: [
                    "Your latest 'certification' is from a free YouTube course that takes 30 minutes to complete. The fact that you devoted 3 paragraphs to describe how it fundamentally shifted your engineering paradigm is frankly concerning.",
                    "Your experience lists exactly 4 roles in the last 2 years. Job hopping is fine, but you seem to be speedrunning the probation periods.",
                    "Why do you have 'Visionary' in your headline? The only thing you're envisioning is the weekend."
                ],
                analysis: {
                    strengths: ["You're very confident.", "Great use of emojis in professional settings."],
                    weaknesses: ["Head in the clouds.", "Short tenures everywhere.", "Certifications that aren't actually certs."]
                },
                advice: [
                    "Stick around long enough at a job to push to production.",
                    "Remove 'Visionary' from your headline immediately.",
                    "Focus on technical delivery rather than thought leadership."
                ],
                closingRoast: "Your whole profile looks like a 404 error wrapped in a suit."
            },
            {
                summary: "Welcome to the echo chamber of unoriginal thought leadership.",
                mainRoast: [
                    "Oh great, another '10x Developer who loves to disrupt'. The only thing you're disrupting is the HR department's patience.",
                    "In 4 years you've claimed to master exactly 48 different technologies. Either you're the literal reincarnation of Alan Turing, or you just list every tool your company's Slack workspace has an integration for.",
                    "And no, winning a local university hackathon 7 years ago is not the cornerstone of your professional identity anymore."
                ],
                analysis: {
                    strengths: ["You know the names of a LOT of technologies.", "You update your profile frequently."],
                    weaknesses: ["Keyword stuffing to the extreme.", "Living in the past.", "Pretentious tone."]
                },
                advice: [
                    "Pick a primary stack and actually learn it deeply.",
                    "No one cares about your hackathon from a decade ago.",
                    "Stop reposting motivational quotes."
                ],
                closingRoast: "You're a master of none, but a junior of all."
            }
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    const systemPrompt = `You are a brutally honest but funny senior tech recruiter and software engineer reviewing developer profiles.
Your task is to generate a detailed and entertaining roast of the provided profile while also giving useful career advice.

STYLE RULES
* Be sarcastic but not abusive.
* Make the roast funny and relatable for developers.
* Use multiple sections.
* Output must be engaging enough that users want to share it on LinkedIn.
* Avoid repeating generic lines.
* Use plenty of relevant and funny emojis throughout the roast to make it more expressive! 🤡🔥💀

OUTPUT STRUCTURE
Return the response in this exact JSON format:
{
  "summary": "A short funny paragraph summarizing the overall profile.",
  "mainRoast": [
    "Write 3-5 roast paragraphs criticizing overused buzzwords, weak achievements, lack of real projects, generic resume phrases, empty tutorial projects. Make each witty and slightly sarcastic as an item in this array."
  ],
  "analysis": {
    "strengths": ["Mention 2 things the profile does well"],
    "weaknesses": ["Mention 3-5 things that look weak or generic"]
  },
  "advice": [
    "Provide 4-6 actionable improvement suggestions"
  ],
  "closingRoast": "End with one very funny closing roast sentence that developers would laugh at."
}

IMPORTANT: The response must be detailed and at least 180-250 words long in total across the fields.`;

    const userPrompt = `Profile:
${linkedinData}`;

    try {
        let content = '';

        if (useAntigravity) {
            const completion = await antigravityClient.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'antigravity-roast-v1',
                temperature: 0.9,
                response_format: { type: 'json_object' }
            });
            content = completion.choices[0].message.content;
        } else if (useNvidia) {
            const completion = await nvidiaClient.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'meta/llama3-70b-instruct',
                temperature: 0.9,
                response_format: { type: 'json_object' }
            });
            content = completion.choices[0].message.content;
        } else if (useGroq) {
            const completion = await groqClient.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'mixtral-8x7b-32768',
                temperature: 0.9,
                response_format: { type: 'json_object' }
            });
            content = completion.choices[0].message.content;
        } else {
            const completion = await openaiClient.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'gpt-4-turbo',
                temperature: 0.9,
                response_format: { type: 'json_object' }
            });
            content = completion.choices[0].message.content;
        }

        return safeJSONParse(content);
    } catch (error) {
        console.error('LinkedIn AI API Error:', error);
        throw new Error('Failed to generate LinkedIn roast from AI provider.');
    }
};

const generateResumeRoastFromAI = async (resumeData) => {
    let useAntigravity = !!antigravityClient;
    let useOpenAI = !!openaiClient;
    let useGroq = !!groqClient;
    let useNvidia = !!nvidiaClient;

    if (provider === 'antigravity' && useAntigravity) {
        useOpenAI = false;
        useGroq = false;
        useNvidia = false;
    } else if (provider === 'nvidia' && useNvidia) {
        useAntigravity = false;
        useOpenAI = false;
        useGroq = false;
    } else if (provider === 'groq' && useGroq) {
        useAntigravity = false;
        useOpenAI = false;
        useNvidia = false;
    } else if (provider === 'openai' && useOpenAI) {
        useAntigravity = false;
        useGroq = false;
        useNvidia = false;
    }

    if (!useAntigravity && !useOpenAI && !useGroq && !useNvidia) {
        const templates = [
            {
                summary: "Your resume reads like every template on the internet decided to collaborate.",
                mainRoast: [
                    "Your 'team player with leadership skills' line appears on 8 million resumes.",
                    "Listing HTML and CSS as your top technical skills in 2026 is like bragging that you know how to breathe. And honestly, no one cares that you were 'Captain of the Intramural Volleyball Team' when you're applying for a backend systems role.",
                    "Your objective statement is so spectacularly vague it could apply to a sandwich artist or a CEO. 'Looking for a challenging role where I can utilize my skills to impact the company'. So inspiring."
                ],
                analysis: {
                    strengths: ["You used a readable font.", "The file format was correct."],
                    weaknesses: ["Zero quantifiable metrics.", "Too much white space padding.", "Unrelated hobbies listed.", "Generic objective statement."]
                },
                advice: [
                    "Add measurable achievements instead of generic phrases.",
                    "Remove the 'Objective' section. Everyone's objective is to get a job.",
                    "Focus on the actual tech stack you used for those vague 'implemented a feature' bullet points.",
                    "Drop the 5-star skill ratings, nobody believes you are a 5/5 in Python."
                ],
                closingRoast: "Your resume is so generic I could use it to apply for a job at a paper company and they wouldn't notice the difference."
            },
            {
                summary: "Ah yes, the classic '3-page novel' disguised as a Resume.",
                mainRoast: [
                    "Why is this three pages long? You have 2 years of experience. Did you document every bathroom break as a 'strategic operational pivot'?",
                    "Under 'Projects', you have 'Calculator App' and 'To-Do List'. Groundbreaking. I'm sure FAANG is fighting over who gets to hire the mastermind behind basic loop structures.",
                    "Also, rating your own skills with little progress bars is not just clinically insane, but also mathematically meaningless. You're an '80% in React'? What does that even mean?"
                ],
                analysis: {
                    strengths: ["Attention to extreme, unnecessary detail.", "You definitely know how to type on a keyboard."],
                    weaknesses: ["Way too long.", "Meaningless skill progress bars.", "Basic tutorial projects listed as experience."]
                },
                advice: [
                    "Cut this down to a single page. Immediately.",
                    "Remove the arbitrary skill rating charts.",
                    "Only list projects that solve an actual problem, not a code-along."
                ],
                closingRoast: "Your resume doesn't need a recruiter, it needs an editor."
            },
            {
                summary: "This looks like it was designed by a graphic designer who hates reading.",
                mainRoast: [
                    "There are so many columns, icons, and colors here that I feel like I'm reading an infographic for a startup energy drink.",
                    "You listed 'Detail Oriented' right beneath a bullet point that is missing a period and has a glaring spelling mistake. The irony is thicker than your margins.",
                    "I see you included a headshot. Pro tip: smelling the camera doesn't make you look professional, it just makes me uncomfortable."
                ],
                analysis: {
                    strengths: ["Visually striking.", "You figured out how to use Canva."],
                    weaknesses: ["Form over function.", "Spelling errors.", "Unprofessional photo inclusion.", "Hard for ATS to parse."]
                },
                advice: [
                    "Switch to a standard, single-column text format.",
                    "Run spellcheck. Honestly, just do it.",
                    "Remove the photo. This isn't Tinder."
                ],
                closingRoast: "This isn't a resume, it's a warning label."
            }
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    const systemPrompt = `You are a brutally honest but funny senior tech recruiter and software engineer reviewing developer profiles.
Your task is to generate a detailed and entertaining roast of the provided profile / resume while also giving useful career advice.

STYLE RULES
* Be sarcastic but not abusive.
* Make the roast funny and relatable for developers.
* Use multiple sections.
* Output must be engaging enough that users want to share it on LinkedIn.
* Avoid repeating generic lines.
* Use plenty of relevant and funny emojis throughout the roast to make it more expressive! 🤡🔥💀

OUTPUT STRUCTURE
Return the response in this exact JSON format:
{
  "summary": "A short funny paragraph summarizing the overall profile.",
  "mainRoast": [
    "Write 3-5 roast paragraphs criticizing overused buzzwords, weak achievements, lack of real projects, generic resume phrases, empty tutorial projects. Make each witty and slightly sarcastic as an item in this array."
  ],
  "analysis": {
    "strengths": ["Mention 2 things the profile does well"],
    "weaknesses": ["Mention 3-5 things that look weak or generic"]
  },
  "advice": [
    "Provide 4-6 actionable improvement suggestions"
  ],
  "closingRoast": "End with one very funny closing roast sentence that developers would laugh at."
}

IMPORTANT: The response must be detailed and at least 180-250 words long in total across the fields.`;

    const userPrompt = `Resume Content:
${resumeData.substring(0, 3000)}`;

    try {
        let content = '';

        if (useAntigravity) {
            const completion = await antigravityClient.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'antigravity-roast-v1',
                temperature: 0.9,
                response_format: { type: 'json_object' }
            });
            content = completion.choices[0].message.content;
        } else if (useNvidia) {
            const completion = await nvidiaClient.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'meta/llama3-70b-instruct',
                temperature: 0.9,
                response_format: { type: 'json_object' }
            });
            content = completion.choices[0].message.content;
        } else if (useGroq) {
            const completion = await groqClient.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'mixtral-8x7b-32768',
                temperature: 0.9,
                response_format: { type: 'json_object' }
            });
            content = completion.choices[0].message.content;
        } else {
            const completion = await openaiClient.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'gpt-4-turbo',
                temperature: 0.9,
                response_format: { type: 'json_object' }
            });
            content = completion.choices[0].message.content;
        }

        return safeJSONParse(content);
    } catch (error) {
        console.error('Resume AI API Error:', error);
        throw new Error('Failed to generate Resume roast from AI provider.');
    }
};

const generateRoastBattleFromAI = async (u1Profile, u1Stats, u2Profile, u2Stats) => {
    let useAntigravity = !!antigravityClient;
    let useOpenAI = !!openaiClient;
    let useGroq = !!groqClient;
    let useNvidia = !!nvidiaClient;

    if (provider === 'antigravity' && useAntigravity) {
        useOpenAI = false;
        useGroq = false;
        useNvidia = false;
    } else if (provider === 'nvidia' && useNvidia) {
        useAntigravity = false;
        useOpenAI = false;
        useGroq = false;
    } else if (provider === 'groq' && useGroq) {
        useAntigravity = false;
        useOpenAI = false;
        useNvidia = false;
    } else if (provider === 'openai' && useOpenAI) {
        useAntigravity = false;
        useGroq = false;
        useNvidia = false;
    }

    if (!useAntigravity && !useOpenAI && !useGroq && !useNvidia) {
        // Pick winner based on stars or repos even in mock
        const score1 = (u1Stats.totalStars * 5) + u1Stats.originalRepoCount;
        const score2 = (u2Stats.totalStars * 5) + u2Stats.originalRepoCount;
        const winner = score1 >= score2 ? u1Profile.login : u2Profile.login;
        const loser = score1 >= score2 ? u2Profile.login : u1Profile.login;

        return {
            winner: winner,
            reason: `${winner} dominates because ${loser}'s GitHub looks like a tutorial graveyard with ${score1 >= score2 ? u2Stats.originalRepoCount : u1Stats.originalRepoCount} barely-touched repos.`,
            roast1: `${u1Profile.login} looks like they wrote all their code in Notepad.`,
            roast2: `${u2Profile.login} seems to copy-paste most tutorials on YouTube.`
        };
    }

    const systemPrompt = `You are an expert developer and brutally honest judge. Analyze two GitHub profiles and declare a WINNER in a 'roast battle'. 
    
    IMPORTANT: The "winner" is the BETTER, more IMPRESSIVE developer. The "loser" is the one who gets roasted harder for their poor stats or bad coding habits. 

    Make the verdict funny, slightly brutal, but clear. Give a customized short roast for each developer too.
    Be sure to use plenty of relevant and funny emojis throughout the roasts and verdict to make it more expressive! 🤡⚔️🔥
    Return the response in this exact JSON format:
    {
      "winner": "Username of the winner (the superior dev)",
      "reason": "Funny reason why they won the battle and are superior (1-2 sentences)",
      "roast1": "Brutal short roast of the first developer",
      "roast2": "Brutal short roast of the second developer"
    }`;

    const u1Lang = Object.keys(u1Stats.languageDistribution).join(', ') || 'None';
    const u2Lang = Object.keys(u2Stats.languageDistribution).join(', ') || 'None';

    const userPrompt = `
First Developer:
Username: ${u1Profile.login}
Repos: ${u1Stats.originalRepoCount}
Stars: ${u1Stats.totalStars}
Top Languages: ${u1Lang}

Second Developer:
Username: ${u2Profile.login}
Repos: ${u2Stats.originalRepoCount}
Stars: ${u2Stats.totalStars}
Top Languages: ${u2Lang}
`;

    try {
        let content = '';

        if (useAntigravity) {
            const completion = await antigravityClient.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'antigravity-roast-v1',
                temperature: 0.9,
                response_format: { type: 'json_object' }
            });
            content = completion.choices[0].message.content;
        } else if (useNvidia) {
            const completion = await nvidiaClient.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'meta/llama3-70b-instruct',
                temperature: 0.9,
                response_format: { type: 'json_object' }
            });
            content = completion.choices[0].message.content;
        } else if (useGroq) {
            const completion = await groqClient.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'mixtral-8x7b-32768',
                temperature: 0.9,
                response_format: { type: 'json_object' }
            });
            content = completion.choices[0].message.content;
        } else {
            const completion = await openaiClient.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'gpt-4-turbo',
                temperature: 0.9,
                response_format: { type: 'json_object' }
            });
            content = completion.choices[0].message.content;
        }

        return safeJSONParse(content);
    } catch (error) {
        console.error('Battle AI API Error:', error);
        throw new Error('Failed to generate roast battle from AI provider.');
    }
};

module.exports = {
    generateRoastFromAI,
    generateLinkedInRoastFromAI,
    generateResumeRoastFromAI,
    generateRoastBattleFromAI
};
