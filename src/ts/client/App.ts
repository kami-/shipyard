import * as Admiral from './Admiral';
import * as Hull3 from './Hull3';
import * as Mission from './Mission';
import * as View from './View';


export function init() {
    Mission.getMissionConfig(missionConfig => {
        Admiral.updateFromConfig(missionConfig.Admiral);
        Hull3.updateFromConfig(missionConfig.Hull3);
        Mission.updateFromConfig(missionConfig);
        View.init();
    });
}

init();