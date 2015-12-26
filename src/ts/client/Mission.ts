/// <reference path="./typings/tsd.d.ts" />

import $ = require('jquery');
import Promise = require('bluebird');
import Hull3 = require('./Hull3');
import Settings = require('./Settings');

import {Side, MissionType, Terrain, Faction, Addons, FactionRequest, Mission, Config, GeneratedMission} from '../common/Mission';
export {Side, MissionType, Terrain, Faction, Addons, FactionRequest, Mission, Config, GeneratedMission} from '../common/Mission';

var MISSION_PATH = `${Settings.CONTEXT_PATH}/mission`;

var terrains: Terrain[] = [];

export function getSides(): Side[] {
    return [Side.BLUFOR, Side.OPFOR, Side.INDFOR, Side.CIVILIAN];
}

export function sideToString(s: Side): string {
    switch (s) {
        case Side.OPFOR: return 'OPFOR';
        case Side.INDFOR: return 'INDFOR';
        case Side.CIVILIAN: return 'CIVILIAN';
        default: return 'BLUFOR';
    }
}

export function getMissionTypes(): MissionType[] {
    return [MissionType.COOP, MissionType.TVT, MissionType.GTVT, MissionType.COTVT];
}

export function missionTypeToString(mt: MissionType): string {
    switch (mt) {
        case MissionType.TVT: return 'TVT';
        case MissionType.GTVT: return 'GTVT';
        case MissionType.COTVT: return 'COTVT';
        default: return 'COOP';
    }
}

export function getTerrains(): Terrain[] {
    return terrains;
}

export function getMissionConfig(): Promise<Config> {
    return Promise.resolve($.get(`${MISSION_PATH}/config`));
}

export function updateFromConfig(config: Config) {
    terrains = config.terrains;
}
