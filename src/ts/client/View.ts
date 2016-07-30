/// <reference path="./typings/tsd.d.ts" />

import $ = require('jquery');
import _ = require('lodash');
import Common = require('../common/Common');
import Hull3 = require('./Hull3');
import Admiral = require('./Admiral');
import Mission = require('./Mission');

var factionIdCounter = 0; 
var TERRAIN_FIELD: JQuery = null,
    MISSION_TYPE_FIELD: JQuery = null,
    ON_LOAD_NAME_FIELD: JQuery = null,
    AUTHOR_FIELD: JQuery = null,
    BRIEFING_NAME_FIELD: JQuery = null,
    OVERVIEW_TEXT_FIELD: JQuery = null,
    FACTION_SELECT_FIELD_TEMPLATE: _.TemplateExecutor = null,
    FACTION_GROUPS_TEMPLATE: _.TemplateExecutor = null,
    FACTION_VEHICLE_CLASSNAME_FIELDS_TEMPLATE: _.TemplateExecutor = null,
    ADD_FACTION_BUTTON: JQuery = null,
    FACIONS_CONTAINER: JQuery = null,
    ADMIRAL_CONTAINER: JQuery = null,
    ADMIRAL_IS_ENABLED: JQuery = null,
    ADMIRAL_SELECT_FIELD_TEMPLATE: _.TemplateExecutor = null,
    PLANK_FIELD: JQuery = null,
    GENERATE_MISSION_BUTTON: JQuery = null,
    DOWNLOAD_MISSION_FORM: JQuery = null;

interface Option {
    value: string;
    text: string;
}

function nextFactionId(): number {
    factionIdCounter = factionIdCounter + 1;
    return factionIdCounter;
}

function initMissionFields(terrains: Mission.Terrain[], missionTypes: Mission.MissionType[]) {
    TERRAIN_FIELD = $('#terrain').eq(0);
    MISSION_TYPE_FIELD = $('#missionType').eq(0);
    ON_LOAD_NAME_FIELD = $('#onLoadName').eq(0);
    AUTHOR_FIELD = $('#author').eq(0);
    BRIEFING_NAME_FIELD = $('#briefingName').eq(0);
    OVERVIEW_TEXT_FIELD = $('#overviewText').eq(0);

    initSelectField(TERRAIN_FIELD, terrains.map(terrainToOption));
    initSelectField(MISSION_TYPE_FIELD, missionTypes.map(missionTypeToOption));
}

function initFactions() {
    FACTION_SELECT_FIELD_TEMPLATE = _.template($('#faction-select-field-template').html());
    FACTION_GROUPS_TEMPLATE = _.template($('#faction-groups-template').html());
    FACTION_VEHICLE_CLASSNAME_FIELDS_TEMPLATE = _.template($('#faction-vehicle-classname-fields-template').html());
    ADD_FACTION_BUTTON = $('#add-faction').eq(0);
    FACIONS_CONTAINER = $('#factions').eq(0);
    ADD_FACTION_BUTTON.click(() => { addFaction(FACIONS_CONTAINER); });
}

function terrainToOption(t: Mission.Terrain): Option {
    return { value: t.id, text: t.name }
}

function missionTypeToOption(mt: Mission.MissionType): Option {
    return {
        value: Mission.missionTypeToString(mt),
        text: Mission.missionTypeToString(mt)
    }    
}

function sideToOption(s: Mission.Side): Option {
    return {
        value: Mission.sideToString(s),
        text: Mission.sideToString(s)
    }
}

function factionToOption(f: Hull3.Faction): Option {
    return { value: f.id, text: `${f.name} (${f.id})` };
}

function templateToOption(t: Common.Template): Option {
    return { value: t.id, text: t.name }
}

function initSelectField(field: JQuery, options: Option[], selectedValue?: string) {
    field.empty();
    options.forEach(o => {
        field.append(`<option value="${o.value}" ${selectedValue && o.value == selectedValue ? 'selected="selected"' : ''}>${o.text}</option>`);
    });
}

