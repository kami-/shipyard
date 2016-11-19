import Common = require('./Common');

export interface UnitTemplate extends Common.Template {}
export interface ZoneTemplate extends Common.Template {}

export interface Config {
    unitTemplates: UnitTemplate[];
    zoneTemplates: ZoneTemplate[];
}

export interface Request {
    isEnabled: boolean;
    campUnitTemplateId: string;
    campZoneTemplateId: string;
    patrolUnitTemplateId: string;
    patrolZoneTemplateId: string;
    cqcUnitTemplateId: string;
    cqcZoneTemplateId: string;
}
