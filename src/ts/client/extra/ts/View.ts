/// <reference path="../../typings/tsd.d.ts" />

import $ = require('jquery');
import Settings = require('../../Settings');
import Mission = require('../../Mission');

var TERRAIN_FIELD: JQuery = null,
    GENERATE_MISSION_BUTTON: JQuery = null,
    DOWNLOAD_MISSION_FORM: JQuery = null;

interface Option {
    value: string;
    text: string;
}

function initMissionFields(terrains: Mission.Terrain[]) {
    TERRAIN_FIELD = $('#terrain').eq(0);

    initSelectField(TERRAIN_FIELD, terrains.map(terrainToOption));
}

function terrainToOption(t: Mission.Terrain): Option {
    return { value: t.id, text: t.name }
}

function initSelectField(field: JQuery, options: Option[], selectedValue?: string) {
    field.empty();
    options.forEach(o => {
        field.append(`<option value="${o.value}" ${selectedValue && o.value == selectedValue ? 'selected="selected"' : ''}>${o.text}</option>`);
    });
}

function initGenerateMission() {
    GENERATE_MISSION_BUTTON = $('#generate-mission').eq(0);
    GENERATE_MISSION_BUTTON.click(generateMission);
    DOWNLOAD_MISSION_FORM = $('#download-mission').eq(0);
}

function generateMission() {
    var terrain = { terrainId: TERRAIN_FIELD.find(':selected').val() };
    $('#download-progress').css('display', 'inline-block');
    $('#generate-mission').prop("disabled", true);
    $.ajax({
        url: `${Settings.CONTEXT_PATH}/town-sweep/generate`,
        method: 'POST',
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify(terrain),
        processData: false
    }).done(generatedMission => {
        DOWNLOAD_MISSION_FORM.attr('action', Mission.getDownloadPath(generatedMission.id, generatedMission.zip));
        DOWNLOAD_MISSION_FORM.submit();
    }).fail(e => {
        prompt('There was an error generating the mission! Show this to a programmer:', `Mission: ${JSON.stringify(terrain)}; Error: ${e.responseText}`);
    }).always(() => {
        $('#download-progress').css('display', 'none');
        $('#generate-mission').prop("disabled", false);
    });
}

export function init() {
    initMissionFields(Mission.getTerrains());
    initGenerateMission();
}