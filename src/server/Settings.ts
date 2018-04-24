export var HOST_NAME = process.env.IP;
export var PORT = 5000;
export var CONTEXT_PATH= '/shipyard';

export var PATH = {
    Mission: {
        WORKING_DIR: 'workingDir'
    },
    Hull3: {
        CLONE_URL: 'https://github.com/kami-/hull3.git',
        HOME: 'hull3',
        SAMPLE_MISSION_HOME: 'hull3.Altis',
        FACTION: 'hull3/factions.h',
        GEAR_HOME: 'hull3/assign/gear',
        UNIFORM_HOME: 'hull3/assign/uniform'
    },
    Admiral: {
        CLONE_URL: 'https://github.com/kami-/admiral.git',
        HOME: 'admiral',
        SAMPLE_MISSION_HOME: 'admiral.Altis'
    },
    Plank: {
        HOME: 'plank'
    },
    ArkInhouse: {
        CLONE_URL: 'https://github.com/Cyruz143/ark_inhouse.git',
        HOME: 'ark_inhouse/addons',
    },
    SERVER_RESOURCES_HOME: 'resources/server',
    SERVER_ADDON_HOME: 'resources/server/addon',
    CLIENT_RESOURCES_HOME: 'resources/client'
}