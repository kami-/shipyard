/// <reference path="./typings/tsd.d.ts" />

import Settings = require('./Settings');
import _ = require('lodash');

import {GearTemplate, UniformTemplate, GroupTemplate, VehicleClassnameTemplate, Faction, FactionConfig, Config, FactionRequest} from '../common/Hull3';
export {GearTemplate, UniformTemplate, GroupTemplate, VehicleClassnameTemplate, Faction, FactionConfig, Config, FactionRequest} from '../common/Hull3';

var factions: Faction[] = [];
var factionConfigs: { [id: string]: FactionConfig } = {};
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

export function getFactionConfigs(): { [id: string]: FactionConfig } {
    return factionConfigs;
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
    factionConfigs = config.factionConfigs;
    gearTemplates = config.gearTemplates;
    uniformTemplates = config.uniformTemplates;
    groupTemplates = config.groupTemplates;
    vehicleClassnameTemplates = config.vehicleClassnameTemplates;
}