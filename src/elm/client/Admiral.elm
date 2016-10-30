module Admiral exposing (..)

import Json.Decode as Decode exposing (Decoder, (:=), list)
import Json.Decode.Pipeline exposing (decode, required)

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



decodeConfig : Decoder Config
decodeConfig =
  decode Config
    |> required "unitTemplates" (list Common.decodeTemplate)
    |> required "zoneTemplates" (list Common.decodeTemplate)
