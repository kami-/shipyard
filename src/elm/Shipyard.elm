module Shipyard where

import Mission
import Hull3

import Basics exposing (toString)
import Debug exposing(log)
import Effects exposing (Effects)
import Json.Decode
import Json.Encode
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Signal exposing (Address)
import Task exposing (..)


-- MODEL

defaultMission : Mission.Mission
defaultMission =
  { terrain = { id = "Altis", name = "Altis" }
  , missionType = Mission.COOP
  , maxPlayers = 0
  , onLoadName = "Oh it's this mission!"
  , author = "Kami"
  , briefingName = "oh_its_this_mission"
  , overviewText = "Slot everything!"
  , factions = []
  , addons = { admiral = True, plank = False }
  }

defaultMissionConfig : Mission.Config
defaultMissionConfig =
  { sides = Mission.sides
  , missionTypes = Mission.missionTypes
  , terrains =
      [ { id="Altis", name="Altis" }
      , { id="Stratis", name="Stratis" }
      ]
  , hull3 =
      { factions = []
      , gearTemplates = []
      , uniformTemplates = []
      }
  }

defaultModel : Model
defaultModel = Model defaultMission defaultMissionConfig

type alias Model =
    { mission : Mission.Mission
    , missionConfig : Mission.Config
    }

init : (Model, Effects Action)
init =
  ( defaultModel
  , Effects.none
  )


-- UPDATE

type Action
    = One
    | Two

update : Action -> Model -> (Model, Effects Action)
update action model =
  case action of
    One -> (model, Effects.none)
    Two -> (model, Effects.none)


-- VIEW

view : Signal.Address Action -> Model -> Html
view address model =
  div
    []
    [ div
      [ class "header" ]
      [ span [ class "header-text" ] [ text "Shipyard" ] ]
    , div
      [ class "content" ]
      [ div
        [ class "form" ]
        [ h3 [ class "after" ] [ text "Mission" ]
        , selectField
            "terrain"
            "Terrain"
            (toOptionPairs .id .name [{id="Altis",name="Altis"},{id="Stratis",name="Stratis"}])
            model.mission.terrain.id
        , selectField
            "missionType"
            "Mission type"
            (toOptionPairs Mission.missionTypeToStr Mission.missionTypeToStr Mission.missionTypes)
            <| Mission.missionTypeToStr model.mission.missionType
        , intField
            "maxPlayers"
            "Max players"
            model.mission.maxPlayers
        , textField
            "onLoadName"
            "OnLoadName"
            model.mission.onLoadName
        , textField
            "author"
            "Author"
            model.mission.author
        , textField
            "briefingName"
            "Briefing name"
            model.mission.briefingName
        , textField
            "overviewText"
            "Overview text"
            model.mission.overviewText
        , h3 [ class "before after" ] [ text "Factions" ]
        , button
          [ id "add-faction" ]
          [ text "Add faction" ]
        , h3 [ class "before after" ] [ text "Addons" ]
        , addonField "admiral" "Admiral" model.mission.addons.admiral
        , addonField "plank" "Plank" model.mission.addons.plank
        ]
      ]
    ]

toOptionPairs : (a -> String) -> (a -> String) -> List a -> List (String, String)
toOptionPairs toVal toTxt xs = List.map (\x -> (toVal x, toTxt x)) xs

fieldGroup : String -> String -> Html -> Html
fieldGroup inpName lblText inp =
  div 
  [ class "field-group" ]
  [ label [ for inpName ] [ text lblText ]
  , inp
  ]

selectField : String -> String -> List (String, String) -> String -> Html
selectField inpId lblText opts selectedVal =
  let
    toOption selectedVal (val, txt) =
      option
      [ value val
      , selected (val == selectedVal)
      ]
      [ text txt ]
  in
    fieldGroup inpId lblText
      <| select [ id inpId ]
        <| List.map (toOption selectedVal) opts

intField : String -> String -> Int -> Html
intField inpId lblText val =
  fieldGroup inpId lblText
    <| input
        [ id inpId
        , name inpId
        , type' "number"
        , step "1"
        , value
            <| toString val 
        ]
        []

textField : String -> String -> String -> Html
textField inpId lblText val =
  fieldGroup inpId lblText
    <| input
        [ id inpId
        , name inpId
        , type' "text"
        , value val
        ]
        []

addonField : String -> String -> Bool -> Html
addonField inpId lblText isChecked =
  fieldGroup inpId lblText
    <| input
        [ id inpId
        , name inpId
        , type' "checkbox"
        , checked isChecked
        ]
        []

faction : Hull3.Config -> Mission.Faction -> Int -> Html
faction h3Config f idx =
  div
  []
  [ selectField
      (factionFieldId "faction" idx)
      "Gear template"
      (toOptionPairs  .id .name  h3Config.gearTemplates)
      f.gearTemplateId
  , selectField
      (factionFieldId "side" idx)
      "Side"
      (toOptionPairs Mission.sideToStr Mission.sideToStr Mission.sides)
      <| Mission.sideToStr f.side
  , selectField
      (factionFieldId "gear" idx)
      "Gear template"
      (toOptionPairs  .id .name  h3Config.gearTemplates)
      f.gearTemplateId
  , selectField
      (factionFieldId "uniform" idx)
      "Uniform template"
      (toOptionPairs  .id .name  h3Config.uniformTemplates)
      f.uniformTemplateId
  ]

factionFieldId : String -> Int -> String
factionFieldId id idx = id ++ "Faction" ++ (toString idx)

{-
    , div
      [ class "container" ]
      [ div
        [ class "row light form-group" ]
        [ div
          [ class "row form-header" ]
          [ label [ for "game-select" ] [ text "Game" ] ]
        , div
          [ class "row form-content" ]
          [ div []
            [
              select
              [ id "game-select"
              , on "change" targetValue (Signal.message address << GameChange)
              ]
              [ option [ selected True, value "arma2" ] [ text "Arma 2" ]
              , option [ value "arma2-i44" ] [ text "Arma 2 - I44" ]
              , option [ value "arma3" ] [ text "Arma 3" ]
              ]
            ]
          ]
        ]
      , div
        [ class "row light form-group" ]
        [ div
          [ class "row form-header" ]
          [ label [] [ text "Factions" ] ]
        , div
          [ class "row form-content" ]
          [ div
            [ id "faction-checkBoxes" ]
            (List.map (factionCheckBox address) model.factions)
          ]
        ]
      , div
        [ class "row form-group" ]
        [ div
          []
          [ button 
            [ id "btn-check-all" 
            , onClick address CheckAllFactions
            ]
            [ text (if model.checkState == CheckAll then "Check all" else "Uncheck all") ]
          , button 
            [ id "btn-add"
            , onClick address GetMission
            ]
            [ text "Add factions" ]
          ]
        ]
      , div
        [ class "row" ]
        [ div
          [ id "editor" ]
          []
        ]
      ]
    ]
-}

-- Effects