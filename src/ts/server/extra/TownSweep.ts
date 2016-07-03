/// <reference path="../typings/tsd.d.ts" />

import fs = require('fs-extra');
import _ = require('lodash');
import Common = require('../../common/Common');
import Hull3 = require('../Hull3');
import Mission = require('../Mission');
import Settings = require('../Settings');

import {Ast, Lexer, Parser, PrettyPrinter} from 'config-parser';

function removeRolePrefix(vehicle: Parser.Node) {
    var despription = Ast.select(vehicle, 'Attributes.description')[0];
    despription.value = despription.value.split('-')[1].substring(1);
}

function defaultMission(terrainId: string): Mission.Mission {
    var faction = Hull3.getFactions()[0];
    return {
        terrainId: terrainId,
        missionTypeName: 'COOP',
        onLoadName: 'Town Sweep',
        author: 'Ark',
        briefingName: 'town_sweep',
        overviewText: 'Town Sweep (Set camouflage)',
        factions: [{
            factionId: faction.id,
            sideName: Common.sideToString(faction.side),
            gearTemplateId: faction.gearTemplateId,
            uniformTemplateId: faction.uniformTemplateId,
            groupTemplateIds: ['CO', 'ASL', 'A1', 'A2', 'A3', 'BSL', 'B1', 'B2', 'B3', 'CSL', 'C1', 'C2', 'C3', 'DSL', 'D1', 'D2', 'D3', 'MMG1', 'MMG2', 'MMG3', 'MMG4'],
            vehicleClassnames: faction.vehicleClassnames
        }],
        addons: {
            Admiral: {
                isEnabled: true,
                campUnitTemplateId: 'Base',
                campZoneTemplateId: 'Camp',
                patrolUnitTemplateId: 'Base',
                patrolZoneTemplateId: 'Patrol',
                cqcUnitTemplateId: 'Base',
                cqcZoneTemplateId: 'Cqc'
            },
            plank: false
        }
    };
}

function updateMissionSqm(missionSqmPath: string) {
    var missionSqm = fs.readFileSync(missionSqmPath, 'UTF-8');
    var ast = Parser.create(missionSqm, Lexer.create(missionSqm)).parse();
    _.remove(Ast.select(ast, 'Mission.Entities')[0].fields, n => {
        var dataType = Ast.select(n, 'dataType')[0];
        return dataType && dataType.value != 'Group'
    });
    var groupItems = Ast.select(ast, 'Mission.Entities.Item*').filter(e => Ast.select(e, 'dataType')[0].value == 'Group');
    _.each(groupItems, g => {
        _.chain(Ast.select(g, 'Entities.Item*'))
        .each(v => { removeRolePrefix(v); })
        .value();
    });
    fs.writeFileSync(missionSqmPath, PrettyPrinter.create('\t').print(ast), 'UTF-8');
}

function updateDescriptionExt(descriptionExtPath: string) {
    var camouflageParam = `
        class TownSweep_Camouflage {
            title = "Camouflage";
            values[] = {0,1,2};
            texts[] = {"Woodland", "Desert", "Snow"};
            default = 0;
        };
    `;
    var descriptionExt = fs.readFileSync(descriptionExtPath, 'UTF-8')
        .replace(/class Params {/g, "class Params {" + camouflageParam);
    fs.writeFileSync(descriptionExtPath, descriptionExt, 'UTF-8');
}

function updateHull3(hull3Path: string) {
    var events = `

    class Events {
        hull3_initialized = "src\\preinit.sqf";
    };
    `;

    var hull3 = fs.readFileSync(hull3Path, 'UTF-8')
        .replace(/isEnabled = 1;/g, "isEnabled = 1;" + events);
    fs.writeFileSync(hull3Path, hull3, 'UTF-8');
}

function updateAdmiral(admiralPath: string) {
    var events = `

    class Events {
        admiral_initialized = "src\\admiral_initialized.sqf";
    };
    `;

    var admiral = fs.readFileSync(admiralPath, 'UTF-8')
        .replace(/isEnabled = 1;/g, "isEnabled = 1;" + events);
    fs.writeFileSync(admiralPath, admiral, 'UTF-8');
}

export function generateMission(terrainId: string): Mission.GeneratedMission {
    var mission = defaultMission(terrainId);
    var generatedMission = Mission.generateMission(mission);
    updateMissionSqm(`${generatedMission.missionDir}/mission.sqm`);
    updateDescriptionExt(`${generatedMission.missionDir}/description.ext`);
    updateHull3(`${generatedMission.missionDir}/hull3/hull3.h`);
    updateAdmiral(`${generatedMission.missionDir}/admiral/admiral.h`);
    fs.copySync(`${Settings.PATH.SERVER_RESOURCES_HOME}/extra/ts/src`, `${generatedMission.missionDir}/src`);
    fs.copySync(`${Settings.PATH.SERVER_RESOURCES_HOME}/extra/ts/hull3/briefing/blufor.sqf`, `${generatedMission.missionDir}/hull3/briefing/blufor.sqf`);
    return generatedMission;
}
