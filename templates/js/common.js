/******************************************************************************
*
* add active event to element A 
*
******************************************************************************/
(function($){
	$.addTouchActive = function(){
		$("a").each(function(i, n){
			addActiveEvent( this );
		});
	};

	$.fn.addTouchActive = function(){
		addActiveEvent( this.get(0) );
	};

	function addActiveEvent(el){
		/* if able touch */
		//$.log(el.nodeName);
		if(window.Touch){
			el.ontouchstart = function(e){
				$(e.target).addClass('active');
			};
			el.ontouchend = function(e){
				$(e.target).removeClass('active');
			};
		}
	}
})(jQuery);



/******************************************************************************
*
* 判斷可視高度 & add min height 
*
******************************************************************************/
var mobiScreen = {
	minheight : null,
	detect : function(){
		this.minheight = window.innerHeight;
		this.addHeightTo(['view']);
	},
	addStlye : function(el){
		if(el){
			document.getElementById(el).style.minHeight = this.minheight + 'px';
		}
	},
	addHeightTo : function(el){
		if( typeof(el) === 'string'){
			this.addStlye(el);
		}else if(typeof(el) === 'object'){
			for(var i in el){
				this.addStlye(el[i]);
			}
		}
	}
};



/******************************************************************************
*
* dialog view transition 
*
******************************************************************************/
(function($){
	var view,
		diaView,
		titleView,
		contView,
		currentOpts,
		defaults = {
			href      : "#",     //載入內容
			title     : "",
			barColor  : "#6D83A1",
			aniType   : "slide", //效果
			inViewFn  : function(){},    //enter view function
			outViewFn : function(){}     //exit view function
		};
	$.fn.dialogView = function(opt){
		$(this).unbind('click.dv').bind('click.dv', function(e) {
			e.preventDefault();
			currentOpts = null;
			currentOpts = $.extend(defaults, {
									href  : $(this).attr("href"), 
									title : $(this).attr("title")}, opt);
			//$.log(currentOpts);
			$.dialogView(currentOpts);
			return false;
		});
		return this;
	};

	$.dialogView = function(opt){
		var options;
		currentOpts = null;
		currentOpts = options = $.extend(defaults, opt);
		$.log(options);
		view    = document.getElementById('view');
		diaView.getElementsByClassName("top-bar")[0].style.backgroundColor = options.barColor;

		$(view).addClass("transitioning out " + options.aniType);
		$(diaView).addClass("transitioning in " + options.aniType).show();

		addListener(view,    transTo_DiaView);
		addListener(diaView, transTo_DiaView);

		$.dialogView.setTitle(options.title);

		if(options.href !== "#" && options.href.indexOf("#") === 0){
			var target = options.href.substr(options.href.indexOf("#"));

			$('<div class="dialogview-tmp" />')
				.hide()
				.insertBefore( $(target) )
				.bind('dialogview-close', function(){
					//$.log(contView.children());
					$(this).replaceWith($(contView).children());
				});
			
			$(target).appendTo(contView);
		}

		options.inViewFn();
	};

	function _draw() {
		diaView = document.createElement("div");
		diaView.id = "diaview";
		diaView.style.minHeight = window.innerHeight + 'px';

		contView = document.createElement("div");
		contView.className = "cont";

		var topdiv = document.createElement("div");
		topdiv.className = "top-bar";

		titleView = document.createElement("div");
		titleView.className = "title";

		var backBtn = document.createElement("a");
		backBtn.className = "back-btn";
		backBtn.href = "#";
		backBtn.innerHTML = "回上一頁";

		topdiv.appendChild(titleView);
		topdiv.appendChild(backBtn);
		diaView.appendChild(contView);
		diaView.appendChild(topdiv);
		document.body.appendChild(diaView);

		$(backBtn).bind('click', function(){
			//var options = currentOpts;
			//$.log(currentOpts);
			$(view).addClass("transitioning in reverse " + currentOpts.aniType).show();
			$(diaView).addClass("transitioning out reverse " + currentOpts.aniType);

			addListener(view,    transTo_View);
			addListener(diaView, transTo_View);

			return false;
		}).addTouchActive();
	}


	function addListener(el, fn){
		el.addEventListener('webkitAnimationEnd', fn, false);
		el.addEventListener('animationend',       fn, false);
	}
	function removeListener(el, fn){
		el.removeEventListener('webkitAnimationEnd', fn, false);
		el.removeEventListener('animationend',       fn, false);
	}
	function transTo_DiaView(e){
		switch(e.target.id){
			case "view":
				$(e.target).removeClass("transitioning out " + currentOpts.aniType).hide();
			break;
			case "diaview":
				$(e.target).removeClass("transitioning in " + currentOpts.aniType);
			break;
		}
		removeListener(e.target, transTo_DiaView);
	}
	function transTo_View(e){
		switch(e.target.id){
			case "view":
				$(e.target).removeClass("transitioning in reverse " + currentOpts.aniType);
			break;
			case "diaview":
				$(e.target).removeClass("transitioning out reverse " + currentOpts.aniType).hide();
				$.event.trigger('dialogview-close');
				currentOpts.outViewFn();
			break;
		}
		removeListener(e.target, transTo_View);
	}

	$(document).ready(_draw);

	$.extend($.dialogView, {
		setTitle : function (str) {
			titleView.innerHTML = str;
		}
	});
})(jQuery);




