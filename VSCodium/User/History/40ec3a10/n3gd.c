#include <stdio.h>

union var {
    float x;
    int y;
} var;

int main (){
    
    var.y = 3;
    
    printf("%f, %d", var.x, var.y);
}