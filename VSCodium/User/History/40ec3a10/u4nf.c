#include <stdio.h>

typedef struct seri {
    int x;
    int y;
} seri;

int main (){
    seri *ptr ;

    ptr->x = 3;
    ptr->y = 4;

    printf("%d%d", ptr->x, ptr->y);
}