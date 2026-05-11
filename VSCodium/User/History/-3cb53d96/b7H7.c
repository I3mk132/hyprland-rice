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



// #include <stdio.h>
// #include <stdlib.h>

// void function(int *arr, int length){
//     int result;
//     for (int i = 1; i < length; i++){
        
//         result = *(arr + i) - *(arr + i - 1);   
//         printf("%d\n", result);
//     }
    
// }

// int main(){
//     int arr[5] = {200, 500, 100, 700, 1000};

//     function(arr, 5);
    
// }





/*
 ╔══════════════════════════════════════════════════════════════════╗
 ║           DUNGEON CRAWLER 3D - Raycasting FPS Engine            ║
 ║              Written in Pure C (SDL2) - No OpenGL               ║
 ║                   Wolfenstein-Style 3D Engine                   ║
 ╚══════════════════════════════════════════════════════════════════╝

 COMPILE:
   Linux/macOS:  gcc -O2 -o game3d game3d.c -lSDL2 -lm
   Windows:      gcc -O2 -o game3d game3d.c -lSDL2 -lSDL2main -lm

 CONTROLS:
   W/S or ↑/↓   - Move Forward / Backward
   A/D or ←/→   - Rotate Left / Right
   SHIFT         - Sprint
   ESC           - Quit
   M             - Toggle minimap
*/

#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>
#include <time.h>

#ifdef _WIN32
  #include <SDL2/SDL.h>
#else
  #include <SDL2/SDL.h>
#endif

/* ═══════════════════════════ CONSTANTS ═══════════════════════════ */

#define SCREEN_W      960
#define SCREEN_H      540
#define FOV           60.0
#define MOVE_SPEED    3.0
#define ROT_SPEED     2.5
#define SPRINT_MUL    2.0

#define MAP_W         20
#define MAP_H         20

#define TEX_W         64
#define TEX_H         64

#define NUM_TEXTURES  4
#define NUM_SPRITES   8

#define MINIMAP_SCALE 12
#define MINIMAP_X     10
#define MINIMAP_Y     10

/* ═══════════════════════════ TYPES ══════════════════════════════ */

typedef struct {
    double x, y;
    double dx, dy;
    double plane_x, plane_y;
} Camera;

typedef struct {
    double x, y;
    int    tex_id;
    int    active;
} Sprite;

typedef struct {
    int    map[MAP_H][MAP_W];
    int    width, height;
} Map;

/* ═══════════════════════════ GLOBALS ════════════════════════════ */

static Uint32 textures[NUM_TEXTURES][TEX_H * TEX_W];
static double z_buffer[SCREEN_W];
static int    show_minimap = 1;

/* ═══════════════════════════ MAP ════════════════════════════════ */

static const int WORLD_MAP[MAP_H][MAP_W] = {
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,2,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,1},
    {1,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,4,4,4,0,0,0,0,0,0,0,4,4,4,0,0,1},
    {1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,4,0,0,1},
    {1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,4,0,0,1},
    {1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,4,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,1},
    {1,0,3,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,3,1},
    {1,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
};

/* ═══════════════════════════ TEXTURE GENERATION ═════════════════ */

