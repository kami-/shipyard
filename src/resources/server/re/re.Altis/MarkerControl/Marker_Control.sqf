#define MARKER_NAME "AO"

// Add:
/*

if (serverCommandAvailable "#logout" || !isMultiplayer) then {
      call compile preprocessFileLineNumbers "MarkerControl\Marker_Control.sqf";
      [] spawn MC_Init;
};

*/
// to your init.sqf

MC_Init = {
    private ["_actionID_enable","_actionID_disable"];
    MC_MarkerCanBeMoved = false;
    MC_MarkerDisabled = false;
    _actionID_enable = player addaction ["<t color ='#F3F781'>Activate Marker Control</t>","MarkerControl\Marker_Enable_Move.sqf",nil,100,true,true,"","(_target == _this) && !MC_MarkerCanBeMoved && !MC_MarkerDisabled"];
    _actionID_disable = player addaction ["<t color ='#F78181'>Deactivate Marker Control</t>","MarkerControl\Marker_Disable_Move.sqf",nil,100,true,true,"","(_target == _this) && MC_MarkerCanBeMoved"];
    waitUntil {
        sleep 1;
        MC_MarkerDisabled;
    };
    {
        player removeAction _x;
    } forEach [_actionID_disable,_actionID_enable];
};

MC_AllowMarkerMove = {
    onMapSingleClick {
        MARKER_NAME setMarkerPos _pos;
        hintSilent format ["Marker set to co-ordinates: %1",_pos];
    };
};

MC_DisableMarkerMove = {
    onMapSingleClick {};
};