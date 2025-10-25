#include <graphics.h>
#include <stdio.h>
#include <direct.h>
#include <conio.h>
#include <alloc.h>


void print_cwd() {
    char cwd[260]; // Buffer for current directory path

    if (getcwd(cwd, sizeof(cwd)) != NULL) {
        printf("Current directory: %s\n", cwd);
    } else {
        printf("Failed to get current directory.\n");
    }
}


#include <stdio.h>
#include <stdlib.h>
#include <graphics.h>

int main() {
    int gd = DETECT, gm;

    print_cwd();
    getch();

    initgraph(&gd, &gm, "c:\\borlandc\\bgi");

    FILE *fp = fopen("temp\\output.txt", "r");
    if (fp == NULL) {
        printf("Error opening file\n");
        getch();
        closegraph();
        return 1;
    }

    int width = 8;
    int height = 2;
    char line[1024];

    int y = 0;
    while (fgets(line, sizeof(line), fp) && y < height) {
        for (int x = 0; x < width; x++) {
            char pixel_char = line[x];
            //int color = (pixel_char == '1') ? WHITE : BLACK;
	    putpixel(x, y, pixel_char);
        }
        y++;
    }

    fclose(fp);

    getch();
    closegraph();
    return 0;
}
