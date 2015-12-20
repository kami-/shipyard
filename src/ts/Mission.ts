/// <reference path="../../typings/tsd.d.ts" />

import Hull3 = require('./Hull3');
import Settings = require('./Settings');
import fs = require('fs-extra');

var missionIdCounter: number = 0;

export enum Side {
    BLUFOR,
    OPFOR,
    INDFOR,
    CIVILIAN
}

export enum MissionType {
    COOP,
    TVT,
    GTVT,
    COTVT
}

export interface Terrain {
    id: string;
    name: string;
}

export interface Faction {
    side: Side;
    faction: Hull3.Faction;
    gear: string;
    uniform: string;
}

export interface Addons {
    Admiral: boolean;
    Plank: boolean;
}

export interface Mission {
    terrain: Terrain;
    missionTypeName: string;
    maxPlayers: number;
    onLoadName: string;
    author: string;
    briefingName: string;
    overviewText: string;
    factions: Faction[];
    addons: Addons;
}

export interface Hull3Configuration {
    factions: Hull3.Faction[];
    gearTemplateNames: string[];
    uniformTemplateNames: string[];
}

export interface MissionConfig {
    missionTypeNames: string[];
    terrains: Terrain[];
    Hull3: Hull3Configuration;
}

export interface GeneratedMission {
    missionId: number;
    missionDir: string;
    missionWorkingDir: string;
}

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
            gearTemplateNames: Hull3.getGearTemplates(),
            uniformTemplateNames: Hull3.getUniformTemplates()
        }
    }
}


export function generateMission(mission: Mission): GeneratedMission {
    var missionId = nextMissionId();
    // ark_co60_oh_its_this_mission.Altis
    var missionDir = `ark_${mission.missionTypeName.toLowerCase()}${mission.maxPlayers}_${mission.briefingName.toLowerCase()}.${mission.terrain.name}`;
    var missionWorkingDir = `${Settings.PATH.Mission.workingDir}/${missionId}/${missionDir}`;
    fs.copySync(Hull3.getSampleMissionPath(), missionWorkingDir);
    return {
        missionId: missionId,
        missionDir: missionDir,
        missionWorkingDir: missionWorkingDir
    }
}

cleanWorkingDir();