/******************************************************************************
*
* gallery
*
*******************************************************************************/
(function($){
	var gallery,
		el,
		i,
		page,
		slides,
		dialogView,
		Wrapper;
	$.galleryView = function(){};

	function initWithPhotos(photos){
		dialogView = document.getElementById("diaview").getElementsByClassName("cont")[0];

		Wrapper = document.createElement("DIV");
		Wrapper.id = "gallery-wrapper";

		dialogView.appendChild(Wrapper);
		dialogView.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
		
		slides = photos;
		gallery = new SwipeView(Wrapper, { numberOfPages: slides.length });
		$.dialogView.setTitle("1/" + slides.length);

		for (i=0; i<3; i++) {
			page = i==0 ? slides.length-1 : i-1;
			el = document.createElement('img');
			el.src = slides[page].img;
			el.width = slides[page].width;
			el.height = slides[page].height;
			gallery.masterPages[i].appendChild(el);

			el = document.createElement('span');
			el.innerHTML = slides[page].desc;
			gallery.masterPages[i].appendChild(el)
		}
		
		gallery.onFlip(function(){
			var el,
				upcoming,
				i;
			
			for (i=0; i<3; i++) {
				upcoming = gallery.masterPages[i].dataset.upcomingPageIndex;
				if (upcoming != gallery.masterPages[i].dataset.pageIndex) {
					el = gallery.masterPages[i].querySelector('img');
					el.src = slides[upcoming].img;
					el.width = slides[upcoming].width;
					el.height = slides[upcoming].height;
					
					el = gallery.masterPages[i].querySelector('span');
					el.innerHTML = slides[upcoming].desc;
				}
			}
			//title 
			$.dialogView.setTitle(gallery.pageIndex  + 1 + "/" + slides.length);
		});
	}

	function close () {
		dialogView.removeEventListener('touchmove', function (e){ e.preventDefault(); }, false);
		dialogView.removeChild(Wrapper);
		Wrapper = dialogView = slides = gallery = null;
	}
	$.extend($.galleryView, {
		initWithPhotos : function(photos){
			initWithPhotos(photos);
		},
		close : function(){
			close();
		}
	});
})(jQuery);



/******************************************************************************
*
* loader
*
*******************************************************************************/
(function($){
	var loadbox,
		inder_canvas,
		drawIntervalID,
		ctx,
		color  = "255,255,255";
		size   = 40,  // canvas size
		spokes = 8;   // Number of spokes on the wheel
	$.loader   = function(){};
	function init () {
		//ajax 全域設定
		$.ajaxSetup({
			url  : '/ajax.php',
			type : "POST" ,
			dataType : "json"
		});
		loadbox = document.createElement('DIV');
		loadbox.id = "mloader";
		document.body.appendChild(loadbox);
		
		$(loadbox).bind("ajaxSend", function(){
			$.loader.start();
		}).bind("ajaxComplete", function(){
			$.loader.stop();
		});
	}
	function start(){
		if(!inder_canvas){
			creat();
		}else{
			drawThanStart();
		}
	}

	function drawThanStart(){
		loadbox.className = "show";
		var tranX = ( document.body.scrollTop + ( mobiScreen.minheight/2 ));
		loadbox.style.top = tranX + "px";
		//loadbox.style.webkitTransform = 'translateY(' + tranX + 'px)';
		//loadbox.style.transform = 'translateY(' + tranX + 'px)';
		drawIntervalID = setInterval(draw, 75);
	}
	function stop(){
		loadbox.className = "hide";
		loadbox.style.top =  document.body.scrollTop + mobiScreen.minheight + "px";
		clearCtx();
		clearInterval(drawIntervalID);
	};
	
	function draw(){
		clearCtx();
		ctx.rotate(Math.PI*2/ spokes);	// Rotate the origin
		for (var i=0; i<spokes; i++) {
			ctx.rotate(Math.PI*2/ spokes);	// Rotate the origin
			ctx.strokeStyle = "rgba("+ color +","+ i/spokes +")";	// Set transparency
			ctx.beginPath();
			ctx.moveTo(0,8);
			ctx.lineTo(0,12);
			ctx.stroke();
		}
	}

	function clearCtx () {
		ctx.clearRect(-size/2, -size/2, size, size); // Clear the image
	}

	function creat(){
		inder_canvas = document.createElement('canvas');
		inder_canvas.width  = size;
		inder_canvas.height = size;
		loadbox.appendChild(inder_canvas);

		var txt = document.createElement('SPAN');
		txt.innerHTML = "Loading";
		loadbox.appendChild(txt);
		
		ctx = inder_canvas.getContext('2d');
		ctx.translate(size/2, size/2);     // Center the origin
		ctx.lineWidth = 4;
		ctx.lineCap = "round";
		
		drawThanStart();
	};

	

	$.extend($.loader, {
		init  : function(){
			init();
		},
		start : function(){
			start();
		},
		stop : function(){
			stop();
		}
	});
})(jQuery);


