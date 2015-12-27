export var HOST_NAME = process.env.IP;
export var PORT = process.env.PORT
export var CONTEXT_PATH= '/shipyard';

export var PATH = {
    Mission: {
        workingDir: 'workingDir'
    },
    Hull3: {
        HOME: 'addon/hull3',
        SAMPLE_MISSION_HOME: 'hull3.Altis',
        FACTION: 'hull3/factions.h',
        GEAR_HOME: 'hull3/assign/gear',
        UNIFORM_HOME: 'hull3/assign/uniform'
    },
    Admiral: {
        HOME: 'addon/admiral'
    },
    Plank: {
        HOME: 'addon/plank'  
    },
    SERVER_RESOURCES_HOME: 'src/resources/server',
    CLIENT_RESOURCES_HOME: 'src/resources/client'
}