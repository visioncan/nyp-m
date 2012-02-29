function init () {
	$.ajax({
		url   : "/templates/1330490131/js/edm/embed.min.js",
		type  : "GET",
		cache : true,
		dataType : "script",
		success  : function() {
			embedInit({
				vars   : flavars,
				width  : 750,
				height : 480
			});
		}
	});
}

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





$(document).ready(init);
window.onload = load;

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