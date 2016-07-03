call compile preprocessFileLineNumbers "src\ts_functions.sqf";
call compile preprocessFileLineNumbers "src\interaction_functions.sqf";
call compile preprocessFileLineNumbers "src\spawn_functions.sqf";

if (isServer) then {
    [] call ts_fnc_preinit;
    [] call ts_spawn_fnc_preinit;
};

if (hasInterface) then {
    [] call ts_interaction_fnc_preinit;
};