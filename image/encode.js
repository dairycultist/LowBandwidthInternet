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

const { intToRGBA, rgbaToInt } = require("@jimp/utils");

// the decode script will have an option to stop a percentage of the way through decoding to see what it looks like

(async () => {

    const in_path = process.argv[2];
    const out_path = process.argv[3] || "output.sim";

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

                    buf[x + y * w] = ((rgb.r >> 6) << 6) | ((rgb.g >> 5) << 2) | (rgb.b >> 6);

                    // test what image will look like once decoded
                    let r = rgb.r >> 6;
                    let g = rgb.g >> 5;
                    let b = rgb.b >> 6;
                    r = r & 0x01 ? ((r << 6) | 0b00111111) : (r << 6);
                    g = g & 0x01 ? ((g << 5) | 0b00011111) : (g << 5);
                    b = b & 0x01 ? ((b << 6) | 0b00111111) : (b << 6);
                    image.setPixelColor(rgbaToInt(r, g, b, 255), x, y);
                }
            }
        }

        // test what image will look like once decoded
        await image.write("temp.png");

        fs.writeFileSync(out_path, buf);

    } catch (error) {
        console.error("An error occurred while processing the image:", error);
    }

})();