/* Creates procedural textures without needing image files */
static void generate_textures(void) {
    int x, y, t;

    /* Texture 0: Stone bricks */
    for (y = 0; y < TEX_H; y++) {
        for (x = 0; x < TEX_W; x++) {
            int bx = x / 8;
            int by = y / 8;
            int shifted = (by % 2) ? (x + 4) / 8 : bx;
            int is_mortar = (x % 8 == 0) || (y % 8 == 0 && shifted % 2 == 0);
            Uint8 base = is_mortar ? 60 : 90 + (shifted * 13 + by * 7) % 40;
            Uint8 noise = (x * 3 + y * 7 + x * y) % 20;
            textures[0][y * TEX_W + x] = SDL_MapRGB(
                SDL_AllocFormat(SDL_PIXELFORMAT_RGBA8888),
                base + noise, base - 10 + noise / 2, base - 20
            );
            /* Inline color packing */
            textures[0][y * TEX_W + x] = ((Uint32)(base + noise) << 24) |
                                          ((Uint32)(base - 10 + noise/2) << 16) |
                                          ((Uint32)(base - 20) << 8) | 0xFF;
        }
    }

    /* Texture 1: Red/orange wall */
    for (y = 0; y < TEX_H; y++) {
        for (x = 0; x < TEX_W; x++) {
            int stripe = (x / 4 + y / 4) % 2;
            Uint8 r = stripe ? 180 : 140;
            Uint8 g = stripe ? 60  : 40;
            Uint8 b = 20;
            Uint8 noise = (x * 5 + y * 3) % 25;
            textures[1][y * TEX_W + x] = ((Uint32)(r+noise) << 24) |
                                          ((Uint32)(g) << 16) |
                                          ((Uint32)(b) << 8) | 0xFF;
        }
    }

    /* Texture 2: Blue/purple tech wall */
    for (y = 0; y < TEX_H; y++) {
        for (x = 0; x < TEX_W; x++) {
            int panel = (x / 16) + (y / 16) * 4;
            int edge  = (x % 16 < 1 || y % 16 < 1);
            Uint8 r = edge ? 0   : 30 + (panel * 5) % 20;
            Uint8 g = edge ? 120 : 60 + (panel * 7) % 30;
            Uint8 b = edge ? 200 : 160 + (panel * 11) % 40;
            textures[2][y * TEX_W + x] = ((Uint32)(r) << 24) |
                                          ((Uint32)(g) << 16) |
                                          ((Uint32)(b) << 8) | 0xFF;
        }
    }

    /* Texture 3: Green mossy brick */
    for (y = 0; y < TEX_H; y++) {
        for (x = 0; x < TEX_W; x++) {
            int mortar = (x % 10 == 0) || ((y % 6 == 0) && ((x/10 + y/6) % 2 == 0));
            Uint8 noise = (x * 7 + y * 13 + x * y) % 30;
            Uint8 r = mortar ? 30  : 50  + noise;
            Uint8 g = mortar ? 50  : 100 + noise;
            Uint8 b = mortar ? 20  : 30  + noise / 2;
            textures[3][y * TEX_W + x] = ((Uint32)(r) << 24) |
                                          ((Uint32)(g) << 16) |
                                          ((Uint32)(b) << 8) | 0xFF;
        }
    }

    (void)t; /* suppress unused warning */
}

/* ═══════════════════════════ RAYCASTING ENGINE ══════════════════ */

static void cast_rays(SDL_Renderer *renderer, const Camera *cam,
                      const Map *map) {
    int x;
    for (x = 0; x < SCREEN_W; x++) {
        /* Camera space ray direction */
        double cam_x    = 2.0 * x / (double)SCREEN_W - 1.0;
        double ray_dx   = cam->dx + cam->plane_x * cam_x;
        double ray_dy   = cam->dy + cam->plane_y * cam_x;

        /* Map cell */
        int map_x = (int)cam->x;
        int map_y = (int)cam->y;

        /* DDA setup */
        double delta_x = (ray_dx == 0) ? 1e30 : fabs(1.0 / ray_dx);
        double delta_y = (ray_dy == 0) ? 1e30 : fabs(1.0 / ray_dy);
        double side_x, side_y;
        int step_x, step_y;

        if (ray_dx < 0) { step_x = -1; side_x = (cam->x - map_x) * delta_x; }
        else            { step_x =  1; side_x = (map_x + 1.0 - cam->x) * delta_x; }
        if (ray_dy < 0) { step_y = -1; side_y = (cam->y - map_y) * delta_y; }
        else            { step_y =  1; side_y = (map_y + 1.0 - cam->y) * delta_y; }

        /* DDA march */
        int side = 0;
        int hit  = 0;
        while (!hit) {
            if (side_x < side_y) { side_x += delta_x; map_x += step_x; side = 0; }
            else                  { side_y += delta_y; map_y += step_y; side = 1; }
            if (map_x < 0 || map_x >= MAP_W || map_y < 0 || map_y >= MAP_H) break;
            if (map->map[map_y][map_x] > 0) hit = 1;
        }

        /* Perpendicular wall distance */
        double perp_dist;
        if (side == 0) perp_dist = (map_x - cam->x + (1 - step_x) / 2.0) / ray_dx;
        else           perp_dist = (map_y - cam->y + (1 - step_y) / 2.0) / ray_dy;

        if (perp_dist < 0.001) perp_dist = 0.001;
        z_buffer[x] = perp_dist;

        /* Wall height on screen */
        int line_h = (int)(SCREEN_H / perp_dist);
        int draw_s = SCREEN_H / 2 - line_h / 2;
        int draw_e = SCREEN_H / 2 + line_h / 2;

        /* Texture selection */
        int tex_id = map->map[map_y][map_x] - 1;
        if (tex_id < 0) tex_id = 0;
        if (tex_id >= NUM_TEXTURES) tex_id = NUM_TEXTURES - 1;

        /* Texture X coordinate */
        double wall_x;
        if (side == 0) wall_x = cam->y + perp_dist * ray_dy;
        else           wall_x = cam->x + perp_dist * ray_dx;
        wall_x -= floor(wall_x);

        int tex_x = (int)(wall_x * TEX_W);
        if ((side == 0 && ray_dx > 0) || (side == 1 && ray_dy < 0))
            tex_x = TEX_W - tex_x - 1;

        /* Draw textured wall column */
        double step     = (double)TEX_H / line_h;
        double tex_pos  = (draw_s - SCREEN_H / 2 + line_h / 2) * step;

        int y;
        for (y = (draw_s < 0 ? 0 : draw_s);
             y < (draw_e > SCREEN_H ? SCREEN_H : draw_e); y++) {
            int tex_y = (int)tex_pos & (TEX_H - 1);
            tex_pos  += step;

            Uint32 color = textures[tex_id][tex_y * TEX_W + tex_x];
            Uint8 r = (color >> 24) & 0xFF;
            Uint8 g = (color >> 16) & 0xFF;
            Uint8 b = (color >>  8) & 0xFF;

            /* Darken side walls for depth effect */
            if (side == 1) { r /= 2; g /= 2; b /= 2; }

            /* Distance fog */
            double fog = 1.0 - perp_dist / 12.0;
            if (fog < 0.0) fog = 0.0;
            r = (Uint8)(r * fog);
            g = (Uint8)(g * fog);
            b = (Uint8)(b * fog);

            SDL_SetRenderDrawColor(renderer, r, g, b, 255);
            SDL_RenderDrawPoint(renderer, x, y);
        }
    }
}

