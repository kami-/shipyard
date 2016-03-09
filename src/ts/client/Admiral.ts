/// <reference path="./typings/tsd.d.ts" />

import Settings = require('./Settings');
import _ = require('lodash');

import {Config, UnitTemplate, ZoneTemplate, Request} from '../common/Admiral';
export {Config, UnitTemplate, ZoneTemplate, Request} from '../common/Admiral';

var unitTemplates: UnitTemplate[] = [];
var zoneTemplates: ZoneTemplate[] = [];

export function getUnitTemplates(): UnitTemplate[] {
    return unitTemplates;
}

export function getZoneTemplates(): ZoneTemplate[] {
    return zoneTemplates;
}

export function updateFromConfig(config: Config) {
    unitTemplates = config.unitTemplates;
    zoneTemplates = config.zoneTemplates;
}