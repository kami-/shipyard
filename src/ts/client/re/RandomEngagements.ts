/// <reference path="../typings/tsd.d.ts" />

import $ = require('jquery');
import _ = require('lodash');
import Settings = require('../Settings');

var ORIGINAL_MISSION_TEXTAREA: JQuery = null,
    GENERATE_MISSION_BUTTON: JQuery = null,
    DOWNLOAD_MISSION_FORM: JQuery = null;

function generateMission() {
    $.ajax({
        url: getGeneratePath(),
        method: 'POST',
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify({ missionSqm: ORIGINAL_MISSION_TEXTAREA.val() }),
        processData: false
    }).done(generatedMission => {
        DOWNLOAD_MISSION_FORM.attr('action', getDownloadPath(generatedMission.id, generatedMission.zip));
        DOWNLOAD_MISSION_FORM.submit();
    });
}

function getGeneratePath(): string {
    return `${Settings.CONTEXT_PATH}/re/generate`;
}

function getDownloadPath(id: number, zip: string): string {
    return `${getGeneratePath()}/${id}/${zip}`;
}

export function init() {
    ORIGINAL_MISSION_TEXTAREA = $('#original-mission').eq(0);
    GENERATE_MISSION_BUTTON = $('#generate-mission').eq(0);
    GENERATE_MISSION_BUTTON.click(generateMission);
    DOWNLOAD_MISSION_FORM = $('#download-mission').eq(0);
}

$('document').ready(init);