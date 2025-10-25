0 REM POKE 710,2
1 REM POKE 709,11
10 GRAPHICS 8
20 POKE 559,62          :REM SDMCTL Direct Memory Access (DMA) enable
30 POKE 53248,20       :REM 53248 HPOSP0 (W) Horizontal position of player 0
40 WHT=15
50 POKE 704,WHT         :REM Locations 704 to 712 ($2C0 to $2C8) are the color registers for players, missiles,and playfields
60 I=PEEK(106)-8        :REM RAMTOP - RAM size, defined by powerup
70 POKE 54279,I         :REM CONSOL (W/R) Used to see if one of the three yellow console buttons has been pressed (not the RESET button!).
80 POKE 53277,3         :REM GRACTL (W) Used to turn on players and to turn on missiles.
90 POKE 53256,3         :REM SIZEP0 (W) Size of player 0.

100 REM DRAW 10 LINES (BACKGROUND)
110 FOR A = 70 TO 100 STEP 3
120 COLOR 1: PLOT 100,A: DRAWTO 315,A+20
130 NEXT A

200 J=I*256+1024
210 FOR Y=J+120 TO J+137
220 READ Z
230 POKE Y,Z
240 NEXT Y
250 FOR X=221 TO 48 STEP -1:GOSUB 500:NEXT X
260 GOTO 250
320 POKE Y,Z
500 POKE 53248,X        :REM 53248 HPOSP0 (W) Horizontal position of player 0
510 RETURN

600 DATA 128,64,44,18,18,18
610 DATA 127,129,60,195,153,195
620 DATA 60,0,0,0,0,0
