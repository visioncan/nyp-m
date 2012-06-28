
$.edmService = {
	data: {},
	url : "http://172.17.10.158/_Amfphp/?contentType=application/json",
	callObj : {
		"serviceName": "edm/edmService",
		"methodName": "getDMData"
	},
	spinner : null,
	loadStart : function(spin_opt){
		var opts = {
			lines: 13, // The number of lines to draw
			length: 7, // The length of each line
			width: 3, // The line thickness
			radius: 10, // The radius of the inner circle
			rotate: 0, // The rotation offset
			color: '#FFF', // #rgb or #rrggbb
			speed: 1, // Rounds per second
			trail: 60, // Afterglow percentage
			shadow: false, // Whether to render a shadow
			hwaccel: true, // Whether to use hardware acceleration
			className: 'spinner', // The CSS class to assign to the spinner
			zIndex: 2e9, // The z-index (defaults to 2000000000)
			top: 'auto', // Top position relative to parent in px
			left: 'auto' // Left position relative to parent in px
		};
		for (var i in spin_opt) {
			opts[i] = spin_opt[i];
		};
		this.spinner = new Spinner(opts).spin(document.getElementById('loader-spin'));
		document.getElementById('loader-overlay').style.opacity = 1;
	},
	loadStop : function(){
		document.getElementById('loader-overlay').style.opacity = 0;
		this.spinner.stop();
		setTimeout(function(){
			document.getElementById('loader-overlay').style.display = 'none';
		},200);
	},
	get : function(dmid, callback, spin_opt){
		if (typeof spin_opt === 'undefined') {
			spin_opt = {};
		};
		this.loadStart(spin_opt);
		this.callObj['parameters'] = [dmid];
		var callData = JSON.stringify(this.callObj);
		$.post(this.url, callData, function(json){
			$.edmService.data = json;
			callback();
		},"json");
	}
};




