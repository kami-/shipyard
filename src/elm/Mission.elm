module Mission where

import Hull3
import Json.Decode exposing (..)
import Json.Encode as Encode

type Side
    = BLUFOR
    | OPFOR
    | INDFOR
    | CIVILIAN

type MissionType
    = COOP
    | TVT
    | GTVT
    | COTVT

type alias Terrain =
    { id : String
    , name : String
    }

type alias Faction =
    { side : Side
    , faction : Hull3.Faction
    , gearTemplateId : String
    , uniformTemplateId : String
    }

type alias Addons =
    { admiral : Bool
    , plank : Bool
    }

type alias Mission =
    { terrain : Terrain
    , missionType : MissionType
    , maxPlayers : Int
    , onLoadName : String
    , author : String
    , briefingName : String
    , overviewText : String
    , factions : List Faction
    , addons : Addons
    }

type alias Config =
    { missionTypes : List MissionType
    , terrains : List Terrain
    , hull3 : Hull3.Config
    }

side : Decoder Side
side = map strToSide string

missionType : Decoder MissionType
missionType = map strToMissionType string

terrain : Decoder Terrain
terrain =
  object2 Terrain
    ("id" := string)
    ("name" := string)

mission : Decoder Config
mission =
  object3 Config
    ("missionTypes" := list missionType)
    ("terrains" := list terrain)
    ("hull3" := Hull3.config)

strToSide : String -> Side
strToSide str =
  case str of
    "OPFOR" -> OPFOR
    "INDFOR" -> INDFOR
    "CIVILIAN" -> CIVILIAN
    _ -> BLUFOR

strToMissionType : String -> MissionType
strToMissionType str =
  case str of
    "TVT" -> TVT
    "GTVT" -> GTVT
    "COTVT" -> COTVT
    _ -> COOP
