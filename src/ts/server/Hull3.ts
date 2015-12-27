/// <reference path="./typings/tsd.d.ts" />

import Settings = require('./Settings');
import fs = require('fs-extra');

import {Ast, Lexer, Mission, Parser} from 'config-parser';
import {Faction, Template, GearTemplate, UniformTemplate, GroupTemplate, VehicleClassnameTemplate, Config} from '../common/Hull3';
export {Faction, Template, GearTemplate, UniformTemplate, GroupTemplate, VehicleClassnameTemplate, Config} from '../common/Hull3';

var SAMPLE_MISSION_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.SAMPLE_MISSION_HOME}`, 
    FACTION_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.FACTION}`,
    GEAR_HOME_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.GEAR_HOME}`,
    UNIFORM_HOME_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.UNIFORM_HOME}`,
    GROUPS_JSON_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/groups.json`;

var factions: Faction[] = [];
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

export function updateGearTemplates() {
    var gearTemplateFilenames = fs.readdirSync(GEAR_HOME_PATH);
    gearTemplates = gearTemplateFilenames.map(gf => getTemplate(GEAR_HOME_PATH, gf));
}

export function updateUniformTemplates() {
    var uniformTemplateFilenames = fs.readdirSync(UNIFORM_HOME_PATH);
    uniformTemplates = uniformTemplateFilenames.map(uf => getTemplate(UNIFORM_HOME_PATH, uf));
}

export function updateGroupTemplates() {
    groupTemplates = JSON.parse(fs.readFileSync(GROUPS_JSON_PATH, 'UTF-8'));
}

export function updateVehicleClassnameTemplates() {
    vehicleClassnameTemplates = [
        { id: 'IFV', name: 'IFV', description: '', classname: 'BLU_IFV' },
        { id: 'TNK', name: 'Tank', description: '', classname: 'BLU_TNK' },
        { id: 'TH', name: 'Transport helo', description: '', classname: 'BLU_TH' },
        { id: 'AH', name: 'Attack helo', description: '', classname: 'BLU_AH' }
    ];
}

export function getFactions(): Faction[] {
    return factions;
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
updateGearTemplates();
updateUniformTemplates();
updateGroupTemplates();
updateVehicleClassnameTemplates();