/************************************************

         dP                                     
         88                                     
88d888b. 88 .d8888b. dP    dP .d8888b. 88d888b. 
88'  `88 88 88'  `88 88    88 88ooood8 88'  `88 
88.  .88 88 88.  .88 88.  .88 88.  ... 88       
88Y888P' dP `88888P8 `8888P88 `88888P' dP       
88                        .88                   
dP                    d8888P           

************************************************/
(function($){
	var options,
		nextBtn,
		prevBtn,
		fullBtn,
		pageInfo,
		overlyLink,

		NEXT = 'next',
		PREV = 'prev',
		ONE_PAGE = 'one-page',
		LEFT_PAGE = 'left-page',
		RIGHT_PAGE = 'right-page',

		current = 0, //目前圖片頁數
		page = 1;    //目前分頁

	$.player = function(opt){
		options = opt;
		options.id = '#' + options.id;
		drawLoader();
	};
	
	function drawLoader(){
		var ldsp = document.createElement('div');
		ldsp.id = 'loader-spin';
		var ld = document.createElement('div');
		ld.id = 'loader-overlay';
		ld.appendChild(ldsp);
		$(options.id).before(ld);
		$.edmService.get(options.vars.dm, intoview, { color: '#666'});
		fixListWidth();
	}

	function intoview(){
		$.edmService.loadStop();
		
		nextBtn = document.createElement('div');
		nextBtn.className = 'next btn';
		$(nextBtn).click(next);
		prevBtn = document.createElement('div');
		prevBtn.className = 'prev btn';
		$(prevBtn).click(prev);
		fullBtn = document.createElement('div');
		fullBtn.className = 'fullsc btn';
		pageInfo = document.createElement('div');
		pageInfo.className = 'pageinfo';
		overlyLink = document.createElement('a');
		overlyLink.className = 'overly-link';
		overlyLink.href = 'javascript:;';
		$(overlyLink).click(function(e){
			var page = e.currentTarget.hash.replace('#','');
			var dmFrame = document.getElementById('framehelper');
				dmFrame.setAttribute('src' , dmFrame.getAttribute('src') + '&mode=mobile&p=' + page);
		});
		document.querySelector(options.id).appendChild(overlyLink);

		var ico_next = document.createElement('img');
		ico_next.src = '/templates/images/edm/m_arrow.svg';
		nextBtn.appendChild(ico_next);
		$(ico_next).clone().prependTo(prevBtn);

		var ico_fullsc = document.createElement('img');
		ico_fullsc.src = '/templates/images/edm/m_zoom.svg';
		fullBtn.appendChild(ico_fullsc);

		var ctrl = document.createElement('div');
		ctrl.id = 'ctrl-wrap';
		ctrl.appendChild(nextBtn);
		ctrl.appendChild(prevBtn);
		ctrl.appendChild(fullBtn);
		ctrl.appendChild(pageInfo);
		$(options.id).before(ctrl);

		ctrl.style.opacity = 1;
		$(options.id).get(0).style.opacity = 1;

		newPage(current);
		setTimeout(function(){$('#loader-overlay').remove();}, 300);

		//mouse event
		addActiveEvent(document.querySelector(options.id), function(){
			fullBtn.style.opacity = 0.8;
		}, function(){
			fullBtn.style.opacity = 0.4;
		});
		addActiveEvent(nextBtn);
		addActiveEvent(prevBtn);
	}

	function newPage(num){
		var img = document.createElement('img'),
			img2 = null,
			total_width = 0,
			pagesDATA = $.edmService.data.pages,
			wrapper   = $('<div/>',{ id: 'page' + page }),
			pageImg   = $('<div/>', {'class' : 'img'}),
			rightWarp = $('<div/>', {'class' : RIGHT_PAGE});

			wrapper.append(pageImg);
			
		if (num == 0 || num == $.edmService.data.pages.length - 1 ) {
			img.setAttribute('height', options.height);
			img.className = ONE_PAGE;
			img.src = '/' + pagesDATA[num].large.url;
			
			total_width = Math.floor((options.height / pagesDATA[num].large.height) * pagesDATA[num].large.width);
			pageImg.append(img);
			pageImg.css('width', total_width);

		}else{
			var table = $('<table/>',{ 'cellspacing' : 0 , 'html' : '<tr></tr>'});
			var leftTD = $('<td/>');
			var rightTD = $('<td/>');

			img.setAttribute('height', options.height);
			img.className = LEFT_PAGE;
			img.src = '/' + pagesDATA[num].large.url;
			
			total_width = Math.floor((options.height / pagesDATA[num].large.height) * pagesDATA[num].large.width);

			img2 = $(img).clone().get(0);
			img2.setAttribute('height', options.height);
			img2.className = RIGHT_PAGE;
			img2.src = '/' + pagesDATA[(num + 1)].large.url;

			total_width += Math.floor((options.height / pagesDATA[(num + 1)].large.height) * pagesDATA[(num + 1)].large.width);

			leftTD.append(img);
			rightTD.append(img2);
			table.find('tr').append(leftTD).append(rightTD);

			var addstyle = {'width': total_width};
			if (total_width > options.width) {
				addstyle.marginLeft = - Math.floor((total_width - options.width) / 2);
			};
			pageImg.append(table).css(addstyle);
		}
		wrapper.appendTo(options.id);
		//overlyLink.href = '?mobile#' + (num + 1);
		overlyLink.href = '#' + (num + 1);

		//btn display
		if (num == 0) {
			nextBtn.style.display = 'block';
			prevBtn.style.display = 'none';
		}else if(num == $.edmService.data.pages.length - 1){
			nextBtn.style.display = 'none';
			prevBtn.style.display = 'block';
		}else{
			nextBtn.style.display = 'block';
			prevBtn.style.display = 'block';
		}
		renewPageInfo(num);
	}

	function renewPageInfo(n){
		var now = n == 0 || (n == ($.edmService.data.pages.length - 1)) ? (n + 1) : (n + 1) + '-' + (n + 2);
		pageInfo.innerHTML = '<b>' + now + '</b>/' + $.edmService.data.pages.length;
	}

	function removePage(dri){
		switch (dri){
			case NEXT :
				$('#page'+ (page - 1)).remove();
				break;
			case PREV :
				$('#page'+ (page + 1)).remove();
				break;
		}
	}
	// EVENT 
	function next(){
		if (current == ($.edmService.data.pages.length - 1)) {
			return;
		};
		page++;
		if (current == 0) {
			current ++;
		}else{
			current += 2;
		}
		newPage(current);
		removePage(NEXT);
	}
	function prev(){
		if (current == 0) {
			return;
		};
		page--;
		if (current == 1) {
			current --;
		}else{
			current -= 2;
		}
		newPage(current);
		removePage(PREV);
	}


	function addActiveEvent(el, touchStart, touchEnd){
		if(window.Touch){
			el.ontouchstart = function(e){
				if(typeof touchStart !== 'undefined'){
					touchStart();
				}else{
					$(e.target).addClass('active');
				}
			};
			el.ontouchend = function(e){
				if(typeof touchEnd !== 'undefined'){
					touchEnd();
				}else{
					$(e.target).removeClass('active');
				}
			};
		}
	}

	function fixListWidth(){
		//window.onload = 
		window.onresize = function(){
			if (document.body.clientWidth <= 500) {
				$("#edm-list ul").css('width', 135 * $('#edm-list ul li').length );
			}else{
				$("#edm-list ul").css('width', 'auto');
			}
		}
	}

})(jQuery);




