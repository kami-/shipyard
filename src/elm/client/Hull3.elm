module Hull3 exposing (..)

import Json.Decode as Decode exposing (Decoder, (:=), list, string, int)
import Json.Decode.Pipeline exposing (decode, required)

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



decodeConfig : Decoder Config
decodeConfig =
  decode Config
    |> required "factions" (list decodeFaction)
    |> required "gearTemplates" (list Common.decodeTemplate)
    |> required "uniformTemplates" (list Common.decodeTemplate)
    |> required "groupTemplates" (list Common.decodeTemplate)
    |> required "vehicleClassnameTemplates" (list Common.decodeTemplate)

decodeFaction : Decoder Faction
decodeFaction =
  decode Faction
    |> required "id" string
    |> required "name" string
    |> required "description" string
    |> required "gearTemplateId" string
    |> required "uniformTemplateId" string
    |> required "side" (int `Decode.andThen` Common.decodeSideFromInt)
    |> required "camouflage" (list string)
    |> required "rolePrefix" string
    |> required "vehicleClassnames" (Decode.dict string)