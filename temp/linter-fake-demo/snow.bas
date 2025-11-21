0 poke 646,1
2 l=len("winter fake demo"):tc=39-l
10 for i=0 to 40:poke 53280,i
15 poke 211,tc:poke 214, 6
20 poke 55296+40+i,1
21 poke 55296+160-i,1
22 poke 55296+180+i,1
23 print "winter fake demo "
24 if tc>0 then tc=tc-1
25 if tc<=0 then gosub 50
30 next
40 end
50 poke 53281,0
60 poke 211,0: poke 214,7
80 for j=0 to 7
90 print"                         ";
91 poke 53280,j
92 i=i+1
99 next j
100 return