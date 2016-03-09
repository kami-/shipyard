import Common = require('./Common');

export interface GearTemplate extends Common.Template {}
export interface UniformTemplate extends Common.Template {}

export interface GroupTemplate extends Common.Template {
    groupingId: string;    
}

export interface VehicleClassnameTemplate extends Common.Template {
    classname: string;
}

export interface Faction {
    id: string;
    name: string;
    description: string;
    gearTemplateId: string;
    uniformTemplateId: string;
    rolePrefix: string;
    vehicleClassnames: { [id: string]: string };
}

export interface Config {
    factions: Faction[];
    gearTemplates: GearTemplate[];
    uniformTemplates: UniformTemplate[];
    groupTemplates: GroupTemplate[];
    vehicleClassnameTemplates: VehicleClassnameTemplate[];
}

export interface FactionRequest {
    factionId: string;
    sideName: string;
    gearTemplateId: string;
    uniformTemplateId: string;
    groupTemplateIds: string[];
    vehicleClassnames: { [id: string]: string };
}
