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


Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


ypedmfn.init();