#include <stdio.h>
#include <conio.h>
#include <string.h>

void pointers(){
	char* s;
	s = "dupa";
	s+=2;
	printf("%s", s);
}

char* reverseString(char* s){
	char* sEnd;
	sEnd = s + strlen(s);
	printf("Len=%d begin adddress=%d, end addess=%d", strlen(s), &s, &sEnd);

	for(int i=0; i<strlen(s)/2; i++){
		s++;
		sEnd--;
	}

	return s;

}

void main(){
	pointers();
	reverseString("Kamil Slimak");
	getch();
}
