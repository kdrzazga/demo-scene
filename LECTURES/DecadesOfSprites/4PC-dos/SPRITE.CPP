#include<graphics.h>
#include<string.h>
#include<stdio.h>
#include<conio.h>
#include<dos.h>


const sprite_width = 9;
const sprite_height = 13;
const screen_width = 320;
const initial_text_y = 55;

int sprite[sprite_height][sprite_width] = {
    {WHITE, 0,     0,     0,     0,     0,     0,     0,     0},
    {0,     WHITE, 0,     0,     0,     0,     0,     0,     0},
    {0,     0,     WHITE, 0,     WHITE, WHITE, 0,     0,     0},
    {0,     0,     0,     WHITE, 0,     0,     WHITE, 0,     0},
    {0,     0,     0,     WHITE, 0,     0,     WHITE, 0,     0}, //5
    {0,     WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, 0},
    {WHITE, 0,     0,     0,     0,     0,     0,     0,     WHITE},
    {0,     0,     WHITE, WHITE, WHITE, WHITE, 0,     0,     0},
    {WHITE, WHITE, 0,     0,     0,     0,     WHITE, WHITE, 0},
    {WHITE, 0,     0,     WHITE, WHITE, 0,     0,     WHITE, 0}, //10
    {WHITE, WHITE, 0,     0,     0,     0,     WHITE, WHITE, 0},
    {0,     0,     WHITE, WHITE, WHITE, WHITE, 0,     0    , 0},
    {0,     0,     0,      0,    0,     0,     0,     0,     0},
};

void draw_sprite(int x0, int y0, int arr[sprite_height][sprite_width]) {
    for(int y = 0; y < sprite_height; y++) {
	    for(int x = 0; x < sprite_width; x++) {
		    int color = arr[y][x];

		    if (color == 0)
			continue;

		    //putpixel(x0 + x, y0 + y, color);
		    putpixel(x0 + 3*x, y0 + y, color);
		    putpixel(x0 + 3*x+1, y0 + y, color);
		    putpixel(x0 + 3*x+2, y0 + y, color);
	    }
    }
}

void flip_vertical(int arr[][sprite_width], int height) {
    for (int i = 0; i < height / 2; i++) {
        for (int j = 0; j < sprite_width; j++) {
            int temp = arr[i][j];
            arr[i][j] = arr[height - i - 1][j];
            arr[height - i - 1][j] = temp;
        }
    }
}

void flip_horizontal(int arr[][sprite_width], int width) {
    for (int i = 0; i < sprite_height; i++) {
	for (int j = 0; j < width / 2; j++) {
	    int temp = arr[i][j];
	    arr[i][j] = arr[i][width - j - 1];
	    arr[i][width - j - 1] = temp;
	}
    }
}

void draw_background(){
    setfillstyle(SOLID_FILL, BLACK);
    bar(0,0, getmaxx(), initial_text_y-1);

    setfillstyle(SOLID_FILL, CYAN);
    bar(0,initial_text_y-3, getmaxx(), initial_text_y-1);

    setfillstyle(SOLID_FILL, GREEN);
    bar(30, 30, 60, initial_text_y-3);
    bar(170, 20, 190, initial_text_y-3);

    setfillstyle(SOLID_FILL, BLUE);
    bar(90, 20, 100, initial_text_y-3);
}

void main(){
    int gd = DETECT, gm;
    initgraph(&gd, &gm, "c:\\borlandc\\bgi");
    //https://home.cs.colorado.edu/~main/bgi/doc/initgraph.html
    setgraphmode(0);

    int x_pos = 0;
    int y_pos = 41;

    int flipped[sprite_height][sprite_width];
    memcpy(flipped, sprite, sizeof(sprite));
    flip_horizontal(flipped, sprite_width);

    while(1) {
	if (kbhit()) {
	    break;
	}

	    draw_background();
	    draw_sprite(x_pos, y_pos, flipped);
	    delay(50);
	    if (x_pos > screen_width - sprite_width) {
		x_pos = 0;
	    }
	x_pos++;


    int width = getmaxx() + 1;
    int height = getmaxy() + 1;
    int maxColors = getmaxcolor() + 1;

    int text_x = 10;
    int text_y = initial_text_y;

    setcolor(RED);
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
