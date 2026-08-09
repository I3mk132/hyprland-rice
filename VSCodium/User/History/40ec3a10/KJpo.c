#include <stdio.h>

union var {
    float x;
    int y;
} var;

struct var2 {
    float x;
    int y;
    char str[19];
} var2;

int main (){
    
    var2.x = 34;
    var2.y = 22;
    var2.str == "nigga";
    
    printf("%f, %d, %s", var2.x, var2.y, var2.str);
}