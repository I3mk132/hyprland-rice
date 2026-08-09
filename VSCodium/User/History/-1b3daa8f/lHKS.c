#include <stdio.h>

int main ( ){
    int arr1[] = {10, 20, 30, 40, 50};
    char str[] = "hello";
    int arr3[] = {1, 2, 3,4 ,5 };
    int **ptr1, *ptr2;
    char *ptr;
    
    ptr = &str[3];
    ptr2 = &arr3[1];
    *ptr1 = ptr2;

    /*
    ptr1 = ? 
    &ptr1 = ?
    *ptr1 = ?
    *(ptr + 1) = ?
    *ptr + 1 = ?
    **ptr1 + 3 = ?
    &ptr2 = ?
    ptr2[2] = ?

    
    
    
    */
}