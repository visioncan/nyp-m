function init () {
	$.ajax({
		url   : "/templates/1330490131/js/edm/embed.min.js",
		type  : "GET",
		cache : true,
		dataType : "script",
		success  : function() {
			embedInit({
				vars   : flavars,
				width  : (document.body.clientWidth - 160)
			});
		}
	});
	linkaddhost();
}

var parentHost;
function load() {
	helperResize();
}

function helperResize() {
	if(parentHost == ''){
		return;
	}
	var height = $(document.body).outerHeight();
	document.getElementById('framehelper').src = "//" + parentHost + "/framehelper.html?height=" + height + "&" + Math.random();
}
function linkaddhost() {
	parentHost = getHostVars();
	//link 加 host
	$(".upload_link, #edm-list a, .addnew").each(function(){
		var hostvar = ($(this).attr("href").indexOf("?") == -1) ? "?host=" : "&host=";
		$(this).attr("href", $(this).attr("href") + hostvar + parentHost);
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
        vars[hash[0]] = decodeURIComponent(hash[1]);
	}
	return vars.host;
}




$(document).ready(init);
window.onload = load;



// Object.size = function(obj) {
//     var size = 0, key;
//     for (key in obj) {
//         if (obj.hasOwnProperty(key)) size++;
//     }
//     return size;
// };


$.enableConsole = true;
var log = $.log =  $.fn.console = $.console = function(str, method){
method = (( method == undefined) ? "log" :  method );
if (window.console && console[method] && $.enableConsole)
	//console[method].apply(this, [].splice.call(arguments,1))
	console[method](str);
	return this;
};