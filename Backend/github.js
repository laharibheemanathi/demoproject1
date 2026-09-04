const API_BASE = "https://api.github.com";

function getHeaders() {
    const token = process.env.GITHUB_TOKEN;

    const headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "GitSync-AI"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

async function githubRequest(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "GET",
        headers: getHeaders()
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GitHub API error ${response.status}: ${errorText}`);
    }

    return response.json();
}

async function getRepository() {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    return githubRequest(`/repos/${owner}/${repo}`);
}

async function getCommits(perPage = 30) {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    return githubRequest(
        `/repos/${owner}/${repo}/commits?per_page=${perPage}`
    );
}

async function getCommitDetails(sha) {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    return githubRequest(`/repos/${owner}/${repo}/commits/${sha}`);
}

async function getPullRequests(state = "all") {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    return githubRequest(
        `/repos/${owner}/${repo}/pulls?state=${state}&per_page=30`
    );
}

module.exports = {
    getRepository,
    getCommits,
    getCommitDetails,
    getPullRequests
};