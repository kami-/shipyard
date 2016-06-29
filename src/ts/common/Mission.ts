import Common = require('./Common');

import Hull3 = require('./Hull3');
import Admiral = require('./Admiral');

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
    side: Common.Side;
    faction: Hull3.Faction;
    gearTemplateId: string;
    uniformTemplateId: string;
}

export interface Addons {
    Admiral: Admiral.Request;
    plank: boolean;
}

export interface Mission {
    terrainId: string;
    missionTypeName: string;
    onLoadName: string;
    author: string;
    briefingName: string;
    overviewText: string;
    factions: Hull3.FactionRequest[];
    addons: Addons;
}

export interface Config {
    sideNames: string[];
    missionTypeNames: string[];
    terrains: Terrain[];
    Hull3: Hull3.Config;
    Admiral: Admiral.Config;
}

export interface GeneratedMission {
    missionId: number;
    missionWorkingDir: string;
    missionDirName: string;
    missionDir: string;
}

export function getMissionTypes(): MissionType[] {
    return [MissionType.COOP, MissionType.TVT, MissionType.GTVT, MissionType.COTVT];
}

export function missionTypeToString(mt: MissionType): string {
    return MissionType[mt];
}

export function getMissionTypeNames(): string[] {
    return getMissionTypes().map(missionTypeToString);
}

export function stringToMissionType(mt: string): MissionType {
    return MissionType[mt];
}

export function missionTypeToGameType(mt: MissionType): string {
    switch (mt) {
        case MissionType.TVT:
            return 'TDM';
        case MissionType.GTVT:
            return 'DM';
        case MissionType.COTVT:
            return 'TDM';
        default:
            return 'Coop';
    }
}

export function missionTypeToMissionNamePrefix(mt: MissionType): string {
    switch (mt) {
        case MissionType.TVT:
            return 'tvt';
        case MissionType.GTVT:
            return 'gtvt';
        case MissionType.COTVT:
            return 'cotvt';
        default:
            return 'co';
    }
}