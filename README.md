# LowBandwidthInternet

A technical pet-project attempting to recreate systems necessary for a 'workable' internet while minimizing required bandwidth.

## /image/

The `.sim` ("Small IMage") format downsamples (by a factor of 2) the image n times, then stores (in order):
- The data of the downsampled image as a block
- The three blocks corresponding to the data that would upsample that image once
- The three blocks corresponding to the data that would upsample the upsample once
- etc
All the data of the original image is stored, but interlaced. This interlacing means
you need less pixel data to see a "full" image (that gets refined as you get more
information). Compression is possible but only within blocks. Reconstructing the
image should be done in such a way that "gaps" between (not within) blocks are filled
by what data currently is available.

```
node image/encode.js [image file in] [image file out, default: ./output.sim]
```

## References

https://commons.wikimedia.org/wiki/File:RGB_6bits_palette_sample_image.png

https://woot.iiichan.net/index.php?image=306
