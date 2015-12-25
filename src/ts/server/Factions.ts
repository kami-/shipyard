/*
/// <reference path="../typings/node.d.ts" />

import Lexer = require('../node_modules/config-parser/Lexer');
import Parser = require('../node_modules/config-parser/Parser');
import PrettyPrinter = require('../node_modules/config-parser/PrettyPrinter');
import Hull = require('./Hull');
import Settings = require('./Settings');
import fs = require('fs');

type Factions = { [faction: string]: string; };
type GameFactions = { [game: string]: Factions; };

function getFactionsByGame(game: string): Factions {
    var result: Factions = {};
    try {
        var gameFactions: GameFactions = <GameFactions>JSON.parse(fs.readFileSync(Settings.FILE_PATHS.FACTIONS, 'utf8'));
        if (gameFactions[game]) {
            result = gameFactions[game];
        }
    } catch (e) {
        console.log('Failed to read faction data file!\n', e);
    }
    return result
}

function readFactionFile(game: string, factions: Factions, factionName: string): string {
    var result: string = '';
    if (factions[factionName]) {
        try {
            result = fs.readFileSync(`${Settings.FILE_PATHS.FACTIONS_HOME}/${game}/${factions[factionName]}`, 'utf8');
        } catch (e) {
            console.log('Failed to read faction file!\n', e);
        }
    }
    return result
};

function getFactionFiles(game: string, factions: Factions, factionNames: string[]): string[] {
    var result: string[] = [];
    for (var i = 0, len = factionNames.length; i < len; i++) {
        var factionFile: string = readFactionFile(game, factions, factionNames[i]);
        if (factionFile !== '') {
            result.push(factionFile);
        }
    }
    return result;
};

function getDefaultMission(game: string, factions: Factions): string {
    return readFactionFile(game, factions, Settings.DEFAULT_MISSION_SQM);
};

export function getFactionNamesByGame(game: string): string[] {
    var result: string[] = [],
        factions: Factions = getFactionsByGame(game);
    for (var factionName in factions) {
        if (factions.hasOwnProperty(factionName) && factionName !== Settings.DEFAULT_MISSION_SQM) {
            result.push(factionName);
        }
    }
    return result;
};

export function getMissionWithFactions(game: string, factionNames: string[]): string {
    var factions: Factions = getFactionsByGame(game);
    var missionFile: string = getDefaultMission(game, factions);
    var missionAst: Parser.Node = Parser.create(missionFile, Lexer.create(missionFile)).parse();
    Hull.addFactions(missionAst, getFactionFiles(game, factions, factionNames));
    return PrettyPrinter.create('    ').print(missionAst);
*/