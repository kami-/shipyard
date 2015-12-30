/// <reference path="./typings/tsd.d.ts" />

import Hull3 = require('./Hull3');
import Settings = require('./Settings');
import fs = require('fs-extra');

import {Side, MissionType, Terrain, Faction, Addons, FactionRequest, Mission, Config, GeneratedMission, getSideNames, getMissionTypeNames} from '../common/Mission';
export {Side, MissionType, Terrain, Faction, Addons, FactionRequest, Mission, Config, GeneratedMission, getSideNames, getMissionTypeNames} from '../common/Mission';

var missionIdCounter: number = 0,
    TERRAINS_JSON_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/terrains.json`;

var terrains: Terrain[] = [];

function nextMissionId(): number {
    missionIdCounter = missionIdCounter + 1;
    return missionIdCounter;
}

function cleanWorkingDir() {
    fs.emptyDirSync(Settings.PATH.Mission.workingDir);
}

export function getTerrains(): Terrain[] {
    return terrains
}

export function updateTerrains() {
    terrains = <Terrain[]>JSON.parse(fs.readFileSync(TERRAINS_JSON_PATH, 'UTF-8'));
}

export function getMissionConfig(): Config {
    return {
        sideNames: getSideNames(),
        missionTypeNames: getMissionTypeNames(),
        terrains: getTerrains(),
        Hull3: {
            factions: Hull3.getFactions(),
            factionConfigs: Hull3.getFactionConfigs(),
            gearTemplates: Hull3.getGearTemplates(),
            uniformTemplates: Hull3.getUniformTemplates(),
            groupTemplates: Hull3.getGroupTemplates(),
            vehicleClassnameTemplates: Hull3.getVehicleClassnameTemplates()
        }
    }
}

export function generateMission(mission: Mission): GeneratedMission {
    var missionId = nextMissionId();
    // ark_co60_oh_its_this_mission.Altis
    var missionDirName = `ark_${mission.missionTypeName.toLowerCase()}${mission.maxPlayers}_${mission.briefingName.toLowerCase()}.${mission.terrainId}`;
    var missionWorkingDir = `${Settings.PATH.Mission.workingDir}/${missionId}`;
    var missionDir = `${missionWorkingDir}/${missionDirName}`;
    fs.copySync(Hull3.getSampleMissionPath(), missionDir);
    return {
        missionId: missionId,
        missionWorkingDir: missionWorkingDir,
        missionDirName: missionDirName,
        missionDir: missionDir
    }
}

cleanWorkingDir();
updateTerrains();