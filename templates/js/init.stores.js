function init(){
	mobiScreen.detect(); //螢幕判斷 加入最小可視高
	$.loader.init();     //ajax 全域設定
	$.addTouchActive();  //加入 touch event
	$.profileSetting();  
}



/******************************************************************************
*
*  profile setting
*
******************************************************************************/
(function($){
	$.profileSetting = function(){
		$("#profile .more").click(function(){
			$("#profile").css("height","auto");
			$(this).parent("li").remove();
			return false;
		});
		$("#profile .more-tel").click(function(){
			var addHeight =  parseInt(document.getElementById("profile").style.height) + 
							$("#profile .more-tel-list").height();
			//$.log( addHeight );
			$("#profile").css("height", addHeight);
			$("#profile .more-tel-list").show();
			$(this).hide();
			return false;
		});
		$("#product a").click(function(){
			$.ajax({
				data 	 : "fn=get_products",
				success  : function(json){
					$.intoDialogView({
						aniType  : "slide",
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

		//slideShowHide();
	};

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
})(jQuery);

















$(document).ready(init);