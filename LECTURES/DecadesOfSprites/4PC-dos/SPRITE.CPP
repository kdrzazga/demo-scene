#include<graphics.h>
#include<conio.h>
#include<dos.h>
#include<stdio.h>

const sprite_width = 8;
const sprite_height = 13;
const screen_width = 320;

int sprite[sprite_height][sprite_width] = {
    {4, 0, 0, 0, 0, 0, 0, 0},
    {0, 4, 0, 0, 0, 0, 0, 0},
    {0, 0, 4, 0, 4, 4, 0, 0},
    {0, 0, 0, 4, 0, 0, 4, 0},
    {0, 0, 0, 4, 0, 0, 4, 0}, //5
    {0, 4, 4, 4, 4, 4, 4, 4},
    {4, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 4, 4, 4, 4, 0, 0},
    {4, 4, 0, 0, 0, 0, 4, 4},
    {4, 0, 0, 4, 4, 0, 0, 4}, //10
    {4, 4, 0, 0, 0, 0, 4, 4},
    {0, 0, 4, 4, 4, 4, 0, 4},
    {0, 0, 0, 0, 0, 0, 0, 0},
};

void draw_sprite(int x0, int y0) {
    for(int y = 0; y < sprite_height; y++) {
	for(int x = 0; x < sprite_width; x++) {
	    int color = sprite[y][x];
	    putpixel(x0 + x, y0 + y, color);
	}
    }
}

void main(){
    int gd = DETECT, gm;
    initgraph(&gd, &gm, "c:\\borlandc\\bgi");
    setgraphmode(0);

    int xPos = 0;
    int yPos = 30;

    while(1) {
	if (kbhit()) {
	    break;
	}

	    cleardevice();
	    draw_sprite(xPos, yPos);
	    delay(50);
	    if (xPos > screen_width - sprite_width) {
		xPos = 0;
	    }
	xPos++;


    int width = getmaxx() + 1;
    int height = getmaxy() + 1;
    int maxColors = getmaxcolor() + 1;

    int text_x = 10;
    int text_y = 200;


    setcolor(WHITE);
    outtextxy(text_x, text_y, "Graphics mode:");
    text_y += 20;
    char buffer[100];

    sprintf(buffer, "Resolution: %d x %d pixels", width, height);
    outtextxy(text_x, text_y, buffer);
    text_y += 20;

    sprintf(buffer, "Colors supported: %d", maxColors);
    outtextxy(text_x, text_y, buffer);
    }
    closegraph();
}
