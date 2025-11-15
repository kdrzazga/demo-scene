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
.const if = 139
.const then = 167
.const next = 130
.const space = 32
.const quote = 34
.const i = 73
.const equal = 178
.const one = 49
.const colon = 58
.const left_arrow = 95
.const poke = $97
.const peek = 194
.const signature_basic = $180d
.const WHITE = 5
.const BLACK = 144
.const RED = 28
.const BLUE = 31

*=2049 "basic loader"
.byte 24, 8

.byte 227, 0
.byte  poke

.byte $00,0,$19

.byte 229, 0
.byte  print
.byte $00,0,$19

.byte 231, 0
.byte  poke
.text " 53280, 7: "
.byte poke
.text " 53281, 7: "
.byte poke
.text " 646, 0"
.byte $00,0,$19

.byte 233, 0
.byte  print,32, quote, 147, 31
.text "TUFF GUY"
.byte BLACK
.text " (C64 MULTICOLOR GRAPHICS)       "
.byte quote
.byte $00,0,$19

.byte 235, 0
.byte  print,32, quote
.text "RELEASED ON "
.byte RED
.text "SYNTAX PARTY"
.byte BLACK
.text ", 15-16TH NOV 25MELBOURNE, AUSTRIA OR AUSTRALIA :)"
.byte quote
.byte $00,0,$19

.byte 256, 0, for
.text " I "
.byte 178 //2057
.byte 32, 49, 32, 164, 32  //2063
.text "3000 : "
.byte  next, colon, print
.byte 0,0,$19

.byte 237, 0
.byte  print,32, quote
.text ""
.byte quote
.byte $00,0,$19

.byte 239, 0
.byte  print,32, quote
.text "GFX + LITTLE CODE: "
.byte RED
.text "KRISTOF D. (K&A+)     "
.byte BLACK
.byte quote
.byte $00,0,$19

.byte 243, 0
.byte  print,32, quote
.text "MSX: COMMANDO BY ROB HUBBARD            (IN CASE YOU COULDN'T RECOGNIZE)"
.byte quote, colon, print
.byte $00,0,$19

.byte 247, 0
.byte  print,32, quote
.text "KUDOZ TO K&A+ INCLUDING "
.byte RED
.text "PAN ARECZEK"
.byte BLACK
.text "     GREETINGS TO ALL AUSSIES"
.byte quote
.byte $00,0,$19

.byte 247, 0
.byte  print,32, quote
.text "INCLUDING KANGAROOS"
.byte quote
.byte $00,0,$19

.byte 254, 0, for
.text " I "
.byte 178 //2057
.byte 32, 49, 32, 164, 32  //2063
.text "8000 : "
.byte  next
.byte 0,0,$19

/*
.byte 249, 0, poke
.text " 4096,255"
.byte 0,0,$19

.byte 251, 0, poke
.text " 4096, ("
.byte peek
.text "(4096)-1):"
.byte 0,0,$19


.byte 253, 0, if
.text " "
.byte peek
.text "(4096)>0 "
.byte then
.text " 253:"
.byte 0,0,$19
.byte 0,0
*/

.byte 255, 0
.byte sys
.text " 2570"
.byte $00,$19
.byte $00, $00

.print "End code: " + *
rts
