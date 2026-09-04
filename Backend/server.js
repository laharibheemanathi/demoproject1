require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
    getRepository,
    getCommits,
    getCommitDetails,
    getPullRequests
} = require("./github");

const {
    buildSyncResult,
    analyzeChanges
} = require("./sync");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "GitSync AI backend is running"
    });
});

app.get("/api/repository", async (req, res) => {
    try {
        const repository = await getRepository();

        res.json({
            success: true,
            repository: {
                name: repository.name,
                fullName: repository.full_name,
                description: repository.description,
                defaultBranch: repository.default_branch,
                url: repository.html_url
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get("/api/commits", async (req, res) => {
    try {
        const commits = await getCommits();

        res.json({
            success: true,
            count: commits.length,
            commits
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get("/api/commit/:sha", async (req, res) => {
    try {
        const commit = await getCommitDetails(req.params.sha);

        res.json({
            success: true,
            commit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get("/api/pulls", async (req, res) => {
    try {
        const pulls = await getPullRequests();

        res.json({
            success: true,
            count: pulls.length,
            pullRequests: pulls
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get("/api/sync", async (req, res) => {
    try {
        const lastSeenSha = req.query.lastSeenSha || null;
        const commits = await getCommits(50);

        const result = buildSyncResult(commits, lastSeenSha);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get("/api/change-analysis", async (req, res) => {
    try {
        const commits = await getCommits(30);
        const detailedCommits = [];

        for (const commit of commits.slice(0, 10)) {
            const details = await getCommitDetails(commit.sha);
            detailedCommits.push(details);
        }

        const analysis = analyzeChanges(detailedCommits);

        res.json({
            success: true,
            analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(
        `GitSync AI backend running on http://localhost:${PORT}`
    );
});