/// <reference path="./typings/tsd.d.ts" />

import $ = require('jquery');
import Promise = require('bluebird');
import Hull3 = require('./Hull3');
import Settings = require('./Settings');

import {Side, MissionType, Terrain, Faction, Addons, FactionRequest, Mission, Config, GeneratedMission, missionTypeToString, sideToString, getSides, getMissionTypes} from '../common/Mission';
export {Side, MissionType, Terrain, Faction, Addons, FactionRequest, Mission, Config, GeneratedMission, missionTypeToString, sideToString, getSides, getMissionTypes} from '../common/Mission';

var MISSION_PATH = `${Settings.CONTEXT_PATH}/mission`;

var terrains: Terrain[] = [];

export function getTerrains(): Terrain[] {
    return terrains;
}

export function getMissionConfig(): Promise<Config> {
    return Promise.resolve($.get(`${MISSION_PATH}/config`));
}

export function updateFromConfig(config: Config) {
    terrains = config.terrains;
}
