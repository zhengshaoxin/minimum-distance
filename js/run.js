const wrap = document.getElementById('wrap');

let iMap, iCanvas, iTimer;
let iPath = [];
let iHinders = [];
let iPlace = {
    type: 0,
    start: null,
    end: null,
}

/**
 * 鼠标拖动绘制地图大小
 */
let drawMap = function(event) {
    let width = event.pageX - iMap.dataset.x;
    let height = event.pageY - iMap.dataset.y;

    if (width < 0) {
        width = Math.abs(width);
        iMap.style.left = event.pageX + 'px';
    }
    if (height < 0) {
        height = Math.abs(height);
        iMap.style.top = event.pageY + 'px';
    }

    iMap.style.width = width + 'px';
    iMap.style.height = height + 'px';
}

/**
 * 用像素点来画路径线
 */
let drawPathPoint = function(xy) {
    let [x, y] = xy.split('-');
    let point = document.createElement('i');

    point.setAttribute('style', 'position: absolute; width: 1px; height: 1px; background: #ffb61e;');
    point.style.top = y + 'px';
    point.style.left = x + 'px';
    point.style.zIndex = iHinders.length + 1;

    iMap.appendChild(point);
}

/**
 * 设置起点和终点
 */
let setPlace = function(event) {
    if (iPlace.type == 0) {
        iPlace.start = document.createElement('i');
        iPlace.start.setAttribute('class', 'fa fa-street-view');
        iPlace.start.setAttribute('style', 'position: absolute; color: #00e09e; font-size: 40px;');
        iMap.appendChild(iPlace.start);
    }
    if (iPlace.type == 1) {
        iPlace.end = document.createElement('i');
        iPlace.end.setAttribute('class', 'fa fa-flag-o');
        iPlace.end.setAttribute('style', 'position: absolute; color: #cb3a56; font-size: 40px;');
        iMap.appendChild(iPlace.end);
    }

    let type = iPlace.type % 2 == 0 ? 'start' : 'end';
    let [x, y] = [event.offsetX, event.offsetY];

    iPlace[type].style.left = x + 'px';
    iPlace[type].style.top  = y + 'px';
    iPlace[type].dataset.x  = x;
    iPlace[type].dataset.y  = y;

    iPlace.type++;
}

/**
 * 设置障碍物
 */
let setHinder = function(event) {
    let hinder = document.createElement('span');
    let size = Math.floor(Math.random() * (60 - 20 + 1) + 20); // 偷懒，随机设置大小 20 ~ 50

    hinder.setAttribute('style', 'display: block; position: absolute; overflow: hidden; text-align: center; background: #fcefe8');
    hinder.style.top = event.offsetY + 'px';
    hinder.style.left = event.offsetX + 'px';
    hinder.style.width = size + 'px';
    hinder.style.height = size + 'px';
    hinder.style.fontSize = size + 'px';
    hinder.style.zIndex = iHinders.length + 1;

    // 计算障碍物外围坐标点集合
    let points = [];
    for (var i=0; i<=size; i++) {
        points.push((event.offsetX + i) + '-' + (event.offsetY)); // 上
        points.push((event.offsetX + size) + '-' + (event.offsetY + i)); // 右
        points.push((event.offsetX + i) + '-' + (event.offsetY + size)); // 下
        points.push((event.offsetX) + '-' + (event.offsetY + i)); // 左
    }

    iHinders.push(points);
    iMap.appendChild(hinder);
}

/**
 * 鼠标按下生成地图
 */
wrap.onmousedown = function(event) {
    if (iMap) {
        return;
    }

    iMap = document.createElement('div');
    iMap.setAttribute('id', 'iMap');
    iMap.setAttribute('style', 'background: #fff; position: relative; border: thin dashed; width: 0px; height: 0px;');
    wrap.appendChild(iMap);

    iMap.dataset.x = event.pageX;
    iMap.dataset.y = event.pageY;
    iMap.style.left = event.pageX + 'px';
    iMap.style.top = event.pageY + 'px';

    this.style.cursor = 'crosshair';
    this.addEventListener('mousemove', drawMap, true);
}

