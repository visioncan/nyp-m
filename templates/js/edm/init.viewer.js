function init () {
	var viewerid = "edm-viewer";
	if( $.isMobile !== "mobile"){
		$.swfView({
			id     : viewerid,
			width  : 750,
			height : 480
		});

	}else{
		$("#" + viewerid).html("尚未支援播放");
	}
}




(function($){
	var swfUrl       = "/templates/swf/edmplayer.swf" ,
		swfobjectUrl = "/templates/js/libs/swfobject.js",
		installUrl   = "/templates/swf/expressInstall.swf",
		options,
		defaults = {
			width  : 700,
			height : 480,
			params : { 
				wmode  : "opaque",
				menu   : "false",
				scale  : "noScale",
				allowFullscreen : "true",
				allowScriptAccess : "always",
				bgcolor : "#EFEFEF"
			}
		};
	$.swfView = function(opt){
		options = $.extend({}, defaults, opt);
		//viewer = $("#" + options.id);
		addjs();
	};
	function addjs () {
		$("#" + options.id).parent().css("height", options.height);
		$.ajax({
			url  : swfobjectUrl,
			type : "GET",
			cache : true,
			dataType : "script",
			success : function() {
				var swfv = swfobject.getFlashPlayerVersion();
				if( swfv.major == 0){
					alert("沒有flash");
				}
				if( !swfobject.hasFlashPlayerVersion("10.0.0") ){
					alert("升級flash http://get.adobe.com/flashplayer/");
				}
				Embed(flavars);
			}
		});
	}

	function Embed(vars){
		swfobject.embedSWF(
					swfUrl,
					options.id,
					options.width,
					options.height,
					"10.0.0", 
					installUrl, 
					vars,
					options.params
		);
	}
})(jQuery);







$(document).ready(init);


Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


$.enableConsole = true;
$.fn.log = $.log = $.fn.console = $.console = function(str, method){
method = (( method == undefined) ? "log" :  method );
if (window.console && console[method] && $.enableConsole)
	//console[method].apply(this, [].splice.call(arguments,1))
	console[method](str);
	return this;
};