/******************************************************************************
*
* activity-indicator
*
*******************************************************************************/

(function($){
	var act_canvas, ctx;
	$.fn.actIndicator = function(opt){
		this.each(function() {
			var $this = $(this);
			if (opt !== 'STOP') {
				opt = $.extend({color: $this.css('color')}, $.fn.actIndicator.defaults, opt);
				//$.log(opt);
				act_canvas = document.createElement('canvas');
				act_canvas.width  = opt.size;
				act_canvas.height = opt.size;
				act_canvas.style.position = 'absolute';
				$(act_canvas).css({
					"-webkit-transition" : "-webkit-transform .2s"
				});
				this.appendChild(act_canvas);

				ctx = act_canvas.getContext('2d');
				ctx.translate(opt.size/2, opt.size/2);     // Center the origin
				ctx.lineWidth = opt.width;
				ctx.lineCap = "round";

				for (var i=0; i<spokes; i++) {
					ctx.rotate(Math.PI*2/ opt.spokes);	// Rotate the origin
					ctx.strokeStyle = "rgba("+ opt.color +","+ i/spokes +")";	// Set transparency
					ctx.beginPath();
					ctx.moveTo(0, opt.inner);
					ctx.lineTo(0,(opt.size/2) - 2);
					ctx.stroke();
				}
				$this.data('Indicator', opt);
			}else{
				
			}
		});
		return this;
	};
	$.fn.actIndicator.defaults = {
		color  : "0,0,0",
		size   : 40,      // canvas size
		spokes : 10 ,       // Number of spokes on the wheel
		inner  : 8,
		width  : 4
	};
})(jQuery);



