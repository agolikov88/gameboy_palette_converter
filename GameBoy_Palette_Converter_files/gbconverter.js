/**
 * Calculate brightness value by RGB or HEX color.
 * @param color (String) The color value in RGB or HEX (for example: #000000 || #000 || rgb(0,0,0) || rgba(0,0,0,0))
 * @returns (Number) The brightness value (dark) 0 ... 255 (light)
 */
function brightnessByColor(color) {
    var m = color.match(/(\d+){1}/g);
    if (m) var r = m[0], g = m[1], b = m[2];
    if (typeof r != "undefined") return ((r * 299) + (g * 587) + (b * 114)) / 1000;
}

$(document).ready(function () {
    $('#download-image').on('click', function (event) {
        event.preventDefault();
        var canvas = document.getElementById('canvas');
        window.location = canvas.toDataURL("image/png");
    });

    var imageLoader = document.getElementById('picture');
    imageLoader.addEventListener('change', handleImage, false);

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    function handleImage(e) {
        var reader = new FileReader();
        var imageObj = new Image();

        reader.onload = function (event) {
            imageObj.src = event.target.result;
        }

        reader.readAsDataURL(e.target.files[0]);

        imageObj.onload = function () {
            canvas.width = imageObj.width;
            canvas.height = imageObj.height;
            imageWidth = imageObj.width,
                imageHeight = imageObj.height;

            context.drawImage(imageObj, 0, 0, imageWidth, imageHeight);
            imageData = context.getImageData(0, 0, imageObj.width, imageObj.height);

            var pixels = imageData.data;
            var numPixels = pixels.length;
            var pixels_without_alpha = new Array();
            var image_palette = new Array();
            var rgb_pixels = new Array();

            for (var i = 0; i < numPixels; i += 4) {
                pixels_without_alpha.push(pixels[i]);
                pixels_without_alpha.push(pixels[i + 1]);
                pixels_without_alpha.push(pixels[i + 2]);

                var color = pixels[i] + "," + pixels[i + 1] + "," + pixels[i + 2];
                //compare with palette array
                if (!image_palette.includes(color)) {
                    image_palette.push(color);
                    if (image_palette.length > 4) {
                        alert("Image palette contains more than 4 colors - image will not be converted!");
                        break;
                    }
                }
                rgb_pixels.push(color);
            }

            //Sort palette by brightness
            image_palette.sort(function (a, b) {
                //console.log(a);
                //console.log(b);
                //console.log(brightnessByColor (a));
                //console.log(brightnessByColor (b));
                a = brightnessByColor(a);
                b = brightnessByColor(b);
                if (a > b) {
                    return 1;
                }
                if (b > a) {
                    return -1;
                }
                return 0;
            });

            // for (var i = 0; i < 4; i++) {
            //     console.log(image_palette[i]);
            // }

            var gb_palette_rgb = new Array('0,0,0', '128,128,128', '192,192,192', '255,255,255');

            var pixels_converted = new Array();

            for (var j = 0; j < numPixels; j += 3) {
                var color_r = pixels_without_alpha[j]
                var color_g = pixels_without_alpha[j + 1]
                var color_b = pixels_without_alpha[j + 2]

                //match with gb palette colors
                for (var i = 0; i < 4; i++) {
                    var base_colors_r = image_palette[i].split(',')[0];
                    var base_colors_g = image_palette[i].split(',')[1];
                    var base_colors_b = image_palette[i].split(',')[2];
                    if (color_r == base_colors_r && color_g == base_colors_g && color_b == base_colors_b) {
                        pixels_converted.push(parseInt(gb_palette_rgb[i].split(',')[0]));
                        pixels_converted.push(parseInt(gb_palette_rgb[i].split(',')[1]));
                        pixels_converted.push(parseInt(gb_palette_rgb[i].split(',')[2]));
                        pixels_converted.push(255);
                    }
                }
            }

            for (var i = 0; i < pixels_converted.length; i++) {
                pixels[i] = pixels_converted[i];
            }

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.putImageData(imageData, 0, 0);
        };
    }
});