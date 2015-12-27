/// <reference path="./typings/tsd.d.ts" />

import Settings = require('./Settings');
import fs = require('fs-extra');
import _ = require('lodash');

import {Ast, Lexer, Mission, Parser} from 'config-parser';
import {Template, GearTemplate, UniformTemplate, GroupTemplate, VehicleClassnameTemplate, Faction, FactionConfig, Config} from '../common/Hull3';
export {Template, GearTemplate, UniformTemplate, GroupTemplate, VehicleClassnameTemplate, Faction, FactionConfig, Config} from '../common/Hull3';

var SAMPLE_MISSION_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.SAMPLE_MISSION_HOME}`, 
    FACTION_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.FACTION}`,
    GEAR_HOME_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.GEAR_HOME}`,
    UNIFORM_HOME_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.UNIFORM_HOME}`,
    FACTION_CONFIGS_JSON_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/factions.json`,
    GROUPS_JSON_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/groups.json`,
    VEHICLE_CLASSNAMES_JSON_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/vehicle-classnames.json`;

var factions: Faction[] = [];
var factionConfigs: { [id: string]: FactionConfig } = {};
var gearTemplates: GearTemplate[] = [];
var uniformTemplates: UniformTemplate[] = [];
var groupTemplates: GroupTemplate[] = [];
var vehicleClassnameTemplates: VehicleClassnameTemplate[] = [];

function parseFile(path: string): Parser.Node {
    var factionFile: string = fs.readFileSync(path, 'UTF-8');
    return Parser.create(factionFile, Lexer.create(factionFile)).parse();
}

function factionNodeToFaction(node: Parser.Node): Faction {
    return {
        id: node.fieldName,
        name: node.fieldName,
        description: '',
        gearTemplateId:  Ast.select(node, 'gear')[0].value,
        uniformTemplateId: Ast.select(node, 'uniform')[0].value
    }
}

function getTemplate(homePath: string, filename: string): Template {
    var ast = parseFile(`${homePath}/${filename}`);
    var templateAst = Ast.select(ast, '*')[0];
    return {
        id: templateAst.fieldName,
        name: templateAst.fieldName,
        description: ''
    }
}

export function updateFactions() {
    var factionsAst = parseFile(FACTION_PATH);
    factions = Ast.select(factionsAst, 'Faction.*').map(factionNodeToFaction);
}

export function updateFactionConfigs() {
    factionConfigs = JSON.parse(fs.readFileSync(FACTION_CONFIGS_JSON_PATH, 'UTF-8'));
    _.forOwn(factionConfigs, (rc, factionId) => {
        rc.factionId = factionId;
    });
}

export function updateGearTemplates() {
    var gearTemplateFilenames = fs.readdirSync(GEAR_HOME_PATH);
    gearTemplates = gearTemplateFilenames.map(gf => getTemplate(GEAR_HOME_PATH, gf));
}

export function updateUniformTemplates() {
    var uniformTemplateFilenames = fs.readdirSync(UNIFORM_HOME_PATH);
    uniformTemplates = uniformTemplateFilenames.map(uf => getTemplate(UNIFORM_HOME_PATH, uf));
}

export function updateGroupTemplates() {
    groupTemplates = <GroupTemplate[]>JSON.parse(fs.readFileSync(GROUPS_JSON_PATH, 'UTF-8'));
}

export function updateVehicleClassnameTemplates() {
    vehicleClassnameTemplates = <VehicleClassnameTemplate[]>JSON.parse(fs.readFileSync(VEHICLE_CLASSNAMES_JSON_PATH, 'UTF-8'));
}

export function getFactions(): Faction[] {
    return factions;
}

export function getFactionConfigs(): { [id: string]: FactionConfig } {
    return factionConfigs;
}

export function getGearTemplates(): GearTemplate[] {
    return gearTemplates;
}

export function getUniformTemplates(): UniformTemplate[] {
    return uniformTemplates;
}

export function getGroupTemplates(): GroupTemplate[] {
    return groupTemplates;
}

export function getVehicleClassnameTemplates(): VehicleClassnameTemplate[] {
    return vehicleClassnameTemplates;
}

export function getSampleMissionPath(): string {
    return SAMPLE_MISSION_PATH;
}

updateFactions();
updateFactionConfigs();
updateGearTemplates();
updateUniformTemplates();
updateGroupTemplates();
updateVehicleClassnameTemplates();
