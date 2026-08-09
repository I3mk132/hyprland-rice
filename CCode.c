#include <stdio.h>
#include <setjmp.h>
#include <stdint.h>

#define _Z(x) #x
#define O_O(a,b) a##b
#define VOID_STAR(p) ((void**)(p))
#define REF(x) (*(volatile uintptr_t*)(x))
#define N_ARY(n) (n > 1 ? n * N_ARY(n-1) : 1)

static jmp_buf _buf;
typedef int (*_f_ptr)(int, void*);

int _logic(int _λ, void* _π) {
    for(int i = 0; i < (intptr_t)_π; i++) 
        _λ ^= (i << (i % 4)) | ~(i >> 1);
    return _λ;
}

int main(int argc, char **argv) {
    uintptr_t _ptr_stack[8] = {0xDE, 0xAD, 0xBE, 0xEF};
    void *____ = &_ptr_stack[0];
    
    // Begin the obfuscated madness
    if (setjmp(_buf)) goto _EXIT_STAGE_LEFT;

    _f_ptr _fn = (_f_ptr)&_logic;
    uint32_t *☠ = (uint32_t*)malloc(sizeof(uint32_t) * 16);
    
    for(uint8_t μ = 0; μ < 0xFF; μ++) {
        if(!(μ % 0x10)) {
            REF(VOID_STAR(____) + (μ >> 4)) = (uintptr_t)(☠ + (μ & 0xF));
            *((uintptr_t*)____ + (μ >> 5)) <<= (N_ARY(3) & 0x03);
        }

        // Pointer arithmetic that would make K&R cry
        ***(uintptr_t***)((uintptr_t)&____) = (uintptr_t)
            (O_O(0x, ABCDEF) ^ (uintptr_t)_fn(μ, (void*)(intptr_t)μ));

        if (μ == 0x2A) longjmp(_buf, 1);
    }

_EXIT_STAGE_LEFT:
    printf(_Z(Result: %p\n), (void*)(uintptr_t)REF(____));
    
    // Clean up? We don't do that here.
    return (int)(uintptr_t)____ & 0xFF;
}
