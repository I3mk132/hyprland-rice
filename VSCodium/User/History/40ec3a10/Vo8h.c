#include <stdio.h>

typedef struct seri2 { 
    int arr[100];
} seri2;

typedef struct seri {
    seri2 x;
    int y;

    unsigned int tm:5 ;
} seri;

typedef enum enDays {Sun=1, Mon, Tue, Wed, Thu, Fri, Sat} days;

typedef union uni { 
    int x;
    float y;
} un;

struct structure { 
    int x, y;
    days day;
    un unions;
} st;


int main (){
    seri my_seri;
    seri *ptr = &my_seri;

    struct structure *ptr2 = &st; 

    ptr2->x = 3;
    ptr2->y = 4;

    ptr->tm = 32;
    printf("%d\n\n", ptr->tm);


    printf("%d%d\n\n", ptr2->x, ptr2->y);
    
    for (int i = 0; i< 10; i++){

        ptr->x.arr[i] = i;
    }

    for (int i = 0; i < 10; i++){
        printf("%d", *(ptr->x.arr + i));
    }

}