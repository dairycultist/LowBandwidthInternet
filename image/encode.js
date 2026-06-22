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

        await image
            .resize({ w: 256 }).brightness(1.1).posterize(8).dither();

        const w = 256;
        const h = image.bitmap.height;
        const buf = Buffer.alloc(w * h);

        for (let i = 0; i < 4; i++) {

            for (let y = i / 2; y < h; y += 2) {
                for (let x = i % 2; x < w; x += 2) {

                    const rgb = intToRGBA(image.getPixelColor(x, y));

                    buf[x + y * w] = ((rgb.r >> 5) << 5) | ((rgb.g >> 5) << 2) | (rgb.b >> 6);
                }
            }
        }

        fs.writeFileSync(out_path, buf);

    } catch (error) {
        console.error("An error occurred while processing the image:", error);
    }

})();