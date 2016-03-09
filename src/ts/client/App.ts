/// <reference path="./typings/tsd.d.ts" />

import Admiral = require('./Admiral');
import Hull3 = require('./Hull3');
import Mission = require('./Mission');
import View = require('./View');


export function init() {
    Mission.getMissionConfig(missionConfig => {
        Admiral.updateFromConfig(missionConfig.Admiral);
        Hull3.updateFromConfig(missionConfig.Hull3);        
        Mission.updateFromConfig(missionConfig);
        View.init();
    });
}

init();