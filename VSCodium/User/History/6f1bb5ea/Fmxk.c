#include <stdio.h>
#define KUPalan(x, y, z) (x)*(y)*(z)
#define getNum() \
        int num1, num2, num3; \
        scanf(&num1, "%d"); \
        scanf(&num2, "%d"); \
        scanf(&num3, "%d"); \




int main(){
    printf("%d", KUPalan(10, 10, 10));

    return 0;
}