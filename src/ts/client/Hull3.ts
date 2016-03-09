/// <reference path="./typings/tsd.d.ts" />

import Settings = require('./Settings');
import _ = require('lodash');

import {GearTemplate, UniformTemplate, GroupTemplate, VehicleClassnameTemplate, Faction, Config, FactionRequest} from '../common/Hull3';
export {GearTemplate, UniformTemplate, GroupTemplate, VehicleClassnameTemplate, Faction, Config, FactionRequest} from '../common/Hull3';

var factions: Faction[] = [];
var gearTemplates: GearTemplate[] = [];
var uniformTemplates: UniformTemplate[] = [];
var groupTemplates: GroupTemplate[] = [];
var vehicleClassnameTemplates: VehicleClassnameTemplate[] = [];

export function getFactions(): Faction[] {
    return factions;
}

export function getFactionById(id: string): Faction {
    return _.find<Faction>(factions, '.id', id);
}

export function getGearTemplates(): GearTemplate[] {
    return gearTemplates;
}

export function getUniformTemplates(): UniformTemplate[] {
    return uniformTemplates;
}

export function getGroupTemplates(): GroupTemplate[] {
    return groupTemplates;
}

export function getVehicleClassnameTemplates(): VehicleClassnameTemplate[] {
    return vehicleClassnameTemplates;
}

export function updateFromConfig(config: Config) {
    factions = config.factions;
    gearTemplates = config.gearTemplates;
    uniformTemplates = config.uniformTemplates;
    groupTemplates = config.groupTemplates;
    vehicleClassnameTemplates = config.vehicleClassnameTemplates;
}