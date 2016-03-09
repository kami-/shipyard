/// <reference path="./typings/tsd.d.ts" />

import Settings = require('./Settings');
import fs = require('fs-extra');

import {Lexer, Parser} from 'config-parser';
import {Template} from '../common/Common';

export function parseFile(path: string): Parser.Node {
    var factionFile: string = fs.readFileSync(path, 'UTF-8');
    return Parser.create(factionFile, Lexer.create(factionFile)).parse();
}