function exit(){
	//window.onerror = function(){return true};
	window.onlyplayer = true;
	window.Container = function(){return null};
	window.Paper = function(){};
	window.PaperContainer = function(){};
	window.edm = function(){};
	return;
};
if (typeof Container === 'undefined') {
	exit();
}







/************************************************

         dP          dP                dP 
         88          88                88 
.d8888b. 88 .d8888b. 88d888b. .d8888b. 88 
88'  `88 88 88'  `88 88'  `88 88'  `88 88 
88.  .88 88 88.  .88 88.  .88 88.  .88 88 
`8888P88 dP `88888P' 88Y8888' `88888P8 dP 
     .88                                  
 d8888P                                   

************************************************/
var stage,
	wrapper = document.getElementById("edm-canvas"),
	pageinfo = document.getElementById("pageinfo"),
	update = false,
	LANDSCAPE = 'landscape',
	PORTRAIT  = 'portrait',
	RIGHT = "right",
	LEFT  = "left",
	stageWidth  = document.body.clientWidth,
	stageHeight = document.body.clientHeight,
	screenori = document.body.clientWidth > document.body.clientHeight ? LANDSCAPE : PORTRAIT;



function tick() {
	if (update) {
		stage.update();
	};
}





/************************************************

88d888b. .d8888b. 88d888b. .d8888b. 88d888b. 
88'  `88 88'  `88 88'  `88 88ooood8 88'  `88 
88.  .88 88.  .88 88.  .88 88.  ... 88       
88Y888P' `88888P8 88Y888P' `88888P' dP       
88                88                         
dP                dP                         

************************************************/
function Paper(num){
	this.num = num;
	this.width = 0;
	this.height = 0;
	this.orgWidth = 0;
	this.orgHeight = 0;
	this.maxWidth = 0;
	this.maxHeight = 0;
	this.ratio = 1; //預設縮放比
	this.img;
	this.img2 = null;
	this.cv;
	this.isZooming = true,
	this.isZoomMode = false;
	this.currentScale = 1;
	this.isOnGesture = false;
	this.maxfullRatio = 1.6; //放大size最大值
	this.isDouble = false; //是否為雙頁
	this.loadComplete = function(target){};

	this.initialize();
};
Paper.prototype = new Container();
Paper.prototype.Container_initialize = Paper.prototype.initialize;
Paper.prototype.initialize = function(){
	this.Container_initialize();
	//this.isDouble = this.num % 2 == 1; //單數為雙面
	var len = $.edmService.data.pages.length;
	if(screenori === PORTRAIT || this.num == 0 || (this.num == (len - 1) && len % 2 == 0)){
		this.singlePAGE();
	}else{
		this.doublePAGE();
	}
};

