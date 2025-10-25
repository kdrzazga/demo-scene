#include <graphics.h>
#include <stdio.h>
#include <direct.h>
#include <conio.h>
#include <alloc.h>
#include <stdlib.h>

void print_cwd() {
    char cwd[260]; // Buffer for current directory path

    if (getcwd(cwd, sizeof(cwd)) != NULL) {
        printf("Current directory: %s\n", cwd);
    } else {
        printf("Failed to get current directory.\n");
    }
}

int char_to_int(char pixel_char){
    int pixel_value;
    if (pixel_char >= '0' && pixel_char <= '9') {
        pixel_value = pixel_char - '0';
    } else if (pixel_char >= 'a' && pixel_char <= 'f') {
        pixel_value = pixel_char - 'a' + 10;
    }
    return pixel_value;
}

int main() {
    int gd = DETECT, gm;

    print_cwd();
    getch();

    initgraph(&gd, &gm, "c:\\borlandc\\bgi");

    FILE *fp = fopen("picconv\\output.txt", "r");
    if (fp == NULL) {
        printf("Error opening file\n");
        getch();
        closegraph();
        return 1;
    }

    int width = 627;
    int height = 252;
    char line[1024];

    int y = 0;
    while (fgets(line, sizeof(line), fp) && y < height) {
        for (int x = 0; x < width; x++) {
            char pixel_char = line[x];
            //int color = (pixel_char == '1') ? WHITE : BLACK;
            if(pixel_char == '\n')  y++;
	    putpixel(x, y, char_to_int(pixel_char));
        }
        y++;
    }

    fclose(fp);

    getch();
    closegraph();
    return 0;
}
