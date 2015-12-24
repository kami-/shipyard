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
  { terrain = { id = "", name = "" }
  , missionType = Mission.COOP
  , maxPlayers = 0
  , onLoadName = "Oh it's this mission!"
  , author = "Kami"
  , briefingName = "oh_its_this_mission"
  , overviewText = "Slot everything!"
  , factions = []
  , addons = { admiral = True, plank = False }
  }

defaultModel : Model
defaultModel = Model defaultMission

type alias Model =
    { mission : Mission.Mission
    
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
        [ h3 [] [ text "Mission" ]
        , selectField "terrain" "Terrain" [ ("Altis", "Altis"), ("Stratis", "Stratis") ]
        , selectField "missionType" "Mission type" [ ("COOP", "COOP"), ("TVT", "TVT"), ("GTVT", "GTVT"), ("COTVT", "COTVT") ]
        , intField "maxPlayers" "Max players"
        , textField "onLoadName" "OnLoadName"
        , textField "author" "Author"
        , textField "briefingName" "Briefing name"
        , textField "overviewText" "Overview text"
        , h3 [] [ text "Factions" ]
        , h3 [] [ text "Addons" ]
        ]
      ]
    ]

fieldGroup : String -> String -> Html -> Html
fieldGroup inpName lblText inp =
  div 
  [ class "field-group" ]
  [ label [ for inpName ] [ text lblText ]
  , inp
  ]

selectField : String -> String -> List (String, String) -> Html
selectField inpId lblText opts =
  let
    toOption (val, txt) = option [ value val ] [ text txt ]
  in
    fieldGroup inpId lblText
      <| select [ id inpId ]
        <| List.map toOption opts

intField : String -> String -> Html
intField inpId lblText =
  fieldGroup inpId lblText
    <| input
        [ id inpId
        , name inpId
        , type' "number"
        , step "1"
        ]
        []

textField : String -> String -> Html
textField inpId lblText =
  fieldGroup inpId lblText
    <| input
        [ id inpId
        , name inpId
        , type' "text"
        ]
        []

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