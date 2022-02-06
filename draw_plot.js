let scale_factor = 20;
coord(scale_factor);
strokeWeight(2);
stroke(0, 13, 255);
plot(f, scale_factor);
noLoop();

function f(x) {
    return 2 * x + 1;
}