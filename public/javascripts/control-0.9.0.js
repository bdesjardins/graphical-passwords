/* © 2006 Zoltan Foley-Fisher ALL RIGHTS RESERVED */


var FUNCTION, TIMEOUT

 
var CURRENTX, CURRENTY 
var DELTAX, DELTAY



 	function controlInitialise() {
		switch (navigator.appName) {
		case 'Netscape' : {
			if (navigator.appVersion.substr(0,1) >= 5) {
				trace('Control initialised for Netscape 5')
				return 1
			}
			break
		}
		case 'Opera' : {
			if (navigator.appVersion.substr(0,1) >= 9) {
				trace('Control initialised for Opera 9')
				return 1
			}
			break
		}
		}
		trace('Control cannot be initialised for your browser')
		trace(navigator.userAgent + " " + navigator.appVersion)
		return -1
	}
	
	
	
	
	
	function controlCalculatePositions(e)
	{
		
		e = (e) ? e : ((window.event) ? window.event : "")
		
		var height = $('#canvas1').height();
		var width = $('#canvas1').width();
		
		//x, y relative to canvas
		
		var offset = jQuery($('#canvas1')).offset(); 
		var relativeX = e.clientX - offset.left, relativeY = e.clientY - offset.top;
		
		var xFraction = (relativeX)/width, yFraction = (relativeY)/height //border width = 2
		
		var newX = canvasXCoordinateForFraction(xFraction), newY = canvasYCoordinateForFraction(yFraction)
		
		newX = Math.round(newX/100)*100;
		newY = Math.round(newY/100)*100;
		
		if (CURRENTX != undefined)
			DELTAX = newX - CURRENTX
		if (CURRENTY != undefined)
			DELTAY = newY - CURRENTY
		CURRENTX = newX
		CURRENTY = newY
	}
	

	

	//.......................................................
	//functions translate canvas events to model manipulations
	
	function controlMouseDown(e) {
		
	if (!e) var e = window.event;

	var rightclick;
	if (e.which) rightclick = (e.which == 3);
	else if (e.button) rightclick = (e.button == 2);
	if (rightclick)
		return;
	
	
		controlCalculatePositions(e)
		var x = CURRENTX, y = CURRENTY;
		
		
		if (hasElements()) {
			removeAllElements()
			
		} else {
			
			includeNearestInElements()
				
		switch (FUNCTION) {
			
			
			case 'functionSite': {
				var c
				if (c = anyPointContainedInElements())
				{
					removeFromElements(c)
				} else
				{
					c = new Point(new VectorObject(x, y))
				}
				
				var s = new StringObject("?")
				new Site(new Text(s, c))
				addToElements(c)
				
				break
			}
			
			
			case 'functionPoint': {
				var c
				if (c = anyPointContainedInElements())
				{
					removeFromElements(c)
				} else
				{
					c = new Point(new VectorObject(x, y))
				}
				
				addToElements(c)
		
				break
			}
			
			case 'functionLine': {
				var c
				if (c = anyPointContainedInElements())
				{
					removeFromElements(c)
				} else
				{
					c = new Point(new VectorObject(x, y))
				}
				
				var endPoint = new Point(new VectorObject(x, y))
				new Line(c, endPoint)
				addToElements(endPoint)
		
				break
			}
			
			case 'functionArc': {
				var c
				if (c = anyPointContainedInElements())
				{
					removeFromElements(c)
				} else
				{
					c = new Point(new VectorObject(x, y))
				}
				
				var p1 = new Point(new VectorObject(x, y-1))
				var p2 = new Point(new VectorObject(x, y))
				new Arc(p2, p1, c)
				addToElements(p1)
				addToElements(p2)
	
				break
			}
			
			case 'functionText': {
				var c
				if (c = anyPointContainedInElements())
				{
					removeFromElements(c)
				} else
				{
					c = new Point(new VectorObject(x, y))
				}
				
				var s = new StringObject("text")
				new Text(s, c)
				
				break
			}
			
			case 'functionMove': {
				
				break
			}
			
			case 'functionDelete': {
				deleteElements()
				break
			}
			
			case 'functionHorizontal': {
				if (ELEMENTS.nextMember != ELEMENTS) {
					if (ELEMENTS.nextMember.subject.typeM.head == LINES) {
						CONSTRAINT = new Constraint(NEAREST.prevMember.subject, 'H')
					}
				}
				break
			}
			
			case 'functionVertical': {
				if (ELEMENTS.nextMember != ELEMENTS) {
					if (ELEMENTS.nextMember.subject.typeM.head == LINES) {
						CONSTRAINT = new Constraint(NEAREST.prevMember.subject, 'V')
					}
				}
				break
			}
			
			case 'functionLength': {
				if (ELEMENTS.nextMember != ELEMENTS) {
					if (ELEMENTS.nextMember.subject.typeM.head == LINES) {
						CONSTRAINT = new Constraint(NEAREST.prevMember.subject, 'L')
					}
				}
				break
			}
		}
		
		}
		reset()

		render()
		
		
		e.stopPropagation()
		return false
	}
	
	
	
	
	function controlMouseMove(e)
	{
		/*if (TIMEOUT) {
			clearTimeout(TIMEOUT)
			TIMEOUT = setTimeout("relaxC()",100)
		}
		*/
		
		
	if (!e) var e = window.event;

	var rightclick;
	if (e.which) rightclick = (e.which == 3);
	else if (e.button) rightclick = (e.button == 2);
	if (rightclick)
		return;
		
		controlCalculatePositions(e)
		var x = CURRENTX, y = CURRENTY;
		var deltaX = DELTAX, deltaY = DELTAY
		
		
		
		calculateNearestElementsTo(x, y)
		
		switch (FUNCTION)
		{
			case 'functionDelete':
			case 'functionHorizontal':
			case 'functionVertical':
			case 'functionLength':
			{
				break
			}
			default:
			{
				moveElements(deltaX, deltaY)
				break
			}
			
		}
		reset()
		
		render()
		
		
		e.stopPropagation()
		return false
	}
	
	
	
	
	
	
	
	function controlMouseUp(e) {
	
	if (!e) var e = window.event;

	var rightclick;
	if (e.which) rightclick = (e.which == 3);
	else if (e.button) rightclick = (e.button == 2);
	if (rightclick)
		return;
		
		
		controlCalculatePositions(e)
		
		
		
		includeNearestInElements()
	
		mergeElements()
		reset()
		
		removeAllElements()
		
		markAllPointsAsNeedingRender()
		render()
		
		
		e.stopPropagation()
		return false
	}
	
	



	
	//..............................................................
	// periodically relax the constraints

	
	function relaxC(event) {
		if (TIMEOUT) {
			clearTimeout(TIMEOUT)
		}
		//if (document.getElementById('relaxValue').value) {
			TIMEOUT = setTimeout("relaxC()",100)
		//}
		var c = CONSTRAINTS.nextMember
		while (c != CONSTRAINTS) {
			c.subject.relax()
			c = c.nextMember
		}
		reset()
		
		render()
		
		return false
	}
	
	
	
	
	
	
	//..............................................................
	// functions to manipulate model and update canvas

	function hasElements()
	{
		return (ELEMENTS.nextMember != ELEMENTS)
	}
	
	function anyPointContainedInElements()
	{
		var c = ELEMENTS.nextMember
		if (c != ELEMENTS) {
			if (c.subject.typeM.head == POINTS) {
				return c.subject;
			}
		}
		return null;
	}
	
	function addToElements(p)
	{
		ELEMENTS.addMember(p.elementsM)
	}
	
	function removeFromElements(p)
	{
		ELEMENTS.removeMember(p.elementsM)
	}
				
	function removeAllElements() {
		while (ELEMENTS.nextMember != ELEMENTS) {
			ELEMENTS.removeMember(ELEMENTS.nextMember)
		}
	}
	
	function includeNearestInElements() {
		var c = NEAREST.nextMember
		while (c != NEAREST) {
			if (c.subject.typeM.head == CONSTRAINTS) {
				ELEMENTS.addMember(c.subject.elementsM)
				return
			}
			if (c.subject.typeM.head == POINTS) {
				ELEMENTS.addMember(c.subject.elementsM)
				return
			}
			c = c.nextMember
		}
		if (NEAREST.prevMember != NEAREST) {
			ELEMENTS.addMember(NEAREST.prevMember.subject.elementsM)	
		}
	}
	
	function mergeElements() {
		var c1 = ELEMENTS.nextMember
		while (c1 != ELEMENTS) {
			var c2 = c1.nextMember
			while (c2 != ELEMENTS) {
				var inSamePrimative = false
				
				if (c1.subject.dependents) {
				
					var d1 = c1.subject.dependents.nextMember
					while (d1 != c1.subject.dependents) {
						var d2 = c2.subject.dependents.nextMember
						while (d2 != c2.subject.dependents) {
							if (d1.subject == d2.subject) {
								inSamePrimative = true
								break
							}
							d2 = d2.nextMember
						}
						if (inSamePrimative) {
							break
						}
						d1 = d1.nextMember
					}
				
				}
				
				if (inSamePrimative) {
					trace("inSamePrimative")
					ELEMENTS.removeMember(c2)
				} else {
					c1.subject.mergeWith(c2.subject)
				}
				c2 = c1.nextMember
			}
			c1 = c1.nextMember
		}	
	}
	
	
	function moveElements(deltaX, deltaY) {
		var c = ELEMENTS.nextMember
		while (c != ELEMENTS) {
			c.subject.move(deltaX, deltaY)
			c = c.nextMember
		}
	}
	
	function deleteElements() {
		if (ELEMENTS.nextMember != ELEMENTS) {
			trace("element:" + ELEMENTS.nextMember.subject)
			ELEMENTS.nextMember.subject.deleteAll()
		}
			trace("deleted:" + DELETED)
			var c = DELETED.nextMember
			while (c != DELETED) {
				DELETED.removeMember(c.subject.deletedM)
				c = DELETED.nextMember
			}
	}
	
	
	function deleteAll() {
		while (POINTS.nextMember != POINTS) {
			POINTS.nextMember.subject.deleteAll()
		}		
			trace("deleted:" + DELETED)
			var c = DELETED.nextMember
			while (c != DELETED) {
				DELETED.removeMember(c.subject.deletedM)
				c = DELETED.nextMember
			}
	}
	

	function markAllPointsAsNeedingRender() {
		var c = POINTS.nextMember
		while (c != POINTS) {
			c.subject.markAsNeedingRender()
			c = c.nextMember
		}
	}
	
	
	function calculateNearestElementsTo(x, y) {
		var c = POINTS.nextMember
		while (c != POINTS) {
			if (c.subject.distanceTo(x, y) < POINTRADIUS+10) {
				if (c.subject.nearestM.head != NEAREST) {
					NEAREST.addMember(c.subject.nearestM)
					c.subject.markAsNeedingRender()
				}
			} else {
				if (c.subject.nearestM.head == NEAREST) {
					NEAREST.removeMember(c.subject.nearestM)
					c.subject.markAsNeedingRender()
				}
			}
			c = c.nextMember
		}
		c = LINES.nextMember
		while (c != LINES) {
			if (c.subject.distanceTo(x, y) < 10) {
				if (c.subject.nearestM.head != NEAREST) {
					NEAREST.addMember(c.subject.nearestM)
					c.subject.markAsNeedingRender()
				}
			} else {
				if (c.subject.nearestM.head == NEAREST) {
					NEAREST.removeMember(c.subject.nearestM)
					c.subject.markAsNeedingRender()
				}
			}
			c = c.nextMember
		}
		c = ARCS.nextMember
		while (c != ARCS) {
			if (c.subject.distanceTo(x, y) < 10) {
				if (c.subject.nearestM.head != NEAREST) {
					NEAREST.addMember(c.subject.nearestM)
					c.subject.markAsNeedingRender()
				}
			} else {
				if (c.subject.nearestM.head == NEAREST) {
					NEAREST.removeMember(c.subject.nearestM)
					c.subject.markAsNeedingRender()
				}
			}
			c = c.nextMember
		}
		c = CONSTRAINTS.nextMember
		while (c != CONSTRAINTS) {
			if (c.subject.distanceTo(x, y) < 10) {
				if (c.subject.nearestM.head != NEAREST) {
					NEAREST.addMember(c.subject.nearestM)
					c.subject.markAsNeedingRender()
				}
			} else {
				if (c.subject.nearestM.head == NEAREST) {
					NEAREST.removeMember(c.subject.nearestM)
					c.subject.markAsNeedingRender()
				}
			}
			c = c.nextMember
		}
	}
	

	
	
	
	
	//.....................................................................
	//functions to manage control panel/toolbar
	
	function setFunction(f) {
		trace(f)
		FUNCTION = f
			
		
		var canvas = document.getElementById('canvas1')
		switch(FUNCTION) {
			case 'functionText' : {
				canvas.style.cursor = 'text'
				break
			}
			case 'functionMove' : {
				canvas.style.cursor = 'move'
				break
			}
			case 'functionDelete' : {
				canvas.style.cursor = 'pointer'
				break
			}
			case 'functionHorizontal' : {
				canvas.style.cursor = 'pointer'
				break
			}
			case 'functionVertical' : {
				canvas.style.cursor = 'pointer'
				break
			}
			case 'functionLength' : {
				canvas.style.cursor = 'pointer'
				break
			}
			default : {
				canvas.style.cursor = 'crosshair'
				break
			}
		}
		
	}
	
	
	
	function mouseFunctionChosen(e) {
		e = (e) ? e : ((window.event) ? window.event : "")
		setFunction(e.target.id)
		
		e.stopPropagation()
		return false
	}
	
	function keyFunctionChosen(e) {
		e = (e) ? e : ((window.event) ? window.event : "")
	if (e.ctrlKey) {
		switch(String.fromCharCode(e.keyCode)) {
			case 'S' : {
				setFunction('functionSite')
				break
			}
			case 'P' : {
				setFunction('functionPoint')
				break
			}
			case 'L' : {
				setFunction('functionLine')
				break
			}
			case 'A' : {
				setFunction('functionArc')
				break
			}
			case 'T' : {
				setFunction('functionText')
				break
			}
			case 'M' : {
				setFunction('functionMove')
				break
			}
			case 'D' : {
				setFunction('functionDelete')
				break
			}
			case 'H' : {
				setFunction('functionHorizontal')
				break
			}
			case 'V' : {
				setFunction('functionVertical')
				break
			}
			case 'E' : {
				trace("")
				trace("___Structures "+STRUCTURES)
				trace("________Lines "+LINES)
				trace("_________Arcs "+ARCS)
				trace("________Texts "+TEXTS)
				trace("_______Points "+POINTS)
				trace("VectorObjects "+VECTOROBJECTS)
				trace("StringObjects "+STRINGOBJECTS)
				trace("ScalarObjects "+SCALAROBJECTS)
				trace("__Constraints "+CONSTRAINTS)
				trace("______Changed "+CHANGED)
				trace("__NeedsRender "+NEEDSRENDER)
				trace("______Deleted "+NEAREST)
				trace("______Nearest "+NEAREST)
				trace("_____Elements "+ELEMENTS)

				break
			}
		}
	}
		return true
	}
	
		

	
	
