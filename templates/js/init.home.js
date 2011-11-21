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
	$.searchPanel = function(){
		$("#kw-input").focus(function(){
			$("#search-bar").addClass("focus");
			$("#overlay").addClass("on search");
		}).blur(function(){
			if(window.Touch){
				removeFocus();
			}else{
				setTimeout(removeFocus, 500);
			}
		});
		
		//全部搜尋click
		$("#se-all-btn").click(function(){
			var k=$.trim($("#kw-input").val());
			document.location.href="?func=search_all_listing&k="+k;
		});
		
		//鄰近搜尋click
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
*  list menu
*
******************************************************************************/
(function($){
	var mainList,
		container,
		backBtnHeight = 35;   //上方黑色back 按鈕高
	$.menu = function(){
		mainList = document.getElementById("list");
		container = document.getElementById("container");
		//mainList.addEventListener('webkitTransitionEnd', searchBarVisibleOrNot, false);
		//mainList.addEventListener('transitionend',       searchBarVisibleOrNot, false);
		//mainList.addEventListener('oTransitionEnd',      searchBarVisibleOrNot, false);
		$("#near-cata > li > a, #all-cata > li > a").click(function(){
			if( $(this).parent("li").hasClass("current") ){;
				if($(mainList).hasClass("sub2")){
					//exit sub2
					mainList.className = "";
					container.className = "";
					fixHeightByName("auto");
					$(mainList).find(".current").removeClass("current");
				}else{
					//exit sub3
					$(this).siblings(".sub2").children('.current').removeClass('current');
					mainList.className = "sub2";
					fixHeightByName(".sub2", $(this));
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
		$("#all-cata .sub2 a").click(function(){
			var thisEl = $(this);
			/****
			* if sub3 is not exist than insert ul 
			****/
			if( thisEl.siblings(".sub3").length === 0 ){
				var param_data = {
						fn  : "get_menu",
						mid : $(this).get(0).className
					};
				$.ajax({
					data 	 : param_data,
					dataType : "html" ,
					//global: false,
					success  : function(html){
						thisEl.after(html);
						thisEl.parent("li").addClass("current");
						mainList.className = "sub3";
						fixHeightByName(".sub3", thisEl);
					}
				});
			}else{
				thisEl.parent("li").addClass("current");
				mainList.className = "sub3";
				fixHeightByName(".sub3", thisEl);
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