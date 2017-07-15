import * as fs from 'fs-extra';
import * as _ from 'lodash';
import * as Common from '../../common/Common';
import * as Hull3 from '../Hull3';
import * as Mission from '../Mission';
import * as Settings from '../Settings'

import {Ast, Lexer, Parser, PrettyPrinter} from 'config-parser';

const TS_HOME = `${Settings.PATH.SERVER_ADDON_HOME}/${Settings.PATH.ArkInhouse.HOME}/town_sweep`;

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
            Navy: false,
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
    Ast.select(ast, 'Mission.Entities.items')[0].value = Ast.select(ast, 'Mission.Entities.Item*').length;
    var groupItems = Ast.select(ast, 'Mission.Entities.Item*').filter(e => Ast.select(e, 'dataType')[0].value == 'Group');
    _.each(groupItems, g => {
        _.chain(Ast.select(g, 'Entities.Item*'))
        .each(v => { removeRolePrefix(v); })
        .value();
    });
    fs.writeFileSync(missionSqmPath, PrettyPrinter.create('\t').print(ast), 'UTF-8');
}

function updateDescriptionExt(descriptionExtPath: string) {
    const enableClass = fs.readFileSync(`${TS_HOME}/ts_enable_class.h`, 'UTF-8');
    const camouflageParam = fs.readFileSync(`${TS_HOME}/ts_camouflage_param.h`, 'UTF-8');
    const descriptionExt = fs.readFileSync(descriptionExtPath, 'UTF-8')
        .replace(/class Params {/g, `\n${enableClass}\n\nclass Params {\n${camouflageParam}\n\n`);
    fs.writeFileSync(descriptionExtPath, descriptionExt, 'UTF-8');
}

export function generateMission(terrainId: string): Mission.GeneratedMission {
    var mission = defaultMission(terrainId);
    var generatedMission = Mission.generateMission(mission);
    updateMissionSqm(`${generatedMission.missionDir}/mission.sqm`);
    updateDescriptionExt(`${generatedMission.missionDir}/description.ext`);
    fs.copySync(`${TS_HOME}/blufor_briefing.sqf`, `${generatedMission.missionDir}/hull3/briefing/blufor.sqf`);
    return generatedMission;
}
