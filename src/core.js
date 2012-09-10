(function(){
    var jmw = {};
    jmw.layout = function(el, config) {
        if(el && !config){
            config = el;
            el = $('body');
        }
        var $el = $(el);
        var $layout = jmw.builder.build(config);
        el.append($layout);
        var role = $layout.jqmData('role');
        if(role && $layout[role]){
            $layout[role]();
        } else {
            $layout.page();
        }
        if (role == 'page') {
            $.mobile.changePage($layout);
        }
        return $layout;
    };
    jmw.buildWidget = function(role, config) {
        var $el = null;
        if (this.WidgetBuilder && this.WidgetBuilder['role']) {
            $el = jmw.widgetBuilder['role'](config);
        } else {
            if(role){
                if(!config.data){ config.data={}; }
                config.data.role = role;
                delete config.role;
            }
            $el = jmw.builder.build(config);
        }
        return $el;
    };
    this.jmw = jmw;
}());

(function(jmw){
    var builder = function(options){
        this.defaultTag = 'div';
        $.extend(this, options);
    };
    builder.prototype.build = function(elConfig) {
            var el, data, $el, complete = false;

            if(elConfig.el){
                $el = $(elConfig.el);
                delete elConfig.el;
            } else if (elConfig.role) {
                $el = jmw.buildWidget(elConfig.role, elConfig);
                complete = !!$el;
            } else {
                el = document.createElement(elConfig.tag || this.defaultTag);
                $el = $(el);
            }

            if(!complete){
                data = elConfig.data || {};
                var nsData = ($.mobile && $.mobile.ns) ? 'data-' + $.mobile.ns + '-' : 'data-';
                $.each(data, function(key, val) {
                    //writes to the internal element / data cache
                    //but not to the actual element unless the attribute
                    //already exists
                    $el.jqmData(key, val);
                    //actually writes to the element
                    $el.attr(nsData+key, val);
                });

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
    jmw.DomBuilder = builder;
    jmw.builder = new builder();
}(jmw));
