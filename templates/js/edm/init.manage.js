function init () {
	if($(document.body).hasClass('uploadbyDOC')){
		$.uploadTabs();
		$.upload({ by : "doc" });
	}else if($(document.body).hasClass('uploadbyIMG')){
		$.uploadTabs();
		$.upload({ by : "img" });
	}else if ($(document.body).hasClass('manage')){
		$.edmList();
	}else if ($(document.body).hasClass('sort-img')){
		$.uploadTabs();
		$.sortDm();
	}else if ($(document.body).hasClass('edit-edm')){
		$.editDM();
	}

	linkaddhost();



	// 未登入就轉跳
	//$.log( parent.location = "http://yahoo.com");

	//ajax 全域設定
	$.ajaxSetup({
		url  : '/ajax.php',
		type : "POST" ,
		dataType : "json"
	});
};


var parentHost;
function load() {
	helperResize();
}

function helperResize() {
	parentHost = getHostVars();
	if(parentHost == ''){
		return;
	}
	var height = $(document.body).outerHeight();
	document.getElementById('framehelper').src = "//" + parentHost + "/framehelper.html?height=" + height + "&" + Math.random();
}

function linkaddhost() {
	//link 加 host
	var urlparam = $.uploadTabs.getParams();
	$(".upload_link, #edm-list a, .addnew").each(function(){
		$(this).attr("href", $(this).attr("href") + "?" + $.param(urlparam));
	});
}

