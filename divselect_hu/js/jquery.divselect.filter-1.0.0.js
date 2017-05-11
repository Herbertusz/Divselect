/*!
 * divselectfilter jQuery plugin v1.0.0
 * Copyright (c) 2012.10.04. Horváth Norbert
 */
'use strict';

(function($){

    // Alapértelmezett beállítások
    var defaultoptions = {

        // az elem felépítését leíró HTML template
        template :
            '<div class="{cssprefix}">' +
                '<input class="{cssprefix}-input" type="hidden" name="{select.name}" value="{select.val}" />' +
                '<div class="{cssprefix}-selector {select.readonly} {select.disabled}">{select.defhtml}</div>' +
                '<div class="{cssprefix}-menu">' +
                    '<div class="{cssprefix}-filter">' +
                        '<input class="{cssprefix}-filter-input" type="text" value="" />' +
                        '<span class="{cssprefix}-filter-reset">X</span>' +
                    '</div>' +
                    '{loop}' +
                        '{optgroup_start}' +
                            '<div class="{cssprefix}-group">' +
                                '<div class="{cssprefix}-grouptitle">{optgroup.label}</div>' +
                        '{/optgroup_start}' +
                        '{optgroup_end}' +
                            '</div>' +
                        '{/optgroup_end}' +
                        '{optiontags}' +
                            '<div class="{cssprefix}-item {option.readonly} {option.disabled}">{option.html}</div>' +
                        '{/optiontags}' +
                    '{/loop}' +
                '</div>' +
                '<div class="{cssprefix}-background"></div>' +
            '</div>',

        // filter engedélyezése
        enabled : true,

        // ESEMÉNYKEZELŐK (futási időben módosíthatók)

        /**
         * Lista lenyitásakor fut le
         * @param <Event> event jquery Event objektum
         * @scope <DOM> this: divselect elem
         */
        open : function(event){
            var $divelement = $(this);
            $divelement.find("."+$divelement.data("cssprefix")+"-filter-input").focus();
        }

    };

    // Publikus metódusok
    var methods = {

        /**
         * A select lecserélése
         * @param <object> settings alapbeállítások felülírása
         * @return <jQuery> legyártott elem
         */
        create : function(settings){
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
            return this.each(function(){
                var $divelement = $(this);
                if (!$divelement.data("divselect") || $divelement.data("divselectfilter")) return;

                // eseménykezelők
                $divelement.find("."+cssprefix+"-filter-input").bind("keypress.divselectfilter", function(event){
                    if ($divelement.data("filter-enabled")){
                        Interaction.handleSpecialAction.dropdown($divelement, event);
                    }
                });
                $divelement.data("options").create.call($divelement.get(0), $.Event("create"));
            });
        },

        /**
         * Tulajdonság módosítása/lekérdezése futási időben
         * @param <string|object> name tulajdonság neve
         * @param <string> value tulajdonság értéke
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
         * Referencia lekérése a Divselect objektumra (a belső működés módosításához/bővítéséhez)
         * @param <string> name változó neve
         * @param <object> context változó kontextusa (pl. window)
         * @return <object> a Divselect objektum
         */
        getplugin : function(name, context){
            var plugin = {};
            plugin.defaultoptions = defaultoptions;
            plugin.Interaction = Interaction;
            plugin.methods = methods;
            return plugin;
        }

    };

    $.fn.divselectfilter = function(method){
        if (methods[method]){
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof(method) == "object" || !method){
            return methods.create.apply(this, arguments);
        }
        else{
            $.error("A jquery.divselect.filter pluginnak nincs "+method+" metódusa.");
            return false;
        }
    };

})(jQuery);
