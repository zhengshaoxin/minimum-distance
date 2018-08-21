// 封装一些几何函数，毕业后还要看数学 T^T
const Geometry = {
    // 计算点在线的哪一侧, 为正数在左侧；为负数在右侧；为0在线上。
    whichSide: (point = [0,0], line = [[0,0], [0,0]]) => {
        return (line[0][0] - point[0]) * (line[1][1] - point[1]) - (line[0][1] - point[1]) * (line[1][0] - point[0]);
    },
    // 判断两条线是否相交
    isIntersect: function(line = [[0,0], [0,0]], side = [[0,0], [0,0]]) {
        if (Math.max(line[0][0], line[1][0]) < Math.min(side[0][0], side[1][0])) {
            return false;
        }
        if (Math.max(line[0][1], line[1][1]) < Math.min(side[0][1], side[1][1])) {
            return false;
        }
        if (Math.max(side[0][0], side[1][0]) < Math.min(line[0][0], line[1][0])) {
            return false;
        }
        if (Math.max(side[0][1], side[1][1]) < Math.min(line[0][1], line[1][1])) {
            return false;
        }
        if (this.whichSide(side[0], line) * this.whichSide(side[1], line) > 0) {
            return false;
        }
        if (this.whichSide(line[0], side) * this.whichSide(line[1], side) > 0) {
            return false;
        }
        return true;
    },
    // 计算线的点集合，digital differential analyzer 算法
    dda: (a, b) => {
        let coordinate = [];
        let dx = b[0] - a[0];
        let dy = b[1] - a[1];

        let dn = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);

        let xinc = dx / dn;
        let yinc = dy / dn;

        let x = a[0];
        let y = a[1];

        for (var k=1; k<=dn; k++) {
            x += xinc;
            y += yinc;
            coordinate.push(Math.round(x) + '-' + Math.round(y));
        }

        return coordinate;
    },
    // 计算两点间的距离
    getDistance: (a, b) => Math.round(Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))),
    // 计算正方形的四个顶点坐标 顺时针方向
    getRectPoint: (point = {x: 0, y: 0}, size = 0) => {
        return [
            [point.x, point.y],
            [point.x + size, point.y],
            [point.x + size, point.y + size],
            [point.x, point.y + size],
        ];
    },
    // 以一个不在多边形上的点为中心，寻找多边形上可见的顶点。polygon 为多边形各个顶点坐标
    getVisibility: function(point = [0, 0], polygon = []) {
        return polygon.filter(function(apex, index) {
            let copy = [...polygon];
            let line = [point, apex];

            copy.splice(index, 1);
            for (let i=0; i<copy.length; i++) {
                let side = [copy[i], copy[i+1] ? copy[i+1] : copy[0]];
                if (Geometry.isIntersect(line, side)) {
                    return false;
                }
            }

            return true;
        });
    },
    // 取左右两组最远的点，再取离起点最近的点
    getCorner: function(from, left, right) {
        return this.getNearest(from, [this.getFarthest(from, left), this.getFarthest(from, right)]);
    },
    // 取最远的顶点
    getFarthest: (point, apexs) => {
        let distance = 0;
        let farthest = [];

        apexs.forEach(function(apex) {
            let d = Geometry.getDistance(point, apex);
            if (d >= distance) {
                farthest = apex;
            } else {
                distance = d;
            }
        });

        return farthest;
    },
    // 取最近的顶点
    getNearest: (point, apexs) => {
        let distance = [];
        apexs.forEach(function(apex) {
            distance.push(Geometry.getDistance(point, apex));
        });

        return apexs[distance.indexOf(Math.min(...distance))];
    }
};
