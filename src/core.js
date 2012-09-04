jmw = window.jmw || {};

jmw = {
    widgets: null,
    pages: null,
    layout: function(el, config) {
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
    },
    buildWidget: function(role, config) {
        var $el = null;
        if (this.widgetBuilder && this.widgetBuilder['role']) {
            $el = jmw.widgetBuilder['role'](config);
        } else {
            $el = jmw.builder.build(config);
        }
        return $el;
    },
    builder: {
        defaultTag: 'div',
        build: function(elConfig) {
            var el, data, $el;
            el = document.createElement(elConfig.tag || jmw.builder.defaultTag);
            $el = $(el);

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

            return $el;
        }
    }
}
