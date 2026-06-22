const Jimp = require("@jimp/core").createJimp({
  formats: [
    require("@jimp/js-png").default,
    require("@jimp/js-jpeg").default
  ],
  plugins: [
    require("@jimp/plugin-resize").methods,
    require("@jimp/plugin-color").methods
  ]
});

// format works like this: pixels are stored (and subsequently drawn) interspaced
// consider a 4x4 pixel image, this is how it would be loaded
// AACC ABCD ABCD ABCD
// AACC ABCD EBGD EFGH
// IIKK IJKL IJKL IJKL
// IIKK IJKL MJOL MNOP
// I might consider breaking each of these above pixels into groups of 2x2 pixels themselves for even faster loading of a usable image, but whatever
// this allows you to, say, only have 25% of the image data and still see a "full" image (that gets refined as you get more information)
// the decode script will have an option to stop a percentage of the way through decoding to see what it looks like

(async () => {

    const path = process.argv[2];

    try {
        const image = await Jimp.read(path);

        await image
            .resize({ w: 256 })
            .contrast(0.1) // adds 10%
            .brightness(1.1) // sets to 110%
            .posterize(4); // 6 bit

        await image.write("output.png");

    } catch (error) {
        console.error("An error occurred while processing the image:", error);
    }

})();