/* ═══════════════════════════ FLOOR & CEILING ════════════════════ */

static void draw_floor_ceiling(SDL_Renderer *renderer, const Camera *cam) {
    int y;
    for (y = 0; y < SCREEN_H; y++) {
        double row_angle = SCREEN_H / 2.0 - y;
        if (fabs(row_angle) < 0.0001) row_angle = 0.0001;
        double row_dist = (SCREEN_H / 2.0) / fabs(row_angle);

        double floor_step_x = row_dist * (cam->dx - cam->plane_x) / SCREEN_W;
        double floor_step_y = row_dist * (cam->dy - cam->plane_y) / SCREEN_W;

        double floor_x = cam->x + row_dist * (cam->dx - cam->plane_x);
        double floor_y = cam->y + row_dist * (cam->dy - cam->plane_y);

        /* fog factor */
        double fog = 1.0 - row_dist / 10.0;
        if (fog < 0.0) fog = 0.0;

        int x;
        for (x = 0; x < SCREEN_W; x++) {
            int fx = (int)floor_x & (TEX_W - 1);
            int fy = (int)floor_y & (TEX_H - 1);
            floor_x += floor_step_x;
            floor_y += floor_step_y;

            Uint32 fc = textures[0][fy * TEX_W + fx];
            Uint8 r   = (fc >> 24) & 0xFF;
            Uint8 g   = (fc >> 16) & 0xFF;
            Uint8 b   = (fc >>  8) & 0xFF;

            /* Floor */
            if (y > SCREEN_H / 2) {
                double ff = fog * 0.5;
                SDL_SetRenderDrawColor(renderer,
                    (Uint8)(r * ff), (Uint8)(g * ff), (Uint8)(b * ff), 255);
                SDL_RenderDrawPoint(renderer, x, y);
            }
            /* Ceiling */
            else {
                Uint8 cr = (Uint8)(20 * fog);
                Uint8 cg = (Uint8)(20 * fog);
                Uint8 cb = (Uint8)(40 * fog);
                SDL_SetRenderDrawColor(renderer, cr, cg, cb, 255);
                SDL_RenderDrawPoint(renderer, x, y);
            }
        }
    }
}

/* ═══════════════════════════ MINIMAP ════════════════════════════ */

