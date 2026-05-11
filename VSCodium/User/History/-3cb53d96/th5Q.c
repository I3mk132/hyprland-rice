// Problem 1
/*
#include <stdio.h>

void PrintGrade(int x){
    printf("Result: ");
    if (x >= 80) printf("AA");
    else if (x >= 50) printf("CC");
    else printf("FF");
}

int main(){
    PrintGrade(88);
}
    */

// Problem 2
/*
#include <stdio.h>
void IsEven(int num){

    int c = num%2;
    switch (c){
        case 0:
            printf("Your number: {%d} is Even", num); break;
        case 1:
            printf("Your number: {%d} is Odd", num); break;
    
    }
}

int main(void){
    int i;
    printf("Inter a number: \n");
    scanf("%d", &i);
    IsEven(i);
    return 0;
}
    */

// Problem 3
/*
#include <stdio.h>

short IsLeap(int Year){
    return (((Year % 4 == 0) && (Year % 100 != 0)) || (Year % 400 == 0)) ? 1 : 0;
}

int main(){
    int i = 0;
    do {
        printf("please enter a year: (-1 to exit): ");
        scanf("%d", &i);

        printf("Your enterd year {%d} is %s a leap year\n", i, IsLeap(i) ? "" : "not") ;

    }
    while (i != -1);

}
*/

/*
#include <stdio.h>

void FindEbobOrEkok(){
    int a = 0, b = 0;
    int ebob = 1;
    int ekok = 1;


    printf("Please the first number: \n");
    scanf("%d", &a);
    printf("Please enter the second number: \n");
    scanf("%d", &b);

    for (int i = 1; i <= (a>b ? a : b); i++){
        if (b % i == 0 && a % i == 0){
            ebob = i;
        }
    }

    int i = (a > b) ? a : b;
    while (1) {
        if (i % a == 0 && i % b == 0) {
            ekok = i;
            break; 
        }
        i++;
    }

    printf("the ebob of your entered numbers {%d and %d} is: %d \n", a, b, ebob);
    printf("the ekek of your entered numbers {%d and %d} is: %d \n", a, b, ekok);

}

int main(void){
    FindEbobOrEkok();
}
    */



// #include <stdio.h>

// int Sum(int x, int y, int z){
    
//     printf("%d, %d, %d \n", x, y, z);

//     if (x == 0){
//         return 0;
//     }
//     else {
//         return Sum(x-1, y-1, z-1);
//     }

// }

// void printname(char name[]){

//     name = "ahmad";
//     printf("my name is %s\n", name);
// }


// int main(void){

//     int x, y, z;

//     printf ("x  y  z\n");
//     Sum(x, y, );

        
//     return 0;
    
// }

// # include <stdio.h>

// int main(){

//     int** pptr;
//     int*ptr;

//     int i[] = {1,2,3,4,5};

//     ptr = &i[0];

//     pptr = &ptr;

//     printf("ptr: %p\n", ptr);
//     printf("&ptr: %p\n", &ptr);
//     printf("*ptr: %d\n", *ptr);
//     printf("pptr: %p\n", pptr);
//     printf("&pptr: %p\n", &pptr);
//     printf("*pptr: %p\n", *pptr);
//     printf("*pptr+1: %p\n", *pptr+1);
//     printf("**pptr+1: %d\n", **pptr+ 1);
//     printf("*pptr[0]+1: %d\n", *pptr[0]+1);

//}



#include <stdio.h>
#include <stdlib.h>

void function(int arr[5], int length){
    int result;
    for (int i = 0; i < length - 1; i++){
        result = (arr[i] - arr[i + 1]);
        if (result > 0){
            printf("-%d\n", abs(result));
        }
        else {
            printf("+%d\n", abs(result));
        }
    }
}

int main(){
    int arr[5] = {200, 500, 100, 700, 1000};

    function(arr, 5);
}
