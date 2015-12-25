/// <reference path="./typings/tsd.d.ts" />

import express = require('express');
import bodyParser = require('body-parser');
import Settings = require('./Settings');
import Hull3 = require('./Hull3');
import Mission = require('./Mission');
import fs = require('fs-extra');
import cp = require('child_process');
import mime = require('mime');

function registerRoutes(app: express.Express) {
    app.get(Settings.CONTEXT_PATH, (request, response) => {
        response.sendFile(Settings.PATH.RESOURCES_HOME + '/index.html');
    });
    
    app.route(Settings.CONTEXT_PATH + '/mission/generate').get((request, response) => {
        generateMission(request, response);
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
    app.route(Settings.CONTEXT_PATH + '/hull3/faction/update').post((request, response) => {
        Hull3.updateFactions();
        response.sendStatus(200);
    });
    
    app.route(Settings.CONTEXT_PATH + '/hull3/gear').get((request, response) => {
        response.json(Hull3.getGearTemplates());
    });
    app.route(Settings.CONTEXT_PATH + '/hull3/gear/update').post((request, response) => {
        Hull3.updateGearTemplates();
        response.sendStatus(200);
    });
    
    // Uniform
    app.route(Settings.CONTEXT_PATH + '/hull3/uniform').get((request, response) => {
        response.json(Hull3.getUniformTemplates());
    });
    app.route(Settings.CONTEXT_PATH + '/hull3/uniform/update').post((request, response) => {
        Hull3.updateUniformTemplates();
        response.sendStatus(200);
    });
}

function generateMission(request, response) {
    var mission: Mission.Mission = {
        terrain: {id: 'Altis', name: 'Altis' },
        missionTypeName: 'co',
        maxPlayers: 60,
        onLoadName: "Oh it's this mission",
        author: 'Kami',
        briefingName: ' ; echo "hello" ; oh_its_this_mission',
        overviewText: 'Slot everything!',
        factions: [],
        addons: {
            Admiral: true,
            Plank: true
        }
    }
    console.log(mission.briefingName);
    mission.briefingName = mission.briefingName.replace(/[^a-z0-9_]*/g, '');
    console.log(mission.briefingName);
    //var missionDir = Mission.generateMission(request.body);
    var generatedMission = Mission.generateMission(mission);
    var missionZipPath = zipMission(generatedMission.missionDir, generatedMission.missionDirName);
    response.setHeader('Content-disposition', `attachment; filename=${generatedMission.missionDirName}.zip`);
    response.setHeader('Content-type', mime.lookup(missionZipPath));
    response.sendFile(missionZipPath, { root: './' }, () => removeMissionWorkingDir(generatedMission.missionWorkingDir) );
}

// Horrible way to do this. We only allow alphanum and underscroe, so no remote code execution shouldn't happen?.
// Sadly I haven't found a JS module that can zip a folder the way I want ...
function zipMission(missionDir: string, missionDirName: string): string {
    var missionZip = `${missionDir}.zip`;
    var zipCommand = `7z a ${missionZip} ./${missionDir}/*`;
    if (process.platform === 'linux') {
        var missionZipName = `${missionDirName}.zip`;
        zipCommand = `(cd ${missionDir} ; zip -r ${missionZipName} . ; mv ${missionZipName} .. ; cd -)`;
    }
    cp.execSync(zipCommand);
    return missionZip;
}

function removeMissionWorkingDir(missionWorkingDir: string) {
    fs.removeSync(missionWorkingDir);
}

export function start() {
    if (process.platform !== 'linux' && process.platform !== 'win32') { throw 'Unsupported platform!' }

    var app = express();
    app.use(Settings.CONTEXT_PATH, express.static(Settings.PATH.RESOURCES_HOME));
    app.use(bodyParser.json());

    registerRoutes(app);

    var server = app.listen(Settings.PORT, () => {
        console.log(`Shipyard is listening in port ${server.address().port}.`);
    });
}