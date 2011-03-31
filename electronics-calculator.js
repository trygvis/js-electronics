// TODO: all fields should be persistent in a cookie
// TODO: Update the hash bang to save all values?
// TODO: Make a method that prints with SI units (k, M, G, m, u, n).
//       This will print numbers like 0.00333 better.

function SeriesResistors() {
    /**
     * Return R2 in "R1 in series with R2 with the series value X"
     */
    this.solveMissing = function(r1, result) {
        return result - r1
    }
}

function ParallelResistors() {
    /**
     * Return R2 in "R1 || R2 = Rtot"
     */
    this.solveMissing = function(r1, rtot) {
        // Rtot = (R1 + R2) / (R1 * R2)
        // Rtot = 1 / (1/R1 + 1/R2)
        // R2 = (R1 * Rtot) / (R1 - Rtot)

        return (r1 * rtot) / (r1 - rtot)
    }

    this.solve = function(r1, r2) {
        return (r1 + r2) / (r1 * r2)
    }
}

function UriCalculator() {
    var first = [ 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82, 100 ]
    var e12 = first.
        concat(Functional.map("10*",first)).
        concat(Functional.map("100*",first)).
        concat(Functional.map("1000*",first)).
        concat(Functional.map("10000*",first)).
        concat(Functional.map("100000*",first)).
        concat(Functional.map("1000000*",first))

    this.findClosest = function(target, array) {
        var x = Functional.select("<=" + target, array)
        var y = Functional.select(">=" + target, array)
        return [x[x.length - 1], y[0]]
    }

    this.solve = function(calculateFor, u, r, i) {
        switch(calculateFor) {
            case "u":
                if(r > 0 && i > 0) {
                    return { "u" : r * i }
                }
                return {}
            case "r":
                if(u > 0 && i > 0) {
                    var r = u / i
                    var closest = this.findClosest(r, e12)
                    return { "r" : r, "closestLower" : closest[0], "closestHigher" : closest[1] }
                }
                return {}
            case "i": 
                if(u > 0 && r > 0) {
                    return { "i" : u / r }
                }
                return {}
        }
    }
}

function parseUnit(s, unit) {
    s = s.replace(/ /g, "")

    if(s.match(new RegExp(unit + "$"))) {
        s = s.substr(0, s.length - unit.length)
    }

    var factor = 1;
    if(s.match(/.*m$/)) {
        s = s.substr(0, s.length - 1)
        factor = 1/1000
    }

    var value = parseFloat(s)

    if(isNaN(value)) {
        return false;
    }

    return value * factor;
}

function parseVolt(s) {
    return parseUnit(s, "V")
}

function parseAmpere(s) {
    return parseUnit(s, "A")
}

$(document).ready(function() {
    var uriCalculator = new UriCalculator()

    var inputU = jQuery("#uri-u")
    var inputR = jQuery("#uri-r")
    var inputI = jQuery("#uri-i")

    var closestLower = jQuery("#uri-closest-lower")
    var closestHigher = jQuery("#uri-closest-higher")

    var updateUri = function() {
        calculateFor = jQuery("#uri-calculate-for:checked").val()
        var u = parseVolt(inputU.val())
        var r = parseFloat(inputR.val())
        var i = parseAmpere(inputI.val())

        var result = uriCalculator.solve(calculateFor, u, r, i)
        for (key in result) {
            switch(key) {
                case "u": inputU.val(result[key]); break
                case "r": inputR.val(Math.round(result[key])); break
                case "i": inputI.val(result[key]); break
                case "closestLower": closestLower.html(result[key]); break
                case "closestHigher": closestHigher.html(result[key]); break
            }
        }
    }

    inputU.keyup(updateUri)
    inputR.keyup(updateUri)
    inputI.keyup(updateUri)

    updateUri()
})
