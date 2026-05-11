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

#include <stdio.h>

short IsLeap(int Year){
    return (((Year % 4 == 0) && (Year % 100 != 0)) || (Year % 400 == 0)) ? 1 : 0;
}

int main(){
    int i = 0;
    do {
        printf("please enter a year: ");
        
        scanf("%d", &i);
        IsLeap(i);
    }
    while (i != 0);
}