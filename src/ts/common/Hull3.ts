export interface Template {
    id: string;
    name: string;
    description: string;
}

export interface GearTemplate extends Template {}
export interface UniformTemplate extends Template {}
export interface GroupTemplate extends Template {}
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

export interface Config {
    factions: Faction[];
    gearTemplates: GearTemplate[];
    uniformTemplates: UniformTemplate[];
    groupTemplates: GroupTemplate[];
    vehicleClassnameTemplates: VehicleClassnameTemplate[];
}
