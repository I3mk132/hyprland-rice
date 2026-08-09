#include <stdio.h>

typedef struct seri {
    int x;
    int y;
} seri;

int main (){
    seri my_seri;
    seri *ptr = &my_seri;

    printf("%d%d", ptr->x, ptr->y);
}