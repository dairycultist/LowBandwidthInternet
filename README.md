# LowBandwidthInternet

A technical pet-project attempting to recreate systems necessary for a 'workable' internet while minimizing required bandwidth.

## /image/

The `.sim` ("Small IMage") format downsamples (by a factor of 2) a source image n times, then stores (in order):

- The image's width as a little-endian 16-bit unsigned integer (does not store the height; that can be derived)
- The downsampling n value as a 8-bit unsigned integer
- 5 reserved unused bytes (probably to store compression format)
- The data of the downsampled image as a block
- The three blocks corresponding to the data that would upsample that image once
- The three blocks corresponding to the data that would upsample the upsample once
- etc

All the data of the original image is stored, but interlaced. This interlacing means
you need less pixel data to see a "full" image (that gets refined as you receive more
information). Compression is possible but only within blocks. Reconstructing the
image should be done in such a way that pixel "gaps" between (not within) blocks are
filled by what data currently is available.

```
node image/encode.js [in.png/jpg] [out.sim, default: ./encoded.sim] [nvalue]
node image/decode.js [in.sim] [out.png/jpg, default: ./decoded.png] [stopvalue, default: 1.0]
```

`stopvalue` determines how much data `decode` should process before writing to the output file.
Values less than 1.0 cause the program to stop before all the data has been processed, allowing
you to simulate a transmission failure and see how it effects the final image.

There's no transparency and I don't plan on supporting it.

## /markup/

The `.smu` ("Small MarkUp") format.

## References

https://commons.wikimedia.org/wiki/File:RGB_6bits_palette_sample_image.png

https://woot.iiichan.net/index.php?image=306
