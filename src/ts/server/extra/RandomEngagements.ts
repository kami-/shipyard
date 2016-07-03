/// <reference path="../typings/tsd.d.ts" />

import fs = require('fs-extra');
import _ = require('lodash');
import PrettyPrinter = require('./EvalPrettyPrinter');
import Mission = require('../Mission');
import Settings = require('../Settings');

import {Ast, Lexer, Parser} from 'config-parser';

var SAMPLE_MISSION_PATH = `${Settings.PATH.SERVER_RESOURCES_HOME}/${Settings.PATH.RE.HOME}/${Settings.PATH.RE.SAMPLE_MISSION_HOME}`;
var VARNAMES = {
    OVERVIEW_TEXT: 'ark_re_overviewText',
    ATTACKER_FACTION: 'ark_re_attacker_faction',
    ATTACKER_SIDE: 'ark_re_attacker_side',
    ATTACKER_SIDE_PREFIX: 'ark_re_attacker_sidePrefix',
    ATTACKER_ROLE_PREFIX: 'ark_re_attacker_rolePrefix',
    DEFENDER_FACTION: 'ark_re_attacker_faction',
    DEFENDER_SIDE: 'ark_re_defender_side',
    DEFENDER_SIDE_PREFIX: 'ark_re_defender_sidePrefix',
    DEFENDER_ROLE_PREFIX: 'ark_re_defender_rolePrefix',
}

function setOverviewText(ast: Parser.Node) {
    var overviewText = Ast.select(ast, 'Mission.Intel.overviewText')[0];
    overviewText.value = `__EVAL(${VARNAMES.OVERVIEW_TEXT})`;
}

function setSide(vehicle: Parser.Node, sideVarName: string) {
    var side = Ast.select(vehicle, 'side')[0];
    side.value = `__EVAL(${sideVarName})`;
}

function setDescription(vehicle: Parser.Node, rolePrefixVarName: string) {
    var despription = Ast.select(vehicle, 'description')[0];
    despription.value = `__EVAL(${rolePrefixVarName} + " -${despription.value.split('-')[1]}")`;
}

function setInit(vehicle: Parser.Node, factionVarName: string) {
    var init = Ast.select(vehicle, 'init')[0];
    var replacedFactionInit = (<string>init.value).replace(/"/g, '""').replace(/\[""faction"", ""[^"]*""\]/g, `[""faction"", """ + ${factionVarName} + """]`);
    init.value = `__EVAL("${replacedFactionInit.replace(/;/g, '')}")`; 
}

function setClassname(vehicle: Parser.Node, sidePrefixVarName: string) {
    var vehicleField = Ast.select(vehicle, 'vehicle')[0];
    vehicleField.value = `__EVAL(${sidePrefixVarName} + "${(<string>vehicleField.value).substring(1)}")`; 
}

function defaultMission(briefingName: string): Mission.Mission {
    return  {
        terrainId: '',
        missionTypeName: 'TVT',
        onLoadName: 'Random Engegaments',
        author: 'Someone',
        briefingName: briefingName,
        overviewText: '',
        factions: [],
        addons: {
            admiral: false,
            plank: false
        }
    }
}

function generate(missionSqm: string): Parser.Node {
    var ast = Parser.create(missionSqm, Lexer.create(missionSqm)).parse();
    console.log(ast);
    var groupItems = Ast.select(ast, 'Mission.Groups.Item*');
    console.log('groupItems', groupItems[0]);
    var originalAttackerSide = Ast.select(groupItems[0], 'Vehicles.Item0.side')[0].value;
    console.log('originalAttackerSide');
    setOverviewText(ast);
    console.log('setOverviewText');
    _.each(groupItems, g => {
        var groupSide = Ast.select(g, 'side')[0];
        groupSide.value = originalAttackerSide.toLocaleLowerCase() == groupSide.value.toLowerCase() ? `__EVAL(${VARNAMES.ATTACKER_SIDE})` : `__EVAL(${VARNAMES.DEFENDER_SIDE})` ;
        _.chain(Ast.select(g, 'Vehicles.Item*'))
        .filter(v => Ast.select(v, 'player').length > 0)
        .each(v => {
            var side = Ast.select(v, 'side')[0],
                factionVarName = VARNAMES.DEFENDER_FACTION,
                sideVarName = VARNAMES.DEFENDER_SIDE,
                sidePrefixVarName = VARNAMES.DEFENDER_SIDE_PREFIX,
                rolePrefixVarName = VARNAMES.DEFENDER_ROLE_PREFIX;
            if (originalAttackerSide.toLocaleLowerCase() == side.value.toLowerCase()) {
                factionVarName = VARNAMES.ATTACKER_FACTION,
                sideVarName = VARNAMES.ATTACKER_SIDE,
                sidePrefixVarName = VARNAMES.ATTACKER_SIDE_PREFIX,
                rolePrefixVarName = VARNAMES.ATTACKER_ROLE_PREFIX;
            };
            setClassname(v, sidePrefixVarName);
            setSide(v, sideVarName);
            setDescription(v, rolePrefixVarName);
            setInit(v, factionVarName);
        })
        .value();
    });
    return ast;
}

export function generateMission(missionSqm: string): Mission.GeneratedMission {
    var briefingName = 'random_engegaments';
    var missionAst = generate(missionSqm);
    var missionId = Mission.nextMissionId();
    var maxPlayers = Mission.getPlayableUnitCount(missionAst);
    var fullMissionName = `ark_tvt${maxPlayers}_${briefingName}`;
    var missionDirName = `${fullMissionName}.Altis`;
    var missionWorkingDir = `${Settings.PATH.Mission.WORKING_DIR}/${missionId}`;
    var missionDir = `${missionWorkingDir}/${missionDirName}`;
    fs.copySync(SAMPLE_MISSION_PATH, missionDir);
    Ast.select(missionAst, 'Mission.Intel.briefingName')[0].value = fullMissionName;
    fs.writeFileSync(`${missionDir}/mission.sqm`, '#include "re.h"\n\n' + PrettyPrinter.create('\t').print(missionAst), 'UTF-8');
    Mission.generateDescriptionExt(missionDir, defaultMission(briefingName), Mission.MissionType.TVT, maxPlayers);
    return {
        missionId: missionId,
        missionWorkingDir: missionWorkingDir,
        missionDirName: missionDirName,
        missionDir: missionDir
    }
}