Paper.prototype.singlePAGE = function(){
	//log('/////////// single');
	//log('loading === ' + this.num);
	this.maxWidth  = Math.floor($.edmService.data.pages[this.num].full.width * this.maxfullRatio);
	this.maxHeight = Math.floor($.edmService.data.pages[this.num].full.height * this.maxfullRatio);

	this.ratio = Math.min(stageWidth / this.maxWidth, stageHeight / this.maxHeight);
	this.width  = this.orgWidth  = Math.floor(this.maxWidth * this.ratio);
	this.height = this.orgHeight = Math.floor(this.maxHeight * this.ratio);

	this.img = new Image();
	this.img.name = 'page' + this.num;
	this.img.className = PORTRAIT;
	this.img.onload = this;
	this.img.src = '/' + $.edmService.data.pages[this.num].full.url;

	this.cv = document.createElement("canvas");
	this.cv.width = this.width;
	this.cv.height = this.height;
};
Paper.prototype.doublePAGE = function(){
	//log('double');
	//log('loading === ' + this.num);
	var pDATA = $.edmService.data.pages;
	var maxWidth = Math.max(pDATA[this.num].full.width, pDATA[(this.num + 1)].full.width);
	var maxHeight = Math.max(pDATA[this.num].full.height, pDATA[(this.num + 1)].full.height);
	this.maxWidth  = Math.floor(maxWidth * 2 * this.maxfullRatio);
	this.maxHeight = Math.floor(maxHeight * this.maxfullRatio);

	this.ratio = Math.min(stageWidth / this.maxWidth, stageHeight / this.maxHeight);
	this.width  = this.orgWidth  = Math.floor(this.maxWidth * this.ratio);
	this.height = this.orgHeight = Math.floor(this.maxHeight * this.ratio);

	this.img = new Image();
	this.img.name = 'page' + this.num;
	this.img.className = LEFT;
	this.img.onload = this;
	this.img.src = '/' + pDATA[this.num].full.url;
	this.cv = document.createElement("canvas");
	this.cv.width = Math.floor(this.width / 2);
	this.cv.height = this.height;

	if (this.num !== 0 && this.num < pDATA.length) {
		this.img2 = new Image();
		this.img2.name = 'page' + (this.num + 1);
		this.img2.className = RIGHT;
		this.img2.onload = this;
		this.img2.src = '/' + pDATA[(this.num + 1)].full.url;
		this.cv.width = this.width;
	};
};

Paper.prototype.handleEvent = function(e){
	switch(e.type){
		case 'load' :
			this.imgLoadComplete(e);
		break;
	};
};
Paper.prototype.imgLoadComplete = function(e){
	//log('imgLoadComplete');
	switch (e.target.getAttribute('class')){
		case PORTRAIT : 
			this.cv.getContext('2d').drawImage(e.target, 0, 0, this.width, this.height);
			break;

		case LEFT :
			this.cv.getContext('2d').drawImage(e.target, 0, 0, Math.floor(this.width / 2), this.height);
			break;

		case RIGHT : 
			this.cv.getContext('2d').drawImage(e.target, Math.floor(this.width / 2), 0, Math.floor(this.width / 2), this.height);
			break;
	}

	if( this.getNumChildren() == 0){
		var bmp = new Bitmap(this.cv);
		bmp.x = - Math.floor(this.width / 2);
		bmp.y = - Math.floor(this.height / 2);
		//bmp.shadow = new Shadow('#333', 0, 0, 10);
		this.addChild(bmp);
		bmp = null;
	}
	
	this.x = Math.floor(stageWidth / 2);
	this.y = Math.floor(stageHeight / 2);
	this.onPress = function(e){
		if (!this.isZoomMode) {	
			return;
		};
		var offset = {
			x: this.x - e.stageX,
			y: this.y - e.stageY
		};
		e.onMouseMove = function(ev) {
			if (!this.target.isOnGesture) {
				this.target.x = ev.stageX + offset.x;
				this.target.y = ev.stageY + offset.y;
			};
		};
		e.onMouseUp = function(ev){
			var minX, maxX, minY, maxY;
			minY = Math.floor(this.target.height / 2);
			maxY = Math.floor(stageHeight - (this.target.height / 2));
			if (this.target.width > stageWidth) {
				minX = Math.floor(this.target.width / 2);
				maxX = Math.floor(stageWidth - (this.target.width / 2));
			}else{
				minX = maxX = Math.floor(stageWidth / 2);
			};
			
			//
			if(this.target.y > minY){
				Tween.get(this.target).to({y: minY}, 100);
			}else if ( this.target.y < maxY ) {
				Tween.get(this.target).to({y: maxY}, 100);
			}

			if (this.target.x > minX) {
				Tween.get(this.target).to({x: minX}, 100);
			}else if(this.target.x < maxX){
				Tween.get(this.target).to({x: maxX}, 100);
			}
		}
	};
	this.loadComplete(e.target);
};

