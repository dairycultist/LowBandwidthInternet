const fs = require("fs");

const Jimp = require("@jimp/core").createJimp({
  formats: [
    require("@jimp/js-png").default,
    require("@jimp/js-jpeg").default
  ],
  plugins: [
    require("@jimp/plugin-resize").methods,
    require("@jimp/plugin-color").methods,
    require("@jimp/plugin-dither").methods
  ]
});

const { intToRGBA } = require("@jimp/utils");

(async () => {

    const in_path = process.argv[2];
    const out_path = process.argv[3] || "encoded.sim";

    try {
        const image = await Jimp.read(in_path);

        await image.brightness(1.1).posterize(8).dither();

        const w = image.bitmap.width;
        const h = image.bitmap.height;
        const buf = Buffer.alloc(2 + w * h);

        if (w != w & 0xFF) {
            console.error("Image is wider than can be stored in a 16-bit unsigned integer. This format is supposed to be lightweight; what are you doing?");
            return;
        }

        // store length as a little-endian 16-bit unsigned integer
        buf[0] = w & 0xFF;
        buf[1] = (w >> 8) & 0xFF;

        recursive_downsample_encode(image, w, h, buf, 1);

        fs.writeFileSync(out_path, buf);

    } catch (error) {
        console.error("An error occurred while processing the image:", error);
    }

})();

function recursive_downsample_encode(image, w, h, buf, n, curr_n = 0) {

    const spacing = Math.pow(2, curr_n);

    // store the downsampled data
    if (curr_n == n) {

        for (let y = 0; y < h; y += spacing) {
            for (let x = 0; x < w; x += spacing) {

                const rgb = intToRGBA(image.getPixelColor(x, y));

                buf[2 + x + y * w] = ((rgb.r >> 5) << 5) | ((rgb.g >> 5) << 2) | (rgb.b >> 6);
            }
        }

    } else {

        recursive_downsample_encode(image, w, h, buf, n, curr_n + 1);
    }

    // no upsampling data when we have nothing to upsample
    if (curr_n == 0)
        return;

    // store the upsampling data
    for (let i = 1; i < 4; i++) {

        for (let y = Math.floor(i / 2) * (spacing / 2); y < h; y += spacing) {
            for (let x = (i % 2) * (spacing / 2); x < w; x += spacing) {

                const rgb = intToRGBA(image.getPixelColor(x, y));

                buf[2 + x + y * w] = ((rgb.r >> 5) << 5) | ((rgb.g >> 5) << 2) | (rgb.b >> 6);
            }
        }
    }
}