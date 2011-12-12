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
		if( browser.versions.android ){
			$(document.body).addClass('android');
		}
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
			currentOpts = $.extend({}, defaults, {
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
		currentOpts = options = $.extend({}, defaults, opt);
		//$.log(options);
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
		document.getElementById("diaview").style.height = "100%";
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
		document.getElementById("diaview").style.height = "auto";
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
	aCity[1]  ='宜蘭縣';
	aCity[2]  ='花蓮縣';
	aCity[3]  ='基隆市';
	aCity[4]  ='新北市';
	aCity[5]  ='桃園縣';
	aCity[6]  ='台北市';
	aCity[7]  ='新竹縣市';
	aCity[8]  ='苗栗縣';
	aCity[9]  ='台中市';
	aCity[11] ='彰化縣';
	aCity[12] ='南投縣';
	aCity[13] ='雲林縣';
	aCity[14] ='嘉義縣市';
	aCity[15] ='台南市';
	aCity[17] ='澎湖縣';
	aCity[18] ='高雄市';
	aCity[20] ='金門縣';
	aCity[21] ='屏東縣';
	aCity[22] ='台東縣';
	aCity[23] ='馬祖';
	var aTown=new Array(); aTown[0]=new Array();
	//鄉鎮市區 
	// 1.宜蘭縣
	aTown[1]= new Array("宜蘭市260","頭城鎮261","礁溪鄉262","壯圍鄉263","員山鄉264","羅東鎮265","三星鄉266","大同鄉267","五結鄉268","冬山鄉269","蘇澳鎮270","南澳鄉272","釣魚台290");
	// 2.花蓮縣
	aTown[2]= new Array("花蓮市970","新城鄉971","秀林鄉972","吉安鄉973","壽豐鄉974","鳳林鎮975","光復鄉976","豐濱鄉977","瑞穗鄉978","萬榮鄉979","玉里鎮981","卓溪鄉982","富里鄉983");
	// 3.基隆市
	aTown[3]= new Array("仁愛區200","信義區201","中正區202","中山區203","安樂區204","暖暖區205","七堵區206");
	// 4.新北市
	aTown[4]= new Array("萬里區207","金山區208","板橋區220","汐止區221","深坑區222","石碇區223","瑞芳區224","平溪區226","雙溪區227","貢寮區228","新店區231","坪林區232","烏來區233","永和區234","中和區235","土城區236","三峽區237","樹林區238","鶯歌區239","三重區241","新莊區242","泰山區243","林口區244","蘆洲區247","五股區248","八里區249","淡水區251","三芝區252","石門區253");
	// 5.桃園縣
	aTown[5]= new Array("中壢市320","平鎮市324","龍潭鄉325","楊梅鎮326","新屋鄉327","觀音鄉328","桃園市330","龜山鄉333","八德市334","大溪鎮335","復興鄉336","大園鄉337","蘆竹鄉338");
	// 6.台北市
	aTown[6]= new Array("中正區100","大同區103","中山區104","松山區105","大安區106","萬華區108","信義區110","士林區111","北投區112","內湖區114","南港區115","文山區116");
	// 7.新竹縣市
	aTown[7] = new Array("東區300", "北區300", "香山區300", "竹北市302","湖口鄉303","新豐鄉304","新埔鎮305","關西鎮306","芎林鄉307","寶山鄉308","竹東鎮310","五峰鄉311","橫山鄉312","尖石鄉313","北埔鄉314","峨嵋鄉315");
	// 8.苗栗縣
	aTown[8]= new Array("竹南鎮350","頭份鎮351","三灣鄉352","南庄鄉353","獅潭鄉354","後龍鎮356","通霄鎮357","苑裡鎮358","苗栗市360","造橋鄉361","頭屋鄉362","公館鄉363","大湖鄉364","泰安鄉365","銅鑼鄉366","三義鄉367","西湖鄉368","卓蘭鎮369");
	// 9.台中市
	aTown[9]= new Array("中區400","東區401","南區402","西區403","北區404","北屯區406","西屯區407","南屯區408","太平區411","大里區412","霧峰區413","烏日區414","豐原區420","后里區421","石岡區422","東勢區423","和平區424","新社區426","潭子區427","大雅區428","神岡區429","大肚區432","沙鹿區433","龍井區434","梧棲區435","清水區436","大甲區437","外埔區438","大安區439");
	// 10.彰化縣
	aTown[11]= new Array("彰化市500","芬園鄉502","花壇鄉503","秀水鄉504","鹿港鎮505","福興鄉506","線西鄉507","和美鎮508","伸港鄉509","員林鎮510","社頭鄉511","永靖鄉512","埔心鄉513","溪湖鎮514","大村鄉515","埔鹽鄉516","田中鎮520","北斗鎮521","田尾鄉522","埤頭鄉523","溪州鄉524","竹塘鄉525","二林鎮526","大城鄉527","芳苑鄉528","二水鄉530");
	// 11.南投縣
	aTown[12]= new Array("南投市540","中寮鄉541","草屯鎮542","國姓鄉544","埔里鎮545","仁愛鄉546","名間鄉551","集集鎮552","水里鄉553","魚池鄉555","信義鄉556","竹山鎮557","鹿谷鄉558");
	// 12.雲林縣
	aTown[13]= new Array("斗南鎮630","大埤鄉631","虎尾鎮632","土庫鎮633","褒忠鄉634","東勢鄉635","臺西鄉636","崙背鄉637","麥寮鄉638","斗六市640","林內鄉643","古坑鄉646","莿桐鄉647","西螺鎮648","二崙鄉649","北港鎮651","水林鄉652","口湖鄉653","四湖鄉654","元長鄉655");
	// 14.嘉義縣市
	aTown[14]= new Array("東區600","西區600","番路鄉602","梅山鄉603","竹崎鄉604","阿里山605","中埔鄉606","大埔鄉607","水上鄉608","鹿草鄉611","太保市612","朴子市613","東石鄉614","六腳鄉615","新港鄉616","民雄鄉621","大林鎮622","溪口鄉623","義竹鄉624","布袋鎮625");
	// 15.台南市
	aTown[15]= new Array("中西區700","東區701","南區702","北區704","安平區708","安南區709","永康區710","歸仁區711","新化區712","左鎮區713","玉井區714","楠西區715","南化區716","仁德區717","關廟區718","龍崎區719","官田區720","麻豆區721","佳里區722","西港區723","七股區724","將軍區725","學甲區726","北門區727","新營區730","後壁區731","白河區732","東山區733","六甲區734","下營區735","柳營區736","鹽水區737","善化區741","大內區742","山上區743","新市區744","安定區745");
	// 17.澎湖縣
	aTown[17]= new Array("馬公市880","西嶼鄉881","望安鄉882","七美鄉883","白沙鄉884","湖西鄉885");
	// 18.高雄市
	aTown[18]= new Array("新興區800","前金區801","苓雅區802","鹽埕區803","鼓山區804","旗津區805","前鎮區806","三民區807","楠梓區811","小港區812","左營區813","仁武區814","大社區815","東沙群島817","南沙群島819","岡山區820","路竹區821","阿蓮區822","田寮區823","燕巢區824","橋頭區825","梓官區826","彌陀區827","永安區828","湖內區829","鳳山區830","大寮區831","林園區832","鳥松區833","大樹區840","旗山區842","美濃區843","六龜區844","內門區845","杉林區846","甲仙區847","桃源區848","那瑪夏區849","茂林區851","茄萣區852");
	// 21.屏東縣
	aTown[21]= new Array("屏東市900","三地門901","霧臺鄉902","瑪家鄉903","九如鄉904","里港鄉905","高樹鄉906","鹽埔鄉907","長治鄉908","麟洛鄉909","竹田鄉911","內埔鄉912","萬丹鄉913","潮州鎮920","泰武鄉921","來義鄉922","萬巒鄉923","崁頂鄉924","新埤鄉925","南州鄉926","林邊鄉927","東港鎮928","琉球鄉929","佳冬鄉931","新園鄉932","枋寮鄉940","枋山鄉941","春日鄉942","獅子鄉943","車城鄉944","牡丹鄉945","恆春鎮946","滿州鄉947");
	// 22.台東縣
	aTown[22]= new Array("臺東市950","綠島鄉951","蘭嶼鄉952","延平鄉953","卑南鄉954","鹿野鄉955","關山鎮956","海端鄉957","池上鄉958","東河鄉959","成功鎮961","長濱鄉962","太麻里鄉963","金峰鄉964","大武鄉965","達仁鄉966");
	// 21.金門縣
	aTown[20]= new Array("金沙鎮890","金湖鎮891","金寧鄉892","金城鎮893","烈嶼鄉894","烏坵鄉896");
	// 22.連江縣
	aTown[23]= new Array("南竿鄉209","北竿鄉210","莒光鄉211","東引鄉212");
	
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
		$(citySel).bind("change", function(){
			var selIndex = citySel.value;
			$(townSel).empty();
			$.log(selIndex);
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
		for (var i in ary){
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
		padding        : 12,
		onStart        : function(){},
		onClose        : function(){}
	};

	

	$.mbox.close = function () {
		var options = getCurrentOpts();

		overlayFadeOut(options);

		
		wrap.trans({
			translate:{x:0, y:0},
			css      : { 'opacity' : 0},
			onFinish : function(){
				wrap.hide();
				$.event.trigger('mbox-close');
				currentOpts = null;
				isOpen = false;
			}
		});
		options.onClose();
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
					//position : 'fixed'
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
		options.onStart();
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
		}else{
			return $.extend({}, $.fn.mbox.defaults);
		}
	}

	$.fn.trans = function(opts) {
		var reopts = $.extend({}, {
				duration : 0.2, 
				delay : 0, 
				onFinish : function(){} }, opts);
		
		if(browser.versions.android){
			if( reopts.translate ){
				reopts.css = $.extend({
					top : reopts.translate.y
				}, reopts.css);
			}
			$(this).css(reopts.css);
			reopts.onFinish();
		}else if($.fn.transition.supported){
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
			var options = getCurrentOpts();
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



 /******************************************************************************
*
*  browser
*
*******************************************************************************/
var browser = {versions:function(){
			var u = navigator.userAgent, app = navigator.appVersion;
			return { 
				trident: u.indexOf('Trident') > -1, //IE核
				presto: u.indexOf('Presto') > -1, //opera核
				webKit: u.indexOf('AppleWebKit') > -1, //蘋果、谷歌核
				gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,//火狐核
				mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否為移動
				ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios
				android: u.indexOf('Android') > -1, //android
				iPhone: u.indexOf('iPhone') > -1, //是否為iPhone
				iPad: u.indexOf('iPad') > -1, //是否iPad
				webApp: u.indexOf('Safari') == -1, //是否web應該程序，沒有頭部與底部,
				app: app
				};
}()};



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