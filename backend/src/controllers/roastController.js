const { getUserProfile, getUserRepos, aggregateRepoStats } = require('../services/githubService');
const { generateRoastFromAI, generateLinkedInRoastFromAI, generateResumeRoastFromAI, generateRoastBattleFromAI } = require('../services/aiService');
const pdfParse = require('pdf-parse');
const { db } = require('../config/firebaseAdmin');

const generateRoast = async (req, res) => {
    try {
        let { username } = req.body;

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ status: 'error', error: 'GitHub username is required and must be a string' });
        }

        username = username.trim().substring(0, 39); // Basic sanitization

        if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username)) {
            return res.status(400).json({ status: 'error', error: 'Invalid GitHub username format' });
        }

        const [profileData, repos] = await Promise.all([
            getUserProfile(username),
            getUserRepos(username)
        ]);

        const repoStats = aggregateRepoStats(repos);
        const aiResponse = await generateRoastFromAI(profileData, repoStats);

        try {
            await db.collection('roasts').add({
                username: profileData.login,
                score: aiResponse.score,
                createdAt: new Date()
            });
        } catch (dbError) {
            // Silently fail DB save to not interrupt user experience
        }

        return res.status(200).json({
            status: 'success',
            data: {
                profile: {
                    username: profileData.login,
                    name: profileData.name,
                    avatarUrl: profileData.avatar_url,
                    bio: profileData.bio,
                    followers: profileData.followers,
                    following: profileData.following,
                    publicRepos: profileData.public_repos,
                    htmlUrl: profileData.html_url
                },
                stats: {
                    totalStars: repoStats.totalStars,
                    totalForks: repoStats.totalForks,
                    languageDistribution: repoStats.languageDistribution,
                    topics: repoStats.topics
                },
                roast: aiResponse.roast,
                suggestions: aiResponse.suggestions,
                score: aiResponse.score
            }
        });

    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return res.status(statusCode).json({ 
            status: 'error', 
            error: error.message || 'Internal Server Error' 
        });
    }
};

const generateLinkedInRoast = async (req, res) => {
    try {
        let { profileUrl } = req.body;

        if (!profileUrl || typeof profileUrl !== 'string') {
            return res.status(400).json({ status: 'error', error: 'LinkedIn profile data or URL is required' });
        }

        profileUrl = profileUrl.trim();

        const aiResponse = await generateLinkedInRoastFromAI(profileUrl);

        return res.status(200).json({
            status: 'success',
            data: {
                summary: aiResponse.summary,
                mainRoast: aiResponse.mainRoast,
                analysis: aiResponse.analysis,
                advice: aiResponse.advice,
                closingRoast: aiResponse.closingRoast
            }
        });

    } catch (error) {
        return res.status(500).json({ status: 'error', error: error.message || 'Internal Server Error' });
    }
};

const generateResumeRoast = async (req, res) => {
    try {
        if (!req.file && (!req.body.resumeText || typeof req.body.resumeText !== 'string')) {
            return res.status(400).json({ status: 'error', error: 'Resume file or text content is required' });
        }

        let resumeText = (req.body.resumeText || '').trim();

        if (req.file) {
            if (req.file.mimetype === 'application/pdf') {
                const pdfData = await pdfParse(req.file.buffer);
                resumeText = pdfData.text;
            } else if (req.file.mimetype === 'text/plain') {
                resumeText = req.file.buffer.toString('utf8');
            } else {
                return res.status(400).json({ status: 'error', error: 'Unsupported file type. Please upload PDF or TXT.' });
            }
        }

        if (resumeText.length > 50000) {
            resumeText = resumeText.substring(0, 50000); // Limit size for AI
        }

        const aiResponse = await generateResumeRoastFromAI(resumeText);

        return res.status(200).json({
            status: 'success',
            data: {
                summary: aiResponse.summary,
                mainRoast: aiResponse.mainRoast,
                analysis: aiResponse.analysis,
                advice: aiResponse.advice,
                closingRoast: aiResponse.closingRoast
            }
        });

    } catch (error) {
        return res.status(500).json({ status: 'error', error: error.message || 'Internal Server Error' });
    }
};

const generateRoastBattle = async (req, res) => {
    try {
        let { username1, username2 } = req.body;

        if (!username1 || !username2 || typeof username1 !== 'string' || typeof username2 !== 'string') {
            return res.status(400).json({ status: 'error', error: 'Both GitHub usernames are required' });
        }

        username1 = username1.trim().substring(0, 39);
        username2 = username2.trim().substring(0, 39);

        const [profileData1, repos1, profileData2, repos2] = await Promise.all([
            getUserProfile(username1),
            getUserRepos(username1),
            getUserProfile(username2),
            getUserRepos(username2)
        ]);
        
        const repoStats1 = aggregateRepoStats(repos1);
        const repoStats2 = aggregateRepoStats(repos2);

        const aiResponse = await generateRoastBattleFromAI(profileData1, repoStats1, profileData2, repoStats2);

        return res.status(200).json({
            status: 'success',
            data: {
                user1: { profile: profileData1, stats: repoStats1 },
                user2: { profile: profileData2, stats: repoStats2 },
                battle: aiResponse
            }
        });

    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return res.status(statusCode).json({ status: 'error', error: error.message || 'Internal Server Error' });
    }
};

module.exports = {
    generateRoast,
    generateLinkedInRoast,
    generateResumeRoast,
    generateRoastBattle
};
