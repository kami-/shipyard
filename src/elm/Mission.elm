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
    { sides : List Side
    , missionTypes : List MissionType
    , terrains : List Terrain
    , hull3 : Hull3.Config
    }

side : Decoder Side
side = map strToSide string

sides : List Side
sides = [ BLUFOR, OPFOR, INDFOR, CIVILIAN ]

missionType : Decoder MissionType
missionType = map strToMissionType string

missionTypes : List MissionType
missionTypes = [ COOP, TVT, GTVT, COTVT ]

terrain : Decoder Terrain
terrain =
  object2 Terrain
    ("id" := string)
    ("name" := string)

config : Decoder Config
config =
  object4 Config
    ("sides" := list side)
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

sideToStr : Side -> String
sideToStr s =
  case s of
    BLUFOR -> "BLUFOR"
    OPFOR -> "OPFOR"
    INDFOR -> "INDFOR"
    CIVILIAN -> "CIVILIAN"

strToMissionType : String -> MissionType
strToMissionType str =
  case str of
    "TVT" -> TVT
    "GTVT" -> GTVT
    "COTVT" -> COTVT
    _ -> COOP

missionTypeToStr : MissionType -> String
missionTypeToStr mt =
  case mt of
    COOP -> "COOP"
    TVT -> "TVT"
    GTVT -> "GTVT"
    COTVT -> "COTVT"
