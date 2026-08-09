#include <stdio.h>

union var {
    float x;
    int y;
} var;

int main (){
    
    var.y = 3;
    var.x= 0;
    
    printf("%f, %d", var.x, var.y);
}