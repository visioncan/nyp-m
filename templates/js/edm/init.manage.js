function init () {
	if($(document.body).hasClass('uploadbyDOC')){
		$.upload({ by : "doc" });
		linkaddhost();
	}else if ($(document.body).hasClass('manage')){
		$.edmList();
		linkaddhost();
	}
	



	// 未登入就轉跳
	//$.log( parent.location = "http://yahoo.com");
};


function load() {
	helperResize();
}

function helperResize() {
	if(typeof parentHost == "undefined"){
		return;
	}
	var height = $(document.body).outerHeight();
	document.getElementById('framehelper').src = "//" + parentHost + "/framehelper.html?height=" + height + "&" + Math.random();
}

function linkaddhost() {
	//link 加 host
	if(typeof parentHost != "undefined"){
		$(".upload_link").each(function(){
			$(this).attr("href", $(this).attr("href") + "?host=" + parentHost);
		});
	}
}
/**********************************************
  manage list 
**********************************************/
(function($){
	var PUBLICLY_CLASS = ['off', 'on'];
	$.edmList = function(){
		$.toggleSwitcher({
			label : ["不公開","公開"],
			callback : function(val, switchObj){
				var parentEl = switchObj.parents("tr");
				var param_data = {
					'fn'   : 'dm_publicly',
					'dmid' : parentEl.attr("id"),
					'val'  : val
				};
				$.ajax({
					"type"     : "POST",
					"dataType" : "json",
					"url"      : "ajax.php",
					"data"     : $.param(param_data),
					"success"  : function(data){
						if(data.stat == 'success'){
							//$.log( parentEl );
							parentEl.attr('class', PUBLICLY_CLASS[val]);
						}
					}
           		});
			}
		});
		//del
		$("#edm-list .del").click(function(){
			var dmtitle = $(this).parent().siblings("h3").text();
			if( confirm("確定要刪除這本DM?\n「"+ dmtitle +"」")){
				//del
			}
			return false;
		});
	};
})(jQuery);




/**********************************************
  upload 
**********************************************/
(function($){
	var isUploading = false,
		uploadifyDefaults = {
			'script'    : '/uploadify.php',
			'folder'    : '/upload',
			'uploader'  : '/templates/swf/uploadify/uploadify.swf',
			'cancelImg' : '/templates/images/edm/upload_cancel_btn.gif',
			'wmode'     : 'transparent',
			'hideButton': true,
			'auto'      : true,
			'queueID'   : 'upload-process'
		},
		SelectRow   = $("#select-row"),
		Form        = $("#upload-form");
	$.upload = function(opt){
		switch(opt.by){
			case "doc" :
				uploadByDoc();
				break;
			case "img" :
				uploadByImg();
				break;
		}
	};

	function uploadByDoc () {
		var option = $.extend({}, uploadifyDefaults, {
			'width'     : 180,
		    'height'    : 45,
		    'fileExt'   : '*.pdf;*.doc;*.ppt',
		    'fileDesc'  : 'Document Files (.PDF, .DOC, .PPT)',
		    'multi'     : false,
		    'sizeLimit' : 102400000, // 100mb
		    'onSelect'  : function(event, ID, fileObj) {
		    	$("#uploader-box").addClass("uploading");
		    	$("#upload-detail-box").show();
		    	Form.find(".submit-btn").attr("disabled","disabled").addClass("disabled");
		    	Form.find("#title").val(fileObj.name);
		    	setTimeout(helperResize, 200);
		    },
			'onComplete': function(event, ID, fileObj, response, data) {
				
				Form.find(".submit-btn").removeAttr("disabled").removeClass("disabled").val("儲存");
				var successBox = $("<div/>",{ 'class' : 'success', 'html' : '上傳成功'});
		    	var outer      = $("<div/>",{ 'class' : 'uploadifyQueueItem'});

		    	$("<div/>",{
		    		'class' : "fileName",
		    		'html'  : fileObj.name
		    	}).appendTo(outer);

		    	$("<div/>",{
		    		'class' : "fileSize",
		    		'html'  : Math.round(fileObj.size / 1024 ) + "KB"
		    	}).appendTo(outer);
		    	
		    	setTimeout(function(){
		    		$("#upload-process").addClass("done").append(outer).append(successBox);

		    	}, 260);
			},
			'onError'   : function (event,ID,fileObj,errorObj) {
				alert(errorObj.type + ' Error: ' + errorObj.info);
			}
		});

		$('#upload-frame').css("minHeight", $("#upload-detail-box").height());
		$('#dm_upload').uploadify(option);
		formInit();
	}

	function uploadByImg () {
		
	}

	//////
	// form setting
	//////
	function formInit() {
		$.toggleSwitcher({
			label : ["不公開","公開"]
		});
		if( typeof(selectedKeywords) !== "undefined" )
			defaultWords = selectedKeywords;
	
		$("#keywords").autoSuggest("", {
			asHtmlID       : "keywords",
			startText      : "請輸入關鍵字" , 
			showResultList : false ,  //不顯示下拉
			preFill        : defaultWords
		});
		COL_category();
	}
	// + - 表單
	function COL_category(){
		SelectRow.delegate("button", "click", selectRowClick);
		SelectRow.delegate("select", "change", function(event){
			$(this).siblings(".chid").val( $(this).val() );
		});	
	}
	function selectRowClick(){
		//var Class = $(this).attr('class');
		var lng   = SelectRow.children(".select-row").length;

		if( $(this).hasClass("plus") && lng < 5){
				var orgElem = $(this).parent("span");
				var addCont = orgElem.clone();
				addCont.children("button").attr("class", "minus btn");
				addCont.children(".num").text(lng + 1);
				
				SelectRow.children(".altext").before(addCont);
				//orgElem.after(addCont);
				//$(this).parents(".input").append(  addCont );
				if( lng >= 4 )
					$(this).hide();
		}else{
				if( lng <= 5 )
					SelectRow.children(".select-row").eq(0).children("button").show();
				
				//改編號
				var minusid = $(this).next().text() - 1;
				for( var i = (minusid + 1); i<=4; i++){
					if( SelectRow.children(".select-row").eq(i).length > 0 ){
						SelectRow.children(".select-row").eq(i).children(".num").text(i);
					}
				}
				$(this).parent("span").remove();
		}
		helperResize();
	}



})(jQuery);










