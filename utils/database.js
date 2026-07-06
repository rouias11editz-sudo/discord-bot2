const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "confessions.json");

// =========================
// Ensure DB exists
// =========================
function ensureDatabase() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(
                {
                    count: 0,
                    confessions: []
                },
                null,
                4
            ),
            "utf8"
        );
    }
}

// =========================
// Load DB
// =========================
function load() {
    ensureDatabase();
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

// =========================
// Safe save (prevents corruption)
// =========================
function save(data) {
    const tempFile = DATA_FILE + ".tmp";

    fs.writeFileSync(
        tempFile,
        JSON.stringify(data, null, 4),
        "utf8"
    );

    fs.renameSync(tempFile, DATA_FILE);
}

// =========================
// Sanitize input
// =========================
function sanitize(text) {
    if (!text) return "";
    return text.length > 2000 ? text.slice(0, 1997) + "..." : text;
}

// =========================
// Create confession
// =========================
function createConfession(userId, content) {
    const db = load();

    db.count = (db.count || 0) + 1;

    const id = db.count;

    const confession = {
        id,
        userId,
        content: sanitize(content),
        messageId: null,
        threadId: null,
        reports: [],
        status: "ACTIVE",
        createdAt: Date.now()
    };

    db.confessions.push(confession);
    save(db);

    return confession;
}

// =========================
// Update message ID
// =========================
function updateMessage(id, messageId) {
    const db = load();

    const confession = db.confessions.find(c => c.id === id);
    if (!confession) return null;

    confession.messageId = messageId;
    save(db);

    return confession;
}

// =========================
// Update thread ID
// =========================
function updateThread(id, threadId) {
    const db = load();

    const confession = db.confessions.find(c => c.id === id);
    if (!confession) return null;

    confession.threadId = threadId;
    save(db);

    return confession;
}

// =========================
// Add report (no duplicates)
// =========================
function addReport(id, userId) {
    const db = load();

    const confession = db.confessions.find(c => c.id === id);
    if (!confession) return false;

    if (!confession.reports.includes(userId)) {
        confession.reports.push(userId);
        save(db);
    }

    return true;
}

// =========================
// Check if user already reported
// =========================
function hasReported(id, userId) {
    const db = load();

    const confession = db.confessions.find(c => c.id === id);
    if (!confession) return false;

    return confession.reports.includes(userId);
}

// =========================
// Get confession
// =========================
function getConfession(id) {
    const db = load();
    return db.confessions.find(c => c.id === id);
}

// =========================
// Get by message ID
// =========================
function getByMessage(messageId) {
    const db = load();
    return db.confessions.find(c => c.messageId === messageId);
}

// =========================
// Soft delete
// =========================
function deleteConfession(id) {
    const db = load();

    const confession = db.confessions.find(c => c.id === id);
    if (!confession) return false;

    confession.status = "DELETED";
    save(db);

    return true;
}

// =========================
// Mark safe
// =========================
function markSafe(id) {
    const db = load();

    const confession = db.confessions.find(c => c.id === id);
    if (!confession) return false;

    confession.status = "SAFE";
    save(db);

    return true;
}

// =========================
// Get only active confessions
// =========================
function getActiveConfessions() {
    const db = load();
    return db.confessions.filter(c => c.status === "ACTIVE");
}

// =========================
// EXPORTS
// =========================
module.exports = {
    load,
    save,

    createConfession,
    updateMessage,
    updateThread,

    addReport,
    hasReported,

    getConfession,
    getByMessage,

    deleteConfession,
    markSafe,

    getActiveConfessions
};
