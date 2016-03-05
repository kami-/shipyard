/// <reference path="./typings/tsd.d.ts" />

import Settings = require('./Settings');
import fs = require('fs-extra');
import _ = require('lodash');

import {Ast, Lexer, Mission, Parser, PrettyPrinter} from 'config-parser';
import {Template, GearTemplate, UniformTemplate, GroupTemplate, VehicleClassnameTemplate, Faction, FactionConfig, Config, FactionRequest} from '../common/Hull3';
export {Template, GearTemplate, UniformTemplate, GroupTemplate, VehicleClassnameTemplate, Faction, FactionConfig, Config, FactionRequest} from '../common/Hull3';

var SAMPLE_MISSION_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.SAMPLE_MISSION_HOME}`,
    FACTION_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.FACTION}`,
    GEAR_HOME_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.GEAR_HOME}`,
    UNIFORM_HOME_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.UNIFORM_HOME}`,
    FACTION_CONFIGS_JSON_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/factions.json`,
    GROUPS_JSON_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/groups.json`,
    VEHICLE_CLASSNAMES_JSON_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/vehicle-classnames.json`;

var factions: Faction[] = [],
    factionConfigs: { [id: string]: FactionConfig } = {},
    gearTemplates: GearTemplate[] = [],
    uniformTemplates: UniformTemplate[] = [],
    groupTemplates: GroupTemplate[] = [],
    vehicleClassnameTemplates: VehicleClassnameTemplate[] = [];

function parseFile(path: string): Parser.Node {
    var factionFile: string = fs.readFileSync(path, 'UTF-8');
    return Parser.create(factionFile, Lexer.create(factionFile)).parse();
}

function factionNodeToFaction(node: Parser.Node): Faction {
    return {
        id: node.fieldName,
        name: Ast.select(node, 'name')[0].value,
        description: Ast.select(node, 'description')[0].value,
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

function shiftPosition(node: Parser.Node, xShift: number) {
    var positionX = Ast.select(node, 'position')[0].values[0];
    positionX.value = (parseInt(positionX.value) + xShift).toString();       
}

function removeUnselectedGroups(ast: Parser.Node, factionId: string, rolePrefix: string, selectedGroupIds: string[], xShift: number) {
    var groupItems = Ast.select(ast, 'Mission.Groups.Item*');
    var removableGroupItemIndices = [];
    for (var i = 0, glen = groupItems.length; i < glen; i++) {
        var vehicleItems = Ast.select(groupItems[i], 'Vehicles.Item*');
        for (var j = 0, vlen = vehicleItems.length; j < vlen; j++) {
            var description = Ast.select(vehicleItems[j], 'description')[0],
                init = Ast.select(vehicleItems[j], 'init')[0];
            var groupId = description.value.split(';')[0].split('.')[1];
            if (!_.contains(selectedGroupIds, groupId)) {
                removableGroupItemIndices.push(i + 1); // 'Groups' has an 'items' field so we need to add one to the indices
                break;
            }
            description.value = (<string>description.value).replace(`Group.${groupId};`, rolePrefix);
            init.value = (<string>init.value).replace('["faction", "FACTION"]', `["faction", "${factionId}"]`);
            shiftPosition(vehicleItems[j], xShift);
        }
    }
    _.remove(Ast.select(ast, 'Mission.Groups')[0].fields, (n, idx) => _.contains(removableGroupItemIndices, idx));
}

function removeUnselectedVehicles(ast: Parser.Node, factionId: string, rolePrefix: string, selectedGroupIds: string[], vehicleClassnames: { [id: string]: string }, xShift: number) {
    var vehicleItems = Ast.select(ast, 'Mission.Vehicles.Item*');
    var removableVehicleItemIndices = [];
    for (var i = 0, len = vehicleItems.length; i < len; i++) {
        var description = Ast.select(vehicleItems[i], 'description')[0],
            init = Ast.select(vehicleItems[i], 'init')[0],
            vehicle = Ast.select(vehicleItems[i], 'vehicle')[0];
        var groupId = description.value.split(';')[0].split('.')[1],
            vehicleClassnameId = description.value.split(';')[1].split('.')[1];
        if (!_.contains(selectedGroupIds, groupId)) {
            removableVehicleItemIndices.push(i + 1); // 'Vehicles' has an 'items' field so we need to add one to the indices
            continue;
        }
        description.value = '';
        if (init) {
            init.value = (<string>init.value).replace('["faction", "FACTION"]', `["faction", "${factionId}"]`);
        }
        vehicle.value = vehicleClassnames[vehicleClassnameId];
        shiftPosition(vehicleItems[i], xShift);
    }
    _.remove(Ast.select(ast, 'Mission.Vehicles')[0].fields, (n, idx) => _.contains(removableVehicleItemIndices, idx));
}

export function getFactionRolePrefixById(id: string): string {
    return factionConfigs[id].rolePrefix;
}

export function updateFactions() {
    var factionsAst = parseFile(FACTION_PATH);
    factions = _.sortBy(Ast.select(factionsAst, 'Faction.*').map(factionNodeToFaction), 'name');
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

export function removeUnselectedItems(ast: Parser.Node, factionId: string, rolePrefix: string, selectedGroupIds: string[], vehicleClassnames: { [id: string]: string }, xShift: number) {
    removeUnselectedGroups(ast, factionId, rolePrefix, selectedGroupIds, xShift);
    removeUnselectedVehicles(ast, factionId, rolePrefix, selectedGroupIds, vehicleClassnames, xShift);
}

export function addFactionsToHull3Config(ast: Parser.Node, factions: FactionRequest[]) {
    var node = {
        type: Parser.NodeType.CLASS_FIELD,
        fieldName: 'Faction',
        inheritsFrom: '',
        fields: _.map(factions, f => {
            return {
                type: Parser.NodeType.CLASS_FIELD,
                fieldName: f.factionId,
                inheritsFrom: '',
                fields: [
                    { type: Parser.NodeType.STRING_FIELD, fieldName: 'gear', value: f.gearTemplateId },
                    { type: Parser.NodeType.STRING_FIELD, fieldName: 'uniform', value: f.uniformTemplateId }
                ]
            }
        })
    };
    Ast.select(ast, 'Hull3')[0].fields.push(node);
}

updateFactions();
updateFactionConfigs();
updateGearTemplates();
updateUniformTemplates();
updateGroupTemplates();
updateVehicleClassnameTemplates();