static void draw_minimap(SDL_Renderer *renderer, const Camera *cam,
                         const Map *map) {
    int y, x;
    /* Background */
    SDL_SetRenderDrawColor(renderer, 0, 0, 0, 160);
    SDL_Rect bg = {MINIMAP_X - 2, MINIMAP_Y - 2,
                   MAP_W * MINIMAP_SCALE + 4,
                   MAP_H * MINIMAP_SCALE + 4};
    SDL_RenderFillRect(renderer, &bg);

    for (y = 0; y < MAP_H; y++) {
        for (x = 0; x < MAP_W; x++) {
            SDL_Rect cell = {
                MINIMAP_X + x * MINIMAP_SCALE,
                MINIMAP_Y + y * MINIMAP_SCALE,
                MINIMAP_SCALE - 1,
                MINIMAP_SCALE - 1
            };
            int tile = map->map[y][x];
            if (tile == 0) SDL_SetRenderDrawColor(renderer, 30, 30, 40, 255);
            else if (tile == 1) SDL_SetRenderDrawColor(renderer, 150, 120, 80, 255);
            else if (tile == 2) SDL_SetRenderDrawColor(renderer, 180, 60, 40, 255);
            else if (tile == 3) SDL_SetRenderDrawColor(renderer, 40, 100, 180, 255);
            else                SDL_SetRenderDrawColor(renderer, 60, 140, 60, 255);
            SDL_RenderFillRect(renderer, &cell);
        }
    }

    /* Player dot */
    int px = (int)(MINIMAP_X + cam->x * MINIMAP_SCALE);
    int py = (int)(MINIMAP_Y + cam->y * MINIMAP_SCALE);
    SDL_SetRenderDrawColor(renderer, 255, 220, 0, 255);
    SDL_Rect pdot = {px - 3, py - 3, 6, 6};
    SDL_RenderFillRect(renderer, &pdot);

    /* Direction arrow */
    SDL_SetRenderDrawColor(renderer, 255, 80, 80, 255);
    SDL_RenderDrawLine(renderer, px, py,
        px + (int)(cam->dx * MINIMAP_SCALE * 1.5),
        py + (int)(cam->dy * MINIMAP_SCALE * 1.5));
}

/* ═══════════════════════════ HUD ════════════════════════════════ */

static void draw_hud(SDL_Renderer *renderer) {
    /* Crosshair */
    int cx = SCREEN_W / 2;
    int cy = SCREEN_H / 2;
    SDL_SetRenderDrawColor(renderer, 255, 255, 255, 200);
    SDL_RenderDrawLine(renderer, cx - 12, cy, cx + 12, cy);
    SDL_RenderDrawLine(renderer, cx, cy - 12, cx, cy + 12);
    SDL_SetRenderDrawColor(renderer, 200, 50, 50, 180);
    SDL_RenderDrawLine(renderer, cx - 5, cy, cx + 5, cy);
    SDL_RenderDrawLine(renderer, cx, cy - 5, cx, cy + 5);

    /* Vignette corners */
    SDL_SetRenderDrawColor(renderer, 0, 0, 0, 80);
    int i;
    for (i = 0; i < 40; i++) {
        SDL_SetRenderDrawColor(renderer, 0, 0, 0, (Uint8)(80 - i * 2));
        SDL_Rect vr = {i, i, SCREEN_W - i*2, SCREEN_H - i*2};
        SDL_RenderDrawRect(renderer, &vr);
    }
}

/* ═══════════════════════════ INPUT & MOVEMENT ═══════════════════ */

static void handle_movement(Camera *cam, const Map *map,
                             const Uint8 *keys, double dt) {
    int sprinting  = keys[SDL_SCANCODE_LSHIFT] || keys[SDL_SCANCODE_RSHIFT];
    double mspeed  = MOVE_SPEED * (sprinting ? SPRINT_MUL : 1.0) * dt;
    double rspeed  = ROT_SPEED * dt;

    /* Forward/back */
    if (keys[SDL_SCANCODE_W] || keys[SDL_SCANCODE_UP]) {
        double nx = cam->x + cam->dx * mspeed;
        double ny = cam->y + cam->dy * mspeed;
        if (map->map[(int)cam->y][(int)nx] == 0) cam->x = nx;
        if (map->map[(int)ny][(int)cam->x] == 0) cam->y = ny;
    }
    if (keys[SDL_SCANCODE_S] || keys[SDL_SCANCODE_DOWN]) {
        double nx = cam->x - cam->dx * mspeed;
        double ny = cam->y - cam->dy * mspeed;
        if (map->map[(int)cam->y][(int)nx] == 0) cam->x = nx;
        if (map->map[(int)ny][(int)cam->x] == 0) cam->y = ny;
    }

    /* Rotation */
    if (keys[SDL_SCANCODE_D] || keys[SDL_SCANCODE_RIGHT]) {
        double old_dx      = cam->dx;
        double old_plane_x = cam->plane_x;
        cam->dx      =  cam->dx      * cos(-rspeed) - cam->dy      * sin(-rspeed);
        cam->dy      =  old_dx       * sin(-rspeed) + cam->dy      * cos(-rspeed);
        cam->plane_x =  cam->plane_x * cos(-rspeed) - cam->plane_y * sin(-rspeed);
        cam->plane_y =  old_plane_x  * sin(-rspeed) + cam->plane_y * cos(-rspeed);
    }
    if (keys[SDL_SCANCODE_A] || keys[SDL_SCANCODE_LEFT]) {
        double old_dx      = cam->dx;
        double old_plane_x = cam->plane_x;
        cam->dx      =  cam->dx      * cos(rspeed) - cam->dy      * sin(rspeed);
        cam->dy      =  old_dx       * sin(rspeed) + cam->dy      * cos(rspeed);
        cam->plane_x =  cam->plane_x * cos(rspeed) - cam->plane_y * sin(rspeed);
        cam->plane_y =  old_plane_x  * sin(rspeed) + cam->plane_y * cos(rspeed);
    }
}

