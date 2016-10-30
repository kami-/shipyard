module Mission exposing (..)

import Json.Decode as Decode exposing (Decoder, (:=), string, list, andThen, map)
import Json.Decode.Pipeline exposing (decode, required)

import Common
import Hull3
import Admiral


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
  { side : Common.Side
  , faction : Hull3.Faction
  , gearTemplateId : String
  , uniformTemplateId : String
  }

type alias Addons =
  { admiral : Admiral.Request
  , navy : Bool
  , plank : Bool
  }

type alias Mission =
  { terrain : Terrain
  , missionType : MissionType
  , onLoadName : String
  , author : String
  , briefingName : String
  , overviewText : String
  , factions : List Hull3.FactionRequest
  , addons : Addons
  }

type alias Config =
  { sides : List Common.Side
  , missionTypes : List MissionType
  , terrains : List Terrain
  , hull3 : Hull3.Config
  , admiral : Admiral.Config
  }

type alias GeneratedMission =
  { missionId: Int
  , missionWorkingDir : String
  , missionDirName : String
  , missionDir : String
  , downloadMissionName : String
  }

emptyMission : Mission
emptyMission =
  { terrain = { id = "", name = "" }
  , missionType = COOP
  , onLoadName = ""
  , author = ""
  , briefingName = ""
  , overviewText = ""
  , factions = []
  , addons =
    { admiral =
      { isEnabled = False
      , campUnitTemplateId = "Default"
      , campZoneTemplateId = "Camp"
      , patrolUnitTemplateId = "Default"
      , patrolZoneTemplateId = "Patrol"
      , cqcUnitTemplateId = "Default"
      , cqcZoneTemplateId = "Cqc"
      }
    , navy = False
    , plank = False
    }
  }

emptyConfig : Config
emptyConfig =
  { sides = []
  , missionTypes = []
  , terrains = []
  , hull3 = Hull3.emptyConfig
  , admiral = Admiral.emptyConfig
  }



strToMissionType : String -> MissionType
strToMissionType missionType =
  case missionType of
    "TVT" -> TVT
    "GTVT" -> GTVT
    "COTVT" -> COTVT
    _ -> COOP

missionTypeToStr : MissionType -> String
missionTypeToStr missionType =
  case missionType of
    TVT -> "TVT"
    GTVT -> "GTVT" 
    COTVT -> "COTVT" 
    _ -> "COOP"

decodeMissionType : String -> Decoder MissionType
decodeMissionType missionType =
  Decode.succeed (strToMissionType missionType)

decodeTerrain : Decoder Terrain
decodeTerrain =
  decode Terrain
    |> required "id" string
    |> required "name" string

decodeConfig : Decoder Config
decodeConfig =
  decode Config
    |> required "sideNames" (list (string `andThen` Common.decodeSide))
    |> required "missionTypeNames" (list (string `andThen` decodeMissionType))
    |> required "terrains" (list decodeTerrain)
    |> required "Hull3" Hull3.decodeConfig
    |> required "Admiral" Admiral.decodeConfig
