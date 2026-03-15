const axios = require('axios');

const GITHUB_API_URL = process.env.GITHUB_API_URL || 'https://api.github.com';

/**
 * Helper to get GitHub API headers, optionally with auth if provided in env
 */
const getHeaders = () => {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
    };
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    return headers;
};

/**
 * Fetches user profile data from GitHub
 * @param {string} username 
 * @returns {Promise<Object>}
 */
const getUserProfile = async (username) => {
    try {
        const response = await axios.get(`${GITHUB_API_URL}/users/${username}`, {
            headers: getHeaders()
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error(`GitHub user '${username}' not found.`);
        }
        throw new Error('Failed to fetch GitHub profile. Rate limit exceeded or API error.');
    }
};

/**
 * Fetches user repositories from GitHub
 * @param {string} username 
 * @returns {Promise<Array>}
 */
const getUserRepos = async (username) => {
    try {
        // Fetch up to 100 recent repos to get a good sample for analysis
        const response = await axios.get(`${GITHUB_API_URL}/users/${username}/repos?per_page=100&sort=updated`, {
            headers: getHeaders()
        });
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch GitHub repositories.');
    }
};

/**
 * Extracts and aggregates language stats and other repo insights
 * @param {Array} repos 
 * @returns {Object}
 */
const aggregateRepoStats = (repos) => {
    let totalStars = 0;
    let totalForks = 0;
    const languages = {};
    let topics = new Set();
    const repoNames = [];

    repos.forEach(repo => {
        if (!repo.fork) { // Only count original repos for stats
            totalStars += repo.stargazers_count;
            totalForks += repo.forks_count;
            repoNames.push(repo.name);

            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }

            if (repo.topics && Array.isArray(repo.topics)) {
                repo.topics.forEach(topic => topics.add(topic));
            }
        }
    });

    const languageDistribution = Object.entries(languages)
        .sort((a, b) => b[1] - a[1]) // highest first
        .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});

    return {
        totalStars,
        totalForks,
        languageDistribution,
        topics: Array.from(topics).slice(0, 10), // top 10 topics
        repoCount: repos.length,
        originalRepoCount: repoNames.length,
        sampleRepos: repoNames.slice(0, 5) // Send top 5 names for context
    };
};

module.exports = {
    getUserProfile,
    getUserRepos,
    aggregateRepoStats
};
