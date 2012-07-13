function init () {
	$("<iframe/>",{
		'Width' : '100%',
		'Height' : '400',
		'frameborder' : 0,
		'allowfullscreen' : true,
		'src' : '//' + window.location.host + "/embed/" + flavars.dm
	}).appendTo("#edm-view");

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



$(window).load(load);
$(document).ready(init);




$.enableConsole = true;
var log = $.log =  $.fn.console = $.console = function(str, method){
method = (( method == undefined) ? "log" :  method );
if (window.console && console[method] && $.enableConsole)
	//console[method].apply(this, [].splice.call(arguments,1))
	console[method](str);
	return this;
};