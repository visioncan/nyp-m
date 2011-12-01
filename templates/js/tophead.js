
/******************************************************************************
*
*  nav event
*
******************************************************************************/
(function($){
	$.navBar = function(){
		$("#nbtn-geo").click(function(){
			openGeoPanel();
			return false;
		}).addTouchActive();
		$("#nbtn-user").click(function(){
			openMemberPanel();
			return false;
		}).addTouchActive();
		
	};

	function openGeoPanel () {
		$.mbox({
			type    : 'NAV_BOX',
			arwPos  : 'left',
			href    : '#geo',
			onStart : function(){
				$.geo.open();
			},
			onClose : function(){
				$.geo.close();
			}
		});
	}

	function openMemberPanel () {
		$.mbox({
			type   : 'NAV_BOX',
			arwPos : 'right',
			href   : '#member'
		});
	}

	$.extend($.navBar, {
		openGeo : function() {
			openGeoPanel();
		},
		openMember : function(){
			openMemberPanel();
		}
	});
})(jQuery);


/******************************************************************************
*
* 定位
*
******************************************************************************/
(function($){
	var geoEl ,               //目前位置
		cusEl ,               //指定位置
		glat = 0,             //經緯度
		glng = 0,
		addr = "",            //地址 - 目前的 或 指定的
		isGeo = false,        //是 : 定位目前位置 否: 指定的
		cusAddr = [0,0,''],   //自定位置資料
		cookie_expires = 0.2, //自定位置資料過期日
		isSubmitGeo = false,  //是否送出地址
		geo_spinner,          //載入spin
		btn_spinner,          //載入spin
		tmp_addr,
		spin_opt = {
			lines: 8,  
			length: 3,  
			width: 2,  
			radius: 3,  
			color: '#000',  
			speed: 1.8, 
			trail: 50,  
			shadow: false
		};

	$.geo = function(){
		geoEl = $("#getgeo");
		cusEl = $("#cusloc");

		//creat load spin
		$("<div/>",{
			'id' : 'geo-load',
			'class' : 'spin'
		}).insertAfter(geoEl);
		$("<div/>",{
			'id' : 'nbtn-load',
			'class' : 'spin'
		}).appendTo("#header");


		if($.cookie('cus_addr') == null){
			getGeoLoc();
		}else{
			cusAddr = $.cookie('cus_addr').split(",");
			addr    = $.cookie('res_addr');
			//寫出地址
			setAddr();
		}
		addCheckIconByEl();
		addEvent();
	};

	/////////////////////////
	//
	// 目前位置
	//
	////////////////////////
	function getGeoLoc (e) {
		if (navigator.geolocation) {
			startSpin();
			if(e){
				isGeo = true;
				//清除自定資料
				$.cookie('cus_addr', null);
				$.cookie('res_addr', null);
				addr = "";
				setAddr();
				addCheckIconByEl();
			}
			navigator.geolocation.getCurrentPosition(geoSuccess, e ? geoError : function(){stopSpin();});
		} else {
			if(e){ geoError('你的瀏覽器不支援定位') };
		}
	}
	function geoSuccess (position) {
		isGeo = true;
		stopSpin();
		glat = position.coords.latitude;
		glng = position.coords.longitude;
		var geocoder = new google.maps.Geocoder();
		var latlng = new google.maps.LatLng(glat, glng);
		geocoder.geocode({'latLng': latlng}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if(results[0]){
					addr = results[0].formatted_address;
					setAddr();
					addCheckIconByEl();
				}
			}
		});
	}

	function geoError (msg) {
		//msg.code == 1
		//msg.message == "User denied Geolocation"
		stopSpin();
		isGeo = false;
		alert(typeof msg == 'string' ? msg : "定位失敗" + msg );
	}

	function startSpin () {
		$("#header").addClass("load-geo");
		var title_spin = document.getElementById('geo-load');
		var ico_spin    = document.getElementById('nbtn-load');
		if(geo_spinner)
		return;
		geo_spinner = new Spinner(spin_opt).spin(title_spin);
		btn_spinner = new Spinner(spin_opt).spin(ico_spin);
	}
	function stopSpin () {
		$("#header").removeClass("load-geo");
		geo_spinner.stop();
		btn_spinner.stop();
	}
	///////////////////////////
	//
	// 指定位置
	//
	///////////////////////////
	function addEvent () {
		//縣市選單
		$.selectCity({
			cityId   : 'city_select',
			townId   : 'town_select',
			streetId : 'street_input',
			initData : {
				city : cusAddr[0],
				town : cusAddr[1],
				street : cusAddr[2]
			}
		});

		geoEl.click(function(e){
			getGeoLoc(e);
			return false;
		});

		cusEl.click(function(){
			intoGeoBox();
			return false;
		});
		
		$("#cusloc-form .cancel").click(function(){
			exitGeoBox();
			return false;
		});

		$("#cusloc-form .comm-form").submit(function(){
			isGeo = false;
			if( $("#city_select").val() == 0){
				//$("#city_select").val(0);
				alert("請選擇縣市和區域");
			}else{
				var cityIdx = $("#city_select").val();
				var townIdx = $("#town_select").val();
				var param_data = {
					fn   : "set_geo",
					city : cityIdx,
					town : townIdx,
					street  : $("#street_input").val(),
					fulladdr: $.selectCity.getFullAddr(cityIdx, townIdx) + $("#street_input").val()
				};
				
				alert("送出");

				cusAddr[0] = $("#city_select").val();
				cusAddr[1] = $("#town_select").val();
				cusAddr[2] = $("#street_input").val();
				addr = '台北市中太原路1112號';
				$.cookie('cus_addr', cusAddr, { expires: cookie_expires });
				$.cookie('res_addr', addr, { expires: cookie_expires });
				exitGeoBox();
			}
			return false;
		});
	}

	function intoGeoBox () {
		$('#geo-list').addClass('keyin');
		$('#cusloc-form').addClass('keyin');
		$("#geo	.wrap").css("height", $("#cusloc-form").height());
	}

	function exitGeoBox () {
		$('#geo-list').removeClass('keyin');
		$('#cusloc-form').removeClass('keyin');
		$("#geo	.wrap").css("height","auto");
		if($.cookie('cus_addr') !== null){
			addCheckIconByEl();
			setAddr();
		}
	}

	function setAddr () {
		if(isGeo){
			geoEl.children('.addr').text(addr);
			cusEl.children('.addr').text('');
			$('#cusloc-form .res-addr').text('');
			$('#cusloc-form .res-addr').parent("li").hide();
		}else{
			if($.cookie('res_addr') !== null){
				cusEl.children('.addr').text($.cookie('res_addr'));
				$('#cusloc-form .res-addr').parent("li").show();
				$('#cusloc-form .res-addr').text($.cookie('res_addr'));
			}
			geoEl.children('.addr').text('');
		}

	}

	function addCheckIconByEl () {
		if(isGeo){
			//getgeo
			geoEl.parent("li").get(0).className = "check";
			cusEl.parent("li").get(0).className = "";
		}else{ 
			//"cusloc":
			geoEl.parent("li").get(0).className = "";
			cusEl.parent("li").get(0).className = "check";
		}
	}

	function onOpen () {
		tmp_addr = addr;
	}

	function onClose () {
		if(tmp_addr != addr){
			setTimeout(function(){ window.location.reload(); }, 500);
		}
	}


	$.extend($.geo, {
		data : function(){
			return {
				'lat' : glat,
				'lng' : glng,
				'addr' : addr,
				'geo'  : isGeo ? '1' : '0' 
			}
		},
		open  : function() {
			onOpen();
		},
		close : function(){
			onClose();
		}
	});
})(jQuery);

