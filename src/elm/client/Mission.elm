module Mission exposing (..)

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
