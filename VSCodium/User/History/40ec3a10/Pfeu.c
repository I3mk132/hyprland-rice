#include <stdio.h>


void readFile(char path[100], char *ptr){

    FILE *file;
    int i = 0;
    file = fopen(path, "r");
    if (file != NULL){
        while (!feof(file)){
            *(ptr + i++) = getc(file);
        }
        fclose(file);
    }
}

int main(){

   
}