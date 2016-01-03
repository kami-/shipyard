export interface Template {
    id: string;
    name: string;
    description: string;
}

export interface GearTemplate extends Template {}
export interface UniformTemplate extends Template {}

export interface GroupTemplate extends Template {
    groupingId: string;    
}

export interface VehicleClassnameTemplate extends Template {
    classname: string;
}

export interface Faction {
    id: string;
    name: string;
    description: string;
    gearTemplateId: string;
    uniformTemplateId: string;
}

export interface FactionConfig {
    factionId: string;
    rolePrefix: string;
    vehicleClassnames: { [id: string]: string };
}

export interface Config {
    factions: Faction[];
    factionConfigs: { [id: string]: FactionConfig };
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
