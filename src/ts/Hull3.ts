/// <reference path="../../typings/tsd.d.ts" />

import Settings = require('./Settings');
import fs = require('fs-extra');

import * as configParser from 'config-parser'
import Ast = configParser.Ast;
import Lexer = configParser.Lexer;
import Mission = configParser.Mission;
import Parser = configParser.Parser;

var SAMPLE_MISSION_PATH = `${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.SAMPLE_MISSION_HOME}`, 
    FACTION_PATH = `${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.FACTION}`,
    GEAR_HOME_PATH = `${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.GEAR_HOME}`,
    UNIFORM_HOME_PATH = `${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.UNIFORM_HOME}`;

export var factions: Faction[] = [];
export var gearTemplates: string[] = [];
export var uniformTemplates: string[] = [];

export interface Faction {
    name: string;
    gear: string;
    uniform: string;
}

function parseFile(path: string): Parser.Node {
    var factionFile: string = fs.readFileSync(path, 'UTF-8');
    return Parser.create(factionFile, Lexer.create(factionFile)).parse();
}

function factionNodeToFaction(node: Parser.Node): Faction {
    return {
        name: node.fieldName,
        gear:  Ast.select(node, 'gear')[0].value,
        uniform: Ast.select(node, 'uniform')[0].value
    }
}

function getTemplateName(homePath: string, filename: string) {
    var templateAst = parseFile(`${homePath}/${filename}`);
    return Ast.select(templateAst, '*')[0].fieldName;
}

export function updateFactions() {
    var factionsAst = parseFile(FACTION_PATH);
    factions = Ast.select(factionsAst, 'Faction.*').map(factionNodeToFaction);
}

export function updateGearTemplates() {
    var gearFilenamess = fs.readdirSync(GEAR_HOME_PATH);
    gearTemplates = gearFilenamess.map(gf => getTemplateName(GEAR_HOME_PATH, gf));
}

export function updateUniformTemplates() {
    var uniformFilenames = fs.readdirSync(UNIFORM_HOME_PATH);
    uniformTemplates = uniformFilenames.map(uf => getTemplateName(UNIFORM_HOME_PATH, uf));
}

export function getFactions(): Faction[] {
    return factions;
}

export function getGearTemplates(): string[] {
    return gearTemplates;
}

export function getUniformTemplates(): string[] {
    return uniformTemplates;
}

export function getSampleMissionPath(): string {
    return SAMPLE_MISSION_PATH;
}

updateFactions();
updateGearTemplates();
updateUniformTemplates();
