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
export var gearTemplates: Template[] = [];
export var uniformTemplates: Template[] = [];

export interface Template {
    id: string;
    name: string;
    description: string;
}

export interface GearTemplate extends Template {}
export interface UniformTemplate extends Template {}

export interface Faction {
    name: string;
    gearTemplateId: string;
    uniformTemplateId: string;
}

function parseFile(path: string): Parser.Node {
    var factionFile: string = fs.readFileSync(path, 'UTF-8');
    return Parser.create(factionFile, Lexer.create(factionFile)).parse();
}

function factionNodeToFaction(node: Parser.Node): Faction {
    return {
        name: node.fieldName,
        gearTemplateId:  Ast.select(node, 'gear')[0].value,
        uniformTemplateId: Ast.select(node, 'uniform')[0].value
    }
}

function getTemplate(homePath: string, filename: string): Template {
    var ast = parseFile(`${homePath}/${filename}`);
    var templateAst = Ast.select(templateAst, '*')[0];
    return {
        id: templateAst.fieldName,
        name: templateAst.fieldName,
        description: ""
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

export function getFactions(): Faction[] {
    return factions;
}

export function getGearTemplates(): GearTemplate[] {
    return gearTemplates;
}

export function getUniformTemplates(): UniformTemplate[] {
    return uniformTemplates;
}

export function getSampleMissionPath(): string {
    return SAMPLE_MISSION_PATH;
}

updateFactions();
updateGearTemplates();
updateUniformTemplates();
