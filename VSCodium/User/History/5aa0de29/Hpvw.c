#include <stdio.h>
#include<assert.h>
#define MY_CONSTANT 3

#if !defined(MY_CONSTANT)//MY_CONSTANT tan�ml� de�ilse
#define MY_CONSTANT 0
#endif

#if MY_CONSTANT ==8
#define MY_CONSTANT 1
#elif MY_CONSTANT ==5
#error myconstant uygunsuz deger
#else
#define MY_CONSTANT 4
#endif

#define HELLO(x) puts("Hello, "#x)
#define BIRLESTIR(x,y) x##y

#define PI 3.14
#define dairealan(x)((PI)*(x)*(x))
#define HATA "dosya okuma hatasi\n"
#define NDEBUG
//#undef HATA
//#line 100
int main(void)
{
	//const double PI = 3.14;
	int r = 2;
	FILE* f1;
	printf("ALAN:%f\n", dairealan(r));
	//printf("ALAN:%f\n", dairealan(++r));
	errno_t error_no;
#define PI 2.14//Sembolik bir de�erin yeniden tan�mlanmas� uygun de�ildir.
	printf("ALAN:%f\n", dairealan(r));
	#if 1
	error_no = fopen_s(&f1, "dosya1.c", "r");
	if (error_no != 0) {
		printf(HATA);
	}
	#endif
	printf("my_const:%d\n", MY_CONSTANT);
	HELLO(tuba);
	//printf(BIRLESTIR("Tuba", "Salturk")"\n");
	int i = 10;
	assert(i <= 10);

	printf("\nDerlenen dosya: %s\n", __FILE__);
	printf("Derlenen sat�r: %d\n", __LINE__);
	printf("Derleme tarihi: %s\n", __DATE__);
	printf("Derleme zaman�: %s\n", __TIME__);
	printf("Standart C: %d", __STDC__);

}
