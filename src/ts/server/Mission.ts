/// <reference path="./typings/tsd.d.ts" />

import Hull3 = require('./Hull3');
import Settings = require('./Settings');
import fs = require('fs-extra');
import _ = require('lodash');

import {Ast, Lexer, Parser, PrettyPrinter, Mission as CpMission} from 'config-parser';
import {Side, MissionType, Terrain, Faction, Addons, Mission, Config, GeneratedMission, getSideNames, getMissionTypeNames, stringToMissionType, missionTypeToGameType, missionTypeToMissionNamePrefix} from '../common/Mission';
export {Side, MissionType, Terrain, Faction, Addons, Mission, Config, GeneratedMission, getSideNames, getMissionTypeNames, stringToMissionType, missionTypeToGameType} from '../common/Mission';

var missionIdCounter: number = 0,
    TERRAINS_JSON_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/terrains.json`,
    POSITION_X_SHIFT = 350;

var terrains: Terrain[] = [];

function nextMissionId(): number {
    missionIdCounter = missionIdCounter + 1;
    return missionIdCounter;
}

function parseFile(path: string): Parser.Node {
    var factionFile: string = fs.readFileSync(path, 'UTF-8');
    return Parser.create(factionFile, Lexer.create(factionFile)).parse();
}

function cleanWorkingDir() {
    fs.emptyDirSync(Settings.PATH.Mission.WORKING_DIR);
}

function getFactionMissionAsts(factions: Hull3.FactionRequest[]): Parser.Node[] {
    return _.map(factions, (f, idx) => {
        var ast = parseFile(`${Settings.PATH.SERVER_RESOURCES_HOME}/mission/${f.sideName}.sqm`);
        Hull3.removeUnselectedItems(ast, f.factionId, Hull3.getFactionRolePrefixById(f.factionId), f.groupTemplateIds, f.vehicleClassnames, idx * POSITION_X_SHIFT);
        return ast;
    });
}

function mergeGroupsAndVehicles(missionAst: Parser.Node, factionAsts: Parser.Node[]) {
    var groupItems = _.foldl(factionAsts, (acc, fa) => acc.concat(Ast.select(fa, 'Mission.Groups.Item*')), <Parser.Node[]>[]),
        vehicleItems = _.foldl(factionAsts, (acc, fa) => acc.concat(Ast.select(fa, 'Mission.Vehicles.Item*')), <Parser.Node[]>[]),
        missionGroups = Ast.select(missionAst, 'Mission.Groups')[0],
        missionVehicles = Ast.select(missionAst, 'Mission.Vehicles')[0];
    missionGroups.fields = [];
    missionVehicles.fields = [];
    CpMission.mergeItems(missionGroups, groupItems);
    CpMission.mergeItems(missionVehicles, vehicleItems);
}

function getPlayableUnitCount(missionAst: Parser.Node): number {
    return _.foldl(Ast.select(missionAst, 'Mission.Groups.Item*'), (acc, g) => acc + Ast.select(g, 'Vehicles.Item*').length, 0);
}

function generateMissionSqm(missionAst: Parser.Node, mission: Mission) {
    Ast.select(missionAst, 'Mission.Intel.briefingName')[0].value = mission.briefingName;
    Ast.select(missionAst, 'Mission.Intel.overviewText')[0].value = mission.overviewText;
    mergeGroupsAndVehicles(missionAst, getFactionMissionAsts(mission.factions));
}

function generateHull3Header(missionDir: string, mission: Mission) {
    var hull3Ast = parseFile(`${Hull3.getSampleMissionPath()}/hull3/hull3.h`);
    Hull3.addFactionsToHull3Config(hull3Ast, mission.factions);
    fs.writeFileSync(`${missionDir}/hull3/hull3.h`, PrettyPrinter.create('    ').print(hull3Ast), 'UTF-8');
}

function generateDescriptionExt(missionDir: string, mission: Mission, missionType: MissionType, maxPlayers: number) {
    var desciptionExt = fs.readFileSync(`${missionDir}/description.ext`, 'UTF-8')
        .replace(/onLoadName = "[^"]*";/g, `onLoadName = "${mission.onLoadName}";`)
        .replace(/author = "[^"]*";/g, `author = "${mission.author}";`)
        .replace(/gametype = [^;]*;/g, `gametype = ${missionTypeToGameType(missionType)};`)
        .replace(/maxPlayers = [^;]*;/g, `maxPlayers = ${maxPlayers.toString()};`);
    fs.writeFileSync(`${missionDir}/description.ext`, desciptionExt, 'UTF-8');
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
    var missionAst = parseFile(`${Hull3.getSampleMissionPath()}/mission.sqm`),
        missionType = stringToMissionType(mission.missionTypeName);
    generateMissionSqm(missionAst, mission);
    var maxPlayers = getPlayableUnitCount(missionAst);
    var missionId = nextMissionId();
    var missionDirName = `ark_${missionTypeToMissionNamePrefix(missionType)}${maxPlayers}_${mission.briefingName.toLowerCase()}.${mission.terrainId}`;
    var missionWorkingDir = `${Settings.PATH.Mission.WORKING_DIR}/${missionId}`;
    var missionDir = `${missionWorkingDir}/${missionDirName}`;
    fs.copySync(Hull3.getSampleMissionPath(), missionDir);
    fs.writeFileSync(`${missionDir}/mission.sqm`, PrettyPrinter.create('\t').print(missionAst), 'UTF-8');
    generateHull3Header(missionDir, mission);
    generateDescriptionExt(missionDir, mission, missionType, maxPlayers);
    return {
        missionId: missionId,
        missionWorkingDir: missionWorkingDir,
        missionDirName: missionDirName,
        missionDir: missionDir
    }
}

cleanWorkingDir();
updateTerrains();