Paper.prototype.zoom = function(scale){
	isOnGesture = true;
	//log(scale);
	
	scale *= this.currentScale;
	if (scale < 1) { scale += Math.cos(scale) - 0.54};
	

	var toW, toH;
	toW = this.orgWidth * scale;
	toH = this.orgHeight * scale;
	
	if(toW > this.maxWidth || toH > this.maxHeight){
		this.width = Math.floor(this.maxWidth);
		this.height = Math.floor(this.maxHeight);
		this.scaleX = this.scaleY = this.width / this.orgWidth;
		return;
	}

	this.width = Math.floor(toW);
	this.height = Math.floor(toH);
	this.scaleX = this.scaleY = scale;
};

Paper.prototype.onGestureEnd = function(){	
	this.currentScale = this.scaleX;
	this.isOnGesture = false;
	this.isZoomMode = true;
	if(this.height > this.maxHeight || this.width > this.maxWidth){
		this.width = this.maxWidth;
		this.height = this.maxHeight;
		this.currentScale = this.width / this.orgWidth;
		Tween.get(this).to({scaleX: this.currentScale, scaleY: this.currentScale}, 200);
	}else if ((stageWidth - this.orgWidth) < (stageHeight - this.orgHeight)) {
		if (this.width < stageWidth) {
			this.width = stageWidth;
			this.height = Math.floor((stageWidth / this.orgWidth) * this.orgHeight);
			Tween.get(this).to({scaleX: 1, scaleY: 1}, 200);
			this.currentScale = 1;
			this.isZoomMode = false;
			return;
		};
	}else{	
		if (this.height < stageHeight) {
			this.height = stageHeight;
			this.width = Math.floor((stageHeight / this.orgHeight) * this.orgWidth);
			Tween.get(this).to({scaleX: 1, scaleY: 1}, 200);
			this.currentScale = 1;
			this.isZoomMode = false;
			return;
		};
	}
	if (this.width * this.height < 1024 * 1024 * 4) {
		this.drawBMP();
	};
};

Paper.prototype.drawBMP = function(){
	this.removeChildAt(0);
	this.cv = null;
	this.cv = document.createElement("canvas");
	this.cv.width = this.width;
	this.cv.height = this.height;
	//log('draw bmp = ' + this.cv.width * this.cv.height);
	switch (this.img.getAttribute('class')){
		case PORTRAIT : 
			this.cv.getContext('2d').drawImage(this.img, 0, 0, this.width, this.height);
			break;

		case LEFT :
			this.cv.getContext('2d').drawImage(this.img, 0, 0, Math.floor(this.width / 2), this.height);
			break;
	}
	if (this.img2 !== null) {
		this.cv.getContext('2d').drawImage(this.img2, Math.floor(this.width / 2), 0, Math.floor(this.width / 2), this.height);
	};

	var bmp = new Bitmap(this.cv);
	bmp.scaleX = bmp.scaleY = this.orgWidth / this.width;
	bmp.x = - Math.floor(this.orgWidth / 2);
	bmp.y = - Math.floor(this.orgHeight / 2);
	//bmp.shadow = new Shadow("black", 0, 0, 15);
	this.addChild(bmp);
	bmp = null;
};


/************************************************

                             dP            oo                            
                             88                                          
.d8888b. .d8888b. 88d888b. d8888P .d8888b. dP 88d888b. .d8888b. 88d888b. 
88'  `"" 88'  `88 88'  `88   88   88'  `88 88 88'  `88 88ooood8 88'  `88 
88.  ... 88.  .88 88    88   88   88.  .88 88 88    88 88.  ... 88       
`88888P' `88888P' dP    dP   dP   `88888P8 dP dP    dP `88888P' dP       

************************************************/
function PaperContainer(num, loadCompFn){
	this.num = num;
	this.paper;
	
	if (typeof loadCompFn !== 'undefined') {
		this.loadComplete = loadCompFn;
	}else{
		this.loadComplete = function(target){};
	}
	this.initialize();
}
PaperContainer.prototype = new Container();
PaperContainer.prototype.Container_initialize = PaperContainer.prototype.initialize;
PaperContainer.prototype.initialize = function(){
	this.Container_initialize();
	this.paper = new Paper(this.num);
	this.paper.loadComplete = this.loadComplete;
	this.addChild(this.paper);
};

