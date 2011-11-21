function init(){
	mobiScreen.detect(); //螢幕判斷 加入最小可視高
	$.addTouchActive();
	$.loader.init();     //ajax 全域設定
	$.searchPanel();     //搜尋框
	$.menu();            //catalog menu
	$.navBar();
	$(window).load(function(){$.geo()}); //載入完後才作定位
}



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
			$("#overlay").addClass("on search");
			if(!window.Touch){ 
				clearTimeout(timeId);
			}
		}).blur(function(){
			if(window.Touch){
				removeFocus();
			}else{
				timeId = setTimeout(removeFocus, 500);
			}
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
		$("#overlay").removeClass("on search");
	}
})(jQuery);





/******************************************************************************
*
.__  .__          __   
|  | |__| _______/  |_ 
|  | |  |/  ___/\   __\
|  |_|  |\___ \  |  |  
|____/__/____  > |__|  
             \/  
*
******************************************************************************/
(function($){
	var mainList,
		container,
		backBtnHeight = 35;   //上方黑色back 按鈕高
	$.menu = function(){
		mainList = document.getElementById("list");
		container = document.getElementById("container");

		$("#near-cata > li > a, #all-cata > li > a").click(function(){
			if( $(this).parent("li").hasClass("current") ){;
				if($(mainList).hasClass("sub2")){
					//exit sub2
					mainList.className = "";
					container.className = "";
					fixHeightByName("auto");
					$(mainList).find(".current").removeClass("current");
				}else if($(mainList).hasClass("sub3")){
					//exit sub3
					$(this).siblings(".sub2").children('.current').removeClass('current');
					mainList.className = "sub2";
					fixHeightByName(".sub2", $(this));
				}else if($(mainList).hasClass("sub4")){
					//exit sub4
					$(mainList).find('.sub3 .current').removeClass('current');
					mainList.className = "sub3";
					fixHeightByName(".sub3", $(this).siblings(".sub2").find(".current a"));
				}
			}else{
				//進入第2階
				if($(this).parent().parent("ul").get(0).id === "near-cata"){
					if(isGeo() == 0){
						alert("提醒您! 你必需要先定位您的位置，才能作搜尋「鄰近店家」喔");
						$.navBar.openGeo();
						return false;
					}
				}
				$(this).parent("li").addClass("current");
				mainList.className = "sub2";
				container.className = "insub";
				fixHeightByName(".sub2", $(this));

			}
			return false;
		});
		//所有分類-進入第3階
		//子階
		$("#all-cata .sub2").delegate("a", "click", function(){
			var thisEl = $(this);
			var currentSub = parseInt(thisEl.parent().parent("ul").get(0).className.substring(3));
			var targetGata = targetGata = currentSub + 1;

			if( thisEl.attr("href") !== "#" ){
				window.location = thisEl.attr("href");
				return false;
			}
			if( thisEl.siblings(".sub" + targetGata).length === 0 ){
				
				var param_data = {
					fn   : "get_menu",
					sub  : targetGata,
					goid : $(this).attr("goid"),
					cls  : $(this).get(0).className
				};
				$.ajax({
					data 	 : param_data,
					dataType : "html" ,
					success  : function(html){
						thisEl.after(html);
						thisEl.parent("li").addClass("current");
						mainList.className = "sub" + targetGata;
						fixHeightByName(".sub"+targetGata, thisEl);
					}
				});
				//$.log(param_data);
			}else{
				thisEl.parent("li").addClass("current");
				mainList.className = "sub" + targetGata;
				fixHeightByName(".sub" + targetGata, thisEl);
			}
			return false;
		});
	};

	function isGeo() {
		var geoInfo = $.geo.data();
		return geoInfo.geo;
	}

	function fixHeightByName(nameType, target) {
		if(nameType === "auto"){
			mainList.style.height = "auto";
		}else{
			mainList.style.height = (target.siblings(nameType).height() + backBtnHeight) + "px";
		}
	}

})(jQuery);












$(document).ready(init);