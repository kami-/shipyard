module Common exposing (..)

import Array
import Json.Decode as Decode exposing (Decoder, string, (:=))
import Json.Decode.Pipeline exposing (decode, required)


type Side
  = BLUFOR
  | OPFOR
  | INDFOR

sides : Array.Array Side
sides = Array.fromList [BLUFOR, OPFOR, INDFOR]

type alias Template =
  { id : String
  , name: String
  , description: String
  }



strToSide : String -> Side
strToSide side =
  case side of
    "INDFOR" -> INDFOR
    "OPFOR" -> OPFOR
    _ -> BLUFOR

sideToStr : Side -> String
sideToStr side =
  case side of
    INDFOR -> "INDFOR"
    OPFOR -> "OPFOR"
    _ -> "BLUFOR"

decodeSide : String -> Decoder Side
decodeSide side =
  Decode.succeed (strToSide side)

decodeSideFromInt : Int -> Decoder Side
decodeSideFromInt sideIdx =
  Decode.succeed (Maybe.withDefault BLUFOR (Array.get sideIdx sides))

decodeTemplate : Decoder Template
decodeTemplate =
  decode Template
    |> required "id" string
    |> required "name" string
    |> required "description" string