PaperContainer.prototype.zoom = function(scale){
	this.paper.zoom(scale);
};
PaperContainer.prototype.onGestureEnd = function(){	
	this.paper.onGestureEnd();
};

PaperContainer.prototype.__defineGetter__('isZoomMode', function(){
	return this.paper.isZoomMode;
});
PaperContainer.prototype.__defineGetter__('width', function(){
	return this.paper.width;
});
PaperContainer.prototype.__defineGetter__('height', function(){
	return this.paper.height;
});





/************************************************

               dP            
               88            
.d8888b. .d888b88 88d8b.d8b. 
88ooood8 88'  `88 88'`88'`88 
88.  ... 88.  .88 88  88  88 
`88888P' `88888P8 dP  dP  dP 

************************************************/
var edm = function(opt){
	var vars  = {
			bgc : '#666',
			//ratio : 1,
			currentPage : 0
		},
		bookEvent,
		startX,       //touch start時，點下的座標
		paperStartX;  //touch start時記下 頁面起始的 x 座標

	if (window.onlyplayer) { return; };
	return {
		bookContainer : null,
		currentPaper : null, //目前的paper
		papers : null,		 //放所有頁面陣列
		page : 1,            //目前頁數，由1開始
		totalPage : 0,       //計算所有頁數
		current : 0,		 //目前載入的圖片頁數
		disX : 0,			 //按下後移動的距離
		timer : 0,		     //timer set starts when touch starts
		timerCounter : 0,	 //counter for timer
		isOnGesture : false, //多指觸控
		isMoving : false,    //單指移動
		isDisplayInfo : true, //是否顯示title資訊
		clicks : 0 ,

		init : function(){
			wrapper.width  = stageWidth;
			wrapper.height = stageHeight;
			
			stage = new Stage(wrapper);
			this.bookContainer = new Container();
			this.bookContainer.name = 'bookContainer';
			this.bookContainer.alpha = 0;
			//this.bookContainer.shadow = new Shadow('#333', 0, 0, 10);
			stage.addChild(this.bookContainer);
			Touch.enable(stage); //for iOS
			Ticker.addListener(window);
			update = true;
		},

		intoview : function(){
			this.papers = new Array($.edmService.data.pages.length);

			document.querySelector("#title").innerHTML = $.edmService.data.title;
			document.querySelector("h1").innerHTML = $.edmService.data.publisher;

			var paper = new PaperContainer(this.current, function(target){
				$.edmService.loadStop();
				Tween.get(edm.bookContainer).to({alpha: 1}, 600);
			});
			paper.name = 'page' + this.current;
			this.papers[this.current] = paper;
			this.currentPaper = paper;
			this.bookContainer.addChild(paper);

			
			this.addNew(this.current + 1);
			this.renewPageInfo();
			
			//this.bookContainer.onDoubleClick = function(){ log('double') };
			
			bookEvent = new touchEvent(wrapper);
			bookEvent.onGesture(this.onGesture);
			bookEvent.onGestureEnd(this.onGestureEnd);
			bookEvent.onTouchStart(this.onTouchStart);
			bookEvent.onTouchMove(this.onTouchMove);
			bookEvent.onTouchEnd(this.onTouchEnd);
			bookEvent.onScreenChange(this.onOriChange);
		},
		/*
		如果有帶頁數P，那就以p作為頁數排列的位置
		*/
		addNew : function(n, p){
			if(n >= $.edmService.data.pages.length || typeof this.papers[n] !== 'undefined'){
				return;
			}
			var paper = new PaperContainer(n);
			paper.name = 'page' + n;
			paper.x = (typeof p == 'undefined') ? n * stageWidth : (p) * stageWidth;
			this.papers[n] = paper;
			this.bookContainer.addChild(paper);
		},
		//是否是最未頁
		isLast : function(){
			if( screenori === PORTRAIT || (edm.papers.length % 2) == 0 ){
				return edm.current == (edm.papers.length - 1);
			}else{
				return edm.current == (edm.papers.length - 2);
			}
		},
		onGesture : function(e){
			edm.isOnGesture = true;
			edm.currentPaper.zoom(e.scale);
		},
		onGestureEnd : function(e){
			clearInterval(edm.timer);
			edm.timer = 0;
			edm.isOnGesture = false;
			edm.timerCounter = 0;
			edm.currentPaper.onGestureEnd();
		},
		onTouchStart : function(point){
			startX = point.pageX;
			paperStartX = edm.bookContainer.x;
			/* 修正沒有Touch end 時，timer還是會一直run的問題 */
			if (edm.timer !== 0) {
				clearInterval(edm.timer);
				edm.timer = 0;
			};

			edm.timer = setInterval(function(){ edm.timerCounter++; }, 10);
		},
		onTouchMove : function(point){
			if (edm.currentPaper.isZoomMode) {return;};
			if (edm.isOnGesture) {return;};

			edm.isMoving  = true;
			var dynamicRatio = 1;
			edm.disX = (point.pageX - startX);

			/* idisX > 0 = swipe right */
			if (edm.current == 0) {
				dynamicRatio = edm.disX > 0 ? .3 : 1;
			}else if(edm.isLast()){
				dynamicRatio = edm.disX < 0 ? .3 : 1;
			}

			edm.bookContainer.x = paperStartX + edm.disX * dynamicRatio;
		},

		onTouchEnd : function(){
			clearInterval(edm.timer);
			edm.timer = 0;
			//log(edm.isMoving);
			if (!edm.isMoving ) {
				edm.clicks ++;
				if (edm.clicks == 1 && edm.disX === 0) {
					setTimeout(function(){
						if(edm.clicks == 1) {
							edm.toggleDisplay();
						} else {
							edm.toggleZoom();
						}
						edm.clicks = 0;
						}, 300);
				}
				edm.isMoving = false;
				edm.timerCounter = 0;
				return;
			}
			if (edm.currentPaper.isZoomMode) {return;};
			if (edm.isOnGesture) { return; };
			
			var direction = edm.disX > 0 ? RIGHT : LEFT;

			if( edm.current == 0 && direction == RIGHT || edm.isLast() && direction == LEFT){
				edm.goBack();

			}else if( edm.timerCounter < 20 && edm.disX > 30 ) {
				edm.gotoRight();

			}else if( edm.timerCounter < 20 && edm.disX < -30 ) {
				edm.gotoLeft();

			}else if (edm.disX <= -(stageWidth / 2)) {
				edm.gotoLeft();

			}else if (edm.disX >= (stageWidth / 2)) {
				edm.gotoRight();

			}else if (Math.abs(edm.disX) < (stageWidth / 2)) {
				edm.goBack();
			}
			//reset
			edm.timerCounter = 0;
			edm.disX = 0;
			edm.isMoving = false; 
		},
		goBack : function(){
			//log('=back=');
			var to = -stageWidth * (this.page - 1);
			Tween.get(this.bookContainer).to({x: to }, 200);
		},
		gotoRight : function(){
			this.page --;
			if(screenori === PORTRAIT){
				this.current -= 1;
			}else{
				this.current = (this.current == 1) ? this.current - 1 : this.current - 2;
			}
			// log("\n ====== gotoRight");
			// log('current=' +  this.current);
			// log('page=' +  this.page);

			if(typeof this.papers[this.current] === 'undefined'){
				this.addNew(this.current);
			}

			var to = -stageWidth * (this.page - 1);
			Tween.get(this.bookContainer).to({x: to}, 200);
			this.currentPaper = this.papers[this.current];
			this.renewPageInfo();
		},
		gotoLeft : function(){
			//log("\n ====== gotoLeft");
			this.page ++;
			if(screenori === PORTRAIT){
				this.current += 1;
				this.addNew(this.current + 1);
			}else{
				this.current = (this.current == 0) ? this.current + 1 : this.current + 2;
				this.addNew(this.current + 2, this.page);
			}
			//log('current=' +  this.current);
			//log('page=' +  this.page);

			var to = -stageWidth * (this.page - 1);
			Tween.get(this.bookContainer).to({x: to }, 200);
			this.currentPaper = this.papers[this.current];
			this.renewPageInfo();
		},

		renewPageInfo : function(){
			if (pageinfo.style.display !== 'block') {
				pageinfo.style.display = 'block';
			};
			var curPage;
			if (screenori === PORTRAIT) {
				curPage = (this.current + 1).toString();
			}else{
				if (this.current == 0 || this.current == ($.edmService.data.pages.length - 1)) {
					curPage = (this.current + 1).toString();
				}else{
					curPage = (this.current + 1).toString() + '-' + (this.current + 2).toString();
				}
			}
			pageinfo.innerHTML = '<b>' + curPage + '</b>/' + $.edmService.data.pages.length;
		},

		toggleDisplay : function(){
			this.timerCounter = 0;
			this.isDisplayInfo = !this.isDisplayInfo;
			if (this.isDisplayInfo) {
				pageinfo.style.opacity = 1;
				document.querySelector("#header").style.opacity = 1;
				document.querySelector("#header").style.WebkitUserSelect = '';
			}else{
				pageinfo.style.opacity = 0;
				document.querySelector("#header").style.opacity = 0;
				document.querySelector("#header").style.WebkitUserSelect = 'none';
			}
		},

		toggleZoom : function(){

		},

		currInPage : function(curr){
			if (screenori === PORTRAIT || curr == 0) {
				return curr + 1;
			}else{
				return Math.round(curr/2) + 1;
			}
		},

		onOriChange : function(attr){
			//log(attr.orientation);
			edm.bookContainer.removeAllChildren();
			edm.currentPaper = null;
			edm.papers = new Array($.edmService.data.pages.length);

			//log(stageWidth + " / " + attr.width + ' / '+ document.body.clientWidth);

			stageWidth  = document.body.clientWidth;
			stageHeight = document.body.clientHeight;
			screenori = document.body.clientWidth > document.body.clientHeight ? LANDSCAPE : PORTRAIT;

			wrapper.width  = stageWidth;
			wrapper.height = stageHeight;

			//log(edm.current);
			if (edm.current === 0 || screenori == PORTRAIT) {
				edm.page = edm.currInPage(edm.current);
				edm.addNew(edm.current + 1);
			}else if (screenori !== PORTRAIT && edm.current % 2 == 0) {
				edm.current --;
				edm.page = edm.currInPage(edm.current);
				edm.addNew(edm.current + 2, edm.page);
			}else{
				edm.page = edm.currInPage(edm.current);
				edm.addNew(edm.current + 2, edm.page);
			}

			var paper = new PaperContainer(edm.current);
			paper.name = 'page' + edm.current;
			paper.x = (edm.page - 1) * stageWidth;
			edm.papers[edm.current] = paper;
			edm.currentPaper = paper;
			edm.bookContainer.addChild(paper);

			//log(edm.current + ' / edm.page=' + edm.page);
			edm.renewPageInfo();
			edm.gotoCurrPage();
		},

		gotoCurrPage : function(){
			this.bookContainer.x = -stageWidth * (this.page - 1);
		}

		/////
	};
}();



var mobiFullView = {
	init : function(){
		var htmlClass = document.getElementsByTagName('html')[0].getAttribute('class');
		if( /mobile/i.test(document.body.className) && /mobile/i.test(htmlClass)  ){
			if(typeof flavars !== 'undefined'){
				$.edmService.get(flavars.dm, this.ajaxDone);
				edm.init();
				this.addhelper();
			}
		}
	},
	ajaxDone : function(){
		edm.intoview();
	},
	addhelper : function(){
		var vars = this.getVars();
		document.getElementById('framehelper').src = "//" + vars.host + "/framehelper.html";
	},
	getVars : function() {
		if(window.location.href.indexOf("?") == -1 || window.location.href.indexOf('host=') == -1){
			return '';
		}
		var vars = [],
			hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		for(var i = 0; i < hashes.length; i++){
			var hash = hashes[i].split('=');
	        vars.push(hash[0]);
	        vars[hash[0]] = decodeURIComponent(hash[1]);
		}
		return vars;
	}
};

$(document).ready(function(){
	mobiFullView.init();
});





