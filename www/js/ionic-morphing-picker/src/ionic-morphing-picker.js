angular.module('ionic-morphpacker', [])

/**
 * Morph packer directive
 * 变形旋转拾取器
 *
 * 开发： 微智
 * 网址： www.weismarts.com 
*/
.directive('morphPacker', ['$ionicGesture', '$timeout', '$morphPacker',
    function ($ionicGesture, $timeout, $morphPacker) {

        var link = function (scope, el, attr) {
         var currentAngle,
                itemHeight,
                radius;

            // current position of carousel rotation
            var carouselRotateAngle = 0;

            var isDragging = false;

            var minRotateAngle = 360 / scope.items.length;

            radius = (el[0].scrollHeight|| el[0].offsetHeight )/ 2;
            itemHeight = $morphPacker.$getitemHeight(scope.items.length, radius);

            var carousel = el[0].getElementsByClassName('morph-carousel')[0];

            $timeout(function () {
                if (scope.items.length > 0) {
                    var mo = el[0].getElementsByClassName('morph-carousel__item')[0];
                    el[0].style.height = mo.offsetHeight + 'px';
                }
            }, 50);
            //添加到服务缓存中
            if (!!scope.identifier) {
                $morphPacker.$addEl(scope.identifier, el);
            }
    
            //侦听选择数据变化
            scope.$watch('selectedItem', function(newValue){
                    if(!newValue){return};
                    minRotateAngle = 360 / scope.items.length;
                    $timeout(function(){

                           for (var i = 0, len = scope.items.length; i < len; i++) {
                                if (angular.equals(scope.selectedItem, scope.items[i])) {
                                    // console.log(scope.items[i]);
                                    var angle = 360 - i * minRotateAngle;
                                    // setRotation(angle);
                                    var velocity = 0;
                                    var acceleration = 1.9;
                                    isDragging = false;
                                    currentAngle = stabilizeAngle(angle);
                                    setRotation(currentAngle);
                                    carouselRotateAngle = currentAngle;
                                    break;
                                }else {
                                    scope.carouselRotation = 'rotateX(0deg)';
                                }
                            }
                    },100);
             
            }, true);
    
            $ionicGesture.on('drag', function (ev) {
                var len = Math.ceil(scope.items.length / 2);
                currentAngle = carouselRotateAngle - ev.gesture.deltaY / (el[0].scrollHeight||el[0].offsetHeight) * ( minRotateAngle * len/8);
                isDragging = true;
                setRotation(currentAngle);
            }, el);   
      
            $ionicGesture.on('dragend', function (ev) {
                var velocity = 0;
                var acceleration = 1.9;
                isDragging = false;
                currentAngle = stabilizeAngle(currentAngle);
                setRotation(currentAngle);
                carouselRotateAngle = currentAngle;
                switch (ev.gesture.direction) {
                    case 'down':
                        velocity = ev.gesture.velocityY * acceleration;
                        break;
                    default:
                        velocity = -1 * ev.gesture.velocityY * acceleration;
                }
                finishAnimation(velocity);
            }, el);

            scope.getitemHeight = function () {
                return itemHeight + 'px'
            };

            // scope.getItemRotation = function (i) {
            //     // return 'rotateX(0deg)';
            //     return 'rotateX(' + i * minRotateAngle + 'deg) translateZ(' + radius * (len/8) +'px)';
            // };

            scope.getItemValue = function (item) {
                if (!!scope.showValue)
                    return item[scope.showValue];
                else
                    return item
            };
           
            /**
             * Ending movement of the carousel animation
             *
             * @param velocity
             */
            function finishAnimation(velocity) {
                var direction = velocity < 0 ? 1 : -1;
                var endAngle = stabilizeAngle(Math.abs(velocity) * minRotateAngle);
                var angle = 0;
                var currentAngle = 0;
                var last = +new Date();
                var speed = 500; // how much time will take animation
                var tick = function () {

                    if (isDragging) return false;

                    angle += direction * endAngle * (new Date() - last) / speed;
                    last = +new Date();
                    currentAngle = carouselRotateAngle + angle;
                    setRotation(currentAngle);

                    if (Math.abs(angle) < endAngle) {
                        (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
                    } else {
                        var itemIndex;
                        currentAngle = stabilizeAngle(currentAngle);
                        setRotation(currentAngle);
                        carouselRotateAngle = currentAngle;

                        itemIndex = normalizeAngle(carouselRotateAngle) / minRotateAngle;
                        itemIndex = itemIndex > 0 ? 360 / minRotateAngle - itemIndex : itemIndex;
                        if (!scope.$$phase) {
                            scope.$apply(function () {
                                scope.selectedItem = scope.items[Math.floor(itemIndex)];
                            });
                        } else {

                            scope.selectedItem = scope.items[Math.floor(itemIndex)];
                        }

                    }
                }.bind(this);
                tick();

            }

            function setRotation(angle) {

                 switch (true) {
                    case carousel.style.hasOwnProperty('transform'):
                        carousel.style.transform = 'rotateX('+ angle +'deg)';
                        break;
                    case carousel.style.hasOwnProperty('webkitTransform'):
                        carousel.style.webkitTransform = 'rotateX('+ angle +'deg)';
                        break;
                    case carousel.style.hasOwnProperty('mozTransform'):
                        carousel.style.MozTransform = 'rotateX('+ angle +'deg)';
                        break;
                    case carousel.style.hasOwnProperty('oTransform'):
                        carousel.style.oTransform = 'rotateX('+ angle +'deg)';
                        break;
                    case carousel.style.hasOwnProperty('msTransform'):
                        carousel.style.msTransform = 'rotateX('+ angle +'deg)';
                        break;
                }
                // scope.$apply(function () {
                //     scope.carouselRotation = 'rotateX(' + angle + 'deg)';
                // });
            }

            /**
             * Stabilize given angle to the closest one, based on minRotateAngle
             * @param angle
             * @returns {number}
             */
            function stabilizeAngle(angle) {
                var mod = Math.floor(angle / minRotateAngle),
                    angleF = mod * minRotateAngle,
                    angleS = angleF + minRotateAngle;
                switch (true) {
                    case angle - angleF > angleS - angle:
                        return angleS;
                    default:
                        return angleF;
                }
            }

            /**
             * Normalize angle into range between 0 and 360. Converts invalid angle to 0.
             * @param angle
             * @returns {number}
             */
            function normalizeAngle(angle) {
                var result;
                if (angle == null) {
                    angle = 0;
                }
                result = isNaN(angle) ? 0 : angle;
                result %= 360;
                if (result < 0) {
                    result += 360;
                }
                return result;
            }
        };

        return {
            restrict: 'E',
            scope: {
                items: '=',
                selectedItem: '=onSelected',
                showValue: '@',
                identifier: '@'
            },
            template: [
                '<div class="morph-carousel-container">',
                '<div class="morph-carousel__shadow"></div>',
                    '<div class="morph-carousel-stage">',
                        '<div class="morph-carousel">',
                            '<div  class="morph-carousel__item" '+
                            'ng-repeat="item in ::items">{{ ::getItemValue(item) }}</div>',
                        '</div>',
                        '<div class="morph-carousel__separator"></div>',
                    '</div>',
                '</div>'
            ].join(''),
            link: link
        }
    }])

/**
 * Morphing carousel factory to provide model layer for carousel directives
 */
.factory('$morphPacker', [function () {
    var $morphPacker = {};

    var carouselElements = [];

    /**
     * Get carousel el by it's id
     * @param id
     * @returns {*}
     */
    var getElbyId = function (id) {
        for (var i = 0, len = carouselElements.length; i < len; i++) {
            if (id == carouselElements[i].id)
                return carouselElements[i].el
        }
        return false;
    };

    /**
     * Calculate item width
     * @param itemsAmount {number}
     * @param radius {number}
     * @returns {number}
     */
    $morphPacker.$getitemHeight = function (itemsAmount, radius) {
        var minRotateAngle, angleRad;

        minRotateAngle = 360 / itemsAmount;

        // Angle (half of it) in radians
        angleRad = (minRotateAngle / 2) * Math.PI / 180;

        return radius * Math.sin(angleRad) * 2;
    };

    /**
     * Add carousel element to the list
     * Will return true if successfully added, if element already exist in list it wouldn't be added
     * @param id
     * @param el
     * @returns {boolean}
     */
    $morphPacker.$addEl = function (id, el) {
        //console.log('getElbyId(id) ', getElbyId(id));
        if (!getElbyId(id)) {
            carouselElements.push({
                id: id,
                el: el
            });
            return true;
        }
        return false;
    };
     /**
     * Set item rotation parameters
     * @param itemEl
     * @param y
     * @param z
     */
    $morphPacker.setItemRotation = function( itemEl, y, z ) {
        switch (true) {
            case itemEl.style.hasOwnProperty('transform'):
                itemEl.style.transform = 'rotateX('+ y +'deg) translateZ('+ z +'px)';
                break;
            case itemEl.style.hasOwnProperty('webkitTransform'):
                itemEl.style.webkitTransform = 'rotateX('+ y +'deg) translateZ('+ z +'px)';
                break;
            case itemEl.style.hasOwnProperty('mozTransform'):
                itemEl.style.MozTransform = 'rotateX('+ y +'deg) translateZ('+ z +'px)';
                break;
            case itemEl.style.hasOwnProperty('oTransform'):
                itemEl.style.oTransform = 'rotateX('+ y +'deg) translateZ('+ z +'px)';
                break;
            case itemEl.style.hasOwnProperty('msTransform'):
                itemEl.style.msTransform = 'rotateX('+ y +'deg) translateZ('+ z +'px)';
                break;
        }

    }
    /**
     * Update carousel by it's identifier
     * @param id
     */
    $morphPacker.update = function (id) {


        var carouselEl = getElbyId(id),
            items,
            radius,
            itemHeight,
            minRotateAngle;
        if (!carouselEl) return false;

        var stageEl = carouselEl[0].getElementsByClassName('morph-carousel-stage')[0];
        var carousel = carouselEl[0].getElementsByClassName('morph-carousel')[0];
        
        items = carouselEl[0].getElementsByClassName('morph-carousel__item');
        minRotateAngle = 360 / items.length;

        // Angle (half of it) in radians
        angleRad = (minRotateAngle / 2) * Math.PI / 180;

        radius = (stageEl.offsetHeight)  / 2;

        itemHeight = radius * Math.sin(angleRad) * 2;
       

        // itemHeight = $morphPacker.$getitemHeight(
        //     items.length,
        //     radius
        // );

        carousel.style.height = itemHeight + 'px';

        for (var i = 0, len = items.length; i < len; i++) {

            var _angle = i * minRotateAngle;
            items[i].style.height = itemHeight + 'px';
            $morphPacker.setItemRotation( items[i], _angle, radius * (len/8) );
        }

        carouselEl[0].style.width = items[0].offsetWidth + 'px';

    };

    return $morphPacker;
}]);
