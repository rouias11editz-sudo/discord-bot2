const sessions = new Map();

function get(guildId) {
    return sessions.get(guildId);
}

function create(guildId) {

    sessions.set(guildId, {
        confessionChannel: null,
        modAlertChannel: null,
        modRoles: []
    });

    return sessions.get(guildId);
}

function remove(guildId) {
    sessions.delete(guildId);
}

module.exports = {
    get,
    create,
    remove
};
