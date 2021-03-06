function init(){
	mobiScreen.detect(); //螢幕判斷 加入最小可視高
	$.addTouchActive();
	$.loader.init();     //ajax 全域設定
	$.navBar();
	$(window).load($.geo()); //載入完後才作定位
	$.loadmore();
	$.citySel(); //縣市選單
	$.searchPanel();
}





(function($){
	var listEl,
		loadMoreEl,
		loadspin,
		load_spinner,
		scrollh,
		datajs = null,
		onDeskAllow  = 50,
		onTouchAllow = 200,
		hasMore      = false,
		isLoading    = false,
		spin_opt = {
			lines: 8,  
			length: 4,  
			width: 3,  
			radius: 4,  
			color: '#4D5972',  
			speed: 1.8, 
			trail: 50,  
			shadow: false
		};
	$.loadmore = function(){
		loadMoreEl = $("#loadmore");
		listEl     = $("#listing");

		if(listEl.children("li").length === 5){
			hasMore = true;
		}
		//初始載入電話地址
		load_more(true);
		if(window.Touch)
			touchScroll();
		else
			deskScroll();
	};

	function deskScroll(){
		$(window).scroll(function(){
			//debug();
			scrollh = $(document).height() - $(window).height();
       		if ( (scrollh - $(window).scrollTop()) < onDeskAllow ) {
        		if( hasMore )
        		load_more();
        	}
		});
	}
	function touchScroll () {
		document.body.ontouchmove = function(e){
			//debug();
			scrollh = $(document).height() - $(window).height();
			if ( (scrollh - window.pageYOffset ) < onTouchAllow ) {
        		if( hasMore )
        		load_more();
        	}
		};
	}

	function debug () {
		$("#header").html(window.pageYOffset  + "/" + $(window).scrollTop() + "/" + $(document).height() + "/" +  $(window).height());
		$.log( window.pageYOffset  + "/" + $(window).scrollTop() + "/" + $(document).height() + "/" +  $(window).height() );
	}



	function load_more (isinit) {
		if(isLoading)
		return;
		start_LoadingDraw();

		var param_data = {
			fn      : "get_more",
			last_id : listEl.children("li:last-child").attr("id"),
			init    : isinit ? 1 : 0
		};
		param_data = $.extend(param_data, isFavPage());
		//$.log( param_data );
		$.ajax({
			data 	 : param_data,
			cache    : false,
			success  : function(json){
				//datajs.src = json.url;
				addDataJSURL(json.url);
				$.log(json.url );
			}
		});
	}


	function addDataJSURL (url) {
		//建立script tag 
		if( !datajs ){
			datajs = document.createElement('SCRIPT');
			datajs.type = 'text/javascript';
			datajs.id   = "djs";
			datajs.src  = url;
			document.getElementsByTagName('head')[0].appendChild(datajs);
		}
	}
	function removeDataJS () {
		document.head.removeChild(document.getElementById('djs'));
		datajs = null;
	}



	function start_LoadingDraw(){
		isLoading = true;
		if(loadspin)
		return;
		loadspin = document.createElement('div');
		loadspin.className = 'spin';
		document.getElementById('loadmore').innerHTML = '正在載入更多..';
		document.getElementById('loadmore').appendChild(loadspin);
		document.getElementById('loadmore').className = "loading";
		load_spinner = new Spinner(spin_opt).spin(loadspin);
	}

	function clear_LoadingDraw() {
		isLoading = false;
		load_spinner.stop();
		document.getElementById('loadmore').innerHTML = '';
		document.getElementById('loadmore').className = "";
		loadspin = null;
	}


	function handleData () {
		eval($.canvas.base64_decode(_encode));
		var sid;
		if(typeof(isinit) !== 'undefined' && isinit ){
			for (var tmpsid in _canvas) {
				sid        = tmpsid.split("_")[1];
				var c_tel  = _canvas[tmpsid].tel;
		    	var c_addr = _canvas[tmpsid].addr;
		    	$.canvas.draw("tel_" + sid, c_tel, "tel");
		    	$.canvas.draw("addr_" + sid, c_addr);
			}
		}else{
			for (var tmpsid in _canvas) {
		    	sid          = tmpsid.split("_")[1];
		    	creatListLiEl({
		    		'vip'    : 1,
		    		'name'   : '義大世界',
		    		'sid'    : sid,
		    		//'imgsrc' : 'http://lorempixel.com/100/100/',
		    		'imgsrc' : 'none',  //沒有圖片
		    		'dist'   : '500',
		    		'tel'    : _canvas[tmpsid].tel,
		    		'addr'   : _canvas[tmpsid].addr
		    	});
		    }
		}
		hasMore = hasmore;
		if(!hasMore){
			document.getElementById('loadmore').style.display = "none";
		}
		//clear
		_encode = null;
		hasmore = null;
		isinit  = null;
	    removeDataJS();
	}

	function creatListLiEl (data) {
		var vipLabel = $('<span class="vip-label"></span>');
		var lia = $('<li><a href="">
			<span class="img"><img src="" alt=""></span>
			<h3></h3>
			<canvas class="tel" id="" height="40" width="380"></canvas>
			<canvas class="addr" id="" height="40" width="380"></canvas>
			</a><div class="dist"></div></li>');
		
		lia.attr("id", + data.sid);
		lia.find("a").attr("href", "/stores.php?" + data.sid);
		lia.find("h3").text(data.name);
		lia.find(".tel").attr("id", "tel_" + data.sid).drawText(data.tel, "tel");
		lia.find(".addr").attr("id", "addr_" + data.sid).drawText(data.addr);
		lia.find(".dist").text(data.dist + "公尺");
		if(data.imgsrc != 'none'){
			lia.find("img").attr("src", data.imgsrc);
		}else{
			lia.addClass('noimg');
		}
		
		if(data.vip){
			lia.append(vipLabel);
		}
		listEl.append(lia);
	}

	function isFavPage () {
		if($(document.body).hasClass("fav")){
			var o_cata = $("#order-cata-select").val();
			var o_city = $("#order-city-select").val();
			return {
				isfav      : true,
				order_cata : o_cata,
				order_city : o_city
			};
		}else{
			return {};
		}
	}

	$.fn.drawText = function(str, type){
		//$.log(this.get(0));
		var ctx = this.get(0).getContext("2d");
		if(type === "tel"){
			ctx.font = "24pt helvetica";
		}else{
			ctx.font = "20pt Arial";
		}
		ctx.fillStyle = "#555";
    	ctx.fillText(str, 0, 30);
	};



	$.extend($.loadmore, {
		done : function(){
			clear_LoadingDraw();
			handleData();
		}
	});


})(jQuery);




function hdldata(){
	$.loadmore.done();
	//$.log("call back !!");
}





/******************************************************************************
*
* 縣市選單
*
*******************************************************************************/
(function($){
	$.citySel = function(){
		//$.log($.selectCity.aCity);
		var listCitySel = document.getElementById("listing-city-select");
		if(listCitySel === null)
		return;
		$.selectCity.append_option(listCitySel, $.selectCity.aCity);
		$(listCitySel).change(function(){
			if( $(this).val() !== 0){
				$.log($(this).val());
			}
		});
	};
})(jQuery);





/******************************************************************************
*
*  search panel
*
******************************************************************************/
(function($){
	var timeId;
	$.searchPanel = function(){
		$("#kw-input").focus(function(){
			$("#search-bar").addClass("focus");
			if(!window.Touch){ 
				clearTimeout(timeId);
			}
		}).blur(function(){
			timeId = setTimeout(removeFocus, 1000);
		});

		$("#se-near-btn").click(function(){
			var gdata = $.geo.data();
			//$.log(gdata.geo);
			if(gdata.geo == 0){
				alert('您必需先定位您目前的位置才能搜尋喔!');
				return false;
			}
		});

	};
	function removeFocus () {
		$("#search-bar").removeClass("focus");
	}
})(jQuery);




$(document).ready(init);