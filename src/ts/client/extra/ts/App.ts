import * as Mission from '../../Mission';
import * as View from './View';


export function init() {
    Mission.getMissionConfig(missionConfig => {
        Mission.updateFromConfig(missionConfig);
        View.init();
    });
}

init();