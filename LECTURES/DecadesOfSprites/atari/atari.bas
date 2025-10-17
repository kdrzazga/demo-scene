10 DIM A$(10),B$(100)
20 GRAPHICS 8
30 POKE 559,62          :REM SDMCTL Direct Memory Access (DMA) enable
40 POKE 53248,120       :REM 53248 HPOSP0 (W) Horizontal position of player 0
50 POKE 704,88          :REM Locations 704 to 712 ($2C0 to $2C8) are the color registers for players, missiles,and playfields
60 I=PEEK(106)-8        :REM RAMTOP - RAM size, defined by powerup
70 POKE 54279,I         :REM CONSOL (W/R) Used to see if one of the three yellow console buttons has been pressed (not the RESET button!).
80 POKE 53277,3         :REM GRACTL (W) Used to turn on players and to turn on missiles.
90 POKE 53256,3         :REM SIZEP0 (W) Size of player 0.
100 J=I*256+1024
110 FOR Y=J+120 TO J+137
120 READ Z
130 POKE Y,Z
140 NEXT Y
150 FOR X=48 TO 221:GOSUB 500:NEXT X
160 GOTO 150
320 POKE Y,Z
500 POKE 53248,X        :REM 53248 HPOSP0 (W) Horizontal position of player 0
510 RETURN
600 DATA 60,60,60,60,60,60
610 DATA 255,255,255,255,255,255
620 DATA 60,60,60,60,60,60
