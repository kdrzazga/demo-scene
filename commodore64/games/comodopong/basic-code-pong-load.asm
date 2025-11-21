.const rem = $8f
.const end = $80
.const newline = $08
.const sys = $9e
.const print = 153
.const for = 129
.const next = 130
.const space = 32
.const quote = 34
.const i = 73
.const equal = 178
.const one = 49
.const colon = 58
.const left_arrow = 95
.const poke = $97
.const signature_basic = $180d
.const WHITE = 5
.const BLACK = 144


*=2049 "basic loader"
.byte 24, 8

.byte 53, 0
.byte poke
.text " 53280,12"
.byte colon
.byte poke
.text " 53281,15"
.byte colon
.byte poke
.text " 646,0"
.byte $00,0,$19

.byte 200, 0
.byte  print,32, quote, 147
.text "****************************************"
.byte quote
.byte $00,0,$19

.byte 205, 0
.byte  print,32, quote
.text "*   COMMODOPONG - A SIMPLE PONG GAME   *"
.byte quote
.byte $00,0,$19

.byte 210, 0
.byte  print,32, quote
.text "****************************************"
.byte quote
.byte $00,0,$19


.byte 215, 0
.byte  print,32, quote
.text ""
.byte quote
.byte $00,0,$19

.byte 220, 0
.byte  print,32, quote
.text "KUDOZ TO "
.byte WHITE
.text "PAN ARECZEK"
.byte BLACK
.text " OF K&A+"
.byte quote
.byte $00,0,$19

.byte 223, 0
.byte  print,32, quote
.text ""
.byte quote
.byte $00,0,$19

.byte 225, 0
.byte  print,32, quote
.text ""
.byte quote
.byte $00,0,$19

.byte 230, 0
.byte  print,32, quote
.text "MSX: POPCORN BY LYNX"
.byte quote
.byte $00,0,$19

.byte 235, 0
.byte  print,32, quote
.text "HTTPS://CSDB.DK/SID/?ID=38878"
.byte quote
.byte $00,0,$19

.byte 236, 0
.byte  print,32, quote
.text ""
.byte quote
.byte $00,0,$19

.byte 240, 0
.byte  print,32, quote
.text "(C) KRZYSZTOF D. AND K&A+ 2026"
.byte quote
.byte $00,0,$19

.byte 245, 0, for
.text " I "
.byte 178 //2057
.byte 32, 49, 32, 164, 32  //2063
.text "6 : " //TODO 6000
.byte  next
.byte 0,0,$19

.byte 250, 0
.byte sys
.text " 2534"
.byte $00,$19
.byte $00, $00

.print "End code: " + *
rts
