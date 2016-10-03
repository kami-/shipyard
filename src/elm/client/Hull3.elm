module Hull3 exposing (..)

import Dict
import Common

type alias Faction =
    { id : String
    , name: String
    , description : String
    , gearTemplateId : String
    , uniformTemplateId : String
    , side : Common.Side
    , camouflage : List String
    , rolePrefix : String
    , vehicleClassnames : Dict.Dict String String
    }

type alias Config =
    { factions : List Faction
    , gearTemplates : List Common.Template
    , uniformTemplates : List Common.Template
    , groupTemplates : List Common.Template
    , vehicleClassnameTemplates : List Common.Template
    }

type alias FactionRequest =
    { factionId : String
    , sideName : String
    , gearTemplateId : String
    , uniformTemplateId : String
    , groupTemplateIds : List String
    , vehicleClassnames : Dict.Dict String String
    }

emptyConfig : Config
emptyConfig =
    { factions = []
    , gearTemplates = []
    , uniformTemplates = []
    , groupTemplates = []
    , vehicleClassnameTemplates = []
    }