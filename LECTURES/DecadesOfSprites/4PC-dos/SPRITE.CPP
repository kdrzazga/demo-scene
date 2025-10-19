#include<graphics.h>
#include<conio.h>
#include<dos.h>

const sprite_width = 7;
const screen_width = 320;

int sprite[2][sprite_width] = {
    {5, 4, 2, 2, 2, 2, 4},
    {5, 3, 2, 2, 2, 2, 5}
};

void draw_sprite(int x0, int y0) {
    for(int y = 0; y < 2; y++) {
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
    }

    getch();
    closegraph();
}
