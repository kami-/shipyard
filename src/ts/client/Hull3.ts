/// <reference path="./typings/tsd.d.ts" />

import Settings = require('./Settings');

import {Faction, Template, GearTemplate, UniformTemplate, GroupTemplate, VehicleClassnameTemplate, Config} from '../common/Hull3';
export {Faction, Template, GearTemplate, UniformTemplate, GroupTemplate, VehicleClassnameTemplate, Config} from '../common/Hull3';

export var factions: Faction[] = [];
export var gearTemplates: GearTemplate[] = [];
export var uniformTemplates: UniformTemplate[] = [];
export var groupTemplates: GroupTemplate[] = [];
export var vehicleClassnameTemplates: VehicleClassnameTemplate[] = [];

export function getFactions(): Faction[] {
    return factions;
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
console.log("hull3", config);
    factions = config.factions;
    gearTemplates = config.gearTemplates;
    uniformTemplates = config.uniformTemplates;
    groupTemplates = config.groupTemplates;
    vehicleClassnameTemplates = config.vehicleClassnameTemplates;
}