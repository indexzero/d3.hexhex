(function() {

  d3.hexhex = function() {
    var width = 1,
        height = 1,
        r,
        x = d3_hexhexX,
        y = d3_hexhexY,
        dx,
        dy;

    function hexhex(options) {
      if (typeof options === 'number') {
        options = { height: options };
      }

      var height = options.height,
          pad    = options.padding || options.pad || 0,
          c      = options.center  || options.c,
          points = [],
          counts = [],
          origin,
          median,
          offset,
          count;


      c = c || { x: 20, y: 20 };

      //
      // Have some sane defaults for height and
      // force it to be odd since that's the only way
      // the layout algorithm works...
      //
      height = height || 11;
      if (height % 2 === 0) { height += 1; }
      median = Math.floor(height / 2);
      origin = { x: median, y: median };

      //
      // We calculate the layout based on the height because
      // there will always be an equal number of columns to
      // the height.
      //
      for (var col = 0; col < height; col++) {
        count  = height;
        offset = {
          x: (2 * r * col + (pad * col)) * Math.sin(Math.PI / 3),
          y: 0
        };

        if (col < median) {
          count    = median + col + 1;
          offset.y = r * (median - col);
          //
          // Remember this count when we mirror
          // on the other side.
          //
          counts.push(count);
        }
        else if (col > median) {
          count    = counts.pop();
          offset.y = r * (col - median);
        }

        for (var i = 0; i < count; i++) {
          points.push({
            x:      c.x + offset.x,
            y:      c.y + offset.y + i * 2 * r + (pad * i),
            //
            // TODO: This random number really serves no purpose but
            // to provide some color for perspective
            //
            value: (Math.random() * 35) + 10,
          });
        }
      }

      //
      // Get the "center" point which will always be
      // the exact middle of the list of points.
      //
      var cp = points[points.length / 2 | 0];
      cp = { x: cp.x, y: cp.y };

      return points.map(function (p, i) {
        //
        // Distance between two points
        // http://www.purplemath.com/modules/distform.htm
        //
        p.distance = Math.sqrt(
          Math.pow(cp.x - p.x, 2) +
          Math.pow(cp.y - p.y, 2)
        );

        p.size = p.distance !== 0
          ? 1 / (1 + p.distance)
          : points[i - 1].size;

        return p;
      });
    }

    function hexagon(radius) {
      var x0 = 0, y0 = 0;
      return d3_hexhexAngles.map(function(angle) {
        var x1 = Math.sin(angle) * radius,
            y1 = -Math.cos(angle) * radius,
            dx = x1 - x0,
            dy = y1 - y0;
        x0 = x1, y0 = y1;
        return [dx, dy];
      });
    }

    hexhex.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      return hexhex;
    };

    hexhex.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return hexhex;
    };

    hexhex.hexagon = function(radius) {
      if (arguments.length < 1) radius = r;
      return "m" + hexagon(radius).join("l") + "z";
    };

    hexhex.centers = function() {
      var centers = [];
      for (var y = 0, odd = false, j = 0; y < height + r; y += dy, odd = !odd, ++j) {
        for (var x = odd ? dx / 2 : 0, i = 0; x < width + dx / 2; x += dx, ++i) {
          var center = [x, y];
          center.i = i;
          center.j = j;
          centers.push(center);
        }
      }
      return centers;
    };

    hexhex.mesh = function() {
      var fragment = hexagon(r).slice(0, 4).join("l");
      return hexhex.centers().map(function(p) { return "M" + p + "m" + fragment; }).join("");
    };

    hexhex.size = function(_) {
      if (!arguments.length) return [width, height];
      width = +_[0], height = +_[1];
      return hexhex;
    };

    hexhex.radius = function(_) {
      if (!arguments.length) return r;
      r = +_;
      dx = r * 2 * Math.sin(Math.PI / 3);
      dy = r * 1.5;
      return hexhex;
    };

    return hexhex.radius(1);
  };

  var d3_hexhexAngles = d3.range(0, 2 * Math.PI, Math.PI / 3),
      d3_hexhexX = function(d) { return d[0]; },
      d3_hexhexY = function(d) { return d[1]; };
})();