import * as fs from 'fs-extra';
import * as _ from 'lodash';
import {Ast, Lexer, Mission, Parser, PrettyPrinter} from 'config-parser';

import * as Settings from './Settings';
import {parseFile} from './Common';
import {Template, armaStringToSide} from '../common/Common';
import {GearTemplate, UniformTemplate, GroupTemplate, VehicleClassnameTemplate, Faction, Config, FactionRequest} from '../common/Hull3';
export {GearTemplate, UniformTemplate, GroupTemplate, VehicleClassnameTemplate, Faction, Config, FactionRequest} from '../common/Hull3';

const groupTemplates: GroupTemplate[] = require("./resources/groups.json");
const vehicleClassnameTemplates: VehicleClassnameTemplate[] = require("./resources/vehicle-classnames.json");

var SAMPLE_MISSION_PATH = `${Settings.PATH.SERVER_ADDON_HOME}/${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.SAMPLE_MISSION_HOME}`,
    FACTION_PATH = `${Settings.PATH.SERVER_ADDON_HOME}/${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.FACTION}`,
    GEAR_HOME_PATH = `${Settings.PATH.SERVER_ADDON_HOME}/${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.GEAR_HOME}`,
    UNIFORM_HOME_PATH = `${Settings.PATH.SERVER_ADDON_HOME}/${Settings.PATH.Hull3.HOME}/${Settings.PATH.Hull3.UNIFORM_HOME}`;

var factions: Faction[] = [],
    gearTemplates: GearTemplate[] = [],
    uniformTemplates: UniformTemplate[] = [];

function getTemplate(homePath: string, filename: string): Template {
    var ast = parseFile(`${homePath}/${filename}`);
    var templateAst = Ast.select(ast, '*')[0];
    return {
        id: templateAst.fieldName,
        name: templateAst.fieldName,
        description: ''
    }
}

function getFactionById(id: string): Faction {
    return _.find<Faction>(factions, f => f.id == id);
}

function getGroupTemplateById(id: string): GroupTemplate {
    return _.find<GroupTemplate>(groupTemplates, f => f.id == id);
}

function factionNodeToFaction(node: Parser.Node): Faction {
    return {
        id: node.fieldName,
        name: Ast.select(node, 'name')[0].value,
        description: Ast.select(node, 'description')[0].value,
        gearTemplateId:  Ast.select(node, 'gear')[0].value,
        uniformTemplateId: Ast.select(node, 'uniform')[0].value,
        side: armaStringToSide(Ast.select(node, 'side')[0].value),
        camouflage: Ast.select(node, 'camouflage')[0].values.map(n => n.value),
        rolePrefix: Ast.select(node, 'rolePrefix')[0].value,
        vehicleClassnames: getVehicleClassnames(node)
    };
}

function getVehicleClassnames(node: Parser.Node): { [id: string]: string } {
    var vehicleClassnamesNode = Ast.select(node, 'vehicleClassnames')[0];
    return vehicleClassnamesNode.values.reduce((acc, pair) => {
        acc[pair.values[0].value] = pair.values[1].value;
        return acc;
    }, <{ [id: string]: string }>{});
}

function shiftPosition(node: Parser.Node, xShift: number) {
    var position = Ast.select(node, 'PositionInfo.position')[0];
    var x = position.values[0];
    var z = position.values[1];
    x.value = parseFloat(x.value) + xShift;
    z.value = 1000;
}

function removeUnselectedGroups(ast: Parser.Node, factionId: string, rolePrefix: string, selectedGroupIds: string[], xShift: number) {
    var groupItems = Ast.select(ast, 'Mission.Entities.Item*').filter(e => Ast.select(e, 'dataType')[0].value == 'Group');
    var removableItemIds: number[] = [];
    for (var i = 0, glen = groupItems.length; i < glen; i++) {
        var entitiesItems = Ast.select(groupItems[i], 'Entities.Item*');
        for (var j = 0, elen = entitiesItems.length; j < elen; j++) {
            var description = Ast.select(entitiesItems[j], 'Attributes.description')[0],
                init = Ast.select(entitiesItems[j], 'Attributes.init')[0];
            var groupId = description.value.split(';')[0].split('.')[1];
            if (!_.includes(selectedGroupIds, groupId)) {
                removableItemIds.push(Ast.select(groupItems[i], 'id')[0].value);
                break;
            }
            var groupTemplate = getGroupTemplateById(groupId);
            var newDescription = (<string>description.value).replace(`Group.${groupId};`, rolePrefix);
            description.value = groupTemplate ? newDescription + '@' + getGroupTemplateById(groupId).name : newDescription;;
            init.value = (<string>init.value).replace('["faction", "FACTION"]', `["faction", "${factionId}"]`);
            shiftPosition(entitiesItems[j], xShift);
        }
    }
    _.remove(Ast.select(ast, 'Mission.Entities')[0].fields, n => {
        var id = Ast.select(n, 'id')[0];
        return id && _.includes(removableItemIds, id.value);
    });
}

function removeUnselectedVehicles(ast: Parser.Node, factionId: string, rolePrefix: string, selectedGroupIds: string[], vehicleClassnames: { [id: string]: string }, xShift: number) {
    var vehicleItems = Ast.select(ast, 'Mission.Entities.Item*').filter(e => Ast.select(e, 'dataType')[0].value == 'Object');
    var removableItemIds: number[] = [];
    for (var i = 0, len = vehicleItems.length; i < len; i++) {
        var description = Ast.select(vehicleItems[i], 'Attributes.description')[0],
            init = Ast.select(vehicleItems[i], 'Attributes.init')[0],
            type = Ast.select(vehicleItems[i], 'type')[0];
        var groupId = description.value.split(';')[0].split('.')[1],
            vehicleClassnameId = description.value.split(';')[1].split('.')[1];
        if (!_.includes(selectedGroupIds, groupId)) {
            removableItemIds.push(Ast.select(vehicleItems[i], 'id')[0].value);
            continue;
        }
        description.value = '';
        if (init) {
            init.value = (<string>init.value).replace('["faction", "FACTION"]', `["faction", "${factionId}"]`);
        }
        type.value = vehicleClassnames[vehicleClassnameId];
        shiftPosition(vehicleItems[i], xShift);
    }
    _.remove(Ast.select(ast, 'Mission.Entities')[0].fields, n => {
        var id = Ast.select(n, 'id')[0];
        return id && _.includes(removableItemIds, id.value);
    });
}

function updateFactions() {
    var factionsAst = parseFile(FACTION_PATH);
    factions = _.sortBy(Ast.select(factionsAst, 'Faction.*').map(factionNodeToFaction), 'name');
}

function updateGearTemplates() {
    var gearTemplateFilenames = fs.readdirSync(GEAR_HOME_PATH);
    gearTemplates = gearTemplateFilenames.map(gf => getTemplate(GEAR_HOME_PATH, gf));
}

function updateUniformTemplates() {
    var uniformTemplateFilenames = fs.readdirSync(UNIFORM_HOME_PATH);
    uniformTemplates = uniformTemplateFilenames.map(uf => getTemplate(UNIFORM_HOME_PATH, uf));
}



export function getFactionRolePrefixById(id: string): string {
    return getFactionById(id).rolePrefix;
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

export function init() {
    updateFactions();
    updateGearTemplates();
    updateUniformTemplates();
}
