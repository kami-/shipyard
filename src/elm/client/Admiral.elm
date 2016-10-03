module Admiral exposing (..)

import Common

type alias Config =
    { unitTemplates : List Common.Template
    , zoneTemplates : List Common.Template
    }

type alias Request =
    { isEnabled : Bool
    , campUnitTemplateId : String
    , campZoneTemplateId :  String
    , patrolUnitTemplateId : String
    , patrolZoneTemplateId : String
    , cqcUnitTemplateId : String
    , cqcZoneTemplateId : String
    }

emptyConfig : Config
emptyConfig =
    { unitTemplates = []
    , zoneTemplates = []
    }
