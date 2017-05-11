/*!
 * divselect jQuery plugin v1.0.0
 * Copyright (c) 2013.03.12. Horváth Norbert
 * 
 * http://js.sikerweb.hu/divselect_en
 * http://js.sikerweb.hu/divselect_hu
 */
(function($){

	// Default options
	var defaultoptions = {
		
		// STATIC PROPERTIES (can be modified at the initialization)
		
		// HTML template (the element structure)
		htmltemplate : '\
			<div class="{cssprefix}">\
				<input class="{cssprefix}-input" type="hidden" name="{select.name}" value="{select.val}" />\
				<div class="{cssprefix}-selector {select.readonly} {select.disabled}">{select.defhtml}</div>\
				<div class="{cssprefix}-menu">\
					{block}\
						{optgroup_start}\
							<div class="{cssprefix}-group">\
								<div class="{cssprefix}-grouptitle">{optgroup.label}</div>\
						{/optgroup_start}\
						{optgroup_end}\
							</div>\
						{/optgroup_end}\
						{optiontags}\
							<div class="{cssprefix}-item {option.readonly} {option.disabled}">{option.html}</div>\
						{/optiontags}\
					{/block}\
				</div>\
				<div class="{cssprefix}-background"></div>\
			</div>\
		',
		
		// css class prefix in the generated element
		cssprefix : "divselect",
		
		// HTML codes inside the option elements (if empty, the original code will be used)
		optiontags : {},
		
		// div inherited attributes from the original select
		divattributes : ["id", "class", "dir", "lang", "style", "title"],
		
		// more characters for search
		characters : {
			"á": {"general" : 222, "opera" : 193},
			"é": {"general" : 186, "firefox" : 59, "opera" : 201},
			"í": {"general" : 226, "opera" : 205},
			"ó": {"general" : 187, "firefox" : 107, "opera" : 211},
			"ö": {"general" : 192, "opera" : 214},
			"ő": {"general" : 219, "opera" : 336},
			"ú": {"general" : 221, "opera" : 218},
			"ü": {"general" : 191, "opera" : 220},
			"ű": {"general" : 220, "opera" : 368}
		},
		
		// separated elements inside the option tags (don't close the select; selector inside option)
		unbubble : "input,select,textarea",
		
		// DINAMIC PROPERTIES (can be modified in runtime)
		
		// jump size for page down and page up keys
		pagestep : 10,
		
		// max delay between two keydown (ms)
		keydownwait : 1000,
		
		// disable key event handling
		disablekeys : false,
		
		// disable base functions for click event
		disabledropdown : false,
		disableclose : false,
		disableselect : false,
		
		// position of the list (jQuery UI position)
		position : {
			my: "left top",
			at: "left bottom",
			offset: "0 0",
			collision: "none flip"
		},
		
		/**
		 * List opening effect
		 * @param <jQuery> $elem lista
		 */
		showeffect : function($elem){
			$elem.show();
		},
		/**
		 * List closing effect
		 * @param <jQuery> $elem lista
		 */
		hideeffect : function($elem){
			$elem.hide();
		},
		
		// EVENT HANDLERS (can be modified in runtime)
		
		/**
		 * Triggered after the element is created
		 * @param <Event> event jquery Event object
		 * @scope <DOM> this: divselect element
		 */
		create : function(event){},

		/**
		 * Triggered when a value is chosen
		 * @param <Event> event jquery Event object
		 * @param <string> value selected value
		 * @scope <DOM> this: divselect element
		 */
		select : function(event, value){},

		/**
		 * Triggered when the value is changed
		 * @param <Event> event jquery Event object
		 * @param <string> value selected value
		 * @param <string> oldvalue previously selected value
		 * @scope <DOM> this: divselect element
		 */
		change : function(event, value, oldvalue){},

		/**
		 * Triggered when the list is opened
		 * @param <Event> event jquery Event object
		 * @scope <DOM> this: divselect element
		 */
		open : function(event){},

		/**
		 * Triggered whenthe list is closed
		 * @param <Event> event jquery Event object
		 * @scope <DOM> this: divselect element
		 */
		close : function(event){}
		
	};

	// Inner data storage
	var optionData = {
		selected : null,
		disabled : [],
		readonly : [],
		values : [],
		labels : []
	};
	
	// Utility variables and functions
	var Util = {
		
		// special keys
		keys : {
			ALT: 18, BACKSPACE: 8, CAPS_LOCK: 20, COMMA: 188, CTRL: 17, DELETE: 46, DOWN: 40, END: 35, ENTER: 13,
			ESC: 27, HOME: 36, INSERT: 45, LEFT: 37, NUM_LOCK: 144, NUMPAD_ADD: 107, NUMPAD_DECIMAL: 110,
			NUMPAD_DIVIDE: 111, NUMPAD_ENTER: 108, NUMPAD_MULTIPLY: 106, NUMPAD_SUBTRACT: 109, PAGE_DOWN: 34,
			PAGE_UP: 33, PAUSE: 19, PERIOD: 190, RIGHT: 39, RIGHT_CLICK: 93, SCROLL_LOCK: 145, SHIFT: 16, SPACE: 32,
			TAB: 9, UP: 38, WINDOWS: 91
		},
		
		// alfanumeric keys
		letters : {
			"a": 65, "b": 66, "c": 67, "d": 68, "e": 69, "f": 70, "g": 71, "h": 72, "i": 73,
			"j": 74, "k": 75, "l": 76, "m": 77, "n": 78, "o": 79, "p": 80, "q": 81, "r": 82,
			"s": 83, "t": 84, "u": 85, "v": 86, "w": 87, "x": 88, "y": 89, "z": 90,
			"0": 48, "1": 49, "2": 50, "3": 51, "4": 52, "5": 53, "6": 54, "7": 55, "8": 56, "9": 57
		},
		
		/**
		 * Determine the browser
		 * @return <string> browser type ("ie"|"firefox"|"chrome"|"safari"|"opera"|"general")
		 */
		getBrowser : function(){
			var app = navigator.appName.toLowerCase();
			var ua = navigator.userAgent;
			var browser = ua.match(/(opera|chrome|safari|firefox|ie)\/?\s*(\.?\d+(\.\d+)*)/i);
			browser = browser ? browser[1].toLowerCase() : navigator.appName;
			if (!(browser in {"ie" : 1, "firefox" : 1, "chrome" : 1, "safari" : 1, "opera" : 1})){
				browser = "general";
			}
			return browser;
		},
		
		/**
		 * Remove HTML tags and PHP blocks
		 * @param <string> input input string
		 * @return <string> 
		 */
		stripTags : function(input){
			var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
			var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
			return input.replace(commentsAndPhpTags, "").replace(tags, "");
		}
		
	};
	
	// Divselect creation functions
	var Creation = {
		
		/**
		 * Create the whole select element
		 * @param <string> divhtml template
		 * @param <jQuery> $select the select element
		 * @param <object> optiontags option elements inside
		 * @param <string> cssprefix css prefix
		 * @param <bool> disabled select element disabled property
		 * @param <bool> readonly select element readonly property
		 * @return <string> HTML template segment
		 */
		createSelectTag : function(divhtml, $select, optiontags, cssprefix, disabled, readonly){
			var $rows = $select.children();
			var $selected = $select.find(":selected").first();
			if ($selected.length == 0 && $rows.length > 0){
				$selected = $select.find("option").first();
			}
			var attrName = $select.attr("name") ? $select.attr("name") : "";
			divhtml = divhtml.replace(/\{cssprefix\}/g, cssprefix);
			divhtml = divhtml.replace(/\{select\.name\}/g, attrName);
			divhtml = divhtml.replace(/\{select\.val\}/g, ($rows.length > 0) ? $select.val() : "");
			if (disabled){
				divhtml = divhtml.replace(/\{select\.disabled}/g, cssprefix+"-disabled");
			}
			else{
				divhtml = divhtml.replace(/\{select\.disabled}/g, "");
			}
			if (readonly){
				divhtml = divhtml.replace(/\{select\.readonly}/g, cssprefix+"-readonly");
			}
			else{
				divhtml = divhtml.replace(/\{select\.readonly}/g, "");
			}
			if ($rows.length > 0 && optiontags != null && typeof(optiontags[$select.val()]) != "undefined" && optiontags[$select.val()]){
				var innercode = optiontags[$select.val()].replace(/([^\\])#/g, "$1"+$selected.html()).replace(/\\#/g, "#");
				divhtml = divhtml.replace(/\{select\.defhtml\}/g, innercode);
			}
			else if ($rows.length > 0){
				divhtml = divhtml.replace(/\{select\.defhtml\}/g, $selected.html());
			}
			else{
				divhtml = divhtml.replace(/\{select\.defhtml\}/g, "");
			}
			var htmlblock = '';
			$rows.each(function(i, element){
				if (element.tagName == "OPTION"){
					htmlblock += Creation.createOptionTag(element, divhtml, optiontags, cssprefix);
				}
				else if (element.tagName == "OPTGROUP"){
					htmlblock += Creation.createOptgroupTag(element, divhtml, optiontags, cssprefix);
				}
			});
			if (optionData.selected === null && $rows.length > 0){
				optionData.selected = $rows.eq(0).val();
			}
			divhtml = divhtml.replace(/\{block\}([\s\S]*)\{\/block\}/g, htmlblock);
			return divhtml;
		},
		
		/**
		 * Create one option tag
		 * @param <DOM> element option element
		 * @param <string> htmltemplate template
		 * @param <object> optiontags option elements inside
		 * @param <string> cssprefix css prefix
		 * @return <string> HTML template segment
		 */
		createOptionTag : function(element, htmltemplate, optiontags, cssprefix, optionDataStorage){
			var $element = $(element);
			var segment = htmltemplate.replace(/^[\s\S]*\{optiontags\}([\s\S]*)\{\/optiontags\}[\s\S]*$/g, "$1");
			var value = $element.val();
			var html = $element.html();
			optionData.values.push(value);
			if (optionDataStorage) optionDataStorage.value = value;
			optionData.htmls.push(html);
			if (optionDataStorage) optionDataStorage.html = html;
			segment = segment.replace(/\{cssprefix\}/g, cssprefix);
			segment = segment.replace(/\{option\.val\}/g, value);
			if (optiontags != null && typeof(optiontags[value]) != "undefined" && optiontags[value]){
				var innercode = optiontags[value].replace(/([^\\])#/g, "$1"+$element.html()).replace(/\\#/g, "#");
				segment = segment.replace(/\{option\.html\}/g, innercode);
			}
			else{
				segment = segment.replace(/\{option\.html\}/g, $element.html());
			}
			if ($element.prop("selected")){
				optionData.selected = value;
				if (optionDataStorage) optionDataStorage.selected = true;
			}
			if (element.getAttribute("disabled")){
				segment = segment.replace(/\{option\.disabled}/g, cssprefix+"-disabled");
				optionData.disabled.push(value);
				if (optionDataStorage) optionDataStorage.disabled = true;
			}
			else{
				segment = segment.replace(/\{option\.disabled}/g, "");
			}
			if (element.getAttribute("readonly")){
				segment = segment.replace(/\{option\.readonly}/g, cssprefix+"-readonly");
				optionData.readonly.push(value);
				if (optionDataStorage) optionDataStorage.readonly = true;
			}
			else{
				segment = segment.replace(/\{option\.readonly}/g, "");
			}
			return segment;
		},
		
		/**
		 * Create one optgroup tag
		 * @param <DOM> element optgroup element
		 * @param <string> htmltemplate template
		 * @param <object> optiontags option elements inside
		 * @param <string> cssprefix css prefix
		 * @return <string> HTML template segment
		 */
		createOptgroupTag : function(element, htmltemplate, optiontags, cssprefix, optionDataStorage){
			var segment_optgroup_start = htmltemplate.replace(/^[\s\S]*\{optgroup_start\}([\s\S]*)\{\/optgroup_start\}[\s\S]*$/g, "$1");
			var segment_optgroup_end = htmltemplate.replace(/^[\s\S]*\{optgroup_end\}([\s\S]*)\{\/optgroup_end\}[\s\S]*$/g, "$1");
			var segment_option = '';
			var label = $(element).attr("label") ? $(element).attr("label") : "";
			segment_optgroup_start = segment_optgroup_start.replace(/\{optgroup\.label\}/mg, label);
			optionData.labels.push(label);
			$(element).children("option").each(function(i, subelement){
				segment_option += Creation.createOptionTag(subelement, htmltemplate, optiontags, cssprefix);
			});
			return segment_optgroup_start + segment_option + segment_optgroup_end;
		}
		
	};
	
	// Handle user generated events
	var Interaction = {
		
		/**
		 * Determine the pressed character key
		 * @param <int> chr keyCode
		 * @param <object> definiált additional characters
		 * @return <string|bool> the pressed key or false if unknown
		 */
		getLetter : function(chr, characters){
			for (var index in Util.letters){
				if (chr == Util.letters[index]){
					return index;
				}
			}
			var browser = Util.getBrowser();
			for (index in characters){
				if ($.isPlainObject(characters[index])){
					var code = characters[index].general;
					if (typeof(characters[index][browser]) != "undefined"){
						code = characters[index][browser];
					}
					if (chr == code){
						return index;
					}
				}
				else if (chr == characters[index]){
					return index;
				}
			}
			return false;
		},
		
		/**
		 * Determine the pressed special key
		 * @param <int> keyCode keyCode
		 * @return <string|bool> leütött karakter neve vagy false ha ismeretlen
		 */
		getSpecialKey : function(keyCode){
			for (var name in Util.keys){
				if (Util.keys[name] == keyCode){
					return name;
				}
			}
			return false;
		},
		
		/**
		 * Select element
		 * @param <jQuery> $element selecting option element
		 * @param <jQuery> $divelement divselect element
		 */
		setSelect : function($element, $divelement){
			var cssprefix = $divelement.data("cssprefix");
			$divelement.find("."+cssprefix+"-item").removeData("selected");
			$element.data("selected", true).focus();
		},
		
		/**
		 * Highlight element
		 * @param <jQuery> $element highlighting option element
		 * @param <jQuery> $divelement divselect element
		 */
		setPreselect : function($element, $divelement){
			var cssprefix = $divelement.data("cssprefix");
			$divelement.find("."+cssprefix+"-item").removeData("preselected").removeClass(cssprefix+"-preselected");
			$element.data("preselected", true).addClass(cssprefix+"-preselected").focus();
		},
		
		/**
		 * Open the list
		 * @param <jQuery> $divelement divselect element
		 */
		showDropdown : function($divelement){
			var cssprefix = $divelement.data("cssprefix");
			var showeffect = $divelement.data("options").showeffect;
			var pos = $.extend({}, $divelement.data("options").position);
			if (typeof(pos.of) == "undefined"){
				pos.of = $divelement.find("."+cssprefix+"-selector");
			}
			$divelement.find("."+cssprefix+"-background").show();
			showeffect($divelement.find("."+cssprefix+"-menu"));
			$divelement.find("."+cssprefix+"-selector").addClass(cssprefix+"-active");
			$divelement.find("."+cssprefix+"-menu").position(pos);
			$divelement.find("."+cssprefix+"-item").each(function(){
				if ($(this).data("selected")){
					$(this).focus();
					return false;
				}
			});
		},
		
		/**
		 * Close the list
		 * @param <jQuery> $divelement divselect element
		 */
		hideDropdown : function($divelement){
			var cssprefix = $divelement.data("cssprefix");
			var hideeffect = $divelement.data("options").hideeffect;
			$divelement.find("."+cssprefix+"-background").hide();
			hideeffect($divelement.find("."+cssprefix+"-menu"));
			$divelement.find("."+cssprefix+"-selector").removeClass(cssprefix+"-active");
		},
		
		/**
		 * Handling separated element
		 * @param <jQuery> $element element that isn't bubbling (e.g. a form element)
		 * @param <string> cssprefix css prefix
		 * @param <string> unbubble selector for the separated elements
		 */
		bindUnbubbleEvent : function($element, cssprefix, unbubble){
			if ($element.length > 0){
				$element.find(unbubble).bind("click.divselect", function(event){
					if ($(this).parents().filter($element).data("readonly")){
						event.preventDefault();
					}
					event.stopPropagation();
				});
			}
		},
		
		/**
		 * Base event handlers
		 */
		handleSpecialAction : {
			
			/**
			 * Open the list
			 * @param <jQuery> $divelement divselect element
			 * @param <jQuery> event jquery Event object
			 */
			dropdown : function($divelement, event){
				if ($divelement.data("options").disabledropdown && event) return;
				var divelement = $divelement.get(0);
				if ($divelement.data("disabled")) return;
				Interaction.showDropdown($divelement);
				$divelement.trigger("open.divselect");
			},
			
			/**
			 * Close the list
			 * @param <jQuery> $divelement divselect element
			 * @param <jQuery> event jquery Event object
			 */
			close : function($divelement, event){
				if ($divelement.data("options").disableclose && event) return;
				var cssprefix = $divelement.data("cssprefix");
				var divelement = $divelement.get(0);
				if ($divelement.data("disabled")) return;
				var $selecteditem = $divelement.find("."+cssprefix+"-item").filter(function(){
					return $(this).data("selected");
				});
				Interaction.setPreselect($selecteditem, $divelement);
				Interaction.hideDropdown($divelement);
				$divelement.trigger("close.divselect");
			},
			
			/**
			 * Select element
			 * @param <jQuery> $item selecting element
			 * @param <jQuery> $divelement divselect element
			 * @param <jQuery> event jquery Event object
			 */
			select : function($item, $divelement, event){
				if ($divelement.data("options").disableselect && event) return;
				var cssprefix = $divelement.data("cssprefix");
				var divelement = $divelement.get(0);
				if ($divelement.data("disabled")) return;
				if (!$item.data("disabled")){
					var oldvalue = $divelement.find("."+cssprefix+"-input").val();
					var newvalue = $item.data("value");
					if (!$divelement.data("readonly")){
						$divelement.find("."+cssprefix+"-selector").html($item.html());
						$divelement.find("."+cssprefix+"-selector").data("value", newvalue);
						$divelement.find("."+cssprefix+"-input").val(newvalue);
						if (oldvalue != newvalue){
							$divelement.trigger("change.divselect", [newvalue, oldvalue]);
						}
					}
					Interaction.setPreselect($item, $divelement);
					Interaction.setSelect($item, $divelement);
					$divelement.trigger("select.divselect", [newvalue]);
					if ($divelement.find("."+cssprefix+"-menu:visible").length > 0){
						Interaction.hideDropdown($divelement);
						$divelement.trigger("close.divselect");
					}
				}
			}
			
		},
		
		/**
		 * Key event handling
		 * @param <jQuery> $divelement divselect element
		 * @param <Event> event jQuery Event object
		 */
		handleKeyEvent : function($divelement, event){
			var cssprefix = $divelement.data("cssprefix");
			var pagestep = $divelement.data("options").pagestep;
			var keydownwait = $divelement.data("options").keydownwait;
			var characters = $divelement.data("options").characters;
			var $menuitems = $divelement.find("."+cssprefix+"-item").filter(function(){
				return !$(this).data("disabled");
			});
			var itemnum = $menuitems.length;
			var preselected = null;
			var found = false;
			var offset = 1;
			$menuitems.each(function(index){
				if ($(this).data("preselected")){
					preselected = index;
					return false;
				}
				offset++;
			});
			var letter = null;
			if ((letter = this.getLetter(event.which, characters)) !== false){
				// alfanumeric key
				if ($divelement.data("keytime") && event.timeStamp - $divelement.data("keytime") < keydownwait){
					$divelement.data("keytime", event.timeStamp);
					var str = $divelement.data("keytype");
					if (str != letter){
						$divelement.data("keytype", str + letter);
					}
				}
				else{
					$divelement.data("keytime", event.timeStamp);
					$divelement.data("keytype", letter);
				}
				var searchstr = $divelement.data("keytype");
				// shifting
				var items = $menuitems.get();
				for (var i = 0; i < offset; i++){
					var firstitem = items.shift();
					items.push(firstitem);
				}
				$menuitems = $(items);
				$menuitems.each(function(index){
					var itemstr = $.trim(Util.stripTags($(this).html())).substr(0, searchstr.length);
					if (itemstr == searchstr || itemstr.toLowerCase() == searchstr){
						preselected = index;
						found = true;
						return false;
					}
				});
			}
			else{
				// speciális billentyű
				found = false;
				var thiskey = Interaction.getSpecialKey(event.which);
				if (thiskey && Interaction.keyHandlers["_"+thiskey]){
					event.preventDefault();
					var ret = Interaction.keyHandlers["_"+thiskey].call(
						$divelement, preselected, itemnum, pagestep, event, $menuitems
					);
					if (ret !== false){
						found = true;
						preselected = ret;
					}
				}
			}
			if (found){
				if (event.target == $divelement.get(0)){
					this.handleSpecialAction.select($menuitems.eq(preselected), $divelement, event);
				}
				else{
					this.setPreselect($menuitems.eq(preselected), $divelement);
				}
			}
		},
		
		/**
		 * Defined special key event handlers
		 * @param <int> preselected the highlighted element number
		 * @param <int> itemnum number of the elements in the list
		 * @param <int> pagestep the pagestep property of the divselect
		 * @param <jQuery Event> event the jQuery Event object
		 * @param <jQuery> $menuitems the list elements
		 * @return <int|bool> the new preselected value or false, it it has to be restored
		 */
		keyHandlers : {
			
			_RIGHT : function(preselected, itemnum, pagestep, event, $menuitems){
				return (preselected === null) ? 0 : (preselected + 1) % itemnum;
			},
			_DOWN : function(preselected, itemnum, pagestep, event, $menuitems){
				return (preselected === null) ? 0 : (preselected + 1) % itemnum;
			},
			_LEFT : function(preselected, itemnum, pagestep, event, $menuitems){
				var newpreselected = (preselected === null) ? (itemnum - 1) : (preselected - 1) % itemnum;
				if (newpreselected < 0){
					newpreselected += itemnum;
				}
				return newpreselected;
			},
			_UP : function(preselected, itemnum, pagestep, event, $menuitems){
				var newpreselected = (preselected === null) ? (itemnum - 1) : (preselected - 1) % itemnum;
				if (newpreselected < 0){
					newpreselected += itemnum;
				}
				return newpreselected;
			},
			_PAGE_DOWN : function(preselected, itemnum, pagestep, event, $menuitems){
				var newpreselected = (preselected === null) ? pagestep : (preselected + pagestep);
				if (newpreselected >= itemnum){
					newpreselected = itemnum - 1;
				}
				return newpreselected;
			},
			_PAGE_UP : function(preselected, itemnum, pagestep, event, $menuitems){
				var newpreselected = (preselected === null) ? (itemnum - pagestep) : (preselected - pagestep);
				if (newpreselected < 0){
					newpreselected = 0;
				}
				return newpreselected;
			},
			_HOME : function(preselected, itemnum, pagestep, event, $menuitems){
				return 0;
			},
			_END : function(preselected, itemnum, pagestep, event, $menuitems){
				return itemnum - 1;
			},
			_ENTER : function(preselected, itemnum, pagestep, event, $menuitems){
				if (preselected !== null){
					Interaction.handleSpecialAction.select($menuitems.eq(preselected), this, event);
				}
				return preselected;
			},
			_ESC : function(preselected, itemnum, pagestep, event, $menuitems){
				var $selecteditem = $menuitems.filter(function(){
					return $(this).data("selected");
				});
				Interaction.setPreselect($selecteditem, this);
				Interaction.handleSpecialAction.close(this, event);
				return false;
			}
		
		}
		
	};

	// Public methods
	var methods = {

		// USER METHODS

		/**
		 * Replace the select element
		 * @param <object> settings overwrite default settings
		 * @return <jQuery> generated element
		 */
		create : function(settings){
			var $divselects = $();
			var options;
			if (typeof(settings) == "object"){
				if (typeof(settings.addCharacters) != "undefined"){
					settings.characters = options.characters;
					$.extend(settings.characters, settings.addCharacters);
				}
				options = $.extend({}, defaultoptions, settings);
			}
			else{
				options = defaultoptions;
			}
			this.each(function(){
				if (this.tagName != "SELECT" || $(this).data("divselect")) return;
				optionData = {
					selected : null,
					disabled : [],
					readonly : [],
					values : [],
					labels : [],
					htmls : []
				};
				
				// data collecting
				var $select = $(this);
				var disabled = $select.prop("disabled") ? true : false;
				var readonly = $select.prop("readonly") ? true : false;
				
				// build the html
				var optiontags = options.optiontags;
				var cssprefix = options.cssprefix;
				var divhtml = options.htmltemplate;
				divhtml = Creation.createSelectTag(divhtml, $select, optiontags, cssprefix, disabled, readonly);
				var $divelement = $(divhtml);
				for (var n = 0; n < options.divattributes.length; n++){
					if (options.divattributes[n] == "class" && $select.attr("class")){
						$divelement.attr("class", $divelement.attr("class")+" "+$select.attr("class"));
					}
					else if ($select.attr(options.divattributes[n])){
						$divelement.attr(options.divattributes[n], $select.attr(options.divattributes[n]));
					}
				}
				
				// display the new element
				$(this).replaceWith($divelement);
				$divelement.attr("tabindex", "0");
				$divelement.find("."+cssprefix+"-background").hide();
				$divelement.find("."+cssprefix+"-menu").hide();
				// data attachment to the element
				$divelement.data("divselect", true);
				$divelement.data("cssprefix", cssprefix);
				$divelement.data("options", options);	// objektum (összes paraméter)
				$divelement.data("disabled", disabled);
				$divelement.data("readonly", readonly);
				$divelement.find("."+cssprefix+"-item").each(function(index){
					$(this).attr("tabindex", "0");
					$(this).data("value", optionData.values[index]);
					$(this).data("html", optionData.htmls[index]);
					if ($(this).data("value") == optionData.selected){
						$(this).data("selected", true);
						Interaction.setPreselect($(this), $divelement);
					}
					if ($.inArray($(this).data("value"), optionData.disabled) > -1){
						$(this).data("disabled", true);
					}
					if ($.inArray($(this).data("value"), optionData.readonly) > -1){
						$(this).data("readonly", true);
					}
				});
				$divelement.find("."+cssprefix+"-group").each(function(index){
					$(this).data("label", optionData.labels[index]);
				});
				
				// event handlers
				$divelement.find("."+cssprefix+"-selector").bind("click.divselect", function(event){
					if (!$divelement.data("options").disabledropdown){
						Interaction.handleSpecialAction.dropdown($divelement, event);
					}
				});
				$divelement.find("."+cssprefix+"-background").bind("click.divselect", function(event){
					if (!$divelement.data("options").disableclose){
						Interaction.handleSpecialAction.close($divelement, event);
					}
				});
				$divelement.find("."+cssprefix+"-item").bind("click.divselect", function(event){
					if (!$divelement.data("options").disableselect){
						Interaction.handleSpecialAction.select($(this), $divelement, event);
						Interaction.bindUnbubbleEvent($divelement.find("."+cssprefix+"-selector"), cssprefix, options.unbubble);
					}
				});
				$divelement.bind("keydown.divselect", function(event){
					if (!$divelement.data("options").disablekeys){
						if ($divelement.data("disabled")) return;
						Interaction.handleKeyEvent($divelement, event);
					}
				});
				$divelement.bind("create.divselect", $divelement.data("options").create)
							.bind("select.divselect", $divelement.data("options").select)
							.bind("change.divselect", $divelement.data("options").change)
							.bind("open.divselect", $divelement.data("options").open)
							.bind("close.divselect", $divelement.data("options").close)
							.trigger("create.divselect");
				Interaction.bindUnbubbleEvent($divelement.find("."+cssprefix+"-item"), cssprefix, options.unbubble);
				$divselects = $divselects.add($divelement);
			});
			return $divselects;
		},
		
		/**
		 * Replace the divselect with an equivalent select element
		 * (it keeps the HTML code defined by the optiontags property)
		 * @return <jQuery> the select element
		 */
		destroy : function(){
			var $selects = $();
			this.each(function(){
				var $divelement = $(this);
				var $select = $($divelement.divselect("getselect", "html", true));
				$divelement.replaceWith($select);
				$selects = $selects.add($select);
			});
			return $selects;
		},
		
		/**
		 * Modify a static property in runtime
		 * @param <string|object> name property name
		 * @param <string> value property value
		 * @return <jQuery>
		 */
		regenerate : function(name, value){
			var $divselects = $();
			this.each(function(){
				var $divelement = $(this);
				var options = $divelement.data("options");
				if ($.isPlainObject(name)){
					$.extend(options, name);
				}
				else{
					options[name] = value;
				}
				var $select = $divelement.divselect("destroy");
				$divelement = $select.divselect("create", options);
				$divselects = $divselects.add($divelement);
			});
			return $divselects;
		},

		/**
		 * Get or set a property in runtime
		 * @param <string|object> name property name / property setter map
		 * @param <string> value property value
		 * @return <jQuery|mixed>
		 */
		option : function(name, value){
			if ($.isPlainObject(name)){
				this.each(function(){
					$.extend($(this).data("options"), name);
				});
				return this;
			}
			else{
				if (typeof(value) == "undefined"){
					// getter
					return this.data("options")[name];
				}
				else{
					// setter
					this.each(function(){
						$(this).data("options")[name] = value;
					});
					return this;
				}
			}
		},

		/**
		 * Selected value
		 * @return <string>
		 */
		getval : function(){
			var cssprefix = this.data("cssprefix");
			return this.find("."+cssprefix+"-input").val();
		},
		/**
		 * HTML inside the selected element
		 * @return <string>
		 */
		getselected : function(){
			return this.divselect("getElementByValue", this.divselect("getval")).html();
		},
		
		/**
		 * Open the list
		 * @return <jQuery>
		 */
		open : function(){
			Interaction.handleSpecialAction.dropdown(this, null);
			return this;
		},
		/**
		 * Close the list
		 * @return <jQuery>
		 */
		close : function(){
			Interaction.handleSpecialAction.close(this, null);
			return this;
		},

		/**
		 * Select by value
		 * @param <string> value
		 * @return <jQuery>
		 */
		select : function(value){
			var $divelement = this;
			this.each(function(){
				Interaction.handleSpecialAction.select($(this).divselect("getElementByValue", value), $divelement, null);
			});
			return this;
		},
		
		/**
		 * Determine if the given value is selected
		 * @param <string> value
		 * @return <bool>
		 */
		isselected : function(value){
			return (this.divselect("getval") == value);
		},
		/**
		 * Determine if the given value is readonly
		 * @param <string> value
		 * @return <bool>
		 */
		isreadonly : function(value){
			if (typeof(value) == "undefined"){
				return this.data("readonly");
			}
			else{
				return (this.divselect("getElementByValue", value).data("readonly") ? true : false);
			}
		},
		/**
		 * Determine if the given value is disabled
		 * @param <string> value
		 * @return <bool>
		 */
		isdisabled : function(value){
			if (typeof(value) == "undefined"){
				return this.data("disabled");
			}
			else{
				return (this.divselect("getElementByValue", value).data("disabled") ? true : false);
			}
		},
		
		/**
		 * Set the readonly property for the element(s)
		 * @param <string|array> value(s)
		 * @return <jQuery>
		 */
		setreadonly : function(value){
			var cssprefix = this.data("cssprefix");
			if (typeof(value) == "undefined"){
				this.data("readonly", true);
				this.find("."+cssprefix+"-selector").addClass(cssprefix+"-readonly");
			}
			else if ($.isArray(value)){
				for (var i = 0; i < value.length; i++){
					this.divselect("setreadonly", value[i]);
				}
			}
			else if (!this.divselect("isreadonly")){
				this.each(function(){
					var $option = $(this).divselect("getElementByValue", value);
					$option.data("readonly", true);
					$option.addClass(cssprefix+"-readonly");
				});
			}
			return this;
		},
		/**
		 * Remove the readonly property from the element(s)
		 * @param <string|array> value(s)
		 * @return <jQuery>
		 */
		unsetreadonly : function(value){
			var cssprefix = this.data("cssprefix");
			if (typeof(value) == "undefined"){
				this.data("readonly", false);
				this.find("."+cssprefix+"-selector").removeClass(cssprefix+"-readonly");
			}
			else if ($.isArray(value)){
				for (var i = 0; i < value.length; i++){
					this.divselect("unsetreadonly", value[i]);
				}
			}
			else if (this.divselect("isreadonly", value)){
				this.each(function(){
					var $option = $(this).divselect("getElementByValue", value);
					$option.removeData("readonly");
					$option.removeClass(cssprefix+"-readonly");
				});
			}
			return this;
		},
		/**
		 * unsetreadonly alias
		 */
		setwritable : function(value){
			return this.divselect("unsetreadonly", value);
		},
		/**
		 * Set the disabled property for the element(s)
		 * @param <string|array> value(s)
		 * @return <jQuery>
		 */
		setdisabled : function(value){
			var cssprefix = this.data("cssprefix");
			if (typeof(value) == "undefined"){
				this.data("disabled", true);
				this.find("."+cssprefix+"-selector").addClass(cssprefix+"-disabled");
			}
			else if ($.isArray(value)){
				for (var i = 0; i < value.length; i++){
					this.divselect("setdisabled", value[i]);
				}
			}
			else if (!this.divselect("isdisabled")){
				this.each(function(){
					var $option = $(this).divselect("getElementByValue", value)
					$option.data("disabled", true);
					$option.addClass(cssprefix+"-disabled");
				});
			}
			return this;
		},
		/**
		 * Remove the disabled property from the element(s)
		 * @param <string|array> value(s)
		 * @return <jQuery>
		 */
		unsetdisabled : function(value){
			var cssprefix = this.data("cssprefix");
			if (typeof(value) == "undefined"){
				this.data("disabled", false);
				this.find("."+cssprefix+"-selector").removeClass(cssprefix+"-disabled");
			}
			else if ($.isArray(value)){
				for (var i = 0; i < value.length; i++){
					this.divselect("unsetdisabled", value[i]);
				}
			}
			else if (this.divselect("isdisabled", value)){
				this.each(function(){
					var $option = $(this).divselect("getElementByValue", value);
					$option.removeData("disabled");
					$option.removeClass(cssprefix+"-disabled");
				});
			}
			return this;
		},
		/**
		 * unsetdisabled alias
		 */
		setenabled : function(value){
			return this.divselect("unsetdisabled", value);
		},
		
		/**
		 * Get option elements in a structure that compatible with the add() method
		 * @param <string> format returned format ("none"|"object"|"html")
		 * @return <array> data structure
		 */
		getoptions : function(format){
			if (typeof(format) == "undefined") format = "none";
			var options = [];
			var $divelement = this;
			var cssprefix = $divelement.data("cssprefix");
			$divelement.find("."+cssprefix+"-item").each(function(){
				var $option = $(this);
				if (format == "none"){
					options.push($option.data("value"));
				}
				if (format == "object"){
					options.push({
						value: $option.data("value"),
						html: $option.html(),
						selected: $option.data("selected") ? true : false,
						readonly: $option.data("readonly") ? true : false,
						disabled: $option.data("disabled") ? true : false
					});
				}
				if (format == "html"){
					var params = {
						selected: $option.data("selected") ? ' selected="selected"' : '',
						readonly: $option.data("readonly") ? ' readonly="readonly"' : '',
						disabled: $option.data("disabled") ? ' disabled="disabled"' : ''
					};
					var param = params.selected + params.readonly + params.disabled;
					options.push('<option value="'+$option.data("value")+'"'+param+'>'+$option.html()+'</option>');
				}
			});
			return options;
		},
		
		/**
		 * Get optgroup elements in a structure that compatible with the addgroup() method
		 * @param <string> format returned format ("none"|"options"|"surround")
		 * @return <array> data structure
		 */
		getoptgroups : function(format){
			if (typeof(format) == "undefined") format = "none";
			var optgroups = [];
			var $divelement = this;
			var cssprefix = $divelement.data("cssprefix");
			$divelement.find("."+cssprefix+"-group").each(function(){
				var $optgroup = $(this);
				if (format == "none"){
					optgroups.push($optgroup.data("label"));
				}
				if (format == "options"){
					var options = [];
					$optgroup.find("."+cssprefix+"-item").each(function(){
						var $option = $(this);
						options.push({
							value: $option.data("value"),
							html: $option.html(),
							selected: $option.data("selected") ? true : false,
							readonly: $option.data("readonly") ? true : false,
							disabled: $option.data("disabled") ? true : false
						});
					});
					optgroups.push({
						label: $optgroup.data("label"),
						options: options
					});
				}
				if (format == "surround") {
					var surround = [null, null];
					var $opt1, $opt2;
					var num = $optgroup.find("."+cssprefix+"-item").length;
					if (num > 0){
						$opt1 = $optgroup.find("."+cssprefix+"-item").eq(0);
						$opt2 = $optgroup.find("."+cssprefix+"-item").eq(num - 1);
						surround = [$opt1.data("value"), $opt2.data("value")];
					}
					optgroups.push({
						label: $optgroup.data("label"),
						surround: surround
					});
				}
			});
			return optgroups;
		},
		
		/**
		 * Get a select element that equivalent with the divselect current state
		 * @param <string> format returned format ("object"|"html")
		 * @param <bool> recover if true it recovers the option tags original innerHTML
		 * @return <object|string> the data structure that describe the select element, or it's HTML code
		 */
		getselect : function(format, recover){
			if (typeof(recover) == "undefined") recover = false;
			var n, m, value, structure;
			var select = null;
			var $divelement = this;
			var attributes = $divelement.data("options").divattributes;
			var attributevalues = {};
			for (n = 0; n < attributes.length; n++){
				value = $divelement.attr(attributes[n]);
				if (value !== undefined){
					attributevalues[attributes[n]] = value;
				}
			}
			structure = $divelement.divselect("getSelectStructure");
			if (format == "object"){
				select = {
					attributes: attributevalues,
					readonly: $divelement.data("readonly") ? true : false,
					disabled: $divelement.data("disabled") ? true : false,
					structure : structure
				};
			}
			if (format == "html"){
				var attrlist = "";
				for (var name in attributevalues){
					attrlist += ' '+name+'="'+attributevalues[name]+'"';
				}
				select = '<select'+attrlist+'>\n';
				for (n = 0; n < structure.length; n++){
					if (structure[n].type == "option"){
						// külső option
						if (recover){
							select += structure[n].originalTag+'\n';
						}
						else{
							select += structure[n].tag+'\n';
						}
					}
					else{
						// optgroup
						select += '<optgroup label="'+structure[n].label+'">\n';
						for (m = 0; m < structure[n].options.length; m++){
							// belső option
							if (recover){
								select += structure[n].options[m].originalTag+'\n';
							}
							else{
								select += structure[n].options[m].tag+'\n';
							}
						}
						select += '</optgroup>\n';
					}
				}
				select += '</select>';
			}
			return select;
		},
		
		/**
		 * Add to the list option element(s)
		 * @param <string|object|array> elementDeterminer element describer data structure
		 * @param <string> relative ("before"|"after") insert before or after the location determiner
		 * @param <string> locationValue location determiner for the insertion (value attribute of an option)
		 * @return <jQuery>
		 */
		add : function(elementDeterminer, relative, locationValue){
			
			// data collecting
			var $element, $locationElement, elementData, optiontags = [];
			var $divelement = this;
			var cssprefix = $divelement.data("cssprefix");
			var htmltemplate = $divelement.data("options").htmltemplate;
			var unbubble = $divelement.data("options").unbubble;
			if (typeof(relative) == "undefined"){
				relative = "before";
			}
			if (typeof(locationValue) == "undefined"){
				$locationElement = null;
			}
			else{
				$locationElement = $divelement.divselect("getElementByValue", locationValue);
			}
			
			// create the new option segments
			if ($.isArray(elementDeterminer)){
				// array
				var i;
				if (relative == "after"){
					for (i = elementDeterminer.length - 1; i >= 0; i--){
						$divelement.divselect("add", elementDeterminer[i], "after", locationValue);
					}
				}
				else{
					for (i = 0; i < elementDeterminer.length; i++){
						$divelement.divselect("add", elementDeterminer[i], "before", locationValue);
					}
				}
				return this;
			}
			else{
				elementData = $divelement.divselect("createOptionFromObject", elementDeterminer);
				$element = elementData.$element;
				optiontags = elementData.optiontags;
			}
			
			// option insertion
			var dataStore = {
				selected: false,
				disabled: false,
				readonly: false,
				value: "",
				html: ''
			};
			var $segment = $(Creation.createOptionTag($element.get(0), htmltemplate, optiontags, cssprefix, dataStore));
			if ($locationElement != null){
				if (relative == "after"){
					$locationElement.after($segment);
				}
				else{
					$locationElement.before($segment);
				}
			}
			else{
				if (relative == "after"){
					$divelement.find("."+cssprefix+"-menu").prepend($segment);
				}
				else{
					$divelement.find("."+cssprefix+"-menu").append($segment);
				}
			}
			
			// data attachment
			$segment.attr("tabindex", "0");
			$segment.data("value", dataStore.value);
			if (dataStore.selected){
				$divelement.divselect("select", dataStore.value);
			}
			if (dataStore.disabled){
				$segment.data("disabled", true);
			}
			if (dataStore.readonly){
				$segment.data("readonly", true);
			}
			
			// event handlers
			$segment.bind("click.divselect", function(event){
				if (!$divelement.data("options").disableselect){
					Interaction.handleSpecialAction.select($(this), $divelement, event);
					Interaction.bindUnbubbleEvent($divelement.find("."+cssprefix+"-selector"), cssprefix, unbubble);
				}
			});
			Interaction.bindUnbubbleEvent($segment, cssprefix, unbubble);
			
			return this;
			
		},
		
		/**
		 * Add to the list optgroup element(s) (with the inside options)
		 * @param <object|array> elementDeterminer element describer data structure
		 * @param <string> relative ("before"|"after") insert before or after the location determiner
		 * @param <string> locationValue location determiner for the insertion (value attribute of an option)
		 * @return <jQuery>
		 */
		addgroup : function(elementDeterminer, relative, locationValue){
			
			// data collecting
			var $divelement = this;
			var cssprefix = $divelement.data("cssprefix");
			var htmltemplate = $divelement.data("options").htmltemplate;
			
			// create option elements and determine the optgroup location
			if ($.isArray(elementDeterminer)){
				// array
				var i;
				if (relative == "after"){
					for (i = elementDeterminer.length - 1; i >= 0; i--){
						$divelement.divselect("addgroup", elementDeterminer[i], "after", locationValue);
					}
				}
				else{
					for (i = 0; i < elementDeterminer.length; i++){
						$divelement.divselect("addgroup", elementDeterminer[i], "before", locationValue);
					}
				}
				return this;
			}
			if (elementDeterminer.options){
				$divelement.divselect("add", elementDeterminer.options, relative, locationValue);
			}
			if (typeof(elementDeterminer.surround) == "undefined"){
				var elementData1 = $divelement.divselect("createOptionFromObject", elementDeterminer.options[0]);
				var elementData2 = $divelement.divselect("createOptionFromObject", elementDeterminer.options[elementDeterminer.options.length - 1]);
				elementDeterminer.surround = [elementData1.$element.val(), elementData2.$element.val()];
			}
			var $element1 = $divelement.divselect("getElementByValue", elementDeterminer.surround[0]);
			var $element2 = $divelement.divselect("getElementByValue", elementDeterminer.surround[1]);
			
			// create optgroup segments
			htmltemplate = htmltemplate.replace(/\{cssprefix\}/g, cssprefix);
			var segment_optgroup_start = htmltemplate.replace(/^[\s\S]*\{optgroup_start\}([\s\S]*)\{\/optgroup_start\}[\s\S]*$/g, "$1");
			var segment_optgroup_end = htmltemplate.replace(/^[\s\S]*\{optgroup_end\}([\s\S]*)\{\/optgroup_end\}[\s\S]*$/g, "$1");
			segment_optgroup_start = segment_optgroup_start.replace(/\{optgroup\.label\}/mg, elementDeterminer.label);
			
			// optgroup insertion
			if ($element1.is($element2)){
				$element1.wrapAll(segment_optgroup_start+segment_optgroup_end);
			}
			else{
				$element1.nextUntil($element2).add($element1).add($element2).wrapAll(segment_optgroup_start+segment_optgroup_end);
			}
			$element1.parents("."+cssprefix+"-group").data("label", elementDeterminer.label);
			
			return this;
			
		},
		
		/**
		 * Remove option element(s) from the list
		 * @param <string|array> value(s)
		 * @return <jQuery>
		 */
		remove : function(value){
			if ($.isArray(value)){
				for (var i = 0; i < value.length; i++){
					this.divselect("remove", value[i]);
				}
			}
			this.each(function(){
				$(this).divselect("getElementByValue", value).remove();
			});
			return this;
		},
		
		/**
		 * Remove optgroup element(s) from the list
		 * @param <string|array> label attribute
		 * @param <bool> withOptions remove the inner options
		 * @return <jQuery>
		 */
		removegroup : function(label, withOptions){
			if (typeof(withOptions) == "undefined"){
				withOptions = false;
			}
			var cssprefix = this.data("cssprefix");
			if ($.isArray(label)){
				for (var i = 0; i < label.length; i++){
					this.divselect("removegroup", label[i], withOptions);
				}
			}
			this.each(function(){
				$(this).find("."+cssprefix+"-group").each(function(){
					if ($(this).data("label") == label){
						if (withOptions){
							$(this).remove();
						}
						else{
							var $items = $(this).find("."+cssprefix+"-item").detach();
							$(this).replaceWith($items);
						}
						return false;
					}
				});
			});
			return this;
		},
		
		/**
		 * Remove all the options and optgroups from the list
		 * @param <string> remove ("all"|"options"|"optgroups")
		 * @return <jQuery>
		 */
		truncate : function(remove){
			if (typeof(remove) == "undefined") remove = "all";
			var $divelement = this;
			if (remove == "all"){
				$.each($divelement.divselect("getoptgroups"), function(){
					$divelement.divselect("removegroup", this, true);
				});
				$.each($divelement.divselect("getoptions"), function(){
					$divelement.divselect("remove", this);
				});
			}
			if (remove == "options"){
				$.each($divelement.divselect("getoptions"), function(){
					$divelement.divselect("remove", this);
				});
			}
			if (remove == "optgroups"){
				$.each($divelement.divselect("getoptgroups"), function(){
					$divelement.divselect("removegroup", this, false);
				});
			}
			return this;
		},
		
		// UTILITY METHODS
		
		/**
		 * Get list element by value (utility method)
		 * @param <string> value
		 * @return <jQuery> element
		 */
		getElementByValue : function(value){
			var cssprefix = this.data("cssprefix");
			var $element = $();
			this.find("."+cssprefix+"-item").each(function(){
				if ($(this).data("value") == value){
					$element = $(this);
					return false;
				}
			});
			return $element;
		},
		
		/**
		 * Get value by the list element (utility method)
		 * @param <jQuery|DOM|string> element element describer data structure
		 * @return <string> value
		 */
		getValueByElement : function(element){
			var value = null;
			if (element.jquery){
				// jQuery object
				value = element.data("value");
			}
			else if (element.nodeType){
				// DOM element
				value = $(element).data("value");
			}
			else if (typeof(element) == "string"){
				// innerHTML
				var cssprefix = this.data("cssprefix");
				this.find("."+cssprefix+"-item").each(function(){
					if ($(this).html() == element){
						value = $(this).data("value");
						return false;
					}
				});
			}
			return value;
		},
		
		/**
		 * Get a select element structure that equivalent with the divselect current state (utility method)
		 * @return <array> array of objects that describe the structure
		 */
		getSelectStructure : function(){
			var $divelement = this;
			var cssprefix = $divelement.data("cssprefix");
			var params, param;
			var structure = [];
			var $elem, $option, $optgroup, $lastgroup;
			$divelement.find("."+cssprefix+"-item, ."+cssprefix+"-group").each(function(index){
				$elem = $(this);
				if ($elem.is("."+cssprefix+"-item")){
					// option
					params = {
						selected: $elem.data("selected") ? ' selected="selected"' : '',
						readonly: $elem.data("readonly") ? ' readonly="readonly"' : '',
						disabled: $elem.data("disabled") ? ' disabled="disabled"' : ''
					};
					param = params.selected + params.readonly + params.disabled;
					$option = {
						type: "option",
						value: $elem.data("value"),
						html: $elem.html(),
						selected: $elem.data("selected") ? true : false,
						readonly: $elem.data("readonly") ? true : false,
						disabled: $elem.data("disabled") ? true : false,
						tag: '<option value="'+$elem.data("value")+'"'+param+'>'+$elem.html()+'</option>',
						originalTag: '<option value="'+$elem.data("value")+'"'+param+'>'+$elem.data("html")+'</option>'
					};
					$optgroup = $divelement.divselect("getContainerOptgroup", $elem.data("value"), "element");
					if ($optgroup && $optgroup.data("label") == $lastgroup.label){
						$lastgroup.options.push($option);
					}
					else{
						structure.push($option);
					}
				}
				else{
					// optgroup
					$lastgroup = {
						type: "optgroup",
						label: $elem.data("label"),
						options: []
					};
					structure.push($lastgroup);
				}
			});
			return structure;
		},
		
		/**
		 * Get the container optgroup by the option value (utility method)
		 * @param <string> value option value
		 * @param <string> format returning format ("label"|"element")
		 * @return <string|jQuery> the optgroup element or null
		 */
		getContainerOptgroup : function(value, format){
			var ret;
			var $divelement = this;
			var cssprefix = $divelement.data("cssprefix");
			var $option = $divelement.divselect("getElementByValue", value);
			if ($option.length == 0){
				return undefined;
			}
			var $optgroup = $option.parents("."+cssprefix+"-group").eq(0);
			if ($optgroup.length > 0){
				ret = (format == "label") ? $optgroup.data("label") : $optgroup;
			}
			else{
				ret = null;
			}
			return ret;
		},
		
		/**
		 * Parse the option describer data structure
		 * @param <string|object> elementDeterminer option element describer
		 * @return <jQuery>
		 */
		createOptionFromObject : function(elementDeterminer){
			var describer;
			// objektum-értelmező függvény
			var getOptionFromObject = function(o){
				var element = '<option{attr}></option>';
				var attr = '';
				var descr = {
					element: '<option></option>',
					html: o.html ? o.html : '',
					value: o.value ? o.value : ''
				};
				if (o.value)	attr += ' value="'+o.value+'"';
				if (o.selected) attr += ' selected="selected"';
				if (o.disabled) attr += ' disabled="disabled"';
				if (o.readonly) attr += ' readonly="readonly"';
				descr.element = element.replace(/\{attr\}/g, attr);
				return descr;
			};
			var elementData = {
				$element: null,
				optiontags: []
			};
			if ($.isPlainObject(elementDeterminer)){
				// objektum
				describer = getOptionFromObject(elementDeterminer);
				elementData.$element = $(describer.element);
				elementData.optiontags[describer.value] = describer.html;
			}
			else if (typeof(elementDeterminer) == "string" && /<option[^>]*>(.*)<\/option>/g.test(elementDeterminer)){
				// html
				elementData.$element = $(elementDeterminer.replace(/(<option[^>]*>)(.*)(<\/option>)/g, "$1$3"));
				elementData.optiontags[elementData.$element.val()] = elementDeterminer.replace(/(<option[^>]*>)(.*)(<\/option>)/g, "$2");
			}
			return elementData;
		},
		
		// EXTENSION METHODS
		
		/**
		 * Get a reference to the Divselect object (to modify/extend the inner operations)
		 * @param <string> name variable name
		 * @param <object> context variable context (e.g. window)
		 * @return <object> the Divselect object
		 */
		getplugin : function(name, context){
			var plugin = {};
			plugin.defaultoptions = defaultoptions;
			plugin.optionData = optionData;
			plugin.Util = Util;
			plugin.Creation = Creation;
			plugin.Interaction = Interaction;
			plugin.methods = methods;
			if (typeof(name) != "undefined"){
				if (typeof(context) == "undefined"){
					context = window;
				}
				context[name] = plugin;
			}
			return plugin;
		}

	};

	// intergate plugin to the jQuery library
	$.fn.divselect = function(method){
		if (methods[method]){
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		else if (typeof(method) == "object" || !method){
			return methods.create.apply(this, arguments);
		}
		else{
			$.error("A jquery.divselect pluginnak nincs "+method+" metódusa.");
			return false;
		}
	};

})(jQuery);
