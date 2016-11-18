import * as Settings from './Settings';
import * as fs from 'fs-extra';

import {Lexer, Parser} from 'config-parser';
import {Template} from '../common/Common';

export function parseFile(path: string): Parser.Node {
    var factionFile: string = fs.readFileSync(path, 'UTF-8');
    return Parser.create(factionFile, Lexer.create(factionFile)).parse();
}
