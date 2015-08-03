#!/bin/bash
# createArtistImage.sh originalImage.jpg "rgb(10,38,80)" outputImage.png

convert $1 \
-depth 8 \
-strip \
-resize 500x330 \
-fill $2 -colorize 8% \
-gravity NorthWest -compose Hardlight image/resources/grunge.png -composite \
\( +clone -alpha extract -virtual-pixel black \
-spread 30 -blur 0x3 -threshold 60% \) \
-alpha off -compose Copy_Opacity \
-depth 8 \
-composite \
-trim \
-alpha set -virtual-pixel transparent \
-channel A -blur 0x8  -level 50%,100% +channel \
\( +clone -background black -shadow 75x3+9+10 \) +swap \
-background none -compose Over -layers merge +repage \
png:$3