function getHostVars() {
	if(window.location.href.indexOf("?") == -1 || window.location.href.indexOf('host=') == -1){
		return '';
	}
	var vars = [],
		hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for(var i = 0; i < hashes.length; i++){
		var hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
	}
	return vars.host;
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
  upload tabs
**********************************************/
(function($){
	$.uploadTabs = function(){
		$("#tabs li").eq(0).click(function() {
			if (!$(this).hasClass("current")) {
				var urlparam = getParams();
				urlparam['type'] = 'img';
				window.location = "dm_upload.php?" + $.param(urlparam);
			}
		});
		$("#tabs li").eq(1).click(function() {
			if (!$(this).hasClass("current")) {
				var urlparam = getParams();
				delete urlparam['type'];
				window.location = "dm_upload.php?" + $.param(urlparam);
			}
		});
	};
	function getParams(){
		var url = window.location.href;
		if (url.indexOf("?") == -1) {
			return {};
		}else{
			var paraString = url.substring(url.indexOf("?")+1,url.length).split("&"); 
			var paramObj = {};
			for (i=0; j = paraString[i]; i++){ 
				paramObj[j.substring(0, j.indexOf("="))] = j.substring(j.indexOf("=")+1, j.length); 
			}
			return paramObj;
		}
	}

	$.extend($.uploadTabs, {
		getParams : function(){
			return getParams();
		}
	});

})(jQuery);


/**********************************************
  upload 
**********************************************/
(function($){
	var isSelected = false,
		uploadifyDefaults = {
			'script'    : '/uploadify.php',
			'folder'    : '/upload',
			'uploader'  : '/templates/swf/uploadify/uploadify.swf',
			'cancelImg' : '/templates/images/edm/upload_cancel_btn.gif',
			'wmode'     : 'transparent',
			'hideButton': true,
			'auto'      : true,
			'queueID'   : 'upload-process',
			'onError'   : function (event,ID,fileObj,errorObj) {
				alert(errorObj.type + ' Error: ' + errorObj.info);
			}
		},
		SelectRow   = $("#select-row"),
		Form        = $("#upload-form"),
		codeBox     = $("#embed-code-box"),
		codeTextArea;
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

	/* upload by doc  */
	function uploadByDoc () {
		var option = $.extend({}, uploadifyDefaults, {
			'width'     : 180,
		   'height'    : 45,
		   'fileExt'   : '*.pdf;*.doc;*.ppt',
		   'fileDesc'  : '文件 (.PDF, .DOC, .PPT)',
		   'multi'     : false,
		   'sizeLimit' : 102400000, // 100mb
		   'onSelect'  : function(event, ID, fileObj) {
		   		isSelected = true;
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
		    	var size       = Math.round(fileObj.size / 1024 );
		    	if (size > 1000) {
		    		size = Math.round(size *.001 * 100) * .01;
		    		size = size.toString() + 'MB';
		    	}else{
		    		size = size.toString() + 'KB';
		    	}

		    	$("<div/>",{
		    		'class' : "fileName",
		    		'html'  : fileObj.name + '<span class="fileSize">'+ size +'</span>'
		    	}).appendTo(outer);
		    	
		    	setTimeout(function(){
		    		$("#upload-process").addClass("done").css('backgroundColor','#EAFDDB').append(outer).append(successBox);
		    	}, 260);
			}
		});

		$('#upload-frame').css("minHeight", $("#upload-detail-box").height());
		$('#dm_upload').uploadify(option);
		formInit();
	}

	/* upload by img  */
	function uploadByImg () {
		var option = $.extend({}, uploadifyDefaults, {
			'width'     : 180,
		   'height'    : 45,
		   'fileExt'   : '*.jpg;*.png;',
		   'fileDesc'  : '圖片 (.JPG, .PNG)',
		   'multi'     : true,
		   'sizeLimit' : 5120000, // 5mb
		   'onSelectOnce' : function(event, data) {
		   		isSelected = true;
		    	$("#uploader-box").addClass("uploading");
		    	$("#upload-detail-box").show();
		    	$("#upload-process").css('height',174);
		    	Form.find(".submit-btn").attr("disabled","disabled").addClass("disabled");
		    	setTimeout(helperResize, 200);
		   },
		   'onAllComplete' : function(event, data) {
		   	Form.find(".submit-btn").removeAttr("disabled").removeClass("disabled").val("儲存並排序");
		   	Form.children("form").attr("action", "/dm_sort.php?host=" + parentHost);
		   	var successBox = $("<div/>",{ 'class' : 'success', 'html' : '上傳成功', 'css' : {'top':'20px'} });
		    	var outer      = $("<div/>",{ 'class' : 'uploadifyQueueItem'});
		    	var size       = Math.round(data.allBytesLoaded / 1024 );
		    	if (size > 1000) {
		    		size = Math.round(size *.001 * 100) * .01;
		    		size = size.toString() + 'MB';
		    	}else{
		    		size = size.toString() + 'KB';
		    	}
		    	$("<div/>",{
		    		'class' : "fileName",
		    		'html'  : '已完成上傳' + data.filesUploaded +'個 ('+ size +') 檔案。'
		    	}).appendTo(outer);

		    	setTimeout(function(){
		    		$("#upload-process").addClass("done").css({'height':38, 'backgroundColor':'#EAFDDB'}).append(outer).append(successBox);
		    	}, 260);
		    	setTimeout(helperResize, 270);
		   }
		});

		$('#upload-frame').css("minHeight", $("#upload-detail-box").height());
		$('#dm_upload').uploadify(option);
		formInit();
	}

	//////
	// form setting
	//////
	function formInit() {
		$("input[name='ispublic']").toggleSwitcher({
			label : ["不公開","公開"]
		});
		$("input[name='isembed']").toggleSwitcher({
			label    : ["不公開","公開"],
			callback : function(val, switchObj){
				openEmbedCode(val);
			}
		});
		if ($("input[name='isembed']").val() === "1") {
			openEmbedCode(1);
		};

		if( typeof(selectedKeywords) !== "undefined" )
			defaultWords = selectedKeywords;
	
		$("#keywords").autoSuggest("", {
			asHtmlID       : "keywords",
			startText      : "請輸入關鍵字" , 
			showResultList : false , 
			preFill        : defaultWords
		});
		COL_category();
		verifyForm();
	}

	//驗證表單
	function verifyForm(){
		Form.children("form").submit(function() {
			if($("#title").val() == "") {
				alert("標題未填寫");
				return false;
			}else if($("#descr").val() == "") {
				alert("描述未填寫");
				return false;
			}else{
				isSelected = false;
				return true;
			}
		});
	}

	// + - 表單
	function COL_category(){
		SelectRow.delegate("button", "click", selectRowClick);
		SelectRow.delegate("select", "change", function(event){
			$(this).siblings(".chid").val( $(this).val() );
		});	
	}
	function selectRowClick(){
		var lng   = SelectRow.children(".select-row").length;

		if( $(this).hasClass("plus") && lng < 5){
				var orgElem = $(this).parent("span");
				var addCont = orgElem.clone();
				addCont.children("button").attr("class", "minus btn");
				addCont.children(".num").text(lng + 1);
				SelectRow.children(".altext").before(addCont);
				if( lng >= 4 )
					$(this).hide();
		}else{
				if( lng <= 5 )
					SelectRow.children(".select-row").eq(0).children("button").show();
				
				//改編號
				
				var minususid = $(this).next().text() - 1;
				
				for( var i = (minususid + 1); i<=4; i++){
					if( SelectRow.children(".select-row").eq(i).length > 0 ){
						SelectRow.children(".select-row").eq(i).children(".num").text(i);
					}
				}
				$(this).parent("span").remove();
		}
		helperResize();
	}
	//embed code
	function openEmbedCode(value){
		if (value == 1) {
			codeTextArea = codeText();
			codeTextArea.appendTo("#embed-code-box");
			codeTextArea.focus(function(){
				this.select();
			}).mouseup(function(){
        		return false;
			});
			codeBox.css("height", 80);
		}else{
			codeTextArea.remove();
			codeBox.css("height", 0);
		}
	}
	//
	function codeText(){
		var rtEle;
		if (typeof codeTextArea != undefined || $("#embed-code").length == 0) {
			rtEle = $("<textarea/>", {
				'id'   : "embed-code",
				'text' : embedCode.generate(),
				'css' : { 'fontFamily': 'monospace', 'height' : 55, 'color' : '#666', 'padding' : '8px' }
			});
		}
		return rtEle;
	}

	$.extend($.upload, {
		formInit : function(){
			formInit();
		},
		isSelected : function(){
			return isSelected;
		}
	});
})(jQuery);





/**********************************************
  embed player 
**********************************************/
var embedCode = {
	'host' : "http://172.17.10.158:92/",
	'size' : {
		w : 560,
		h : 340
	},
	'generate' : function() {
		var codeWrap =  $("<div/>");
		$("<iframe/>",{
			'Width' : embedCode.size.w,
			'Height' : embedCode.size.h,
			'frameborder' : 0,
			'allowfullscreen' : true,
			'src' : embedCode.host + "embed/" + $(document.body).attr("dm_id")
		}).appendTo(codeWrap);
		return codeWrap.html();
	}
};






/**********************************************
  sort 
**********************************************/
(function($){
	$.sortDm = function(){
		$("#sortlist").sortable({ 
			'cursor'  : 'move' ,
			'opacity' : 1,
			'update'  : function(event, ui){
				refreshPageSpacing();
				addPagenum();
			}
		});
		$("#sortlist").disableSelection();
		delPageEvent();
		addPagenum();

		$(".save-sort").click(function(){
			$.log( $("#sortlist").sortable('toArray'));
		});
		setTimeout(helperResize, 200);
	};
	function refreshPageSpacing(){
		$("#sortlist .even").removeClass("even");
		$("#sortlist li:even").addClass("even");
	}

	function addPagenum(){
		$("#sortlist li").each(function(i, target){
			target.getElementsByTagName("span")[0].innerHTML = i + 1;
		});
	}

	function delPageEvent(){
		$(".del").tipsy({gravity: 's'}).click(function(){
			if (confirm("請問是否要刪除該張圖片?")) {
				var target = $(this).parents("li");
				var pageid = target.attr("id");
				var param_data = {
					'fn'    : 'deldmimg',
					'dmid'  : $(document.body).attr("dm_id"),
					'pageid': pageid
				};
				target.children("a").remove();
				$.ajax({
					"data"     : $.param(param_data),
					"success"  : function(data){
						if(data.stat == 'success'){
							target.remove();
							refreshPageSpacing();
							addPagenum();
						}
						target = pageid = param_data = null;
					}
           		});
			}
		});
	}
})(jQuery);







/**********************************************
  edit dm 
**********************************************/
(function($){
	$.editDM = function(){
		$.upload.formInit();
		helperResize();
		$("#edm-view").css('height', embedCode.size.h).html(embedCode.generate());
	};
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
window.onbeforeunload = function(evt) {
	if(!$.upload.isSelected()) return;
    var message = '您所上傳的EDM資料尚未儲存! 確定放棄儲存嗎?';
    if (typeof evt == 'undefined') {
        evt = window.event;
    }       
    if (evt) {
        evt.returnValue = message;
    }
    return message;
};

$.enableConsole = true;
$.fn.log = $.log = $.fn.console = $.console = function(str, method){
method = (( method == undefined) ? "log" :  method );
if (window.console && console[method] && $.enableConsole)
	//console[method].apply(this, [].splice.call(arguments,1))
	console[method](str);
	return this;
};