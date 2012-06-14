
(function($){
	var swfUrl       = "/templates/swf/edmplayer.swf" ,
		swfobjectUrl = "/templates/js/libs/swfobject.js",
		installUrl   = "/templates/swf/expressInstall.swf",
		options,
		defaults = {
			width  : 580,
			height : 400,
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
		addjs();
	};
	function addjs () {
		$("#" + options.id).parent().css("height", options.height);
		if(typeof swfobject === "undefined"){
			$.ajax({
				url  : swfobjectUrl,
				type : "GET",
				cache : true,
				dataType : "script",
				success : function() {
					initPlayer();
				}
			});
		}else{
			initPlayer();
		}
	}

	function initPlayer () {
		var swfv = swfobject.getFlashPlayerVersion();
		if( swfv.major == 0){
			alert("您沒有安裝flash");
			return;
		}
		if( !swfobject.hasFlashPlayerVersion("10.0.0") ){
			if(confirm("您的flash player版本過舊，請升級flash player")){
				window.location = "http://get.adobe.com/flashplayer/";
			}
			return;
		}
		Embed(options.vars);
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







(function($){
	var options,
		playerUrl = "/templates/1339635630/js/edm/m.embed.min.js",
		defaults = {
			width  : 580,
			height : 400
		};
	$.mobileView = function(opt){
		options = $.extend({}, defaults, opt);
		addjs();
	};
	function addjs () {
		$("#" + options.id).parent().addClass('mobile').css({
			"height" : options.height
		});
		if(typeof $.player === "undefined"){
			$.ajax({
				url  : playerUrl,
				type : "GET",
				cache : false,
				dataType : "script",
				success : function() {
					initPlayer();
				}
			});
		}else{
			initPlayer();
		}
	}

	function initPlayer(){
		$.player(options);
	}
})(jQuery);






function embedInit(defaults){
	var viewerid = "edm-viewer";
	if( $.isMobile !== "mobile"){
		$.swfView( $.extend({}, defaults, { 'id' : viewerid }) );
	}else{
		$.mobileView( $.extend({}, defaults, { 'id' : viewerid }) );
	}
}


(function(){
	if(typeof defaultEmbed !== "undefined"){
		embedInit(defaultEmbed);
	}
})();
