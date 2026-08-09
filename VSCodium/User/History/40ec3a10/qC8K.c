#include <stdio.h>


void readFile(char path[100], char *ptr){

    FILE *file;
    int i = 0;
    file = fopen(path, "r");
    if (file != NULL){
        while (!feof(file)){
            *(ptr + i++) = getc(file);
            
        }
    }
}

int main(){

    FILE * file1, * file2;


    file1 = fopen("text.txt", "r");

    file2 = fopen("text1.text", "a");
}