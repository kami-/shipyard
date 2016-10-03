module Common exposing (..)

type Side
    = BLUFOR
    | OPFOR
    | INDFOR

type alias Template =
    { id : String
    , name: String
    , description: String
    }
