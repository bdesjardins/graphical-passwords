/*© 2006 Zoltan Foley-Fisher ALL RIGHTS RESERVED*/


var LINENUMBER = 10000

function clearTrace() {
	
	// var out = document.getElementById("trace")
	// out.innerHTML = ""
	
}

function trace(s) {
	
	if(window.console)
		window.console.debug(s);
	
	// var out = document.getElementById("trace")
	// out.innerHTML = LINENUMBER++ + " " + s + "<br>" + out.innerHTML
	
}