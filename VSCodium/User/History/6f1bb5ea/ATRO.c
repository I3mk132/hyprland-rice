#include <stdio.h>
#define CopyFile(source, destination) copyfile(source, destination)

void copyfile(char* source, char* destination){
    FILE* sourceFile,* destFile;
    
    sourceFile = fopen(source, "r");
    if (sourceFile == NULL ) {
        printf("sourceFile couldnt be opened. \n");

    }
    else {
        destFile = fopen(destination, "w");
        if (destFile == NULL){
            printf("destFile couldnt be opened. \n");
        }
        else {

            while (!feof(sourceFile)) {
                putc(getc(sourceFile), destFile);
            }

            fclose(sourceFile);
            fclose(destFile);
        }
    }
}

int main (void ){

    CopyFile("dosya1.c", "dosya2.c");
    return 0;
}