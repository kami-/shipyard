/// <reference path="./typings/tsd.d.ts" />

import Settings = require('./Settings');
import fs = require('fs-extra');

import {Ast, Lexer, Mission, Parser, PrettyPrinter} from 'config-parser';
import {Template} from '../common/Common';
import {GearTemplate, UniformTemplate, GroupTemplate, VehicleClassnameTemplate, Faction, FactionConfig, Config, FactionRequest} from '../common/Hull3';
export {GearTemplate, UniformTemplate, GroupTemplate, VehicleClassnameTemplate, Faction, FactionConfig, Config, FactionRequest} from '../common/Hull3';

export function parseFile(path: string): Parser.Node {
    var factionFile: string = fs.readFileSync(path, 'UTF-8');
    return Parser.create(factionFile, Lexer.create(factionFile)).parse();
}
