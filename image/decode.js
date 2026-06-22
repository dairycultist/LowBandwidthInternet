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


(async () => {

    const in_path = process.argv[2];
    const out_path = process.argv[3] || "decoded.png";
    const stopvalue = process.argv[4] || 1.0;

    try {
        const buf = fs.readFileSync(in_path);

        const w = 256;
        const h = buf.length / 256;

        const image = new Jimp({ width: w, height: h, color: 0x000000FF });

        for (let i = 0; i < 4; i++) {

            for (let y = i / 2; y < h; y += 2) {
                for (let x = i % 2; x < w; x += 2) {

                    let c = buf[x + y * w];
                    let r = c >> 5;
                    let g = (c >> 2) & 0b00000111;
                    let b = c & 0b00000011;
                    r = r & 0x01 ? ((r << 5) | 0b00011111) : (r << 5);
                    g = g & 0x01 ? ((g << 5) | 0b00011111) : (g << 5);
                    b = b & 0x01 ? ((b << 6) | 0b00111111) : (b << 6);

                    image.setPixelColor(rgbaToInt(r, g, b, 255), x, y);
                }
            }
        }

        await image.write(out_path);

    } catch (error) {
        console.error("An error occurred while processing the image:", error);
    }

})();