/* ═══════════════════════════ MAIN ═══════════════════════════════ */

int main(int argc, char *argv[]) {
    (void)argc; (void)argv;

    if (SDL_Init(SDL_INIT_VIDEO) != 0) {
        fprintf(stderr, "SDL_Init error: %s\n", SDL_GetError());
        return 1;
    }

    SDL_Window *win = SDL_CreateWindow(
        "DUNGEON CRAWLER 3D  |  WASD=Move  SHIFT=Sprint  M=Map  ESC=Quit",
        SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
        SCREEN_W, SCREEN_H, SDL_WINDOW_SHOWN
    );
    if (!win) { SDL_Quit(); return 1; }

    SDL_Renderer *ren = SDL_CreateRenderer(win, -1,
        SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC);
    if (!ren) { SDL_DestroyWindow(win); SDL_Quit(); return 1; }

    /* Generate procedural textures */
    generate_textures();

    /* Map */
    Map map;
    map.width  = MAP_W;
    map.height = MAP_H;
    memcpy(map.map, WORLD_MAP, sizeof(WORLD_MAP));

    /* Camera */
    Camera cam;
    cam.x       = 3.5;
    cam.y       = 3.5;
    cam.dx      = 1.0;
    cam.dy      = 0.2;
    cam.plane_x = 0.0;
    cam.plane_y = 0.66;  /* FOV plane */

    /* FPS timer */
    Uint64 freq    = SDL_GetPerformanceFrequency();
    Uint64 prev    = SDL_GetPerformanceCounter();
    double fps_avg = 60.0;
    int    frame   = 0;

    int running = 1;
    SDL_Event ev;

    printf("\n");
    printf("╔════════════════════════════════════════╗\n");
    printf("║       DUNGEON CRAWLER 3D STARTED       ║\n");
    printf("╠════════════════════════════════════════╣\n");
    printf("║  WASD / Arrows  = Move & Rotate        ║\n");
    printf("║  SHIFT          = Sprint               ║\n");
    printf("║  M              = Toggle minimap       ║\n");
    printf("║  ESC            = Quit                 ║\n");
    printf("╚════════════════════════════════════════╝\n\n");

    while (running) {
        /* Delta time */
        Uint64 now = SDL_GetPerformanceCounter();
        double dt  = (double)(now - prev) / (double)freq;
        prev       = now;
        fps_avg    = fps_avg * 0.95 + (1.0 / dt) * 0.05;
        frame++;

        /* Events */
        while (SDL_PollEvent(&ev)) {
            if (ev.type == SDL_QUIT) running = 0;
            if (ev.type == SDL_KEYDOWN) {
                if (ev.key.keysym.sym == SDLK_ESCAPE) running = 0;
                if (ev.key.keysym.sym == SDLK_m) show_minimap = !show_minimap;
            }
        }

        /* Input */
        const Uint8 *keys = SDL_GetKeyboardState(NULL);
        handle_movement(&cam, &map, keys, dt);

        /* ─── RENDER ─── */
        SDL_SetRenderDrawColor(ren, 0, 0, 0, 255);
        SDL_RenderClear(ren);

        /* Floor & ceiling */
        draw_floor_ceiling(ren, &cam);

        /* Walls via raycasting */
        cast_rays(ren, &cam, &map);

        /* HUD overlay */
        draw_hud(ren);

        /* Minimap */
        if (show_minimap) draw_minimap(ren, &cam, &map);

        SDL_RenderPresent(ren);

        /* FPS to title every 60 frames */
        if (frame % 60 == 0) {
            char title[128];
            snprintf(title, sizeof(title),
                "DUNGEON CRAWLER 3D  |  FPS: %.0f  |  Pos: (%.1f, %.1f)",
                fps_avg, cam.x, cam.y);
            SDL_SetWindowTitle(win, title);
        }
    }

    SDL_DestroyRenderer(ren);
    SDL_DestroyWindow(win);
    SDL_Quit();
    printf("Thanks for playing!\n");
    return 0;
}