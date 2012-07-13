
(function($){
	var swfUrl       = "/templates/swf/edmplayer.swf" ,
		swfobjectUrl = "/templates/js/libs/swfobject.js",
		installUrl   = "/templates/swf/expressInstall.swf",
		options,
		defaults = {
			width  : 700,
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
					'100%',
					'100%',
					"10.0.0", 
					installUrl, 
					vars,
					options.params
		);
	}
})(jQuery);







(function($){
	var options,
		playerUrl = "/templates/1342154131/js/edm/m.embed.min.js";
	$.mobileView = function(opt){
		options = opt;
		options.height = document.body.clientHeight;
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
	if(typeof defaultEmbed !== "undefined" && defaultEmbed.length !== 0){
		embedInit(defaultEmbed);
	}
})();
