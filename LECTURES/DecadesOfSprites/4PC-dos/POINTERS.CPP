#include <stdio.h>
#include <conio.h>
#include <string.h>

void pointers(){
	char* s;
	s = "dupa";
	s+=2;
	printf("%s", s);
}


char* reverseString(char* s) {
    char *start = s;
    char *end = s + strlen(s) - 1;

    while (start < end) {
	    char temp = *start;
	    *start = *end;
	    *end = temp;

	    start++;
	    end--;
    }
    return s;
}

void main(){
	clrscr();
	pointers();
	printf("\n");

	char* rev = reverseString("Kamil Slimak");
	printf("%s", rev);
	getch();
}
