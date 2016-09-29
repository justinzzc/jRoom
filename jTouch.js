/**
 * Created by zhouzechen on 16/9/27.
 */

(function ($) {

    var el = document.createElement('div'),
        transformProps = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' '),
        transformProp = support(transformProps),
        transitionDuration = 'transitionDuration WebkitTransitionDuration MozTransitionDuration OTransitionDuration msTransitionDuration'.split(' '),
        transitionDurationProp = support(transitionDuration);

    function support(props) {
        for (var i = 0, l = props.length; i < l; i++) {
            if (typeof el.style[props[i]] !== "undefined") {
                return props[i];
            }
        }
    }

    function adaptCss(name, value) {
        var keys = [
            name,
            '-webkit-' + name,
            '-moz-' + name,
            '-o-' + name,
            '-ms-' + name
        ];

        var result = {};

        $.each(keys, function (i, v) {
            result[v] = value;
        });


        return result;
    }

    $.fn.jTouch = function (options) {

        var me = this,
            settings = $.extend(true, {
                observer: $(document),
                keyWatch: true,
                delay: 50,
                viewLimit: {
                    xMin: undefined,
                    xMax: undefined,
                    yMin: undefined,
                    yMax: undefined
                },
                keyDelta: 5,
                touchReverse: false
            }, options);

        function getAvailableX(x) {

            if (typeof  settings.viewLimit.xMin != 'undefined' && x <= settings.viewLimit.xMin) {
                return settings.viewLimit.xMin;
            }

            if (typeof  settings.viewLimit.xMax != 'undefined' && x >= settings.viewLimit.xMax) {
                return settings.viewLimit.xMax;
            }
            return x;
        }

        function getAvailableY(y) {

            if (typeof  settings.viewLimit.yMin != 'undefined' && y <= settings.viewLimit.yMin) {
                return settings.viewLimit.yMin;
            }


            if (typeof  settings.viewLimit.yMax != 'undefined' && y >= settings.viewLimit.yMax) {
                return settings.viewLimit.yMax;
            }

            return y;
        }

        var mouse = {
                start: {}
            },
            touch = document.ontouchmove !== undefined,
            viewport = {
                ob: $(settings.observer),
                x: 0,
                y: 0,
                el: me,
                perspectiveRate: 1,
                perspective: null,
                changeDistance: function (d) {
                    viewport.perspectiveRate = d;
                    if (!viewport.perspective) {
                        viewport.perspective = viewport.el.parent().css('perspective');
                        viewport.perspective && (viewport.perspective = parseFloat(viewport.perspective));
                    }
                    viewport.perspective && viewport.el.parent().css('perspective', viewport.perspective * viewport.perspectiveRate);
                },
                move: function (coords) {
                    if (coords) {
                        if (typeof coords.x === "number")
                            this.x = getAvailableX(coords.x);
                        if (typeof coords.y === "number")
                            this.y = getAvailableY(coords.y);
                    }
                    //console.log('move :x[' + this.x + '],y[' + this.y + ']');
                    var rev = settings.touchReverse ? -1 : 1;
                    this.el[0].style[transformProp] = "rotateX(" + (rev * this.x) + "deg) rotateY(" + (rev * this.y) + "deg)";
                    this.overResetCheck();
                },
                aniMove: function (coords) {
                    this.el.css(adaptCss('transition', 'transform 200ms ease'));

                    this.move(coords);
                },
                overResetCheck: function () {
                    /*if (this.x > 360 || this.y > 360) {
                        var transitionCss = viewport.el.css('transition') || viewport.el.css('-webkit-transition');
                        viewport.el.css(adaptCss('transition', 'none'));
                        this.move({
                            x: viewport.x % 360,
                            y: viewport.y % 360
                        });
                        viewport.el.css(adaptCss('transition', transitionCss));
                    }*/
                },
                reset: function () {
                    this.move({x: 0, y: 0});
                }
            };

        var animationEnd = 'webkitTransitionEnd mozTransitionEnd oTransitionEnd transitionend';
        viewport.el.on(animationEnd, function () {
            viewport.el.css(adaptCss('transition', 'none'));
        });

        viewport.duration = function () {
            return settings.delay || 0;
        }();

        if (settings.keyWatch) {
            $(document).keydown(function (evt) {
                switch (evt.keyCode) {
                    case 37: // left
                        viewport.aniMove({y: viewport.y - settings.keyDelta});
                        break;

                    case 38: // up
                        evt.preventDefault();
                        viewport.aniMove({x: viewport.x + settings.keyDelta});
                        //viewport.changeDistance(viewport.perspectiveRate + 0.1);
                        break;

                    case 39: // right
                        viewport.aniMove({y: viewport.y + settings.keyDelta});
                        break;

                    case 40: // down
                        evt.preventDefault();
                        viewport.aniMove({x: viewport.x - settings.keyDelta});
                        //viewport.changeDistance(viewport.perspectiveRate - 0.1);
                        break;

                    case 27: //esc
                        viewport.reset();
                        break;

                    default:
                        break;
                }

            });
        }


        viewport.ob.bind('mousedown touchstart', function (evt) {
            delete mouse.last;
            if ($(evt.target).is('a, iframe')) {
                return true;
            }

            evt.originalEvent.touches ? evt = evt.originalEvent.touches[0] : null;
            mouse.start.x = evt.pageX;
            mouse.start.y = evt.pageY;
            viewport.ob.bind('mousemove touchmove', function (event) {
                // Only perform rotation if one touch or mouse (e.g. still scale with pinch and zoom)
                if (!touch || !(event.originalEvent && event.originalEvent.touches.length > 1)) {
                    event.preventDefault();
                    // Get touch co-ords
                    event.originalEvent.touches ? event = event.originalEvent.touches[0] : null;
                    viewport.el.trigger('move-viewport', {x: event.pageX, y: event.pageY});
                }
            });

            viewport.ob.bind('mouseup touchend', function () {
                viewport.ob.unbind('mousemove touchmove');
            });
        });

        viewport.el.bind('move-viewport', function (evt, movedMouse) {
            // Reduce movement on touch screens
            //var movementScaleFactor = touch ? 4 : 1;
            var movementScaleFactor = touch ? 4 : 5;

            if (!mouse.last) {
                mouse.last = mouse.start;
            } else {
                if (forward(mouse.start.x, mouse.last.x) != forward(mouse.last.x, movedMouse.x)) {
                    mouse.start.x = mouse.last.x;
                }
                if (forward(mouse.start.y, mouse.last.y) != forward(mouse.last.y, movedMouse.y)) {
                    mouse.start.y = mouse.last.y;
                }
            }

            viewport.move({
                x: viewport.x + parseInt((movedMouse.y - mouse.start.y ) / movementScaleFactor),
                y: viewport.y - parseInt((movedMouse.x - mouse.start.x ) / movementScaleFactor)
            });

            mouse.last.x = movedMouse.x;
            mouse.last.y = movedMouse.y;

            function forward(v1, v2) {
                return v1 >= v2;
            }
        });

        return me;
    };


})(jQuery);