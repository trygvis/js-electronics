// TODO: all fields should be persistent in a cookie
// TODO: Update the hash bang to save all values?
// TODO: Make a method that prints with SI units (k, M, G, m, u, n).
//       This will print numbers like 0.00333 better.

function Electronics() {
    this.parseUnit = function(s, unit) {
        s = s.replace(/ /g, "")

        if(s.match(new RegExp(unit + "$"))) {
            s = s.substr(0, s.length - unit.length)
        }

        var factor = 1;
        if(s.match(/.*p$/)) {
            s = s.substr(0, s.length - 1)
            factor = 1/1000000000000
        }
        else if(s.match(/.*n$/)) {
            s = s.substr(0, s.length - 1)
            factor = 1/1000000000
        }
        else if(s.match(/.*u$/)) {
            s = s.substr(0, s.length - 1)
            factor = 1/1000000
        }
        else if(s.match(/.*m$/)) {
            s = s.substr(0, s.length - 1)
            factor = 1/1000
        }

        var value = parseFloat(s)

        if(isNaN(value)) {
            return false;
        }

        return value * factor;
    }

    this.parseVoltage = function(s) {
        return this.parseUnit(s, "V")
    }

    this.parseAmpere = function(s) {
        return this.parseUnit(s, "A")
    }

    this.printWithUnit = function(value, unit) {
        if(isNaN(value)) {
            return value
        }

        if(value < 1/1000000) {
            return Math.round(value * 1000000000) + "n" + unit
        }
        if(value < 1/1000) {
            return Math.round(value * 1000000) + "&micro;" + unit
        }
        if(value < 1) {
            return Math.round(value * 1000) + "m" + unit
        }
        if(value > 1000000000) {
            return Math.round(value / 1000000000) + "G" + unit
        }
        if(value > 1000000) {
            return Math.round(value / 1000000) + "M" + unit
        }
        if(value > 1000) {
            return Math.round(value / 1000) + "k" + unit
        }

        return value.toPrecision(3) + unit
    }

    this.printVoltage = function(v) { return this.printWithUnit(v, "V") }
    this.printAmpere = function(i) { return this.printWithUnit(i, "A") }
    this.printResistance = function(r) { return this.printWithUnit(r, "&Omega;") }
}

function ResistorCalculator() {
    var first = [ 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82, 100 ]
    var e12 = first.
        concat(Functional.map("10*",first)).
        concat(Functional.map("100*",first)).
        concat(Functional.map("1000*",first)).
        concat(Functional.map("10000*",first)).
        concat(Functional.map("100000*",first)).
        concat(Functional.map("1000000*",first))

    this.findClosest = function(target) {
        var array = e12
        var x = Functional.select("<=" + target, array)
        var y = Functional.select(">=" + target, array)
        return [x[x.length - 1], y[0]]
    }
}

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
    this.solve = function(calculateFor, u, r, i) {
        switch(calculateFor) {
            case "u":
                return { 
                    "u" : (r > 0 && i > 0) ? r * i : NaN,
                    "formula" : "\\(U = R * I\\)"
                }
            case "r":
                return {
                    "r" : (u > 0 && i > 0) ? u / i : NaN,
                    "formula" : "\\(R = U / I\\)"
                }
            case "i": 
                return {
                    "i" : (u > 0 && r > 0) ?  i = u / r : NaN,
                    "formula" : "\\(I = U / R\\)"
                }
        }
    }
}

$(document).ready(function() {
    var electronics = new Electronics()
    var resistorCalculator = new ResistorCalculator()
    var uriCalculator = new UriCalculator()

    var inputU = jQuery("#uri-u")
    var inputR = jQuery("#uri-r")
    var inputI = jQuery("#uri-i")

    var closestLower = jQuery("#uri-closest-lower")
    var closestVoltage = jQuery("#uri-closest-voltage")
    var closestCurrent = jQuery("#uri-closest-current")
    var closestLowerVoltage = jQuery("#uri-closest-lower-voltage")
    var closestLowerCurrent = jQuery("#uri-closest-lower-current")
    var closestHigherVoltage = jQuery("#uri-closest-higher-voltage")
    var closestHigherCurrent = jQuery("#uri-closest-higher-current")
    var closestHigher = jQuery("#uri-closest-higher")
    var formula = jQuery("#uri-formula")

    var updateUri = function() {
        calculateFor = jQuery("#uri :checked").val()
        var u = electronics.parseVoltage(inputU.val())
        var r = parseFloat(inputR.val())
        var i = electronics.parseAmpere(inputI.val())

        console.log("URI Calculation: solving for " + calculateFor + ", inputs: u=" + u + ", r=" + r + ", i=" + i);
        var result = uriCalculator.solve(calculateFor, u, r, i)
        for (key in result) {
            var value = result[key]
            switch(key) {
                case "u": inputU.val(value); break
                case "r": inputR.val(Math.round(value)); break
                case "i": inputI.val(value); break
                case "formula": 
                    formula.html(value);
                    MathJax.Hub.Queue(["Typeset",MathJax.Hub,document.getElementById("uri-formula")])
                break
            }
        }

        if(calculateFor == "r") {
            r = result["r"]             // Update R
            var closest = resistorCalculator.findClosest(r)
            closestLower.html(electronics.printResistance(closest[0]))
            closestHigher.html(electronics.printResistance(closest[1]))

            closestVoltage.html(electronics.printVoltage(u))
            closestCurrent.html(electronics.printAmpere(i))

            closestLowerVoltage.html(electronics.printVoltage(uriCalculator.solve("u", 0, closest[0], i)["u"]))
            closestLowerCurrent.html(electronics.printAmpere(uriCalculator.solve("i", u, closest[0], 0)["i"]))

            closestHigherVoltage.html(electronics.printVoltage(uriCalculator.solve("u", 0, closest[1], i)["u"]))
            closestHigherCurrent.html(electronics.printAmpere(uriCalculator.solve("i", u, closest[1], 0)["i"]))
        }
    }

    inputU.keyup(updateUri)
    inputR.keyup(updateUri)
    inputI.keyup(updateUri)
    jQuery("#uri input[name='calculate-for']").click(updateUri)

    updateUri()
})
