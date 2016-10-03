import Dom
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.App as App

import Mission

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
    (emptyModel, Cmd GetConfig)


emptyModel : Model
emptyModel =
    { config = Mission.emptyConfig
    , mission = Mission.emptyMission
    }


-- UPDATE

type Msg
    = GetConfig


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    model ! []
  


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
                    , select [ id "terrain" ] []
                    ]
                , div
                    [ class "field-group" ]
                    [ label [ for "missionType" ] [ text "Mission type" ]
                    , select [ id "missionType" ] []
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
                , div [ class "description" ] [ text "Full mission name, shown on load screen" ]
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

                , h3 [ class "after" ] [ text "Facions" ]
                , div [ id "factions" ] []
                , button [ id "add-faction" ] [ text "Add faction" ]

                , h3 [ class "after" ] [ text "Addons" ]
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


-- SUBSCRIPTIONS

--subscriptions : Model -> Sub Msg
--subscriptions model = Sub Submit


-- INIT

--init : (Model, Cmd Msg)
--init =
--  (Model, Cmd Submit)