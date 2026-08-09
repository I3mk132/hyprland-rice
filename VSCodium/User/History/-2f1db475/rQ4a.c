#include <stdio.h>


int binary(int* arr, int start, int end, int target){

    if (end < start){
        return -1;
    }
    int middle = ((end + start)/2);

    if (arr[middle] == target)
        return middle;

    if (target > arr[middle])
        return binary(arr, middle+1, end, target);
    if (target < arr[middle])
        return binary(arr, start, middle-1, target);

    return -1;
    
}

int main(){
    
    int arr[] = {23, 33, 44, 55, 66, 77, 88, 99, 188};

    printf("result is: %d", binary(arr, 0, sizeof(arr)/sizeof(arr[0]), 55));
}