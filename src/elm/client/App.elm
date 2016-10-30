import Debug
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.App as App
import Http
import Task

import Common
import Mission
import Hull3


main : Program Never
main =
  App.program
    { init = init
    , view = view
    , update = update
    , subscriptions = \_ -> Sub.none
    }


-- MODEL

type alias Model =
  { config: Mission.Config
  , mission: Mission.Mission
  }

init : (Model, Cmd Msg)
init =
  (emptyModel, getConfig)


emptyModel : Model
emptyModel =
  { config = Mission.emptyConfig
  , mission = Mission.emptyMission
  }


-- UPDATE

type Msg
  = GetConfig
  | GetConfigSucceed Mission.Config
  | GetFail Http.Error

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    GetConfig ->
      model ! []

    GetConfigSucceed config ->
      Debug.log "config" ({ model | config = config } ! [])

    GetFail error ->
      model ! []



getConfig : Cmd Msg
getConfig =
  Task.perform GetFail GetConfigSucceed (Http.get Mission.decodeConfig "/shipyard/mission/config")



-- VIEW

view : Model -> Html Msg
view model =
  div
    []
    [ div
      [ class "header" ] 
      [ div
        [ class "header-text" ]
        [ text "Shipyard" ]
      , ul
        [ class "menu" ]
        [ li
          [ class "menu-item active" ]
          [ a [ href "/shipyard" ] [ text "Mission" ] ]
        , li
          [ class "menu-item" ]
          [ a [ href "/shipyard/town-sweep" ] [ text "Town Sweep" ] ]
        , li
          [ class "menu-item" ]
          [ a [ href "/shipyard/random-engagements" ] [ text "Random Engagements" ] ]
        ]
      ]
    , div
      [ class "content" ] 
      [ div
        [ class "form" ]
        [ h3 [ class "after" ] [ text "Mission" ]
        , div
          [ class "field-group" ]
          [ label [ for "terrain" ] [ text "Terrain" ]
          , select
            [ id "terrain" ]
            (List.map
              (\t -> option [ value t.id ] [ text t.name ])
              model.config.terrains)
          ]
        , div
          [ class "field-group" ]
          [ label [ for "missionType" ] [ text "Mission type" ]
          , select
            [ id "missionType" ]
            (List.map
              (\mt -> 
                let val = Mission.missionTypeToStr mt
                in option [ value val ] [ text val ])
              model.config.missionTypes)
          ]
        , div
          [ class "field-group" ]
          [ label [ for "onLoadName" ] [ text "OnLoadName" ]
          , input
            [ id "onLoadName"
            , name "onLoadName"
            , type' "text"
            , placeholder "Oh it's this mission"
            , value model.mission.onLoadName
            ] []
          ]
        , div [ class "description" ] [ text "Full mission name, shown on load screen" ]
        , div
          [ class "field-group" ]
          [ label [ for "briefingName" ] [ text "Briefing name" ]
          , input
            [ id "briefingName"
            , name "briefingName"
            , type' "text"
            , placeholder "oh_its_this_mission"
            , value model.mission.briefingName
            ] []
          ]
        , div [ class "description" ] [ text "Short mission name containing only alphanumeric and underscore" ]
        , div
          [ class "field-group" ]
          [ label [ for "overviewText" ] [ text "Overview text" ]
          , input
            [ id "overviewText"
            , name "overviewText"
            , type' "text"
            , placeholder "Slot everything!"
            , value model.mission.overviewText
            ] []
          ]
        , div [ class "description" ] [ text "Short description/pun of mission and slotting requirements" ]
        , div
          [ class "field-group" ]
          [ label [ for "author" ] [ text "Author" ]
          , input
            [ id "author"
            , name "author"
            , type' "text"
            , value model.mission.author
            ] []
          ]

        , h3 [ class "before after" ] [ text "Factions" ]
        , div
          [ id "factions" ]
          [ 
          ]
        , button [ id "add-faction" ] [ text "Add faction" ]

        , h3 [ class "before after" ] [ text "Addons" ]
        , div
          [ class "field-group" ]
          [ label [ for "admiralIsEnabled" ] [ text "Admiral" ]
          , input [ id "admiralIsEnabled", name "admiralIsEnabled", type' "checkbox" ] []
          ]
        , div [ id "admiral", class "addon-config", style [ ("display", "none") ] ] []

        , div
          [ class "field-group" ]
          [ label [ for "navy" ] [ text "Navy" ]
          , input [ id "navy", name "navy", type' "checkbox" ] []
          ]

        , div
          [ class "field-group" , style [ ("display", "none") ] ]
          [ label [ for "plank" ] [ text "Plank" ]
          , input [ id "plank", name "plank", type' "checkbox" ] []
          ]
        , div
          []
          [ button [ id "generate-mission" ] [ text "Generate mission" ]
          , img [ id "download-progress", src "progress.gif", width 24, height 24, style [ ("display", "none"), ("margin-bottom", "-5px") ] ] [] 
          ]
        , Html.form
          [ id "download-mission", method "GET", action "", style [ ("display", "none") ] ]
          []
        ]
      ]
    ]



factionView : Model -> Hull3.Faction -> Html Msg
factionView model faction =
  div
  [ class "faction-container" ]
  [ div
    [ class "faction-field-container" ]
    [ div
      [ class "field-group" ]
      [ label [] [ text "Faction"]
      , select []
        (List.map
          (\f -> option [ value f.id, selected (f.id == faction.id) ] [ text f.name ])
          model.config.hull3.factions)
      ]
    , div [ class "description" ] [ text faction.description ]
    , div [ class "field-group" ]
      [ label [] [ text "Side"]
      , select []
        (List.map
          (\s -> 
            let val = Common.sideToStr s
            in option [ value val ] [ text val ])
          model.config.sides)
      ]
    , div [ class "field-group" ]
      [ label [] [ text "Gear template"]
      , select []
        (let gearTemplate =
          List.head (List.filter
            (\gt -> gt.id == faction.gearTemplateId)
            model.config.hull3.groupTemplates)
        in 
          List.map
            (\gt -> option [ value gt.id, selected (gt.id == gearTemplate.id) ] [ text gearTemplate.name ])
            model.config.hull3.groupTemplates)
      ]
    ]
  , h4 [ class "before" ] [ text "Groups" ]
  , button [ class "check-all-groups all" ] [ text "Uncheck all" ]
  , div
    [ class "faction-groups" ]
    []
  , h4 [ class "before small" ] [ text "Vehicle classnames" ]
  , div
    [ class "faction-vehicle-classname-fields" ]
    []
  , div
    [ class "remove-footer" ]
    []
  ]

-- SUBSCRIPTIONS

--subscriptions : Model -> Sub Msg
--subscriptions model = Sub Submit


-- INIT

--init : (Model, Cmd Msg)
--init =
--  (Model, Cmd Submit)