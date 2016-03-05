sleep 2;

if (serverCommandAvailable "#logout" || !isMultiplayer) then {
      call compile preprocessFileLineNumbers "MarkerControl\Marker_Control.sqf";
      [] spawn MC_Init;
};

if (side player == EAST) then {
    call compile preprocessFileLineNumbers "plank\plank_init.sqf";
    hull3_leaders = ["SL", "FTL", "MMGAG"];
    gear_class = player getVariable "hull3_gear_class";
    if !(isNil "gear_class") then {
        if (gear_class == "CO") exitWith {
            [player, [0, 1, 3, 0, 3, 1, 0, 1]] call plank_api_fnc_forceAddFortifications;
        };
        if (gear_class in hull3_leaders) then {
            [player, [1, 0, 3, 0, 3, 2, 0, 0]] call plank_api_fnc_forceAddFortifications;
        } else {
            [player, [0, 0, 3, 0, 3, 1, 0, 0]] call plank_api_fnc_forceAddFortifications;
        };
    };
};

if (isPlayer player) then {
    waitUntil {
        sleep 2;
        [] call hull3_mission_fnc_hasSafetyTimerEnded;
    };
    [player] call plank_api_fnc_forceRemoveAllFortifications;
};
