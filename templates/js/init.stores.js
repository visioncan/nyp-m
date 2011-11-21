function init(){
	mobiScreen.detect(); //螢幕判斷 加入最小可視高
	$.loader.init();     //ajax 全域設定
	$.addTouchActive();  //加入 touch event
	$.profileSetting();  
	$(".diaview").dialogView();
}



/******************************************************************************
*
*  profile setting
*
******************************************************************************/
(function($){
	var datajs;
	$.profileSetting = function(){
		getProfile();
		$("#profile .more").click(function(){
			$("#profile").css("height","auto");
			$(this).parent("li").remove();
			return false;
		});
		
		$("#product a").click(function(){
			$.ajax({
				data 	 : "fn=get_products",
				success  : function(json){
					$.dialogView({
						aniType  : "slide",
						barColor : "#000",
						inViewFn : function(){
							$.galleryView.initWithPhotos(json);
						},
						outViewFn : function(){
							$.galleryView.close();
						}
					});
				}
			});
			return false;
		});

		$("#share-box").toggle(function(){
			$.loader.start();
		},function(){
			$.loader.stop();
		});
	};

	function getProfile () {
		var param_data = {
				fn  : "get_store_profile",
				sid : $("#corp-info").attr("sid")
			};
		$.ajax({
			data 	 : param_data,
			cache    : false,
			dataType : "json" ,
			success  : function(json){
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
	function handleData () {
		var _canvas = _encode;
		if( _canvas.tel.length === 1){
			$("#profile .more-tel").remove();
			//return;
		}
		$("#profile .tel:eq(0)").drawTel(_canvas.tel[0]); //主要的
		$("#profile .addr").drawAddr(_canvas.addr);
		creatMoreTel(_canvas.tel);
		//more tel click event 
		$("#profile .more-tel").click(function(){
			var addHeight =  parseInt(document.getElementById("profile").style.height) + 
							$("#profile .more-tel-list").height();
			//$.log( addHeight );
			$("#profile").css("height", addHeight);
			$("#profile .more-tel-list").show();
			$(this).hide();
			return false;
		});
	}

	function creatMoreTel (tel) {
		var moreEl = $("#profile .more-tel-list");
		for(var i = 1; i < tel.length; i++){
			var Li = $("<li/>");
			$("<div/>",{
				'class' : "tel"
			}).appendTo(Li).drawTel(tel[i]);
			Li.appendTo(moreEl);
		}
	}

	function slideShowHide(){
		document.body.addEventListener("touchmove", touchMove, false);
		document.body.addEventListener("touchend",  touchEnd, false);
		document.body.addEventListener("touchcancel", touchEnd, false);
	}
	function touchMove (e) {
		//e.preventDefault();
		document.getElementById('slide-show').className = 'onscroll';
	}

	function touchEnd (e) {
		document.getElementById('slide-show').className = '';
	}


	$.fn.drawTel = function(telobj){
		var labelEl = document.createElement("sup");
		var canvasEl = document.createElement("canvas");
		var cwidth = telobj.num.length * 18;
		canvasEl.width = cwidth;
		canvasEl.height = 36;
		canvasEl.style.width = (cwidth/2) + 'px';
		canvasEl.style.height = '18px';
		var ctx = canvasEl.getContext("2d");
		ctx.font = "bold 24pt helvetica";
		ctx.fillStyle = "#193555";
    	ctx.fillText(telobj.num, 0, 30);

    	labelEl.innerHTML = telobj.label;
		$(canvasEl).appendTo(this);
		$(labelEl).appendTo(this);
		this.addTouchActive();
		this.click(function(){
			window.location = "tel:" + telobj.num;
		});
	};

	$.fn.drawAddr = function(addr){
		var canvasEl = document.createElement("canvas");
		var cwidth = addr.length * 32;
		canvasEl.width = cwidth;
		canvasEl.height = 36;
		canvasEl.style.width = (cwidth/2) + 'px';
		canvasEl.style.height = '18px';
		var ctx = canvasEl.getContext("2d");
		ctx.font = "bold 24pt arial";
		ctx.fillStyle = "#193555";
    	ctx.fillText(addr, 0, 30);
		$(canvasEl).appendTo(this);
		this.addTouchActive();
		this.click(function(){
			window.location = "http://maps.google.com/maps?q=" + addr;
		});
	};

	$.extend($.profileSetting, {
		done : function(){
			handleData();
		}
	});
})(jQuery);


function hdldata(){
	$.profileSetting.done();
}















$(document).ready(init);