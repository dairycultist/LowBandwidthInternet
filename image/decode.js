const fs = require("fs");

const Jimp = require("@jimp/core").createJimp({
  formats: [
    require("@jimp/js-png").default,
    require("@jimp/js-jpeg").default
  ],
  plugins: [
    require("@jimp/plugin-color").methods
  ]
});

const { rgbaToInt } = require("@jimp/utils");

let pixels_done = 0;
const stopvalue = process.argv[4] || 1.0;

(async () => {

    const in_path = process.argv[2];
    const out_path = process.argv[3] || "decoded.png";

    try {
        const buf = fs.readFileSync(in_path);

        const w = buf[0] | (buf[1] << 8);
        const h = (-8 + buf.length) / w;
        const n = buf[2];

        const image = new Jimp({ width: w, height: h, color: 0x000000FF });

        recursive_downsample_decode(image, w, h, buf, n);

        await image.write(out_path);

    } catch (error) {
        console.error("An error occurred while processing the image:", error);
    }

})();

function recursive_downsample_decode(image, w, h, buf, n, curr_n = 0) {

    const spacing = Math.pow(2, curr_n);

    // draw the downsampled data
    if (curr_n == n) {

        for (let y = 0; y < h; y += spacing) {
            for (let x = 0; x < w; x += spacing) {

                draw_pixel(x, y, spacing, buf, w, h, image);

                pixels_done++;
                if (pixels_done / (1.0 * w * h) > stopvalue)
                    return;
            }
        }

    } else {

        recursive_downsample_decode(image, w, h, buf, n, curr_n + 1);

        pixels_done++;
        if (pixels_done / (1.0 * w * h) > stopvalue)
            return;
    }

    // no upsampling data when we have nothing to upsample
    if (curr_n == 0)
        return;

    // draw the upsampling data
    for (let i = 1; i < 4; i++) {

        for (let y = Math.floor(i / 2) * (spacing / 2); y < h; y += spacing) {
            for (let x = (i % 2) * (spacing / 2); x < w; x += spacing) {

                draw_pixel(x, y, spacing, buf, w, h, image);

                pixels_done++;
                if (pixels_done / (1.0 * w * h) > stopvalue)
                    return;
            }
        }
    }
}

function draw_pixel(x, y, spacing, buf, w, h, image) {

    let c = buf[8 + x + y * w];
    let r = c >> 5;
    let g = (c >> 2) & 0b00000111;
    let b = c & 0b00000011;
    r = r & 0x01 ? ((r << 5) | 0b00011111) : (r << 5);
    g = g & 0x01 ? ((g << 5) | 0b00011111) : (g << 5);
    b = b & 0x01 ? ((b << 6) | 0b00111111) : (b << 6);

    const mod = (n, m) => ((n % m) + m) % m;

    image.scan(x, y, mod(x - 1, spacing) + 1, mod(y - 1, spacing) + 1, function (x, y, offset) {
        image.setPixelColor(rgbaToInt(r, g, b, 255), x, y);
    });
}