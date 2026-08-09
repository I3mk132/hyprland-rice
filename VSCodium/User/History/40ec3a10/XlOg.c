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

void writeFile(char path[100], char *ptr){
    FILE *file;
    int i = 0;
    file = fopen(path, "a");
    if (file != NULL){
        while (*(ptr + i) != '\0'){
            fprintf(file, "%c", *(ptr+i++));
        }
        fclose(file);
    }
}

int main(){

   
}