jmw = window.jmw || {};

jmw.ElementBuilder = function(config){
    this.config = config;
};
jmw.ElementBuilder.prototype = {
    defaultTag: 'div',
    build: function(elConfig, elAppend){
        var el, data, $el;
        el = document.createElement(elConfig.tag || this.defaultTag);
        $el = $(el);
        data = elConfig.data || {};
        delete elConfig.tag;
        delete elConfig.data;
        $.each(data,function(key, val){
            $.jqmData($el, key, val);
        });
        
        $.each(elConfig, function(key, val){
            switch(key){
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
                    $.each(val, function(i, val){
                        if(val.role){
                            jmw.buildWidget(val.role, val, $el);
                        } else {
                            jmw.ElementBuilder.build(val, $el);
                        }
                    });
                    break;
                default:
                    $el.attr(key, val);
            }
        });
    }
};
