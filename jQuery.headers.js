(function($) {
    var pluginName = "headers";
    var base = { init: $.noop, create: $.noop };
    var prototype = $.extend({}, base, {
        create: function(options) {
            if (!this.element.is('table')) {
                return $.error("Matched elements are required to be tables.");
            }

            this.options = $.extend({
                appendTo: this.element.parent(),
                headerRow: this.element.find('thead,tr').first()
            }, options);


            this.originalHeader = $(this.options.headerRow);
            this.header = this.originalHeader.clone();
            this.parent = $(this.options.appendTo);

            this.originalHeader
                .add(this.originalHeader.find('tr,th,td'))
                .css({
                    visibility: 'hidden',
                    border: 'none'
                });

            this.wrap = $('<table>', {
                'class': this.element.attr('class'),
                'css': {
                    height: this.originalHeader.outerHeight(),
                    width: this.element.outerWidth(),
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    zIndex: 1
                }
            });

            this.wrap
                .addClass('ui-headers')
                .append(this.header)
                .prependTo(this.parent);

            var fn = $.proxy(this._onParentScroll, this);

            if ($.isIE8()) {
                var orgFn = fn;
                fn = function() {
                    $.sFork("ie8-scroll", orgFn, 50);
                };
            }

            this.parent
                .scroll(fn);

            $.resize($.proxy(this.refresh, this));

            this.refresh();
            return this.element;
        },

        refresh: function() {
            var columns = this.header.find('td,th');

            this.originalHeader
                .find('td,th')
                .each(function(idx) {
                    var el = $(this);
                    columns.eq(idx)
                        .css({
                            width: el.outerWidth(),
                            height: el.outerHeight()
                        });
                });

            this.wrap
                .css({
                    //height: this.originalHeader.outerHeight(),
                    width: this.element.outerWidth()
                });

            this.originalHeader
                .css({
                    height: this.wrap.outerHeight()
                });
        },

        destroy: function() {
            this.wrap
                .remove();

            this.originalHeader
                .add(this.originalHeader.find('tr,th,td'))
                .removeAttr('style');

            this.element
                .removeData(pluginName);
        },

        _onParentScroll: function() {
            this.wrap
                .css({
                    left: -this.parent.scrollLeft()
                });
        }
    });

    function init(method) {
        var instance = this.data(pluginName);
        if (typeof instance === "undefined" || instance === null) {
            this.data(pluginName, constr.apply(this, arguments));
            return this;
        }

        if (arguments.length === 0) {
            return instance.init();
        }

        if (typeof instance[method] === "undefined") {
            return $.error('Method ' + method + ' does not exist on jQuery.' + pluginName);
        }

        return instance[method].apply(instance, Array.prototype.splice.call(arguments, 1)) || this;
    }

    function constr(options) {
        var instance = $.noop;
        instance.prototype = prototype;
        instance = new instance();
        instance.element = this;
        instance.create(options);
        return instance;
    }

    $.fn[pluginName] = init;
})(jQuery);