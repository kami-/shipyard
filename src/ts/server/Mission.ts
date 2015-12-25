/// <reference path="./typings/tsd.d.ts" />

import Hull3 = require('./Hull3');
import Settings = require('./Settings');
import fs = require('fs-extra');

import {Side, MissionType, Terrain, Faction, Addons, Mission, Hull3Config, MissionConfig, GeneratedMission} from '../common/Mission';
export {Side, MissionType, Terrain, Faction, Addons, Mission, Hull3Config, MissionConfig, GeneratedMission} from '../common/Mission';

var missionIdCounter: number = 0;

function nextMissionId(): number {
    missionIdCounter = missionIdCounter + 1;
    return missionIdCounter;
}

function cleanWorkingDir() {
    fs.emptyDirSync(Settings.PATH.Mission.workingDir);
}

export function getSideNames(): string[] {
    return [Side.BLUFOR, Side.OPFOR, Side.INDFOR, Side.CIVILIAN].map(s => Side[s]);
}

export function getMissionTypeNames(): string[] {
    return [MissionType.COOP, MissionType.TVT, MissionType.GTVT, MissionType.COTVT].map(mt => MissionType[mt]);
}

export function getTerrains(): Terrain[] {
    return [
        { id: 'Altis', name: 'Altis' },
        { id: 'Stratis', name: 'Stratis' }
    ]
}

export function getMissionConfig(): MissionConfig {
    return {
        missionTypeNames: getMissionTypeNames(),
        terrains: getTerrains(),
        Hull3: {
            factions: Hull3.getFactions(),
            gearTemplates: Hull3.getGearTemplates(),
            uniformTemplates: Hull3.getUniformTemplates()
        }
    }
}


export function generateMission(mission: Mission): GeneratedMission {
    var missionId = nextMissionId();
    // ark_co60_oh_its_this_mission.Altis
    var missionDirName = `ark_${mission.missionTypeName.toLowerCase()}${mission.maxPlayers}_${mission.briefingName.toLowerCase()}.${mission.terrain.name}`;
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