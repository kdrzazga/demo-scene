/*
https://sta.c64.org/cbm64pet.html
https://sta.c64.org/cbm64basins2.html
https://sta.c64.org/cbm64mem.html
*/

.const rem = $8f
.const end = $80
.const newline = $08
.const sys = $9e
.const print = 153
.const for = 129
.const to = 164
.const if = 139
.const then = 167
.const gosub = 141
.const greater = 177
.const less = 179
.const next = 130
.const space = 32
.const return = 142
.const quote = 34
.const i = 73
.const equal = 178
.const minus = 171
.const plus = 170
.const one = 49
.const zero = one - 1
.const colon = 58
.const left_arrow = 95
.const poke = $97
.const peek = 194
.const len = 195
.const signature_basic = $180d
.const WHITE = 5
.const BLACK = 144
.const RED = 28
.const BLUE = 31

*=2049 "basic loader"
.byte 24, 8

.byte 0, 0
.byte  poke
.text " 646,1" //color
.byte $00,0,$19

.byte 2, 0
.text "I"
.byte  equal,  len
.text "("
.byte quote
.text "WINTER FAKE DEMO"
.byte quote
.text ")"
.byte $00,0,$19

.byte 3, 0
.text "T"
.byte equal
.text "39"
.byte minus
.text"I"
.byte $00,0,$19

.byte 10, 0
.byte  for
.text " I"
.byte equal
.text "0 "
.byte to
.text " 40:"
.byte poke
.text " 53280,I"
.byte $00,0,$19

.byte 15, 0
.byte poke
.text "211,T:"
.byte poke
.text "214,6"
.byte $00,0,$19

.byte 20, 0
.byte  poke
.text "55296"
.byte plus
.text" 40"
.byte plus
.text "I,1"
.byte $00,0,$19

.byte 21, 0
.byte  poke
.text "55296"
.byte plus
.text "160"
.byte minus
.text "I,1"
.byte $00,0,$19

.byte 22, 0
.byte  poke
.text "55296"
.byte plus
.text "180"
.byte plus
.text "I,1"
.byte $00,0,$19

.byte 23, 0
.byte  print,32, quote
.text "WINTER FAKE DEMO "
.byte quote, $00,0,$19

.byte 24, 0
.byte  if
.text " T"
.byte greater, zero,32, then
.text " T"
.byte equal
.text "T"
.byte minus, one
.byte $00,0,$19

.byte 25, 0
.byte  if
.text " T"
.byte less,equal, zero,32, then, 32, gosub
.text "50"
.byte $00,0,$19

.byte 30, 0, next
.byte $00,0,$19

.byte 40, 0
.byte sys,32
.text "2700"
.byte $00,0,$19

.byte 50, 0, poke
.text "53280,0"
.byte $00,0,$19

.byte 60, 0, poke
.text "211,0"
.byte colon,poke
.text "214,7"
.byte $00,0,$19

.byte 80, 0, for
.text " J"
.byte equal, zero, to
.text " 7"
.byte $00,0,$19

.byte 90, 0, print, 32,quote
.fill 25, 32
.byte quote
.byte $00,0,$19

.byte 91, 0, poke
.text "53280,J"
.byte $00,0,$19

.byte 92, 0
.text "I"
.byte equal
.text "I"
.byte plus, one
.byte $00,0,$19

.byte 99, 0, next
.text " J"
.byte $00,0,$19

.byte 100, 0, return
.byte $00,$19
.byte $00, $00

.print "LOADER code end: " + *
rts
