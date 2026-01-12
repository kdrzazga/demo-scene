#include <conio.h>
#include <graphics.h>
#include <stdio.h>

#define SIZE_X 8
#define SIZE_Y 8

int main() {
    int x = 0, y = 0;
    const char* filename = "cpp\\output.txt"; // Replace with your filename
    FILE* file = fopen(filename, "r");
    if (!file) {
        printf("Failed to open file.\n");
        return 1;
    }

    // Initialize graphics mode
    int gd = DETECT, gm;
    initgraph(&gd, &gm, "c:\\BORLANDC\\BGI");

    int ch;
    int i = 0;
    while ((ch = fgetc(file)) != EOF) {
        // Convert char to int
        int val = ch - '0'; // assuming all chars are digits 0-9

        // Compute x,y position
        x = i % SIZE_X;
        y = (int)(i / SIZE_X);

        // Map value to color
        int color;
        switch(val) {
            case 0: color = WHITE; break;
            case 1: color = BLUE; break;
            case 2: color = GREEN; break;
            case 3: color = CYAN; break;
            case 4: color = RED; break;
            case 5: color = MAGENTA; break;
            case 6: color = YELLOW; break;
            case 7: color = LIGHTGRAY; break;
            case 8: color = DARKGRAY; break;
            case 9: color = BLACK; break;
            default: color = WHITE; break; // fallback
        }

        putpixel(x, y, color);
        i++;
        if (i >= SIZE_X * SIZE_Y) break; // stop after filling 8x8 grid
    }

    fclose(file);
    getch(); // wait for key press
    closegraph();
    return 0;
}