/******************************************************************************
*
* 縣市選單
*
*******************************************************************************/
(function($){
	//縣市
	var aCity = new Array();
	aCity[1]='宜蘭縣';
	aCity[2]='基隆市';
	aCity[3]='台北市';
	aCity[4]='新北市';
	aCity[5]='桃園縣';
	aCity[6]='新竹市';
	aCity[7]='新竹縣';
	aCity[8]='苗栗縣';
	aCity[9]='台中市';
	aCity[10]='彰化縣';
	aCity[11]='南投縣';
	aCity[12]='雲林縣';
	aCity[13]='嘉義市';
	aCity[14]='嘉義縣';
	aCity[15]='台南市';
	aCity[16]='高雄市';
	aCity[17]='屏東縣';
	aCity[18]='台東縣';
	aCity[19]='花蓮縣';
	aCity[20]='澎湖縣';
	aCity[21]='金門縣';
	aCity[22]='連江縣';
	var aTown=new Array(); aTown[0]=new Array(); aTown[1]=new Array(); aTown[2]=new Array(); aTown[3]=new Array(); aTown[4]=new Array(); aTown[5]=new Array();    aTown[6]=new Array(); aTown[7]=new Array(); aTown[8]=new Array(); aTown[9]=new Array(); aTown[10]=new Array(); aTown[11]=new Array(); aTown[12]=new Array(); aTown[13]=new Array(); aTown[14]=new Array(); aTown[15]=new Array(); aTown[16]=new Array(); aTown[17]=new Array(); aTown[18]=new Array(); aTown[19]=new Array(); aTown[20]=new Array(); aTown[21]=new Array(); aTown[22]=new Array();
//鄉鎮市區 
// 1.宜蘭縣
aTown[1][0]="宜蘭市260"; aTown[1][1]="頭城鎮261"; aTown[1][2]="礁溪鄉262"; aTown[1][3]="壯圍鄉263"; aTown[1][4]="員山鄉264";aTown[1][5]="羅東鎮265"; aTown[1][6]="三星鄉266"; aTown[1][7]="大同鄉267"; aTown[1][8]="五結鄉268"; aTown[1][9]="冬山鄉269"; aTown[1][10]="蘇澳鎮270"; aTown[1][11]="南澳鄉272"; aTown[1][12]="釣魚台290";
// 2.基隆市
aTown[2][0]="仁愛區200"; aTown[2][1]="信義區201"; aTown[2][2]="中正區202";aTown[2][3]="中山區203";aTown[2][4]="安樂區204";aTown[2][5]="暖暖區205";aTown[2][6]="七堵區206";
// 3.台北市
aTown[3][0]="中正區100"; aTown[3][1]="大同區103"; aTown[3][2]="中山區104";aTown[3][3]="松山區105"; aTown[3][4]="大安區106"; aTown[3][5]="萬華區108";aTown[3][6]="信義區110"; aTown[3][7]="士林區111"; aTown[3][8]="北投區112";aTown[3][9]="內湖區114"; aTown[3][10]="南港區115"; aTown[3][11]="文山區116";
// 4.新北市
aTown[4][0]="萬里區207"; aTown[4][1]="金山區208"; aTown[4][2]="板橋區220";aTown[4][3]="汐止區221"; aTown[4][4]="深坑區222"; aTown[4][5]="石碇區223";aTown[4][6]="瑞芳區224"; aTown[4][7]="平溪區226"; aTown[4][8]="雙溪區227";aTown[4][9]="貢寮區228"; aTown[4][10]="新店區231"; aTown[4][11]="坪林區232"; aTown[4][12]="烏來區233"; aTown[4][13]="永和區234"; aTown[4][14]="中和區235";aTown[4][15]="土城區236"; aTown[4][16]="三峽區237"; aTown[4][17]="樹林區238";aTown[4][18]="鶯歌區239"; aTown[4][19]="三重區241"; aTown[4][20]="新莊區242";aTown[4][21]="泰山區243"; aTown[4][22]="林口區244"; aTown[4][23]="蘆洲區247"; aTown[4][24]="五股區248"; aTown[4][25]="八里區249";aTown[4][26]="淡水區251"; aTown[4][27]="三芝區252"; aTown[4][28]="石門區253";
// 5.桃園縣
aTown[5][0]="中壢市320"; aTown[5][1]="平鎮市324"; aTown[5][2]="龍潭鄉325"; aTown[5][3]="楊梅鎮326"; aTown[5][4]="新屋鄉327"; aTown[5][5]="觀音鄉328"; aTown[5][6]="桃園市330"; aTown[5][7]="龜山鄉333"; aTown[5][8]="八德市334"; aTown[5][9]="大溪鎮335"; aTown[5][10]="復興鄉336"; aTown[5][11]="大園鄉337"; aTown[5][12]="蘆竹鄉338";
// 6.新竹市
aTown[6][0]="東區300"; aTown[6][1]="北區300"; aTown[6][2]="香山區300";
// 7.新竹縣
aTown[7][0]="竹北市302"; aTown[7][1]="湖口鄉303"; aTown[7][2]="新豐鄉304"; aTown[7][3]="新埔鎮305"; aTown[7][4]="關西鎮306"; aTown[7][5]="芎林鄉307"; aTown[7][6]="寶山鄉308"; aTown[7][7]="竹東鎮310"; aTown[7][8]="五峰鄉311"; aTown[7][9]="橫山鄉312"; aTown[7][10]="尖石鄉313"; aTown[7][11]="北埔鄉314"; aTown[7][12]="峨嵋鄉315";
// 8.苗栗縣
aTown[8][0]="竹南鎮350"; aTown[8][1]="頭份鎮351"; aTown[8][2]="三灣鄉352"; aTown[8][3]="南庄鄉353"; aTown[8][4]="獅潭鄉354"; aTown[8][5]="後龍鎮356"; aTown[8][6]="通霄鎮357"; aTown[8][7]="苑裡鎮358"; aTown[8][8]="苗栗市360"; aTown[8][9]="造橋鄉361"; aTown[8][10]="頭屋鄉362"; aTown[8][11]="公館鄉363"; aTown[8][12]="大湖鄉364"; aTown[8][13]="泰安鄉365"; aTown[8][14]="銅鑼鄉366"; aTown[8][15]="三義鄉367"; aTown[8][16]="西湖鄉368"; aTown[8][17]="卓蘭鎮369";
// 9.台中市
aTown[9][0]="中區400"; aTown[9][1]="東區401"; aTown[9][2]="南區402"; aTown[9][3]="西區403"; aTown[9][4]="北區404"; aTown[9][5]="北屯區406"; aTown[9][6]="西屯區407"; aTown[9][7]="南屯區408"; aTown[9][8]="太平區411"; aTown[9][9]="大里區412"; aTown[9][10]="霧峰區413"; aTown[9][11]="烏日區414"; aTown[9][12]="豐原區420"; aTown[9][13]="后里區421"; aTown[9][14]="石岡區422"; aTown[9][15]="東勢區423"; aTown[9][16]="和平區424"; aTown[9][17]="新社區426"; aTown[9][18]="潭子區427"; aTown[9][19]="大雅區428"; aTown[9][20]="神岡區429"; aTown[9][21]="大肚區432"; aTown[9][22]="沙鹿區433"; aTown[9][23]="龍井區434"; aTown[9][24]="梧棲區435"; aTown[9][25]="清水區436"; aTown[9][26]="大甲區437"; aTown[9][27]="外埔區438"; aTown[9][28]="大安區439";
// 10.彰化縣
aTown[10][0]="彰化市500"; aTown[10][1]="芬園鄉502"; aTown[10][2]="花壇鄉503"; aTown[10][3]="秀水鄉504"; aTown[10][4]="鹿港鎮505"; aTown[10][5]="福興鄉506"; aTown[10][6]="線西鄉507"; aTown[10][7]="和美鎮508"; aTown[10][8]="伸港鄉509"; aTown[10][9]="員林鎮510"; aTown[10][10]="社頭鄉511"; aTown[10][11]="永靖鄉512"; aTown[10][12]="埔心鄉513", aTown[10][13]="溪湖鎮514", aTown[10][14]="大村鄉515", aTown[10][15]="埔鹽鄉516", aTown[10][16]="田中鎮520", aTown[10][17]="北斗鎮521", aTown[10][18]="田尾鄉522", aTown[10][19]="埤頭鄉523", aTown[10][20]="溪州鄉524", aTown[10][21]="竹塘鄉525", aTown[10][22]="二林鎮526", aTown[10][23]="大城鄉527", aTown[10][24]="芳苑鄉528", aTown[10][25]="二水鄉530";
// 11.南投縣
aTown[11][0]="南投市540", aTown[11][1]="中寮鄉541", aTown[11][2]="草屯鎮542", aTown[11][3]="國姓鄉544", aTown[11][4]="埔里鎮545", aTown[11][5]="仁愛鄉546", aTown[11][6]="名間鄉551", aTown[11][7]="集集鎮552", aTown[11][8]="水里鄉553", aTown[11][9]="魚池鄉555", aTown[11][10]="信義鄉556", aTown[11][11]="竹山鎮557",aTown[11][12]="鹿谷鄉558";
// 12.雲林縣
aTown[12][0]="斗南鎮630", aTown[12][1]="大埤鄉631", aTown[12][2]="虎尾鎮632", aTown[12][3]="土庫鎮633", aTown[12][4]="褒忠鄉634", aTown[12][5]="東勢鄉635", aTown[12][6]="臺西鄉636", aTown[12][7]="崙背鄉637", aTown[12][8]="麥寮鄉638", aTown[12][9]="斗六市640", aTown[12][10]="林內鄉643", aTown[12][11]="古坑鄉646", aTown[12][12]="莿桐鄉647", aTown[12][13]="西螺鎮648", aTown[12][14]="二崙鄉649", aTown[12][15]="北港鎮651", aTown[12][16]="水林鄉652", aTown[12][17]="口湖鄉653", aTown[12][18]="四湖鄉654", aTown[12][19]="元長鄉655";
// 13.嘉義市
aTown[13][0]="東區600", aTown[13][1]="西區600";
// 14.嘉義縣
aTown[14][0]="番路鄉602", aTown[14][1]="梅山鄉603", aTown[14][2]="竹崎鄉604", aTown[14][3]="阿里山605", aTown[14][4]="中埔鄉606", aTown[14][5]="大埔鄉607", aTown[14][6]="水上鄉608", aTown[14][7]="鹿草鄉611", aTown[14][8]="太保市612", aTown[14][9]="朴子市613", aTown[14][10]="東石鄉614", aTown[14][11]="六腳鄉615", aTown[14][12]="新港鄉616", aTown[14][13]="民雄鄉621", aTown[14][14]="大林鎮622", aTown[14][15]="溪口鄉623", aTown[14][16]="義竹鄉624", aTown[14][17]="布袋鎮625";
// 15.台南市
aTown[15][0]="中西區700", aTown[15][1]="東區701", aTown[15][2]="南區702", aTown[15][3]="北區704", aTown[15][4]="安平區708", aTown[15][5]="安南區709", aTown[15][6]="永康區710", aTown[15][7]="歸仁區711", aTown[15][8]="新化區712", aTown[15][9]="左鎮區713", aTown[15][10]="玉井區714", aTown[15][11]="楠西區715", aTown[15][12]="南化區716", aTown[15][13]="仁德區717", aTown[15][14]="關廟區718", aTown[15][15]="龍崎區719", aTown[15][16]="官田區720", aTown[15][17]="麻豆區721", aTown[15][18]="佳里區722", aTown[15][19]="西港區723", aTown[15][20]="七股區724", aTown[15][21]="將軍區725", aTown[15][22]="學甲區726", aTown[15][23]="北門區727", aTown[15][24]="新營區730", aTown[15][25]="後壁區731", aTown[15][26]="白河區732", aTown[15][27]="東山區733", aTown[15][28]="六甲區734", aTown[15][29]="下營區735", aTown[15][30]="柳營區736", aTown[15][31]="鹽水區737", aTown[15][32]="善化區741", aTown[15][33]="大內區742", aTown[15][34]="山上區743", aTown[15][35]="新市區744", aTown[15][36]="安定區745";
// 16.高雄市
aTown[16][0]="新興區800", aTown[16][1]="前金區801", aTown[16][2]="苓雅區802", aTown[16][3]="鹽埕區803", aTown[16][4]="鼓山區804", aTown[16][5]="旗津區805", aTown[16][6]="前鎮區806", aTown[16][7]="三民區807", aTown[16][8]="楠梓區811", aTown[16][9]="小港區812", aTown[16][10]="左營區813", aTown[16][11]="仁武區814", aTown[16][12]="大社區815", aTown[16][13]="東沙群島817", aTown[16][14]="南沙群島819", aTown[16][15]="岡山區820", aTown[16][16]="路竹區821", aTown[16][17]="阿蓮區822", aTown[16][18]="田寮區823", aTown[16][19]="燕巢區824", aTown[16][20]="橋頭區825", aTown[16][21]="梓官區826", aTown[16][22]="彌陀區827", aTown[16][23]="永安區828", aTown[16][24]="湖內區829", aTown[16][25]="鳳山區830", aTown[16][26]="大寮區831", aTown[16][27]="林園區832", aTown[16][28]="鳥松區833", aTown[16][29]="大樹區840", aTown[16][30]="旗山區842", aTown[16][31]="美濃區843", aTown[16][32]="六龜區844", aTown[16][33]="內門區845", aTown[16][34]="杉林區846", aTown[16][35]="甲仙區847", aTown[16][36]="桃源區848", aTown[16][37]="那瑪夏區849", aTown[16][38]="茂林區851", aTown[16][39]="茄萣區852";
// 17.屏東縣
aTown[17][0]="屏東市900", aTown[17][1]="三地門901", aTown[17][2]="霧臺鄉902", aTown[17][3]="瑪家鄉903", aTown[17][4]="九如鄉904", aTown[17][5]="里港鄉905", aTown[17][6]="高樹鄉906", aTown[17][7]="鹽埔鄉907", aTown[17][8]="長治鄉908", aTown[17][9]="麟洛鄉909", aTown[17][10]="竹田鄉911", aTown[17][11]="內埔鄉912", aTown[17][12]="萬丹鄉913", aTown[17][13]="潮州鎮920", aTown[17][14]="泰武鄉921", aTown[17][15]="來義鄉922", aTown[17][16]="萬巒鄉923", aTown[17][17]="崁頂鄉924", aTown[17][18]="新埤鄉925", aTown[17][19]="南州鄉926", aTown[17][20]="林邊鄉927", aTown[17][21]="東港鎮928", aTown[17][22]="琉球鄉929", aTown[17][23]="佳冬鄉931", aTown[17][24]="新園鄉932", aTown[17][25]="枋寮鄉940", aTown[17][26]="枋山鄉941", aTown[17][27]="春日鄉942", aTown[17][28]="獅子鄉943", aTown[17][29]="車城鄉944", aTown[17][30]="牡丹鄉945", aTown[17][31]="恆春鎮946", aTown[17][32]="滿州鄉947";
// 18.台東縣
aTown[18][0]="臺東市950", aTown[18][1]="綠島鄉951", aTown[18][2]="蘭嶼鄉952", aTown[18][3]="延平鄉953", aTown[18][4]="卑南鄉954", aTown[18][5]="鹿野鄉955", aTown[18][6]="關山鎮956", aTown[18][7]="海端鄉957", aTown[18][8]="池上鄉958", aTown[18][9]="東河鄉959", aTown[18][10]="成功鎮961", aTown[18][11]="長濱鄉962", aTown[18][12]="太麻里鄉963", aTown[18][13]="金峰鄉964", aTown[18][14]="大武鄉965", aTown[18][15]="達仁鄉966";
// 19.花蓮縣
aTown[19][0]="花蓮市970", aTown[19][1]="新城鄉971", aTown[19][2]="秀林鄉972", aTown[19][3]="吉安鄉973", aTown[19][4]="壽豐鄉974", aTown[19][5]="鳳林鎮975", aTown[19][6]="光復鄉976", aTown[19][7]="豐濱鄉977", aTown[19][8]="瑞穗鄉978", aTown[19][9]="萬榮鄉979", aTown[19][10]="玉里鎮981", aTown[19][11]="卓溪鄉982", aTown[19][12]="富里鄉983";
// 20.澎湖縣
aTown[20][0]="馬公市880", aTown[20][1]="西嶼鄉881", aTown[20][2]="望安鄉882", aTown[20][3]="七美鄉883", aTown[20][4]="白沙鄉884", aTown[20][5]="湖西鄉885";
// 21.金門縣
aTown[21][0]="金沙鎮890", aTown[21][1]="金湖鎮891", aTown[21][2]="金寧鄉892", aTown[21][3]="金城鎮893", aTown[21][4]="烈嶼鄉894", aTown[21][5]="烏坵鄉896";
// 22.連江縣
aTown[22][0]="南竿鄉209", aTown[22][1]="北竿鄉210", aTown[22][2]="莒光鄉211", aTown[22][3]="東引鄉212";
	
	var citySel,
		townSel,
		streetInput,
		options = {
			cityId : null,
			townId : null,
			streetId: null,
			cityDefTxt : '請選擇縣市',
			townDefTxt : '請選擇區域',
			initData : {
				city : 0,
				town : 0,
				street : ""
			}
	};

	$.selectCity = function(opt){
		$.extend(options, opt);

		aCity[0]   = options.cityDefTxt;
		aTown[0][0]= options.townDefTxt;

		citySel = document.getElementById(options.cityId);
		townSel = document.getElementById(options.townId);
		streetInput = document.getElementById(options.streetId);

		if(citySel.childElementCount === 0){
			creat_def_val();
		}else{
			addEvent();
		}
	};
	function addEvent () {
		$(citySel).change(function(){
			var selIndex = citySel.selectedIndex;
			$(townSel).empty();
			append_option(townSel, aTown[selIndex]);
			townSel.focus();

		});
	}
	function creat_def_val(){
		append_option(citySel, aCity);
		citySel.options[options.initData.city].selected = true;
		if(options.initData.town === 0){
			townSel.appendChild(new Option(options.townDefTxt, 0));
		}else{
			append_option(townSel, aTown[options.initData.city]);
			townSel.options[options.initData.town].selected = true;
		}
		streetInput.value = options.initData.street;
		addEvent();
	}

	function append_option (target, ary) {
		for (var i = 0; i < ary.length; i++){
			var newOpt = new Option(ary[i], i);
			target.appendChild( newOpt );
		}
	}

	$.extend($.selectCity, {
		aCity  : aCity,
		aTown  : aTown,
		append_option : function(target, ary) {
			append_option(target, ary);
		},
		getFullAddr : function(cidx, tidx){
			return aCity[cidx] + aTown[cidx][tidx];
		}
	});
})(jQuery);




