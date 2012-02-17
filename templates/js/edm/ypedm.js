var edmDefaults = {
	host : "http://172.17.10.158:92/frame/"
};
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
		//alert('clientWidth=' + this.outer.clientWidth);
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
		frameParam.push("width=" + frameWidth);
		if(ypedm.page != undefined){
			frameParam.push("page=" + ypedm.page);
		}
		this.frame.src = edmDefaults.host + ypedm.id + "/?" + frameParam.join("&");


		this.outer.style.width = frameWidth + "px";
		//outer.style.overflow = "hidden";
		this.outer.appendChild(this.frame);
	},
	oniFrameLoad : function(e) {
		var frame_height;
		if( navigator.userAgent.indexOf('MSIE') > -1){ //ie
			frame_height = e.srcElement.contentWindow.document.getElementsByTagName('body')[0].clientHeight;
			//frame_height = e.srcElement.contentDocument.body.clientHeight;
		}else{
			frame_height = e.target.contentDocument.body.clientHeight;
		}
		//log(frame_height);
		ypedmfn.frame.style.height    = frame_height + "px";
		ypedmfn.outer.style.minHeight = frame_height + "px";
	}
};



function resizeIframe (height) {
	document.getElementById('edm-frame').style.height = parseInt(height) + 'px';
}


var log = function(str, method) {
	method = (( method == undefined) ? "log" :  method );
	if (window.console && console[method]){
		console[method](str);
	}

};



Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


ypedmfn.init();