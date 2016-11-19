import * as $ from 'jquery';
import * as _ from 'lodash';
import * as Settings from './Settings';

export {Side, sideToString, getSides} from "../common/Common"
import {MissionType, Terrain, Faction, Addons, Mission, Config, GeneratedMission, missionTypeToString, getMissionTypes} from '../common/Mission';
export {MissionType, Terrain, Faction, Addons, Mission, Config, GeneratedMission, missionTypeToString, getMissionTypes} from '../common/Mission';

var MISSION_PATH = `${Settings.CONTEXT_PATH}/mission`;

var terrains: Terrain[] = [];

export function getTerrains(): Terrain[] {
    return terrains;
}

export function getMissionConfig(done: (config: Config) => void) {
    return $.get(`${MISSION_PATH}/config`).done(config => {
        done(<Config>config);
    });
}

export function getGeneratePath(): string {
    return `${MISSION_PATH}/generate`;
}

export function getDownloadPath(id: number, zip: string, name: string): string {
    return `${getGeneratePath()}/${id}/${zip}/${name}`;
}

export function updateFromConfig(config: Config) {
    terrains = config.terrains;
}
