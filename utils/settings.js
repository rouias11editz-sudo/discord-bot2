const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "data", "guilds.json");

function ensureDatabase() {
    if (!fs.existsSync(FILE)) {
        fs.writeFileSync(FILE, JSON.stringify({}, null, 4));
    }
}

function load() {
    ensureDatabase();
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function save(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 4));
}

function getGuild(guildId) {
    const data = load();

    if (!data[guildId]) {
        data[guildId] = {
            confessionChannel: null,
            modAlertChannel: null,
            modRoles: [],
            blistChannel: null
        };

        save(data);
    }

    return data[guildId];
}

function setGuild(guildId, settings) {
    const data = load();

    data[guildId] = {
        ...getGuild(guildId),
        ...settings
    };

    save(data);

    return data[guildId];
}

module.exports = {
    getGuild,
    setGuild
};
