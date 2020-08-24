import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as fs from 'fs-extra';
import * as cp from 'child_process';
import * as mime from'mime';
import * as _ from 'lodash';

import * as Settings from './Settings';
import * as Hull3 from './Hull3';
import * as Admiral from './Admiral';
import * as Mission from './Mission';
import * as TownSweep from './extra/TownSweep';
import * as RandomEngagements from './extra/RandomEngagements';

const ROOT_DIR = process.cwd();

function registerRoutes(app: express.Express) {
    app.get(Settings.CONTEXT_PATH, (request, response) => {
        response.sendFile(Settings.PATH.CLIENT_RESOURCES_HOME + '/index.html', { root: ROOT_DIR });
    });

    app.route(Settings.CONTEXT_PATH + '/mission/generate').post((request, response) => {
        generateMission(request, response);
    });
    app.route(Settings.CONTEXT_PATH + '/mission/generate/:id/:zip/:name').get((request, response) => {
        sendMission(request, response, request.params.id, request.params.zip, request.params.name);
    });
    app.route(Settings.CONTEXT_PATH + '/mission/config').get((request, response) => {
        response.json(Mission.getMissionConfig());
    });
    app.route(Settings.CONTEXT_PATH + '/mission/side').get((request, response) => {
        response.json(Mission.getSideNames());
    });
    app.route(Settings.CONTEXT_PATH + '/mission/type').get((request, response) => {
        response.json(Mission.getMissionTypeNames());
    });
    app.route(Settings.CONTEXT_PATH + '/mission/terrain').get((request, response) => {
        response.json(Mission.getTerrains());
    });

    app.route(Settings.CONTEXT_PATH + '/hull3/faction').get((request, response) => {
        response.json(Hull3.getFactions());
    });

    app.route(Settings.CONTEXT_PATH + '/hull3/gear').get((request, response) => {
        response.json(Hull3.getGearTemplates());
    });

    app.route(Settings.CONTEXT_PATH + '/hull3/uniform').get((request, response) => {
        response.json(Hull3.getUniformTemplates());
    });

    app.route(Settings.CONTEXT_PATH + '/admiral/unit').get((request, response) => {
        response.json(Admiral.getUnitTemplates());
    });

    app.route(Settings.CONTEXT_PATH + '/admiral/zone').get((request, response) => {
        response.json(Admiral.getZoneTemplates());
    });

    app.get(Settings.CONTEXT_PATH + '/town-sweep', (request, response) => {
        response.sendFile(Settings.PATH.CLIENT_RESOURCES_HOME + '/town-sweep.html', { root: './' });
    });
    app.route(Settings.CONTEXT_PATH + '/town-sweep/generate').post((request, response) => {
        generateTownSweep(request, response);
    });

    app.get(Settings.CONTEXT_PATH + '/random-engagements', (request, response) => {
        response.sendFile(Settings.PATH.CLIENT_RESOURCES_HOME + '/random-engagements.html', { root: './' });
    });
    app.route(Settings.CONTEXT_PATH + '/random-engagements/generate').post((request, response) => {
        generateRandomEngagements(request, response);
    });
}

function generateMission(request, response) {
    var mission = request.body;
    mission.briefingName = mission.briefingName.toLowerCase().replace(/[^a-z0-9_]*/g, '');
    var generatedMission = Mission.generateMission(mission);
    var missionZipName = zipMission(generatedMission.missionDir, generatedMission.missionDirName);
    response.json({ id: generatedMission.missionId, zip: missionZipName, downloadName: generatedMission.downloadMissionName });
}

function generateTownSweep(request, response) {
    var generatedMission = TownSweep.generateMission(request.body.terrainId);
    var missionZipName = zipMission(generatedMission.missionDir, generatedMission.missionDirName);
    response.json({ id: generatedMission.missionId, zip: missionZipName, downloadName: generatedMission.downloadMissionName });
}

function generateRandomEngagements(request, response) {
    var generatedMission = RandomEngagements.generateMission(request.body.terrainId);
    var missionZipName = zipMission(generatedMission.missionDir, generatedMission.missionDirName);
    response.json({ id: generatedMission.missionId, zip: missionZipName, downloadName: generatedMission.downloadMissionName });
}

function sendMission(request, response, missionId: number, missionZip: string, downloadMissionName: string) {
    var missionWorkingDir = `${Settings.PATH.Mission.WORKING_DIR}/${missionId}`;
    var missionZipPath = `${missionWorkingDir}/${missionZip}`;
    response.setHeader('Content-disposition', `attachment; filename=${downloadMissionName}.zip`);
    response.setHeader('Content-type', mime.lookup(missionZipPath));
    response.sendFile(missionZipPath, { root: './' }, () => removeMissionWorkingDir(missionWorkingDir) );
}

// Horrible way to do this. We only allow alphanum and underscroe, so no remote code execution shouldn't happen?.
// Sadly I haven't found a JS module that can zip a folder the way I want ...
function zipMission(missionDir: string, missionDirName: string): string {
    var missionZipName = `${missionDirName}.zip`,
        missionZip = `${missionDir}.zip`;
    var zipCommand = `7z a ${missionZip} ./${missionDir}/*`;
    if (process.platform === 'linux') {
        zipCommand = `(cd ${missionDir} ; zip -r ${missionZipName} . ; mv ${missionZipName} .. ; cd -)`;
    }
    cp.execSync(zipCommand);
    return missionZipName;
}

function removeMissionWorkingDir(missionWorkingDir: string) {
    fs.removeSync(missionWorkingDir);
}

function pullAddons() {
    var addons = [Settings.PATH.Hull3, Settings.PATH.Admiral, Settings.PATH.ArkInhouse];
    fs.mkdirpSync(Settings.PATH.SERVER_ADDON_HOME);
    _.each(addons, a => {
        console.log(`Pulling addon '${a.CLONE_URL}'.`);
        let addonPath = `${Settings.PATH.SERVER_ADDON_HOME}/${a.HOME}`;
        try {
            fs.accessSync(addonPath);
        } catch (e) {
            cp.execSync(`git clone ${a.CLONE_URL}`, { cwd: Settings.PATH.SERVER_ADDON_HOME });
        }
        if (process.platform === 'linux') {
            cp.execSync(`(git reset --hard HEAD; git pull)`, { cwd: addonPath });
        } else {
            cp.execSync(`git reset --hard HEAD`, { cwd: addonPath });
            cp.execSync(`git pull`, { cwd: addonPath });
            cp.execSync(`git status > asd.txt`, { cwd: addonPath });
        }
    })
}


export function start() {
    if (process.platform !== 'linux' && process.platform !== 'win32') { throw 'Unsupported platform!' }

    var app = express();
    app.use(Settings.CONTEXT_PATH, express.static(Settings.PATH.CLIENT_RESOURCES_HOME));
    app.use(bodyParser.json());

    registerRoutes(app);

    pullAddons();

    Admiral.init();
    Hull3.init();
    Mission.init();

    var server = app.listen(Settings.PORT, () => {
        console.log(`Shipyard is listening in port ${server.address().port}.`);
    });

}
