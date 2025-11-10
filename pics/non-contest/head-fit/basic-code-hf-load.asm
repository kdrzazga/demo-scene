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
.const poke = $9700
.const signature_basic = $180d
.const WHITE = 5
.const LIGHTBLUE = 154


*=2049 "basic loader"
.byte 24, 8
.byte 245, 0
.byte  print,32, quote, 147, quote
.byte $00,0,$19

.byte 246, 0
.byte  print,32, quote
.text "TRIBUTE TO BLACKBOX CART"
.byte quote
.byte $00,0,$19

.byte 247, 0
.byte  print,32, quote
.text ""
.byte quote
.byte $00,0,$19

.byte 248, 0
.byte  print,32, quote, WHITE, left_arrow
.text "HF"
.byte LIGHTBLUE
.text " IS THE FAMOUS BLACK BOX COMMAND TO "
.byte quote
.byte $00,0,$19

.byte 249, 0
.byte  print,32, quote
.text "MANIPULATE DATASSETE HEADER"
.byte quote
.byte $00,0,$19

.byte 250, 0
.byte  print,32, quote
.text "KUDOZ TO "
.byte WHITE
.text "PAN ARECZEK"
.byte LIGHTBLUE
.text " OF K&A+ AND WOJTEK BRZOSTEK - THE COMPOSER"
.byte quote
.byte $00,0,$19

.byte 234, 0
.byte  print,32, quote
.text "LET'S RUN HEAD FIT NOW  !!!!"
.byte quote
.byte $00,0,$19

.byte 235, 0
.byte  print,32, quote
.text ""
.byte quote
.byte $00,0,$19

.byte 236, 0
.byte  print,32, quote, left_arrow
.text "HF"
.byte quote
.byte $00,0,$19

.byte 237, 0, for
.text " I "
.byte 178 //2057
.byte 32, 49, 32, 164, 32  //2063
.text "6000 : "
.byte  next
.byte 0,0,$19

.byte 238, 0
.byte sys
.text " 2534"
.byte $00,$19
.byte $00, $00

.print "End code: " + *
rts
