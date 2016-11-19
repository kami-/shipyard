import * as fs from 'fs-extra';
import {Ast, Lexer, Mission, Parser, PrettyPrinter} from 'config-parser';

import * as Settings from './Settings';
import {parseFile} from './Common';
import {Template} from '../common/Common';
import {Config, Request, UnitTemplate, ZoneTemplate} from '../common/Admiral';
export {Config, Request, UnitTemplate, ZoneTemplate} from '../common/Admiral';

var UNIT_TEMPLATE_PATH = `${Settings.PATH.SERVER_ADDON_HOME}/${Settings.PATH.Admiral.HOME}/admiral/unit_templates.h`,
    ZONE_TEMPLATE_PATH = `${Settings.PATH.SERVER_ADDON_HOME}/${Settings.PATH.Admiral.HOME}/admiral/zone_templates.h`;

var unitTemplates: UnitTemplate[] = [],
    zoneTemplates: ZoneTemplate[] = [];

function getTemplates(filePath: string, parentSelector: string): Template[] {
    var ast = parseFile(filePath);
    var templateAst = Ast.select(ast, `${parentSelector}.*`);
    return templateAst.map(ut => ({
        id: ut.fieldName,
        name: ut.fieldName,
        description: ''
    }));
}

function updateUnitTemplates() {
    unitTemplates = getTemplates(UNIT_TEMPLATE_PATH, 'UnitTemplates');
}

function updateZoneTemplates() {
    zoneTemplates = getTemplates(ZONE_TEMPLATE_PATH, 'ZoneTemplates');
}



export function replaceTemplates(admiralAst: Parser.Node, request: Request) {
    var templates = [
        { selector: 'Camp.defaultUnitTemplate' , value: request.campUnitTemplateId },
        { selector: 'Camp.defaultZoneTemplate' , value: request.campZoneTemplateId },
        { selector: 'Patrol.defaultUnitTemplate' , value: request.patrolUnitTemplateId },
        { selector: 'Patrol.defaultUnitTemplate' , value: request.patrolUnitTemplateId },
        { selector: 'Cqc.defaultUnitTemplate' , value: request.cqcUnitTemplateId },
        { selector: 'Cqc.defaultUnitTemplate' , value: request.cqcUnitTemplateId },
    ];
    templates.forEach(t => {
        Ast.select(admiralAst, 'Admiral.' + t.selector)[0].value = t.value;
    })
}

export function getUnitTemplates(): UnitTemplate[] {
    return unitTemplates;
}

export function getZoneTemplates(): ZoneTemplate[] {
    return zoneTemplates;
}

export function init() {
    updateUnitTemplates();
    updateZoneTemplates();
}
