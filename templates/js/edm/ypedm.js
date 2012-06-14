var ypedmfn = {
	outer : null,
	frame : null,
	init : function(){
		if(typeof ypedm === "undefined" || typeof ypedm !== "object" || document.getElementById("ypedm") == null){
			console.log('DM嵌入錯誤');
			return;
		}
		this.creat();
	},
	creat : function() {
		this.outer = document.getElementById("ypedm");
		var frameWidth = this.outer.getAttribute("w") != null ? this.outer.getAttribute("w") : "auto";
		var frameParam = new Array();

		this.frame = document.createElement("IFRAME");
		this.frame.setAttribute('frameBorder', '0');
		this.frame.setAttribute('scrolling', 'no');
		this.frame.id = "edm-frame";
		this.frame.style.height = "400px"; //預設高
		if (frameWidth === "auto") {
			var out_width = this.outer.clientWidth;
			if(out_width == 0){
				out_width = this.outer.offsetWidth;
			}
			this.frame.style.width = out_width + "px";
		}else{
			this.frame.style.width = frameWidth + "px";
		}
		frameParam.push("host=" + window.location.host);
		if(ypedm.page != undefined){
			frameParam.push("page=" + ypedm.page);
		}
		this.frame.src = 'http://' + ypedm.src + "?" + frameParam.join("&");
		this.outer.style.width = frameWidth + "px";
		this.outer.appendChild(this.frame);
	}
};



function resizeIframe (height) {
	document.getElementById('edm-frame').style.height = parseInt(height) + 'px';
}


function mobileFull(p){
	var fullViewWrap = document.getElementById('mobile-full-view'),
		dmFrame = document.getElementById('edm-frame'),
		page = 1;
	page = (typeof p === 'undefined' || p === '') ? 1 : p;

	if ( fullViewWrap == null ) {
		fullViewWrap = document.createElement('div');
		fullViewWrap.id = 'mobile-full-view';
		fullViewWrap.style.position = 'fixed';
		fullViewWrap.style.width = '100%';
		fullViewWrap.style.height = '100%';
		fullViewWrap.style.top = '0';
		fullViewWrap.style.left = '0';
		fullViewWrap.style.zIndex = '9999999';
		document.body.appendChild(fullViewWrap);
	}
	var frameSrc = dmFrame.getAttribute('src');
	if(frameSrc.indexOf("?") != -1){
		fullViewWrap.style.display = 'block';
		fullViewWrap.appendChild(dmFrame);

		dmFrame.style.width = '100%';
		dmFrame.style.height = '100%';

		dmFrame.setAttribute('src',frameSrc + '&mobile&p=' + page);
		document.getElementById('wrap').style.display = 'none';
	}
}




// Object.size = function(obj) {
//     var size = 0, key;
//     for (key in obj) {
//         if (obj.hasOwnProperty(key)) size++;
//     }
//     return size;
// };


ypedmfn.init();