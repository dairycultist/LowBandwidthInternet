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

        for (let i = 0; i < 4; i++) {

            for (let y = Math.floor(i / 2); y < h; y += 2) {
                for (let x = i % 2; x < w; x += 2) {

                    const rgb = intToRGBA(image.getPixelColor(x, y));

                    buf[2 + x + y * w] = ((rgb.r >> 5) << 5) | ((rgb.g >> 5) << 2) | (rgb.b >> 6);
                }
            }
        }

        fs.writeFileSync(out_path, buf);

    } catch (error) {
        console.error("An error occurred while processing the image:", error);
    }

})();