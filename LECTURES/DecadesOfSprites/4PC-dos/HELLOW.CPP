#include<graphics.h>
#include<stdio.h>
#include<conio.h>

void greetings(){
	clrscr();
	printf("Hello BCC %d", 3);
}

void initgraphics(){
    int gd = DETECT, gm;
    initgraph(&gd, &gm, "c:\\borlandc\\bgi");
    //https://home.cs.colorado.edu/~main/bgi/doc/initgraph.html
    setgraphmode(0);
}

void list_colors(){
    char buffer[8];
    int text_y = 10;
    outtextxy(50, text_y, "Hello Graphics mode.");
    bar(50, text_y + 10, 120, text_y + 17);
    for(int i=0; i < 16; i++){
	text_y += 10;
	setcolor(i);
	sprintf(buffer, "Color %d", i);
	outtextxy(50, text_y, buffer);
    }
}

void main(){
    greetings();
	getch();
	initgraphics();
	list_colors();
	getch();
	closegraph();
}
