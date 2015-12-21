module ShipyardApp where

import Effects exposing (Never)
import StartApp
import Task exposing (..)

import Shipyard exposing (init, view, update)

app =
  StartApp.start
    { init = init 
    , view = view
    , update = update
    , inputs = []
    }

main =
  app.html

port tasks : Signal (Task.Task Never ())
port tasks =
  app.tasks

port mission : Signal String
port mission =
  Signal.map .mission app.model
  |> Signal.dropRepeats