/************************  
	switch plugin 
************************/
/*
 * jQuery toggle Switch Plugin
 * Author: visioncan
 * date 2011-08-31
 * Copyright:
 * 
 * @example: $.toggleSwitcher();
 * @html: <input name="" type="switch" value="1" />
 * @param Object  callback - callback function on switchs
 * @return jQuery
*/
(function($){
	var defaults = {
		callback  : function(val, switchObj){},
		statclass : ["off", "on"],
		label     : ["OFF", "ON"]
	};
	$.toggleSwitcher = function(opt){
		//$.log( $("input[type=switch]") );
		var options = $.extend({}, defaults, opt);
		$("input[type=switch]").each(function(i, n){
			creatElement(n, options);
		});
	};
	
	$.fn.toggleSwitcher = function(opt){
		var options = $.extend({}, defaults, opt);
		creatElement(this.get(0), options);
	};
	
	function switchHandler(e){
		//console.log($(this).data("opt"));
		/*var Switcher = e.currentTarget,
			BG       = e.currentTarget.getElementsByClassName("bg"),
			Input    = e.currentTarget.children[0]*/
		var options  = $(this).data("opt");
		var Switcher = $(this),
			BG       = $(this).children(".bg"),
			Input    = $(this).children("input[type='hidden']");
		if( Switcher.hasClass("on") ){
			BG.stop().animate({ left: -42} , 180 , function(){
				Input.val(0);
				Switcher.removeClass("on").addClass("off");
				options.callback(0, Switcher);
				Switcher = BG = Input = null;
			});
		}else{
			BG.stop().animate({ left: 0} , 180 , function(){
				Input.val(1);
				Switcher.removeClass("off").addClass("on");
				options.callback(1, Switcher);
				Switcher = BG = Input = null;
			});
		}
	}
	
	function creatElement(target, options){
		var wrapClass = options.statclass[target.value];
		var wrap = $("<div/>",{
			'class'  : "switches " + wrapClass
		}).data("opt", options).click(switchHandler);
		$(target).wrap(wrap);	
		
		var bg = $("<div/>",{
			'class'  : "bg",
			'html'   : '<span class="on">'+ options.label[1] +'</span><span class="off">'+ options.label[0] +'</span>'
		}).insertAfter(target);
		
		var outter = $('<span class="lf"></span><span class="rt"></span>').insertAfter(bg);
		
		var input = $("<input/>",{
			type  : "hidden",
			name  : target.getAttribute("name"),
			value : target.value
		}).insertAfter(target);
		$(target).remove();
	}
})(jQuery);






$(document).ready(init);
window.onload = load;

$.enableConsole = true;
$.fn.log = $.log = $.fn.console = $.console = function(str, method){
method = (( method == undefined) ? "log" :  method );
if (window.console && console[method] && $.enableConsole)
	//console[method].apply(this, [].splice.call(arguments,1))
	console[method](str);
	return this;
};