/******************************************************************************
*
* mbox
*
*******************************************************************************/
(function($){
	var overlay,
		wrap,
		cont,
		isOpen = false,
		currentOpts = null;

	$.fn.mbox = function(opts){};

	$.mbox = function(opts){
		if( isOpen ){
			return ;
		}
		isOpen = true;
		currentOpts = $.extend({}, $.fn.mbox.defaults, opts);
		_show();
	};

	$.fn.mbox.defaults = {
		type           : 'BOX',    //BOX, ALERT, NAV_BOX
		arwPos         : 'CENTER',   //LEFT, CENTER, RIGHT

		overlayShow    : true,
		overlayOpacity : 0.5,
		overlayColor   : '#000',

		href           : null,
		padding        : 12
	};

	

	$.mbox.close = function () {
		var options = getCurrentOpts();

		overlayFadeOut(options);

		
		wrap.trans({
			translate:{x:0, y:0},
			css      : { 'opacity' : 0},
			onFinish : function(){
				$(this).hide();
				$.event.trigger('mbox-close');
				currentOpts = null;
				isOpen = false;
			}
		});
	};

	function init () {
		_draw();
	}
	
	function _show () {
		var options = getCurrentOpts();
		
		overlayFadeIn(options);

		var wrapCSS, wrapTop;
		switch( options.type ){
			case 'NAV_BOX' :
				wrapCSS = {	
					position : 'fixed'
				};
				wrapTop = 53;
			break;
		}

		wrapCSS = $.extend(wrapCSS, {
			'padding' : options.padding,
			'display' : 'block'
		});

		//$.log(wrapCSS);
		wrap.attr('class', options.arwPos.toLowerCase())
			.css(wrapCSS)
			.trans({
				translate :{x:0, y:wrapTop},
				css       : {'opacity' : 1}
			});

		if (options.href.indexOf("#") === 0) {
			var target = options.href.substr(options.href.indexOf("#"));
			$('<div class="mbox-tmp" />')
				.hide()
				.insertBefore( $(target) )
				.bind('mbox-close', function(){
					$(this).replaceWith(cont.children());
				});
			
			$(target).appendTo(cont);
		}
	}

	function _draw () {
		wrap = $("<div/>", {
			'id' : 'mbox'
		}).appendTo(document.body);

		overlay = $("<div/>", {
			'id' : 'overlay'
		}).appendTo(document.body);

		cont = $("<div/>",{
			'id' : 'mbox-cont'
		}).appendTo(wrap);

		$("<a/>",{
			'class' : 'close',
			'href'  : '#close',
			'html'  : '&times;'
		}).appendTo(wrap).click(function(){
			$.mbox.close();
			return false;
		});

		$("<span/>",{
			'class' : 'arw'
		}).appendTo(wrap);
	}

	function overlayFadeIn (options) {
		if( options.overlayShow){
			overlay.css({
				'backgroundColor' : options.overlayColor,
				'display' : 'block',
				'height'  : $(document).height()
			}).trans({
				css : {'opacity' : options.overlayOpacity}
			});
		}
	}
	function overlayFadeOut (options) {
		if( options.overlayShow){
			overlay.trans({
				css      : {'opacity' : 0},
				delay    : 200,
				onFinish : function(){
					$(this).hide();
				}
			});
		}
	}

	function getCurrentOpts () {
		if(currentOpts){
			return currentOpts;
		}
	}

	$.fn.trans = function(opts) {
		var reopts = $.extend({}, {
				duration : 0.2, 
				delay : 0, 
				onFinish : null }, opts);

		if($.fn.transition.supported){
			if(reopts.translate || reopts.scale || reopts.rotate){
				$(this).transformTransition(reopts);
			}else{
				$(this).transition(
					 reopts.css,
					{ delay    : reopts.delay,
					  duration : reopts.duration,
					  onFinish : reopts.onFinish
					}
				);
			}
		}
	};

	$(document).ready(init);

	$.extend($.mbox, {
		overlayFadeIn : function(){
			var options = getCurrentOpts();
			overlayFadeIn(options);
		},
		overlayFadeOut : function(){
			overlayFadeOut(options);
		}
	});
})(jQuery);







 /******************************************************************************
*
*  canvas 顯示tel,addr
*
*******************************************************************************/
$.extend($, {
  canvas: {}
});
$.extend($.canvas, {
  utf8_decode: function (str_data) {
    var tmp_arr = [],
        i = 0,
        ac = 0,
        c1 = 0,
        c2 = 0,
        c3 = 0;
    str_data += '';
    while (i < str_data.length) {
      c1 = str_data.charCodeAt(i);
      if (c1 < 128) {
        tmp_arr[ac++] = String.fromCharCode(c1);
        i++;
      } else if (c1 > 191 && c1 < 224) {
        c2 = str_data.charCodeAt(i + 1);
        tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = str_data.charCodeAt(i + 1);
        c3 = str_data.charCodeAt(i + 2);
        tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return tmp_arr.join('');
  },
  base64_decode: function (data) {
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        dec = "",
        tmp_arr = [];
    if (!data) {
      return data;
    }
    data += '';
    do { // unpack four hexets into three octets using index points in b64
      h1 = b64.indexOf(data.charAt(i++));
      h2 = b64.indexOf(data.charAt(i++));
      h3 = b64.indexOf(data.charAt(i++));
      h4 = b64.indexOf(data.charAt(i++));
      bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
      o1 = bits >> 16 & 0xff;
      o2 = bits >> 8 & 0xff;
      o3 = bits & 0xff;
      if (h3 == 64) {
        tmp_arr[ac++] = String.fromCharCode(o1);
      } else if (h4 == 64) {
        tmp_arr[ac++] = String.fromCharCode(o1, o2);
      } else {
        tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
      }
    } while (i < data.length);
    dec = tmp_arr.join('');
    dec = $.canvas.utf8_decode(dec);
    return dec;
  },
  draw: function (id, str, type) {
    var objCan = document.getElementById(id).getContext("2d");

    if(type === "tel"){
		objCan.font = "24pt helvetica";
	}else{
		objCan.font = "20pt Arial";
	}
	objCan.fillStyle = "#555";
    objCan.fillText(str, 0, 30);
  }
});





Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
/**/


$.enableConsole = true;
$.fn.log = $.log = $.fn.console = $.console = function(str, method){
method = (( method == undefined) ? "log" :  method );
if (window.console && console[method] && $.enableConsole)
	//console[method].apply(this, [].splice.call(arguments,1))
	console[method](str);
	return this;
};