module Hull3 where

import Json.Decode exposing (..)

type alias GearTemplate =
    { id : String
    , name : String
    , description : String    
    }

type alias UniformTemplate =
    { id : String
    , name : String
    , description : String    
    }

type alias Faction =
    { name : String
    , gearTemplateId : String
    , uniformTemplateId : String
    }

type alias Config =
    { factions : List Faction
    , gearTemplates : List GearTemplate
    , uniformTemplates : List UniformTemplate
    }

gearTemplate : Decoder GearTemplate
gearTemplate =
  object3 GearTemplate
    ("id" := string)
    ("name" := string)
    ("description" := string)

uniformTemplate : Decoder UniformTemplate
uniformTemplate =
  object3 UniformTemplate
    ("id" := string)
    ("name" := string)
    ("description" := string)

faction : Decoder Faction
faction =
  object3 Faction
    ("name" := string)
    ("gearTemplateId" := string)
    ("uniformTemplateId" := string)


config : Decoder Config
config =
  object3 Config
    ("factions" := list faction)
    ("gearTemplates" := list gearTemplate)
    ("uniformTemplates" := list uniformTemplate)
