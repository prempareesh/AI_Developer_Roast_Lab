const { getUserProfile, getUserRepos, aggregateRepoStats } = require('../services/githubService');
const { generateRoastFromAI, generateLinkedInRoastFromAI, generateResumeRoastFromAI, generateRoastBattleFromAI } = require('../services/aiService');
const pdfParse = require('pdf-parse');
const { db } = require('../config/firebaseAdmin');

/* ----------------------- GITHUB ROAST ----------------------- */

const generateRoast = async (req, res) => {
    try {
        let { username } = req.body;

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ success: false, error: 'GitHub username is required' });
        }

        username = username.trim().substring(0, 39);

        const [profileData, repos] = await Promise.all([
            getUserProfile(username),
            getUserRepos(username)
        ]);

        const repoStats = aggregateRepoStats(repos);
        const aiResponse = await generateRoastFromAI(profileData, repoStats);

        try {
            await db.collection('roasts').add({
                username: profileData.login,
                score: aiResponse?.score || null,
                createdAt: new Date()
            });
        } catch (err) {
            console.warn("Firestore write skipped:", err.message);
        }

        return res.status(200).json({
            success: true,
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
                    languageDistribution: repoStats.languageDistribution || {},
                    topics: repoStats.topics || []
                },
                roast: aiResponse?.roast || "No roast generated.",
                suggestions: aiResponse?.suggestions || [],
                score: aiResponse?.score || {
                    codeActivity: 0,
                    projectOriginality: 0,
                    consistency: 0,
                    finalScore: 0,
                    verdict: "Unknown"
                }
            }
        });

    } catch (error) {
        console.error("🔥 GitHub Roast Error:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error"
        });
    }
};

/* ----------------------- LINKEDIN ROAST ----------------------- */

const generateLinkedInRoast = async (req, res) => {
    try {
        let { profileUrl } = req.body;
        
        if (!profileUrl || typeof profileUrl !== 'string') {
            return res.status(400).json({
                success: false,
                error: "LinkedIn profile URL is required"
            });
        }

        profileUrl = profileUrl.trim().substring(0, 500);

        if (!profileUrl.toLowerCase().includes('linkedin.com/')) {
            return res.status(400).json({
                success: false,
                error: "Invalid LinkedIn URL"
            });
        }

        const aiResponse = await generateLinkedInRoastFromAI(profileUrl);

        return res.status(200).json({
            success: true,
            data: {
                summary: aiResponse?.summary || "",
                mainRoast: aiResponse?.mainRoast || "No roast generated.",
                analysis: aiResponse?.analysis || {},
                advice: aiResponse?.advice || [],
                closingRoast: aiResponse?.closingRoast || ""
            }
        });

    } catch (error) {
        console.error("🔥 LinkedIn Roast Error:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error"
        });
    }
};

/* ----------------------- RESUME ROAST ----------------------- */

const generateResumeRoast = async (req, res) => {
    try {

        if (!req.file && !req.body.resumeText) {
            return res.status(400).json({
                success: false,
                error: "Resume file or text is required"
            });
        }

        let resumeText = req.body.resumeText || "";

        if (req.file) {
            if (req.file.mimetype === "application/pdf") {
                const pdf = await pdfParse(req.file.buffer);
                resumeText = pdf.text;
            } else if (req.file.mimetype === "text/plain") {
                resumeText = req.file.buffer.toString();
            } else {
                return res.status(400).json({
                    success: false,
                    error: "Unsupported file type"
                });
            }
        }

        // Limit resume text to prevent overwhelming AI provider
        resumeText = resumeText.substring(0, 15000);

        const aiResponse = await generateResumeRoastFromAI(resumeText);

        return res.status(200).json({
            success: true,
            data: {
                summary: aiResponse?.summary || "",
                mainRoast: aiResponse?.mainRoast || "No roast generated.",
                analysis: aiResponse?.analysis || {},
                advice: aiResponse?.advice || [],
                closingRoast: aiResponse?.closingRoast || ""
            }
        });

    } catch (error) {
        console.error("🔥 Resume Roast Error:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error"
        });
    }
};

/* ----------------------- ROAST BATTLE ----------------------- */

const generateRoastBattle = async (req, res) => {
    try {

        let { username1, username2 } = req.body;
        
        if (!username1 || !username2) {
            return res.status(400).json({
                success: false,
                error: "Both GitHub usernames are required"
            });
        }

        username1 = String(username1).trim().substring(0, 39);
        username2 = String(username2).trim().substring(0, 39);

        const [profile1, repos1, profile2, repos2] = await Promise.all([
            getUserProfile(username1),
            getUserRepos(username1),
            getUserProfile(username2),
            getUserRepos(username2)
        ]);

        const stats1 = aggregateRepoStats(repos1);
        const stats2 = aggregateRepoStats(repos2);

        const aiResponse = await generateRoastBattleFromAI(profile1, stats1, profile2, stats2);

        return res.status(200).json({
            success: true,
            data: {
                battle: {
                    winner: aiResponse?.winner || "No winner decided.",
                    winnerScore: aiResponse?.winnerScore || 0,
                    loserScore: aiResponse?.loserScore || 0,
                    reason: aiResponse?.reason || aiResponse?.analysis || "",
                    roast1: aiResponse?.roast1 || "",
                    roast2: aiResponse?.roast2 || ""
                },
                user1: {
                    profile: {
                        username: profile1.login,
                        name: profile1.name,
                        avatarUrl: profile1.avatar_url,
                        bio: profile1.bio,
                        followers: profile1.followers,
                        publicRepos: profile1.public_repos
                    },
                    stats: stats1
                },
                user2: {
                    profile: {
                        username: profile2.login,
                        name: profile2.name,
                        avatarUrl: profile2.avatar_url,
                        bio: profile2.bio,
                        followers: profile2.followers,
                        publicRepos: profile2.public_repos
                    },
                    stats: stats2
                }
            }
        });

    } catch (error) {
        console.error("🔥 Battle Roast Error:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error"
        });
    }
};

module.exports = {
    generateRoast,
    generateLinkedInRoast,
    generateResumeRoast,
    generateRoastBattle
};