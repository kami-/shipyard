import Basics exposing (toString)
import Graphics.Element exposing (Element, leftAligned)
import Html exposing (Html, div, text, pre)
import Html.Attributes exposing (id)
import String
import Text exposing (fromString)

import ElmTest.Test exposing (test, Test, suite)
import ElmTest.Assertion exposing (assert, assertEqual)
import ElmTest.Runner.String exposing (runDisplay)
import ElmTest.Run exposing(run, pass)

import HullParser exposing (..)

tests : Test
tests = suite "HullParser"
        [ suiteGameToString
        , suiteStringToGame
        , suiteCheckFaction
        , suiteCheckAllFactions
--        , suiteUpdate
        ]

suiteGameToString : Test
suiteGameToString =
  suite "gameToString"
  [ test "Arma2" (assertEqual (gameToString Arma2) "arma2")
  , test "Arma2I44" (assertEqual (gameToString Arma2I44) "arma2-i44")
  , test "Arma3" (assertEqual (gameToString Arma3) "arma3")
  ]

suiteStringToGame : Test
suiteStringToGame =
  suite "stringToGame"
  [ test "arma2" (assertEqual (stringToGame "arma2") Arma2)
  , test "arma2-i44" (assertEqual (stringToGame "arma2-i44") Arma2I44)
  , test "arma3" (assertEqual (stringToGame "arma3") Arma3)
  , test "Anything else should be Arma3" (assertEqual (stringToGame "asdfg") Arma3)
  ]

suiteCheckFaction : Test
suiteCheckFaction =
  let factions = [ Faction "faction1" False, Faction "faction2" True ]
      factionsChecked1 = [ Faction "faction1" True, Faction "faction2" True ]
  in
    suite "checkFaction"
    [ test "Empty list" (assertEqual (checkFaction [] "faction1" True) [])
    , test "Faction not in list" (assertEqual (checkFaction factions "faction3" True) factions)
    , test "Faction checked" (assertEqual (checkFaction factions "faction1" True) factionsChecked1)
    , test "Faction checked with same state" (assertEqual (checkFaction factions "faction1" False) factions)
    ]

suiteCheckAllFactions : Test
suiteCheckAllFactions =
  let factions = [ Faction "faction1" False, Faction "faction2" True ]
      factionsChecked = [ Faction "faction1" True, Faction "faction2" True ]
      factionsUnchecked = [ Faction "faction1" False, Faction "faction2" False ]
  in
    suite "checkAllFactions"
    [ test "Empty list" (assertEqual (checkAllFactions [] CheckAll) [])
    , test "All Factions checked" (assertEqual (checkAllFactions factions CheckAll) factionsChecked)
    , test "All Factions unchecked" (assertEqual (checkAllFactions factions UncheckAll) factionsUnchecked)
    ]

suiteUpdate : Test
suiteUpdate =
    suite "update"
    [ suiteUpdateGameChange
    ]

suiteUpdateGameChange : Test
suiteUpdateGameChange =
  let modelArma2 = Model Arma2 [] CheckAll "mission"
      modelArma2I44 = Model Arma2 [] CheckAll ""
      factionsChecked = [ Faction "faction1" True, Faction "faction2" True ]
      factionsUnchecked = [ Faction "faction1" False, Faction "faction2" False ]
  in
    suite "suiteUpdateGameChange"
    [ test "Converts game and empties mission" (assertEqual (update (GameChange "arma2-i44") modelArma2) (modelArma2I44, Effects (FactionsReceive [])))
    ]

main : Html
main =
  let result = run tests
  in
    div
    [ id "result" ]
    [ pre [ id "result-text" ] [ text (runDisplay tests) ]
    , div [ id "result-passed" ] [ text (toString (pass result)) ]
    ]