function addFaction(container: JQuery) {
    var factionId = nextFactionId();
    var factionContainer = $(`<div class="faction-container"></div>`),
        factionFieldContainer = $(`<div class="faction-field-container"></div>`),
        factionField = $(FACTION_SELECT_FIELD_TEMPLATE({
            factionId: factionId,
            fieldClass: 'faction',
            label: 'Faction',
            options: Hull3.getFactions().map(factionToOption),
            selectedValue: ''
        })),
        sideField = $(FACTION_SELECT_FIELD_TEMPLATE({
            factionId: factionId,
            fieldClass: 'side',
            label: 'Side',
            options: Mission.getSides().map(sideToOption),
            selectedValue: ''
        })),
        gearField = $(FACTION_SELECT_FIELD_TEMPLATE({
            factionId: factionId,
            fieldClass: 'gearTemplate',
            label: 'Gear template',
            options: Hull3.getGearTemplates().map(templateToOption),
            selectedValue: ''
        })),
        uniformField = $(FACTION_SELECT_FIELD_TEMPLATE({
            factionId: factionId,
            fieldClass: 'uniformTemplate',
            label: 'Uniform template',
            options: Hull3.getUniformTemplates().map(templateToOption),
            selectedValue: ''
        })),
        removeFooter = $(`<div class="remove-footer"></div>`),
        removeButton = $(`<button class="remove-button">Remove</button>`),
        factionDescription = $('<div class="faction description">    </div>');
    factionFieldContainer.append(factionField);
    factionFieldContainer.append(factionDescription);
    factionFieldContainer.append(sideField);
    factionFieldContainer.append(gearField);
    factionFieldContainer.append(uniformField);
    factionContainer.append(factionFieldContainer);
    addGroups(factionContainer, factionId);
    addVehicleClassnames(factionContainer, factionId);
    removeButton.click(() => { factionContainer.remove(); });
    removeFooter.append(removeButton);
    removeFooter.append($('<div style="clear: both;"></div>'));
    factionContainer.append(removeFooter);
    container.append(factionContainer);
    addFactionChangeHandling(factionContainer);
    factionField.find('select.faction').trigger('change');
}

function addFactionChangeHandling(factionContainer: JQuery) {
    factionContainer.find('select.faction').change(e => {
        var selectedFactionId = $(e.target).find(':selected').val();
        var faction = Hull3.getFactionById(selectedFactionId);
        factionContainer.find('.faction.description').text(faction.description);
        factionContainer.find('select.side').val(Common.sideToString(faction.side));
        factionContainer.find('select.gearTemplate').val(faction.gearTemplateId);
        factionContainer.find('select.uniformTemplate').val(faction.uniformTemplateId);
        factionContainer.find('input.vehicle-classname').each((idx, el) => {
            $(el).val(faction.vehicleClassnames[$(el).data('id')]);
        });
    });
}

function addGroups(container: JQuery, factionId: number) {
    var factionGroups = $(FACTION_GROUPS_TEMPLATE({
            factionId: factionId,
            groupings: _.groupBy(Hull3.getGroupTemplates(), 'groupingId')
        }));
    container.append($('<h4 class="before">Groups</h4>'));
    var checkAllGroupsButton = $('<button class="check-all-groups all">Uncheck all</button>');
    container.append(checkAllGroupsButton);
    container.append(factionGroups);
    checkAllGroupsButton.click(e => {
        var button = $(e.target),
            newState = 'none',
            oldState = 'all',
            newLabel = 'Check all',
            newCheckState = false;
        if (button.hasClass('none')) {
            newState = 'all'
            oldState = 'none',
            newLabel = 'Uncheck all';
            newCheckState = true;
        }
        button.addClass(newState).removeClass(oldState);
        button.text(newLabel);
        factionGroups.find('button.grouping-select').addClass(newState).removeClass(oldState);
        factionGroups.find('input').prop('checked', newCheckState)
    });
    factionGroups.find('.faction-grouping').each((idx, fg) => {
        $(fg).find('.grouping-select').click(e => {
            checkGroups($(e.target), $(fg).find('input'));
        });
    });
}

function checkGroups(button: JQuery, checkboxes: JQuery) {
    var newState = 'none',
        oldState = 'all',
        newCheckState = false;
    if (button.hasClass('none')) {
        newState = 'all';
        oldState = 'none';
        newCheckState = true;
    }
    button.addClass(newState).removeClass(oldState);
    checkboxes.prop('checked', newCheckState);
}

function addVehicleClassnames(container: JQuery, factionId: number) {
    var factionVehicleClassnameFields = FACTION_VEHICLE_CLASSNAME_FIELDS_TEMPLATE({
            factionId: factionId,
            vehicleClassnameTemplates: Hull3.getVehicleClassnameTemplates()
        });
    container.append($('<h4 class="before small">Vehicle classnames</h4>'));
    container.append(factionVehicleClassnameFields);
}

function getSelectedFactions(): Hull3.FactionRequest[] {
    return FACIONS_CONTAINER.find('.faction-container').map((idx, container) => {
        var ffcChildren = $(container).find('.faction-field-container').children();
        return {
            factionId: ffcChildren.find('select.faction :selected').val(),
            sideName: ffcChildren.find('select.side :selected').val(),
            gearTemplateId: ffcChildren.find('select.gearTemplate :selected').val(),
            uniformTemplateId: ffcChildren.find('select.uniformTemplate :selected').val(),
            groupTemplateIds: getSelectedGroupTemplateIds($(container)),
            vehicleClassnames: getVehicleClassnames($(container))
        } 
    }).toArray();
}

function getSelectedGroupTemplateIds(container: JQuery): string[] {
    var groups = container.find('input.group-template').map((idx, inp) => {
        return {
            id: $(inp).data('id'),
            checked: $(inp).prop('checked')
        }
    }).toArray();
    return _.pluck(_.filter(groups, 'checked'), 'id');
}

