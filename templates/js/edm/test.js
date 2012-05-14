var book = {
	cv : document.getElementById("book_canvas"),
	init : function() {
		var stage = new Stage(book.cv);

      	var graphics = new Graphics();
      graphics.setStrokeStyle(3);
      graphics.beginStroke(Graphics.getRGB(255,210,25,0.8));
      graphics.drawRect(0, 0, 80, 80);

      box = new Shape(graphics);
      box.regX = box.regY = 80 / 2;
      box.x = book.cv.width / 2;
      box.y = book.cv.height / 2;
40
      stage.addChild(box);
      //stage.update();

      var container = new Container();

      var bmp = new Bitmap("templates/cache/edm/0001/large/page_2_large.jpg");
      var bmp2 = new Bitmap("templates/cache/edm/0001/full/page_2.jpg");
      bmp.visible = false;
      //bmp.regX  = 5;
      
		container.addChild(bmp);
		container.addChild(bmp2);
		container.scaleX = container.scaleY = 1.2;
		
		 stage.addChild(container);

		log(container);
      //Ticker.setFPS(30);
      Ticker.addListener(stage);
      cv.height = 800;
	}
}



var log = function(str, method) {
	method = (( method == undefined) ? "log" :  method );
	if (window.console && console[method]){
		console[method](str);
	}
};


var callDataObj = {"serviceName":"edm/edmService", "methodName":"getDMData", "parameters":["0001"]};
      var callData = JSON.stringify(callDataObj);
      $.post("http://192.168.0.103/Amfphp/?contentType=application/json", callData, function(data){

            console.log("load OK" + data);
      });