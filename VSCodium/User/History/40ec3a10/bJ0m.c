#include <stdio.h>

typedef struct seri2 { 
    int arr[100];
} seri2;

typedef struct seri {
    seri2* x;
    int y;
} seri;

int main (){
    seri my_seri;
    seri *ptr = &my_seri;

    for (int i = 0; i< 10; i++){

        ptr->x->arr[i] = i;
    }

    printf("%p%d", &ptr->x, ptr->y);
}