function getVehicleClassnames(container: JQuery): { [id: string]: string } {
    var vehicleClassnames = container.find('input.vehicle-classname').map((idx, inp) => {
        return {
            id: $(inp).data('id'),
            classname: $(inp).val()
        }
    }).toArray();
    return _.foldl(vehicleClassnames, (res, vcn) => {
        res[vcn.id] = vcn.classname;
        return res;
    }, <{ [id: string]: string }>{});
}

function initAddons() {
    initAdmiral();
    PLANK_FIELD = $('#plank').eq(0);
}

function initAdmiral() {
    ADMIRAL_CONTAINER = $('#admiral').eq(0);
    ADMIRAL_IS_ENABLED = $('#admiralIsEnabled').eq(0);
    ADMIRAL_IS_ENABLED.change(() => {
        if (ADMIRAL_IS_ENABLED.is(':checked')) {
            ADMIRAL_CONTAINER.show();
        } else {
            ADMIRAL_CONTAINER.hide();
        }
    });
    ADMIRAL_SELECT_FIELD_TEMPLATE = _.template($('#admiral-select-field-template').html());
    initAdmiralSelects(ADMIRAL_CONTAINER);
}

function initAdmiralSelects(container: JQuery) {
    var unitTemplateOptions = Admiral.getUnitTemplates().map(templateToOption),
        zoneTemplateOptions = Admiral.getZoneTemplates().map(templateToOption);
    var admiralTemplates = [
        { templateName: 'campUnitTemplateId', label: 'Camp unit template', options: unitTemplateOptions },
        //{ templateName: 'campZoneTemplateId', label: 'Camp zone template', options: zoneTemplateOptions },
        { templateName: 'patrolUnitTemplateId', label: 'Patrol unit template', options: unitTemplateOptions },
        //{ templateName: 'patrolZoneTemplateId', label: 'Patrol zone template', options: zoneTemplateOptions },
        { templateName: 'cqcUnitTemplateId', label: 'CQC unit template', options: unitTemplateOptions }
        //{ templateName: 'cqcZoneTemplateId', label: 'CQC zone template', options: zoneTemplateOptions },
    ];
    _.each(admiralTemplates, t => {
        var select = $(ADMIRAL_SELECT_FIELD_TEMPLATE({
            templateName: t.templateName,
            label: t.label,
            options: t.options,
            selectedValue: ''
        }));
        container.append(select);
    });
}

function getAdmiralRequest(): Admiral.Request {
    return {
        isEnabled: ADMIRAL_IS_ENABLED.prop('checked'),
        campUnitTemplateId: $('#campUnitTemplateId').find(':selected').val(),
        campZoneTemplateId: 'Camp',//$('#campZoneTemplateId').find(':selected').val(),
        patrolUnitTemplateId: $('#patrolUnitTemplateId').find(':selected').val(),
        patrolZoneTemplateId: 'Patrol',//$('#patrolZoneTemplateId').find(':selected').val(),
        cqcUnitTemplateId: $('#cqcUnitTemplateId').find(':selected').val(),
        cqcZoneTemplateId: 'Cqc'//$('#cqcZoneTemplateId').find(':selected').val()
    };
}

function initGenerateMission() {
    GENERATE_MISSION_BUTTON = $('#generate-mission').eq(0);
    GENERATE_MISSION_BUTTON.click(generateMission);
    DOWNLOAD_MISSION_FORM = $('#download-mission').eq(0);
}

function getMission(): Mission.Mission {
    return {
        terrainId: TERRAIN_FIELD.find(':selected').val(),
        missionTypeName: MISSION_TYPE_FIELD.find(':selected').val(),
        onLoadName: ON_LOAD_NAME_FIELD.val(),
        author: AUTHOR_FIELD.val(),
        briefingName: BRIEFING_NAME_FIELD.val(),
        overviewText: OVERVIEW_TEXT_FIELD.val(),
        factions: getSelectedFactions(),
        addons: {
            Admiral: getAdmiralRequest(),
            plank: PLANK_FIELD.prop('checked')
        }
    }
}

function generateMission() {
    var mission = getMission();
    console.log(mission);
    $('#download-progress').css('display', 'inline-block');
    $('#generate-mission').prop("disabled", true);
    $.ajax({
        url: Mission.getGeneratePath(),
        method: 'POST',
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify(mission),
        processData: false
    }).done(generatedMission => {
        DOWNLOAD_MISSION_FORM.attr('action', Mission.getDownloadPath(generatedMission.id, generatedMission.zip, generatedMission.downloadName));
        DOWNLOAD_MISSION_FORM.submit();
    }).fail(e => {
        prompt('There was an error generating the mission! Show this to a programmer:', `Mission: ${JSON.stringify(mission)}; Error: ${e.responseText}`);
    }).always(() => {
        $('#download-progress').css('display', 'none');
        $('#generate-mission').prop("disabled", false);
    });
}

export function init() {
    initMissionFields(Mission.getTerrains(), Mission.getMissionTypes());
    initFactions();
    initAddons();
    initGenerateMission();
}