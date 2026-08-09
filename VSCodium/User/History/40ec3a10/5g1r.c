#include <stdio.h>


void readFile(char path[100], char *arr){

    FILE *file;
    int i = 0;
    file = fopen(path, "r");
    if (file != NULL){
        while (!feof(file)){
            *(arr + i++) = getc(file);
        }
        *(arr + i) = '\0';
        fclose(file);
    }
}

void writeFile(char path[100], char *arr){
    FILE *file;
    int i = 0;
    file = fopen(path, "a");
    if (file != NULL){
        while (*(arr + i) != '\0'){
            fprintf(file, "%c", *(arr+i++));
        }
        fclose(file);
    }
}

int main(){
    char arr[100];
    readFile("text.txt", arr);
    writeFile("text1.txt", arr);

}