import * as Settings from './Settings';
import * as _ from 'lodash';

import {templateSorter} from '../common/Common';
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
    unitTemplates = config.unitTemplates.sort(templateSorter);
    zoneTemplates = config.zoneTemplates.sort(templateSorter);
}