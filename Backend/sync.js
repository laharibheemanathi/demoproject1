function getCommitSummary(commit) {
    return {
        sha: commit.sha,
        shortSha: commit.sha.substring(0, 7),
        message: commit.commit.message.split("\n")[0],
        author: commit.author
            ? commit.author.login
            : commit.commit.author?.name || "Unknown",
        date: commit.commit.author?.date || null,
        url: commit.html_url
    };
}

function findCommitsSince(commits, lastSeenSha) {
    if (!lastSeenSha) {
        return commits;
    }

    const index = commits.findIndex(
        commit => commit.sha === lastSeenSha
    );

    if (index === -1) {
        return commits;
    }

    return commits.slice(0, index);
}

function analyzeChanges(commits) {
    let filesChanged = 0;
    let additions = 0;
    let deletions = 0;

    for (const commit of commits) {
        if (!commit.files) continue;

        for (const file of commit.files) {
            filesChanged++;
            additions += file.additions || 0;
            deletions += file.deletions || 0;
        }
    }

    return {
        commitsAnalyzed: commits.length,
        filesChanged,
        additions,
        deletions
    };
}

function buildSyncResult(commits, lastSeenSha = null) {
    const newCommits = findCommitsSince(commits, lastSeenSha);

    return {
        lastSeenCommit: lastSeenSha,
        newCommitCount: newCommits.length,
        commits: newCommits.map(getCommitSummary)
    };
}

module.exports = {
    getCommitSummary,
    findCommitsSince,
    analyzeChanges,
    buildSyncResult
};