/**
 * 鼠标松开地图绘制完成
 */
wrap.onmouseup = function(event) {
    this.style.cursor = 'auto';
    this.removeEventListener('mousemove', drawMap, true);

    // 单击设置起点和终点
    iMap.onclick = function(e) {
        iTimer && clearTimeout(iTimer);
        iTimer = setTimeout(function() {
            setPlace(e);
        }, 300);
    }

    // 双击设置障碍物
    iMap.ondblclick = function(e) {
        iTimer && clearTimeout(iTimer);
        setHinder(e);
    }
}

window.test = function()
{
    function run(from, to) {
        // 当前起点到终点的坐标点集合
        let line = Geometry.dda(from, to);
        // line.forEach(function(point) {
        //     drawPathPoint(point);
        // });

         // 是哪个哭夭的障碍物
        let hinder_index = -1;

        // 计算路径和障碍物的交叉点
        let hinder_xy = line.find(function(coordinate) {
            let index = iHinders.findIndex(function(hinder) {
                return hinder.includes(coordinate);
            });
            if (index != hinder_index) {
                hinder_index = index;
            }
            return index >= 0;
        });

        // 如果没有拦路虎则返回终点坐标
        if (hinder_index < 0 || !hinder_xy) {
            console.log('没有障碍物了~');
            iPath.push(to);
            return to;
        } else {
            console.log('障碍点:', hinder_xy, '位于第 ' + (hinder_index + 1) + ' 个障碍物');
        }

        let span = document.getElementsByTagName('span')[hinder_index];
        let rect = Geometry.getRectPoint({x: span.offsetLeft, y: span.offsetTop}, span.offsetWidth);

        // 障碍物可见的顶点, 分左右两组
        let left = [];
        let right = [];

        Geometry.getVisibility(from, rect).forEach(function(point, index) {
            let which = Geometry.whichSide(point, [from, to]);
            if (which > 0) {
                left.push(point);
            }
            if (which < 0) {
                right.push(point);
            }
        });
        console.log('可见点:', left, right);

        // 取左右两组最远的点，再取离起点最近的点
        let corner = Geometry.getCorner(hinder_xy.split('-'), left, right);
        iPath.push(corner);
        console.log('登陆点:', corner);

        // 再判断登陆点 corner 到终点 to 与当前障碍物是否有交集，有的话取 rect 下个顶点作为登陆点
        let collision = Geometry.dda(corner, to).find(function(point) {
            return iHinders[hinder_index].includes(point);
        });

        if (typeof collision !== 'undefined') {
            console.log('又撞上:', collision); // 左顺，右逆
            let side = [...left, ...right].map(function(point) {
                return point.join('-');
            });
            corner = rect.find(function(apex) {
                return !side.includes(apex.join('-'));
            });
            iPath.push(corner);
        }

        return run(corner, to);
    }

    run(
        [parseInt(iPlace.start.dataset.x) + 16, parseInt(iPlace.start.dataset.y) + 30],
        [parseInt(iPlace.end.dataset.x), parseInt(iPlace.end.dataset.y)]
    );

    iCanvas = document.createElement('canvas');
    iCanvas.width = iMap.offsetWidth -2;
    iCanvas.height = iMap.offsetHeight - 2;
    iCanvas.style.position = 'absolute';
    iCanvas.style.zIndex = iHinders.length + 1;
    iCanvas.style.top = 0;
    iCanvas.style.left = 0;
    iMap.appendChild(iCanvas);

    var context = iCanvas.getContext('2d');
    context.imageSmoothingEnabled = true;
    context.beginPath();
    context.moveTo(parseInt(iPlace.start.dataset.x) + 16, parseInt(iPlace.start.dataset.y) + 30);
    iPath.forEach(function(point) {
        context.lineTo(point[0], point[1]);
    });
    context.stroke();

    return null;
}
