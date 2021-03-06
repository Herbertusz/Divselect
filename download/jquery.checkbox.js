/**
 * checkbox jquery plugin v2.7
 * Copyright (c) 2011.09.13. Horváth Norbert
 *
 * @example
 * $(selector).checkbox({
 *		checked: 'images/chc.jpg',
 *		unchecked: 'images/ch.jpg',
 *		readonlychecked: 'images/chc_ro.jpg',
 *		readonlyunchecked: 'images/ch_ro.jpg',
 *		disabled: 'images/ch_d.jpg'
 * });
 * $(selector).bind("change", function(event, checked){
 *		alert(checked);
 * });
 */
(function($){

	var images = {
		checked: '',
		unchecked: '',
		readonlychecked: '',
		readonlyunchecked: '',
		disabled: ''
	};
	var imgattributes = ["class", "title", "style"];
	var inputattributes = ["id"];

	var clickmethod = function($element){
		var $imgelement = getImgElement($element);
		if ($imgelement == null) return;
		var status = $imgelement.data("status");
		if (!status.disabled && !status.readonly){
			if (status.checked){
				$imgelement.attr("src", images.unchecked);
				$imgelement.data("status").checked = false;
				$imgelement.next('input[type="checkbox"]').removeAttr("checked");
				$imgelement.trigger("change", [false]);
				$imgelement.next('input[type="checkbox"]').trigger("change", [false]);
			}
			else{
				$imgelement.attr("src", images.checked);
				$imgelement.data("status").checked = true;
				$imgelement.next('input[type="checkbox"]').attr("checked", "checked");
				$imgelement.trigger("change", [true]);
				$imgelement.next('input[type="checkbox"]').trigger("change", [true]);
			}
		}
	};

	var getImgElement = function($element){
		if (typeof($element.data("status")) == "undefined"){
			var $imgelement = $element.prev("img");
			if ($imgelement.length == 0 || typeof($imgelement.data("status")) == "undefined"){
				return null;
			}
			else{
				return $imgelement;
			}
		}
		else{
			return $element;
		}
	};

	var hideelement = function($element){
		$element.css("display", "none");
		$element.css("position", "absolute");
		$element.css("left", "-9999px");
	};

	var ischecked = function($element){
		var $imgelement = getImgElement($element);
		if ($imgelement == null) return null;
		if ($imgelement.data("status").checked){
			return true;
		}
		else{
			return false;
		}
	};
	var isreadonly = function($element){
		var $imgelement = getImgElement($element);
		if ($imgelement == null) return null;
		if ($imgelement.data("status").readonly){
			return true;
		}
		else{
			return false;
		}
	};
	var isdisabled = function($element){
		var $imgelement = getImgElement($element);
		if ($imgelement == null) return null;
		if ($imgelement.data("status").disabled){
			return true;
		}
		else{
			return false;
		}
	};
	
	var setreadonly = function($element){
		var $imgelement = getImgElement($element);
		if ($imgelement == null) return;
		var status = $imgelement.data("status");
		status.readonly = true;
		if (status.checked){
			$imgelement.attr("src", images.readonlychecked);
		}
		else{
			$imgelement.attr("src", images.readonlyunchecked);
		}
	};
	var unsetreadonly = function($element){
		var $imgelement = getImgElement($element);
		if ($imgelement == null) return;
		var status = $imgelement.data("status");
		status.readonly = false;
		if (status.checked){
			$imgelement.attr("src", images.checked);
		}
		else{
			$imgelement.attr("src", images.unchecked);
		}
	};
	var setdisabled = function($element){
		var $imgelement = getImgElement($element);
		if ($imgelement == null) return;
		var status = $imgelement.data("status");
		status.disabled = true;
		$imgelement.attr("src", images.disabled);
	};
	var unsetdisabled = function($element){
		var $imgelement = getImgElement($element);
		if ($imgelement == null) return;
		var status = $imgelement.data("status");
		status.disabled = false;
		if (status.checked && !status.readonly){
			$imgelement.attr("src", images.checked);
		}
		else if (status.checked && status.readonly){
			$imgelement.attr("src", images.readonlychecked);
		}
		else if (!status.checked && !status.readonly){
			$imgelement.attr("src", images.unchecked);
		}
		else{
			$imgelement.attr("src", images.readonlyunchecked);
		}
	};
	
	var getid = function($element){
		var $imgelement = getImgElement($element);
		if ($imgelement == null) return null;
		return $imgelement.data("status").id;
	};

	var methods = {

		/**
		 * A checkbox lecserélése
		 */
		create : function(setimages){
			images = setimages;
			return this.each(function(){
				var n;
				var $imgelement, $inputelement;
				var imgsrc, checked, disabled = false, readonly = false, name, value, imgdata;
				var $this = $(this);
				if (this.tagName != "INPUT" || $this.data("transformed")) return;
				// adatgyűjtés
				imgsrc = images.unchecked;
				checked = false;
				if ($this.attr("checked")){
					imgsrc = images.checked;
					checked = true;
				}
				if ($this.attr("disabled")){
					imgsrc = images.disabled;
					disabled = true;
				}
				if ($this.attr("readonly")){
					if (checked){
						imgsrc = images.readonlychecked;
					}
					else{
						imgsrc = images.readonlyunchecked;
					}
					readonly = true;
				}
				name = $this.attr("name");
				value = $this.attr("value");
				// html felépítése
				$imgelement = $('<img alt="" src="'+imgsrc+'" />');
				for (n = 0; n < imgattributes.length; n++){
					if ($this.attr(imgattributes[n])){
						$imgelement.attr(imgattributes[n], $this.attr(imgattributes[n]));
					}
				}
				imgdata = {
					"checked" : checked,
					"readonly" : readonly,
					"disabled" : disabled,
					"name" : name,
					"value" : value
				};
				$inputelement = $('<input type="checkbox" name="'+name+'" value="'+value+'" />');
				for (n = 0; n < inputattributes.length; n++){
					if ($this.attr(inputattributes[n])){
						$inputelement.attr(inputattributes[n], $this.attr(inputattributes[n]));
						imgdata[inputattributes[n]] = $this.attr(inputattributes[n]);
					}
				}
				$imgelement.data("status", imgdata);
				$inputelement.data("transformed", true);
				// megjelenítés
				$this.replaceWith($imgelement);
				$imgelement.after($inputelement);
				if (checked && !disabled){
					$inputelement.attr("checked", "checked");
				}
				hideelement($inputelement);
				// eseménykezelők
				$imgelement.bind("click.checkbox", function(event){
					clickmethod($imgelement);
				});
				$inputelement.bind("click.checkbox", function(event){
					event.preventDefault();
					event.stopPropagation();
				});
				if ($inputelement.attr("id")){
					$('label[for="'+$inputelement.attr("id")+'"]').bind("click.checkbox", function(event){
						event.preventDefault();
						clickmethod($imgelement);
					});
				}
				if ($imgelement.parent("label").length > 0){
					$imgelement.parent("label").bind("click.checkbox", function(event){
						event.preventDefault();
						if (event.target != $imgelement.get(0)){
							clickmethod($imgelement);
						}
					});
				}
			});
		},

		/**
		 * Visszaadja az elem id-jét
		 */
		getid : function(){
			return getid(this);
		},

		/**
		 * Ha be van pipálva, true-t ad vissza
		 */
		ischecked : function(){
			return ischecked(this);
		},
		/**
		 * Ha readonly, true-t ad vissza
		 */
		isreadonly : function(){
			return isreadonly(this);
		},
		/**
		 * Ha disabled, true-t ad vissza
		 */
		isdisabled : function(){
			return isdisabled(this);
		},

		/**
		 * Bepipálás
		 */
		check : function(){
			this.each(function(){
				if (!ischecked($(this))){
					clickmethod($(this));
				}
			});
			return this;
		},
		/**
		 * Pipa kiszedése
		 */
		uncheck : function(){
			this.each(function(){
				if (ischecked($(this))){
					clickmethod($(this));
				}
			});
			return this;
		},
		/**
		 * Átbillentés
		 */
		toggle : function(){
			this.each(function(){
				clickmethod($(this));
			});
			return this;
		},
		
		/**
		 * readonly tulajdonság beállítása
		 */
		setreadonly : function(){
			this.each(function(){
				if (!isreadonly($(this))){
					setreadonly($(this));
				}
			});
			return this;
		},
		/**
		 * readonly tulajdonság eltávolítása
		 */
		unsetreadonly : function(){
			this.each(function(){
				if (isreadonly($(this))){
					unsetreadonly($(this));
				}
			});
			return this;
		},
		/**
		 * disabled tulajdonság beállítása
		 */
		setdisabled : function(){
			this.each(function(){
				if (!isdisabled($(this))){
					setdisabled($(this));
				}
			});
			return this;
		},
		/**
		 * disabled tulajdonság eltávolítása
		 */
		unsetdisabled : function(){
			this.each(function(){
				if (isdisabled($(this))){
					unsetdisabled($(this));
				}
			});
			return this;
		},
		
		/**
		 * Elem eltávolítása
		 */
		remove : function(){
			var $imgelement = getImgElement(this);
			$imgelement.remove();
			this.remove();
		}

	};

	$.fn.checkbox = function(method){
		if (methods[method]){
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		else if (typeof(method) == "object" || !method){
			return methods.create.apply(this, arguments);
		}
		else{
			$.error("A jquery.checkbox pluginnak nincs "+method+" tagfüggvénye.");
			return false;
		}
	};

})(jQuery);
