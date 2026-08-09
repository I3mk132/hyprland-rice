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


void swap(int* x, int* y){
    int t;
    t = *x;
    *x = *y;
    *y = t;
}
void bubble(int *arr, int length) {
    int flag;
    int a,b;
    for (int i = 0; i < length -1; i++) {
        flag = -1;
        for (int j = 0; j < length - i - 1; i++){
            a = arr[i];
            b= arr[i+1];
            if (a > b){
                swap(&a, &b);
                flag = 1;
            }
        }
        
        if (flag == -1)
            break;
    }

}

int main(){
    
    int arr[] = {23, 33, 44, 55, 66, 77, 88, 99, 188};

    int result =  binary(arr, 0, sizeof(arr)/sizeof(arr[0]), 88);
    printf("result index is: %d, value: %d\n\n", result, arr[result]);

    int arr1[] = {83, 423, 538 , 23493,3 ,6, 7,8 ,2 ,14};
    int length = sizeof(arr1)/sizeof(arr1[0]);
    printf("unsorted array: arr= {");
    for (int i = 0; i < length; i++){
        printf(" %d ", arr1[i]);
    }

    bubble(arr1, length);
    printf("}\nsorted array: arr= {");
    for (int i =0; i<length; i++){
        printf(" %d ", arr1[i]);
    }

}
