function canvas2d(Images, callback)
{
    var base64 = [];
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var len = Images.length;
    if (len > 9) {
        len = 9;
    }
    
    var a = 0;
    var b = 0;

    var k = 80;
    var l = 80;
    if (len > 4) {
        k = 60;
        l = 60;
    }
    canvas.width = 280;
    canvas.height = 280;
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#EDEDED';
    context.fill();
	
	var size = [
		[[95,40],[50,150],[150,150]],
		[[40,40],[130,40],[40,130],[130,130]],
		[[70,40],[140,40],[40,110],[110,110],[180,110]],
		[[40,40],[110,40],[180,40],[40,110],[110,110],[180,110]],
		[[110,40],[40,110],[110,110],[180,110],[40,180],[110,180],[180,180]],
		[[70,40],[140,40],[40,110],[110,110],[180,110],[40,180],[110,180],[180,180]],
		[[40,40],[110,40],[180,40],[40,110],[110,110],[180,110],[40,180],[110,180],[180,180]],
	];

    function drawing(n) {
        if (n < len) {
            if (len <= 4) {
                if (len != 3) {
					a =  size[1][n][0]
					b =  size[1][n][1]
                } else {
                    a =  size[0][n][0]
					b =  size[0][n][1]
                }
            }
            if (len == 5) {
               a =  size[2][n][0]
			   b =  size[2][n][1]
            }
            if (len == 6) {
			   a =  size[3][n][0]
			   b =  size[3][n][1]
            }
            if (len == 7) {
               a =  size[4][n][0]
			   b =  size[4][n][1]
            }
            if (len == 8) {
               a =  size[5][n][0]
			   b =  size[5][n][1]
            }
            if (len == 9) {
			   a =  size[6][n][0]
			   b =  size[6][n][1]
            }
            var img = new Image();
            img.src = Images[n];
            img.onload = function(){
                context.drawImage(img, a, b, k, l);
                drawing(n + 1);
            }
        } else {
            base64.push(canvas.toDataURL("image/jpg"));
            var param = new FormData();
            param.append('fileStr',base64[0]);
            utility.currencyFileAjax('base64Upload',param,callback);
        }
    }
    drawing(0);
}