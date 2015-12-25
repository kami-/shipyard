export interface Template {
    id: string;
    name: string;
    description: string;
}

export interface GearTemplate extends Template {}
export interface UniformTemplate extends Template {}

export interface Faction {
    name: string;
    gearTemplateId: string;
    uniformTemplateId: string;
}
