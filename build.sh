#! /bin/bash
# Chordgen Build Script
#
# @Author : Mayank Sindwani
# @Date   : 2016-08-25
# @license: MIT
#
# Description : Builds the website assets.
##

TEMP_APP_DIR=.tmp
TAR_BALL_NAME=chordgen.tar
EXTS="\(css\|js\|html\|otf\|woff\|ttf\|gif\|jpg\|png\|ico\)"
VERSION=$( date +%s )

npm install

if [ -d $TEMP_APP_DIR ]; then
  rm -r $TEMP_APP_DIR
fi

mkdir $TEMP_APP_DIR

cp -r css                $TEMP_APP_DIR/css
cp -r images             $TEMP_APP_DIR/images
cp index.html            $TEMP_APP_DIR/index.html
cp -r js                 $TEMP_APP_DIR/js

cd $TEMP_APP_DIR

../node_modules/.bin/minify js/chord.js > js/chord.min.js
rm js/chord.js

../node_modules/.bin/minify css/app.css > css/app.min.css
rm css/app.css

HTML_FILES=(index.html)

for i in ${HTML_FILES[@]}; do
    sed -i "s/js\/chord.js\/js/chord.compact.min.jsg/g" $i
    sed -i "s/css\/app.css/css\/app.min.css/g" $i
    sed -i "s/js\/chord.js/js\/chord.min.js/g"   $i
    sed -i "s/.\.$EXTS/&?v=$VERSION/g" $i
done

cd ..
tar -cvf $TAR_BALL_NAME -C $TEMP_APP_DIR .
rm -rf $TEMP_APP_DIR
