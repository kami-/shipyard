import * as fs from 'fs-extra';
import * as _ from 'lodash';
import * as Common from '../../common/Common';
import * as Hull3 from '../Hull3';
import * as Mission from '../Mission';
import * as Settings from '../Settings'

import {Ast, Lexer, Parser, PrettyPrinter} from 'config-parser';

const RE_HOME = `${Settings.PATH.SERVER_ADDON_HOME}/${Settings.PATH.ArkInhouse.HOME}/random_engagements`;

function removeRolePrefix(vehicle: Parser.Node) {
    var despription = Ast.select(vehicle, 'Attributes.description')[0];
    despription.value = despription.value.split('-')[1].substring(1);
}

function defaultMission(terrainId: string): Mission.Mission {
    var attackerfaction = Hull3.getFactions()[0];
    var defenderfaction = Hull3.getFactions()[1];
    return {
        terrainId: terrainId,
        missionTypeName: 'TVT',
        onLoadName: 'Random Engagements',
        author: 'Ark',
        briefingName: 'random_engagements',
        overviewText: 'Random Engagements (Set camouflage) | Slot HMG for attacker when Planking',
        factions: [{
            factionId: attackerfaction.id,
            sideName: Common.sideToString(Common.Side.BLUFOR),
            gearTemplateId: attackerfaction.gearTemplateId,
            uniformTemplateId: attackerfaction.uniformTemplateId,
            groupTemplateIds: ['CO', 'ASL', 'A1', 'A2', 'A3', 'BSL', 'B1', 'B2', 'B3', 'CSL', 'C1', 'C2', 'C3', 'DSL', 'D1', 'D2', 'D3', 'MMG1', 'MMG2', 'MMG3', 'MMG4', 'HMG1', 'HMG2', 'HMG3', 'HMG4'],
            vehicleClassnames: attackerfaction.vehicleClassnames
        },
        {
            factionId: defenderfaction.id,
            sideName: Common.sideToString(Common.Side.OPFOR),
            gearTemplateId: defenderfaction.gearTemplateId,
            uniformTemplateId: defenderfaction.uniformTemplateId,
            groupTemplateIds: ['CO', 'ASL', 'A1', 'A2', 'A3', 'BSL', 'B1', 'B2', 'B3', 'CSL', 'C1', 'C2', 'C3', 'DSL', 'D1', 'D2', 'D3', 'MMG1', 'MMG2', 'MMG3', 'MMG4'],
            vehicleClassnames: defenderfaction.vehicleClassnames
        }],
        addons: {
            Admiral: {
                isEnabled: false,
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

function updateMissionSqm(missionSqmPath: string): Parser.Node {
    var missionSqm = fs.readFileSync(missionSqmPath, 'UTF-8');
    var ast = Parser.create(missionSqm, Lexer.create(missionSqm)).parse();
    _.remove(Ast.select(ast, 'Mission.Entities')[0].fields, n => {
        var dataType = Ast.select(n, 'dataType')[0];
        return dataType && dataType.value != 'Group';
    });

    var groupItems = Ast.select(ast, 'Mission.Entities.Item*').filter(e => Ast.select(e, 'dataType')[0].value == 'Group');
    _.each(groupItems, g => {
        _.chain(Ast.select(g, 'Entities.Item*'))
        .each(v => { removeRolePrefix(v); })
        .value();
    });

    var hmgGroups = Ast.select(ast, 'Mission.Entities.Item*')
        .filter(e => Ast.select(e, 'dataType')[0].value == 'Group')
        .filter(e => Ast.select(e, 'Entities.Item0.Attributes.description')[0].value.indexOf('HMG') >= 0);
    _.each(hmgGroups, g => {
        _.remove(Ast.select(g, 'Entities')[0].fields, u => {
            var description = Ast.select(u, 'Attributes.description')[0];
            return description
                && description.value.indexOf('HMG') >= 0
                && description.value.indexOf('Assistant') >= 0;
        });
        Ast.select(g, 'Entities.items')[0].value = Ast.select(g, 'Entities.Item*').length;
        Ast.select(g, 'Entities.Item2')[0].fieldName = "Item1";
    });
    Ast.select(ast, 'Mission.Entities.items')[0].value = Ast.select(ast, 'Mission.Entities.Item*').length;
    return ast;
}

function updateDescriptionExt(descriptionExtPath: string, maxPlayers: number) {
    const enableClass = fs.readFileSync(`${RE_HOME}/re_enable_class.h`, 'UTF-8');
    const camouflageParam = fs.readFileSync(`${RE_HOME}/re_camouflage_param.h`, 'UTF-8');
    const descriptionExt = fs.readFileSync(descriptionExtPath, 'UTF-8')
        .replace(/maxPlayers = [^;]*;/g, `maxPlayers = ${maxPlayers.toString()};`)
        .replace(/class Params {/g, `\n${enableClass}\n\nclass Params {\n${camouflageParam}\n\n`);
    fs.writeFileSync(descriptionExtPath, descriptionExt, 'UTF-8');
}

export function generateMission(terrainId: string): Mission.GeneratedMission {
    var mission = defaultMission(terrainId);
    var generatedMission = Mission.generateMission(mission);
    var missionSqmPath = `${generatedMission.missionDir}/mission.sqm`;
    var missionAst = updateMissionSqm(missionSqmPath);
    var maxPlayers = Mission.getPlayableUnitCount(missionAst);
    var fullMissionName = `ark_${Mission.missionTypeToMissionNamePrefix(Mission.stringToMissionType(mission.missionTypeName))}${maxPlayers}_${mission.briefingName.toLowerCase()}`;
    updateDescriptionExt(`${generatedMission.missionDir}/description.ext`, maxPlayers);

    generatedMission.downloadMissionName = `${fullMissionName}.${mission.terrainId}`;
    Ast.select(missionAst, 'ScenarioData.Header.maxPlayers')[0].value = maxPlayers;
    Ast.select(missionAst, 'Mission.Intel.briefingName')[0].value = fullMissionName;

    fs.writeFileSync(missionSqmPath, PrettyPrinter.create('\t').print(missionAst), 'UTF-8');
    fs.copySync(`${RE_HOME}/blufor_briefing.sqf`, `${generatedMission.missionDir}/hull3/briefing/blufor.sqf`);
    fs.copySync(`${RE_HOME}/opfor_briefing.sqf`, `${generatedMission.missionDir}/hull3/briefing/opfor.sqf`);

    return generatedMission;
}
