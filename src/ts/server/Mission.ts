/// <reference path="./typings/tsd.d.ts" />

import Admiral = require('./Admiral');
import Hull3 = require('./Hull3');
import Settings = require('./Settings');
import fs = require('fs-extra');
import _ = require('lodash');

import {Ast, Lexer, Parser, PrettyPrinter, Mission as CpMission} from 'config-parser';
import {parseFile} from './Common'
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
    makeFirstUnitPlayerFor3DEN(missionAst);
}

function makeFirstUnitPlayerFor3DEN(missionAst: Parser.Node) {
    var groups = Ast.select(missionAst, 'Mission.Groups.Item*');
    var units = Ast.select(groups[0], 'Vehicles.Item*');
    console.log(units);
    if (units.length > 0) {
        Ast.select(units[0], 'player')[0].value = 'PLAYER COMMANDER';
    }
}

function getPlayableUnitCount(missionAst: Parser.Node): number {
    return _.foldl(Ast.select(missionAst, 'Mission.Groups.Item*'), (acc, g) => acc + Ast.select(g, 'Vehicles.Item*').length, 0);
}

function generateMissionSqm(missionAst: Parser.Node, mission: Mission) {
    Ast.select(missionAst, 'Mission.Intel.overviewText')[0].value = mission.overviewText;
    mergeGroupsAndVehicles(missionAst, getFactionMissionAsts(mission.factions));
}

function generateHull3Header(missionDir: string, mission: Mission) {
    var hull3Ast = parseFile(`${Hull3.getSampleMissionPath()}/hull3/hull3.h`);
    Hull3.addFactionsToHull3Config(hull3Ast, mission.factions);
    fs.writeFileSync(`${missionDir}/hull3/hull3.h`, PrettyPrinter.create('    ').print(hull3Ast), 'UTF-8');
}

function generateDescriptionExt(missionDir: string, mission: Mission, missionType: MissionType, maxPlayers: number) {
    var descriptionExt = fs.readFileSync(`${missionDir}/description.ext`, 'UTF-8')
        .replace(/onLoadName = "[^"]*";/g, `onLoadName = "${mission.onLoadName}";`)
        .replace(/author = "[^"]*";/g, `author = "${mission.author}";`)
        .replace(/gameType = [^;]*;/g, `gameType = ${missionTypeToGameType(missionType)};`)
        .replace(/maxPlayers = [^;]*;/g, `maxPlayers = ${maxPlayers.toString()};`);
    descriptionExt = tryAddAdmiralInclude(descriptionExt, mission);
    fs.writeFileSync(`${missionDir}/description.ext`, descriptionExt, 'UTF-8');
}

function tryAddAdmiralInclude(descriptionExt: string, mission: Mission): string {
    if (mission.addons.Admiral.isEnabled) {
        return '#include "admiral\\admiral.h"\n' + descriptionExt;
    }
    return descriptionExt;
}

function tryAddAdmiral(mission: Mission, missionDir: string) {
    if (!mission.addons.Admiral.isEnabled) { return; }
    fs.copySync(`${Settings.PATH.SERVER_RESOURCES_HOME}/${Settings.PATH.Admiral.HOME}/${Settings.PATH.Admiral.SAMPLE_MISSION_HOME}/admiral`, `${missionDir}/admiral`);
    var admiralAst = parseFile(`${missionDir}/admiral/admiral.h`);
    Admiral.replaceTemplates(admiralAst, mission.addons.Admiral);
    fs.writeFileSync(`${missionDir}/admiral/admiral.h`, PrettyPrinter.create('    ').print(admiralAst), 'UTF-8');
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
        },
        Admiral: {
            unitTemplates: Admiral.getUnitTemplates(),
            zoneTemplates: Admiral.getZoneTemplates()
        }
    }
}

export function generateMission(mission: Mission): GeneratedMission {
    var missionAst = parseFile(`${Hull3.getSampleMissionPath()}/mission.sqm`),
        missionType = stringToMissionType(mission.missionTypeName);
    generateMissionSqm(missionAst, mission);
    var maxPlayers = getPlayableUnitCount(missionAst);
    var missionId = nextMissionId();
    var fullMissionName = `ark_${missionTypeToMissionNamePrefix(missionType)}${maxPlayers}_${mission.briefingName.toLowerCase()}`;
    var missionDirName = `${fullMissionName}.${mission.terrainId}`;
    var missionWorkingDir = `${Settings.PATH.Mission.WORKING_DIR}/${missionId}`;
    var missionDir = `${missionWorkingDir}/${missionDirName}`;
    fs.copySync(Hull3.getSampleMissionPath(), missionDir);
    Ast.select(missionAst, 'Mission.Intel.briefingName')[0].value = fullMissionName;
    fs.writeFileSync(`${missionDir}/mission.sqm`, PrettyPrinter.create('\t').print(missionAst), 'UTF-8');
    generateHull3Header(missionDir, mission);
    generateDescriptionExt(missionDir, mission, missionType, maxPlayers);
    tryAddAdmiral(mission, missionDir);
    return {
        missionId: missionId,
        missionWorkingDir: missionWorkingDir,
        missionDirName: missionDirName,
        missionDir: missionDir
    }
}

cleanWorkingDir();
updateTerrains();
