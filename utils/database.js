const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "confessions.json");

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
            )
        );
    }
}

function load() {
    ensureDatabase();
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function save(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4));
}

function createConfession(userId, content) {
    const db = load();

    db.count++;

    const confession = {
        id: db.count,
        userId,
        content,
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

function updateMessage(id, messageId) {
    const db = load();

    const confession = db.confessions.find(c => c.id === id);

    if (!confession) return null;

    confession.messageId = messageId;

    save(db);

    return confession;
}

function updateThread(id, threadId) {
    const db = load();

    const confession = db.confessions.find(c => c.id === id);

    if (!confession) return null;

    confession.threadId = threadId;

    save(db);

    return confession;
}

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

function getConfession(id) {

    const db = load();

    return db.confessions.find(c => c.id === id);

}

function getByMessage(messageId) {

    const db = load();

    return db.confessions.find(
        c => c.messageId === messageId
    );

}

function deleteConfession(id) {

    const db = load();

    const confession = db.confessions.find(
        c => c.id === id
    );

    if (!confession) return false;

    confession.status = "DELETED";

    save(db);

    return true;

}

function markSafe(id) {

    const db = load();

    const confession = db.confessions.find(
        c => c.id === id
    );

    if (!confession) return false;

    confession.status = "SAFE";

    save(db);

    return true;

}

module.exports = {

    load,

    save,

    createConfession,

    updateMessage,

    updateThread,

    addReport,

    getConfession,

    getByMessage,

    deleteConfession,

    markSafe

};
