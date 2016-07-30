/// <reference path="../../typings/tsd.d.ts" />

import Mission = require('../../Mission');
import View = require('./View');


export function init() {
    Mission.getMissionConfig(missionConfig => {
        Mission.updateFromConfig(missionConfig);
        View.init();
    });
}

init();