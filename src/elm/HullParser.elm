module HullParser where

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

type Game
    = Arma2
    | Arma2I44
    | Arma3

type alias Faction =
    { name : String
    , checked : Bool
    }

type FactionCheckState
    = CheckAll
    | UncheckAll

type alias Model =
    { game : Game
    , factions : List Faction
    , checkState : FactionCheckState
    , mission : String
    }

init : (Model, Effects Action)
init =
  ( Model Arma2 [] CheckAll ""
  , getGameFactions "arma2"
  )

gameToString : Game -> String
gameToString game =
  case game of
    Arma2 -> "arma2"
    Arma2I44 -> "arma2-i44"
    Arma3 -> "arma3"

stringToGame : String -> Game
stringToGame gameStr =
   if | gameStr == "arma2" -> Arma2
      | gameStr == "arma2-i44" -> Arma2I44
      | otherwise -> Arma3

-- UPDATE

type Action
    = GameChange String
    | FactionsReceive (List String)
    | FactionCheck String Bool
    | CheckAllFactions
    | GetMission
    | MissionReceive String

update : Action -> Model -> (Model, Effects Action)
update action model =
  case action of
    GameChange gameStr ->
      ( { model 
          | game <- stringToGame gameStr
          , mission <- ""
        }
      , getGameFactions gameStr
      )

    FactionsReceive factionNames ->
      ( { model | factions <- List.map (\name -> Faction name False) factionNames }
      , Effects.none
      )

    FactionCheck name checked ->
      ( { model | factions <- checkFaction model.factions name checked }
      , Effects.none
      )

    CheckAllFactions ->
      ( { model 
          | factions <- checkAllFactions model.factions model.checkState
          , checkState <- if model.checkState == CheckAll then UncheckAll else CheckAll
        }
      , Effects.none
      )

    GetMission ->
      (model, getMission model.game model.factions)

    MissionReceive mission ->
      ( { model | mission <- mission }
      , Effects.none
      )

checkFaction : List Faction -> String -> Bool -> List Faction
checkFaction factions name checked =
  let tryReplaceFaction faction =
    if faction.name == name
      then { faction | checked <- checked }
      else faction
  in
    List.map tryReplaceFaction factions

checkAllFactions : List Faction -> FactionCheckState -> List Faction
checkAllFactions factions checkState =
  let checked = checkState == CheckAll
  in
    List.map (\f -> { f | checked <- checked }) factions

-- VIEW

view : Signal.Address Action -> Model -> Html
view address model =
  div
    []
    [ div
      [ class "header" ]
      [ span [ class "header-text" ] [ text "Hull Parser" ] ]
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

factionCheckBox : Address Action -> Faction -> Html
factionCheckBox address faction =
  div
  [ class "checkbox" ]
  [ input
    [ id ("faction-checkbox-" ++ faction.name)
    , type' "checkbox"
    , checked faction.checked
    , name faction.name
    , value faction.name
    , on "change" targetChecked (Signal.message address << FactionCheck faction.name)
    ]
    []
  , label [ for ("faction-checkbox-" ++ faction.name) ] [ text faction.name ]
  ]

-- EFFECTS

encodeFaction : List Faction -> Json.Encode.Value
encodeFaction factions =
    List.filter .checked factions
    |> List.map (\f -> Json.Encode.string f.name)
    |> Json.Encode.list

jsonPost : Json.Decode.Decoder value -> String -> Http.Body -> Task Http.Error value
jsonPost decoder url body = 
  let request =
    { verb = "POST"
    , headers = [ ("Content-Type", "application/json") ]
    , url = url
    , body = body
    }
  in
    Http.fromJson decoder (Http.send Http.defaultSettings request)

getGameFactions : String -> Effects Action
getGameFactions gameStr =
  Http.get (Json.Decode.list Json.Decode.string) ("/hull-parser/faction/" ++ gameStr)
    `onError` (\_ -> succeed [])
    |> Task.map FactionsReceive
    |> Effects.task

getMission : Game -> List Faction -> Effects Action
getMission game factions =
  jsonPost Json.Decode.string ("/hull-parser/faction/" ++ (gameToString game)) (Http.string (Json.Encode.encode 0 (encodeFaction factions)))
    `onError` (\_ -> succeed "")
    |> Task.map MissionReceive
    |> Effects.task