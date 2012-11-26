(function(){
    var root = this;
    var jmw = {};
    // Export the jmw object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `jmw` as a global object via a string identifier,
    // for Closure Compiler "advanced" mode.
    if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = jmw;
    }
    exports.jmw = jmw;
    } else {
    root['jmw'] = jmw;
    }

    jmw.defaultTag = 'div';

    jmw.layout = function(el, config) {
        if(el && !config){
            config = el;
            el = $('body');
        }
        var $el = $(el);
        var $layout = jmw.build(config, config && config.role == 'page');
        el.append($layout);
        var role = $layout.jqmData('role');
        if(role && $layout[role]){
            $layout[role]();
        } else {
            $layout.page();
        }
        if (role == 'page' && config.defer !== true) {
            $.mobile.changePage($layout);
        }
        return $layout;
    };
    jmw.buildWidget = function(role, config) {
        var $el = null;
        if (jmw.widget[role]) {
            $el = jmw.widget[role](config);
        } else {
            if(role){
                if(!config.data){ config.data={}; }
                config.data.role = role;
                delete config.role;
            }
            $el = jmw.build(config);
        }
        return $el;
    };
    jmw.build = function(elConfig, defer) {
            var el, data, $el, complete = false;
            elConfig = elConfig || {};
            if(elConfig.el){
                $el = $(elConfig.el);
                delete elConfig.el;
            }
            if(elConfig.theme){
                elConfig.data = elConfig.data || {};
                elConfig.data.theme = elConfig.theme;
                delete elConfig.theme;
            }
            if (elConfig.role) {
                $el = jmw.buildWidget(elConfig.role, elConfig);
                if(!defer || !elConfig.defer){
                    $el.trigger('create');
                }
                complete = !!$el;
            } else {
                el = document.createElement(elConfig.tag || this.defaultTag);
                $el = $(el);
            }

            if(!complete){
                data = elConfig.data || {};
                jmw._addDataAttr($el, data);
                delete elConfig.tag;
                delete elConfig.data;

                $.each(elConfig, function(key, val) {
                    switch (key) {
                    case 'class':
                        $el.addClass(val);
                        break;
                    case 'text':
                        $el.text(val);
                        break;
                    case 'value':
                        $el.val(val);
                        break;
                    case 'html':
                        $el.html(val);
                        break;
                    case 'id':
                        $el.attr('id', val);
                        break;
                    case 'cn':
                    case 'children':
                        $.each(val, function(i, val) {
                            if (val.role) {
                                $el.append(jmw.buildWidget(val.role, val));
                            } else {
                                $el.append(jmw.builder.build(val));
                            }
                        });
                        break;
                    default:
                        $el.attr(key, val);
                    }
                });
            }

            return $el;
        };
        jmw._addDataAttr = function($el, data){
            var nsData = ($.mobile && $.mobile.ns) ? 'data-' + $.mobile.ns + '-' : 'data-';
            $.each(data, function(key, val) {
                //writes to the internal element / data cache
                //but not to the actual element unless the attribute
                //already exists
                $el.jqmData(key, val);
                //actually writes to the element
                $el.attr(nsData+key, val);
            });
        };

}).call(this);

(function(jmw){
    jmw.widget = {};
    function toData(keys, config){
        config = config || {}, keys = keys || [];
        config.data = config.data || {};
        $.each(config, function(key, val){
            if(key in keys){
                config.data[key] = val;
                delete config[key];
            }
        });
        return config;
    }
    function buildMarkup(keys, config, role){
        var cfg = toData(cfgKeys,config);
        role = role || cfg.role || cfg.data.role;
        delete cfg.role; delete cfg.data.role;
        $el = jmw.build(cfg, true);
        jmw._addDataAttr($el, {'role': role});
        return $el;
    }
    //TODO - controlgroup, fixed toolbar, link, listview item, select, radio, text input/area
    var configKeys = {
        button: ['corners','icon','iconpos','iconshadow','inline','mini','shadow'],
        checkbox: ['mini'],
        collapsible: ['collapsed','collapsed-icon','content-theme','expanded-icon','iconpos','inset','mini'],
        'collapsible-set':  ['collapsed-icon','content-theme','expanded-icon','iconpos','inset','mini'],
        dialog: ['close-btn-text', 'dom-cache', 'overlay-theme', 'title'],
        slider: ['highlight', 'mini', 'track-theme'],
        footer: ['id', 'position', 'fullscreen'],
        header: ['id', 'position', 'fullscreen'],
        listview: ['autodividers', 'count-theme', 'divider-theme', 'filter', 'filter-placeholder', 'filter-theme',
            'header-theme', 'inset', 'split-theme', 'split-icon'],
        navbar: ['iconpos'],
        page: ['add-back-btn', 'back-btn-text', 'back-btn-theme', 'close-btn-text', 'dom-cache', 'overlay-theme', 'title', 'url'],
        popup: ['corners', 'overlay-theme', 'shadow', 'tolerance']
    };
    $.each(configKeys, function(role,keys){
        jmw.widget[key] = (function(){
            return function(config){
                return buildMarkup(keys, config, role);
            };
        }());
    });
})(jmw);
