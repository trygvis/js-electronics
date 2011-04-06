// TODO: all fields should be persistent in a cookie
// TODO: Update the hash bang to save all values?
// TODO: Make a method that prints with SI units (k, M, G, m, u, n).
//       This will print numbers like 0.00333 better.

function Electronics() {
    this.parseUnit = function(s, unit) {
        s = s.replace(/ /g, "")

        if(unit != null && s.match(new RegExp(unit + "$"))) {
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
        else if(s.match(/.*k$/)) {
            s = s.substr(0, s.length - 1)
            factor = 1000
        }
        else if(s.match(/.*M$/)) {
            s = s.substr(0, s.length - 1)
            factor = 1000000
        }
        else if(s.match(/.*G$/)) {
            s = s.substr(0, s.length - 1)
            factor = 1000000000
        }

        var value = parseFloat(s)

        if(isNaN(value)) {
            return NaN;
        }

        return value * factor;
    }

    this.parseBinary = function(s) { return this.parseWithRadix(s, 2) }
    this.parseOctal = function(s) { return this.parseWithRadix(s, 8) }
    this.parseHex = function(s) { return this.parseWithRadix(s, 16) }

    this.parseWithRadix = function(s, radix) {
        var alphabet = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']
        var factor = 1
        var num = 0

        for(i = s.length - 1; i >= 0; i--) {
            var c = s.charAt(i)
            var found = false
            for(j in alphabet) {
                if(j < radix && c == alphabet[j]) {
                    num += j * factor
                    found = true
                    break
                }
            }
            if(!found) {
                return NaN
            }

            factor *= radix
        }

        return num
    }

    this.parseV = function(s) { return this.parseUnit(s, "V") }
    this.parseA = function(s) { return this.parseUnit(s, "A") }
    this.parseR = function(s) { return this.parseUnit(s) }

    this.printWithUnit = function(value, unit) {
        if(isNaN(value)) {
            return value
        }

        if(value < 1/1000000) {
            value = Math.round(value * 1000000000) + "n"
        }
        else if(value < 1/1000) {
            value = Math.round(value * 1000000) + "&micro;"
        }
        else if(value < 1) {
            value = Math.round(value * 1000) + "m"
        }
        else if(value > 1000000000) {
            value = Math.round(value / 1000000000) + "G"
        }
        else if(value > 1000000) {
            value = Math.round(value / 1000000) + "M"
        }
        else if(value > 1000) {
            value = Math.round(value / 1000) + "k"
        }
        else {
            value = value.toPrecision(3)
        }

        return "\\(" + value + unit + "\\)"
    }

    this.printInRadix = function(value, radix) {
        var alphabet = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']
        var negative = false
        if(value < 0) {
            negative = true
            value = -value;
        }

        var s = new Array
        do {
            var c = Math.floor((value % radix))
            s.splice(0, 0, alphabet[c])
        } while(Math.floor(value /= radix) > 0)

        return s.join("")
    }

    this.printBinary = function(value) { return this.printInRadix(value, 2) }
    this.printOctal = function(value) { return this.printInRadix(value, 8) }
    this.printHex = function(value) { return this.printInRadix(value, 16) }

    this.printVoltage = function(v) { return this.printWithUnit(v, "V") }
    this.printAmpere = function(i) { return this.printWithUnit(i, "A") }
    this.printResistance = function(r) { return this.printWithUnit(r, "&Omega;") }
    this.printPower = function(r) { return this.printWithUnit(r, "W") }

    // ------------------------------------------------------------------------
    // Utils

    this.queryParams = {};

    var e,
        a = /\+/g,  // Regex for replacing addition symbol with a space
        r = /([^&=]+)=?([^&]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        q = window.location.search.substring(1);

    while (e = r.exec(q))
       this.queryParams[d(e[1])] = d(e[2]);
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

/**
 * Calculator for ohms law "U = R * I"
 */
function OhmsLaw() {
    this.solve = function(calculateFor, u, r, i) {
        switch(calculateFor) {
            case "u":
                return u = (r > 0 && i > 0) ? r * i : NaN, { 
                    "u" : u,
                    "p" : isNaN(u) ? NaN : u * i,
                    "formula" : "\\(U = R * I\\)"
                }
            case "r":
                return {
                    "r" : (u > 0 && i > 0) ? u / i : NaN,
                    "p" : isNaN(r) ? NaN : u * i,
                    "formula" : "\\(R = U / I\\)"
                }
            case "i": 
                return i = (u > 0 && r > 0) ?  i = u / r : NaN, {
                    "i" : i,
                    "p" : isNaN(i) ? NaN : u * i,
                    "formula" : "\\(I = U / R\\)"
                }
        }
    }
}
