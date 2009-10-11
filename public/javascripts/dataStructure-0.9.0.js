/* © 2006 Zoltan Foley-Fisher ALL RIGHTS RESERVED */


var DATACALLBACK
var WILLRESETCALLBACK

var RENDERTARGET

var LINES = new RingMember(null)
var ARCS = new RingMember(null)
var TEXTS = new RingMember(null)
var POINTS = new RingMember(null)

var VECTOROBJECTS = new RingMember(null)
var STRINGOBJECTS = new RingMember(null)
var SCALAROBJECTS = new RingMember(null)

var CONSTRAINTS = new RingMember(null)

var CHANGED = new RingMember(null)
var NEEDSRENDER = new RingMember(null)
var DELETED = new RingMember(null)
var NEAREST = new RingMember(null)
var ELEMENTS = new RingMember(null)


var POINTRADIUS = 30
var LINEWIDTH = 6

	
	
	function angleBetween(x1, y1, x2, y2)
	{
		if (x2 > x1) {
			return Math.atan((y2 - y1)/(x2 - x1))
		} else if (x2 == x1) {
			if (y2 > y1) {
				return Math.PI/2
			} else {
				return -Math.PI/2
			}
		}
		return Math.atan((y2 - y1)/(x2 - x1)) - Math.PI
	}
	

//..........................................................
function RingMember(s) {
	
	this.head = this
	this.nextMember = this
	this.prevMember = this
	
	this.subject = s
	
	this.addMember = function(c) {
		if (c.head != this) {
			c.head = this
			this.nextMember.prevMember = c
			c.nextMember = this.nextMember
			c.prevMember = this
			this.nextMember = c
		}
	}
	
	this.removeMember = function(c) {
		if (c.head == this) {
			c.prevMember.nextMember = c.nextMember
			c.nextMember.prevMember = c.prevMember
			c.nextMember = c
			c.prevMember = c
			c.head = c
		}
	}
	
	this.toString = function () {
		var s = ""
		if (this.head != this) {
			s = "C{"+this.subject + "}"
			
		} else {
			s = "H{"+this.subject + "}["
			var c = this.nextMember
			while (c.head != c) {
				s = s + c
				c = c.nextMember
			}
			s = s + "]"
		}
		return(s)
	}
	
	
 }
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
//............................................................
 function Dependable() {
	this.dependents = new RingMember(this)
	this.addDependentM = function(c) {
		this.dependents.addMember(c)
	}
	this.removeDependentM = function(c) {
		this.dependents.removeMember(c)
	}
	
	this.markDependentsAsChanged = function() {
		var c = this.dependents.nextMember
		while (c.head != c) {
			c.subject.markAsChanged()
			c = c.nextMember
		}
	}
	this.markDependentsAsNeedingRender = function() {
			var c = this.dependents.nextMember
			while (c.head != c) {
				c.subject.markAsNeedingRender()
				c = c.nextMember
			}
	}
	this.dependentsDeleteAll = function() {
		var c = this.dependents.nextMember
		while (c != this.dependents) {
			var s = c.subject
			c = c.nextMember
			s.deleteAll()
		}
	}	
	
	this.hasDependent = function(t) {
		var d = this.dependents.nextMember
		while (d != this.dependents) {
			if (d.subject == t) {
				return true
			}
			d = d.nextMember
		}
		return false
	}
	
	this.dependentTypeOf = function(t) {
		var d = this.dependents.nextMember
		while (d != this.dependents) {
			if (d.subject.typeM.head == t) {
				return d.subject
			}
			d = d.nextMember
		}
		return null
	}	
}

			


function Arrangeable() {
	this.nearestM = new RingMember(this)
	this.elementsM = new RingMember(this)
}














//............................................................
var NEXTID = 0
function getUniqueID() {
	return NEXTID++
}

var ENCODED = new Array()



function setDataCallback(d) {
	DATACALLBACK = d
}



function decodeData(string) {
	
	
	var e = new Array()
	try
	{
		eval(string)
	} catch (e)
	{
	}

	var decoders = new Array()
	for (id in e) {
		decoders[id] = new Decoder(id)
	}
	for (id in decoders) {
		decoders[id].decode(decoders, e)
	}
}

function createDataNode(string) {
	
	var n = ENCODED.length
	ENCODED[n] = string
	
	var data = ""
	for (id in ENCODED) {
		data = data + ENCODED[id]
	}
	
	if (DATACALLBACK)
		DATACALLBACK(data)
	
	return n
}

function updateDataNode(n, string) {
	
	ENCODED[n] = string
	
	var data = ""
	for (id in ENCODED) {
		data = data + ENCODED[id]
	}
	if (DATACALLBACK)
		DATACALLBACK(data)
}

function deleteDataNode(n) {
	
	delete ENCODED[n]
	
	var data = ""
	for (id in ENCODED) {
		data = data + ENCODED[id]
	}
	if (DATACALLBACK)
		DATACALLBACK(data)
}

function Decoder(ID) {
	
	this.ID = ID
	this.object = null
	
	this.decode = function(allDecoders, encoded) {
		
		if (this.object == null) {
		
			switch (encoded[this.ID].type) {
				
			case 'VectorObject' :
				var x = Number(encoded[this.ID].v0)
				var y = Number(encoded[this.ID].v1)
				
				this.object = new VectorObject(x, y)
				break
				
			case 'StringObject' :
				var v = String(encoded[this.ID].v0)
				
				this.object = new StringObject(v)
				break
				
			case 'ScalarObject' :
				var v = Number(encoded[this.ID].v0)
				
				this.object = new ScalarObject(v)
				break
			
			case 'Constraint' :
				var o = allDecoders[encoded[this.ID].v0].decode(allDecoders, encoded)
				var v = String(encoded[this.ID].v1)
				
				this.object = new Constraint(o, v)
				break
				
			default:
				
				var o1
				if (encoded[this.ID].v0 != undefined)
					o1 = allDecoders[encoded[this.ID].v0].decode(allDecoders, encoded)
				var o2
				if (encoded[this.ID].v1 != undefined)
					o2 = allDecoders[encoded[this.ID].v1].decode(allDecoders, encoded)
				var o3
				if (encoded[this.ID].v2 != undefined)
					o3 = allDecoders[encoded[this.ID].v2].decode(allDecoders, encoded)
				
				
				var objectFunction = eval(encoded[this.ID].type)
				this.object = new objectFunction(o1, o2, o3)
				
				break
				
			}
		}
		return this.object
	}
	
}



function Encoder(object) {
	
	this.encode = function() {
		
		var a = this.object.encode()
		
		var s = "e[" + a[0] + "]=new Object();"
		s = s + "e[" + a[0] + "].type='" + a[1] + "';"
		if (a[2] != undefined)
			s = s + "e[" + a[0] + "].v0='" + a[2] + "';"
		if (a[3] != undefined)
			s = s + "e[" + a[0] + "].v1='" + a[3] + "';"
		if (a[4] != undefined)
			s = s + "e[" + a[0] + "].v2='" + a[4] + "';"
		
		return s
	}
	
	this.object = object
	this.node = createDataNode(this.encode())
	
	this.update = function() {
		updateDataNode(this.node, this.encode())
	}
	
	this.deleteAll = function() {
		deleteDataNode(this.node)
	}
	
}













//............................................................
function setTargetForRender(f) {
	RENDERTARGET = f
}

function render() {
	
	var n = NEEDSRENDER.nextMember
	while (n != NEEDSRENDER) {
	
		if (n.subject.nearestM.head == NEAREST) {
			RENDERTARGET.lineWidth = LINEWIDTH * 2;
		} else {
			RENDERTARGET.lineWidth = LINEWIDTH
		}
		
		n.subject.render()
		
		n = NEEDSRENDER.nextMember
	}
}


function setResetCallback(d) {
	WILLRESETCALLBACK = d
}

function reset() {
	
	if (WILLRESETCALLBACK)
		WILLRESETCALLBACK()
		
	var n = CHANGED.nextMember
	while (n != CHANGED) {
	
		n.subject.reset()
		
		n = CHANGED.nextMember
	}
}















function Line(p1, p2) {

	this.typeM = new RingMember(this)
	LINES.addMember(this.typeM)
	
	this.startPointM = new RingMember(this)
	p1.addDependentM(this.startPointM)
	
	this.endPointM = new RingMember(this)
	p2.addDependentM(this.endPointM)
	
	
	this.x1 = function() {
		return this.startPointM.head.subject.x()
	}
	this.y1 = function() {
		return this.startPointM.head.subject.y()
	}
	this.x2 = function() {
		return this.endPointM.head.subject.x()
	}
	this.y2 = function() {
		return this.endPointM.head.subject.y()
	}
	
	this.xCache = null
	this.yCache = null
	this.x = function() {
		if (this.xCache == null) {
			this.xCache = (this.x2() - this.x1())/2 + this.x1()
		}
		return this.xCache
	}
	this.y = function() {
		if (this.yCache == null) {
			this.yCache = (this.y2() - this.y1())/2 + this.y1()
		}
		return this.yCache
	}
	this.angle = function() {
		if (this.angleCache == null) {
			this.angleCache = angleBetween(this.x1(), this.y1(), this.x2(), this.y2())
		}
		return this.angleCache
	}
	this.move = function(deltaX, deltaY) {
		this.startPointM.head.subject.move(deltaX, deltaY)
		this.endPointM.head.subject.move(deltaX, deltaY)
	}
	
	
	this.vVector = new Vector()
	this.wVector = new Vector()
	this.inheritsArrangeable = Arrangeable
	this.inheritsArrangeable()
	this.distanceTo = function(p, q) {
	
	//from http://softsurfer.com/Archive/algorithm_0102/algorithm_0102.htm
		this.vVector.x = this.x2() - this.x1()
		this.vVector.y = this.y2() - this.y1()
		this.wVector.x = p - this.x1()
		this.wVector.y = q - this.y1()
		var c1 = this.wVector.dot(this.vVector)
		if (c1 <= 0) {
			return this.startPointM.head.subject.distanceTo(p,q)
		}
		var c2 = this.vVector.dot(this.vVector)
		if (c2 <= c1) {
			return this.endPointM.head.subject.distanceTo(p,q)
		}
		var b = c1/c2
		var x3 = this.x1() + b*this.vVector.x
		var y3 = this.y1() + b*this.vVector.y
		return Math.sqrt(Math.pow(x3 - p, 2) + Math.pow(y3 - q, 2))
	}
	
	
	this.mergeWith = function(e) {
		trace("Line merge with"+e)
		ELEMENTS.removeMember(e.elementsM)	
	}

	
	this.deletedM = new RingMember(this)
	this.deleteAll = function() {
		
			if (this.deletedM.head == DELETED) {
				return
			}
		DELETED.addMember(this.deletedM)
		RENDERTARGET.overriddenClearRect(this.x1(), this.y1(), this.x() - this.x1(), this.y() - this.y1())
		RENDERTARGET.overriddenClearRect(this.x(), this.y(), this.x2() - this.x(), this.y2() - this.y())
		

		this.dependentsDeleteAll()
		
		this.startPointM.head.subject.removeDependentM(this.startPointM)
		this.endPointM.head.subject.removeDependentM(this.endPointM)
		
		this.vVector = null
		this.wVector = null
	
		NEEDSRENDER.removeMember(this.needsRenderM)
		ELEMENTS.removeMember(this.elementsM)
		CHANGED.removeMember(this.changedM)
		NEAREST.removeMember(this.nearestM)
		LINES.removeMember(this.typeM)
		
		this.e.deleteAll()
	}
	
	
	this.implementDependable = Dependable
	this.implementDependable()
	
	
	this.changedM = new RingMember(this)
	
	this.reset = function() {
		CHANGED.removeMember(this.changedM)
	}
	this.markAsChanged = function() {
		
		if (this.changedM.head == CHANGED) {
			return
		}
		CHANGED.addMember(this.changedM)
		this.markAsNeedingRender()
		
		this.startPointM.head.subject.markAsChanged()
		this.endPointM.head.subject.markAsChanged()
			
		this.markDependentsAsChanged()
			
		this.xCache = null
		this.yCache = null
		this.angleCache = null
		
		this.e.update()
	}
	
	
	this.needsRenderM = new RingMember(this)
	NEEDSRENDER.addMember(this.needsRenderM)
	
	this.render = function() {
		if (this.needsRenderM.head == NEEDSRENDER) {
			NEEDSRENDER.removeMember(this.needsRenderM)
		
			var startX = this.x1() + POINTRADIUS*Math.cos(this.angle());
			var startY = this.y1() + POINTRADIUS*Math.sin(this.angle());
		
			var endX = this.x2() - POINTRADIUS*Math.cos(this.angle());
			var endY = this.y2() - POINTRADIUS*Math.sin(this.angle());
			
			RENDERTARGET.beginPath()
			RENDERTARGET.moveTo(startX, startY)
			RENDERTARGET.lineTo(endX, endY)
			RENDERTARGET.stroke()
		}
	}
	
	this.markAsNeedingRender = function() {
		
		if (this.needsRenderM.head == NEEDSRENDER) {
			return
		}
			
		NEEDSRENDER.addMember(this.needsRenderM)
		RENDERTARGET.overriddenClearRect(this.x1(), this.y1(), this.x() - this.x1(), this.y() - this.y1())
		RENDERTARGET.overriddenClearRect(this.x(), this.y(), this.x2() - this.x(), this.y2() - this.y())
	
		this.startPointM.head.subject.markAsNeedingRender()
		this.endPointM.head.subject.markAsNeedingRender()
		
		this.markDependentsAsNeedingRender()
	}
	
	this.toString = function () {
		return "Line"
	}




	this.ID = getUniqueID()
	this.encode = function() {
		return [this.ID, 'Line', this.startPointM.head.subject.ID, this.endPointM.head.subject.ID]
	}
	this.e = new Encoder(this)
	
	
	
}

















function Arc(p1, p2, p3) {
	
	this.typeM = new RingMember(this)
	ARCS.addMember(this.typeM)
	
	
	this.startPointM = new RingMember(this)
	p1.addDependentM(this.startPointM)
	
	this.endPointM = new RingMember(this)
	p2.addDependentM(this.endPointM)
	
	this.centerPointM = new RingMember(this)
	p3.addDependentM(this.centerPointM)
	
	
	this.rCache = null
	this.outerRCache = null
	this.thetaStartCache = null
	this.thetaEndCache = null
	this.x1 = function() {
		return this.startPointM.head.subject.x()
	}
	this.y1 = function() {
		return this.startPointM.head.subject.y()
	}
	this.x2 = function() {
		return this.endPointM.head.subject.x()
	}
	this.y2 = function() {
		return this.endPointM.head.subject.y()
	}
	this.x = function() {
		return this.centerPointM.head.subject.x()
	}
	this.y = function() {
		return this.centerPointM.head.subject.y()
	}
	this.r = function() {
		if (this.rCache == null) {
			this.rCache = (this.endPointM.head.subject.distanceTo(this.x(), this.y())+this.startPointM.head.subject.distanceTo(this.x(), this.y()))/2
		}
		return this.rCache
	}
	this.outerR = function() {
		if (this.outerRCache == null) {
			this.outerRCache = this.endPointM.head.subject.distanceTo(this.x(), this.y())
			var temp = this.startPointM.head.subject.distanceTo(this.x(), this.y())
			if (temp > this.outerRCache) {
				this.outerRCache = temp
			}
		}
		return this.outerRCache
	}
	this.thetaStart = function() {
		if (this.thetaStartCache == null) {
			this.thetaStartCache = angleBetween(this.x(), this.y(), this.x1(), this.y1())
		}
		return this.thetaStartCache
	}
	this.thetaEnd = function() {
		if (this.thetaEndCache == null) {
			this.thetaEndCache = angleBetween(this.x(), this.y(), this.x2(), this.y2())
		}
		return this.thetaEndCache
	}
	
	
	
	this.move = function(deltaX, deltaY) {
		this.startPointM.head.subject.move(deltaX, deltaY)
		this.endPointM.head.subject.move(deltaX, deltaY)
		this.centerPointM.head.subject.move(deltaX, deltaY)
	}
	
	
	
	this.inheritsArrangeable = Arrangeable
	this.inheritsArrangeable()
	this.distanceTo = function(p, q) {
		return Math.abs(this.centerPointM.head.subject.distanceTo(p, q) - this.r())
	}
	this.mergeWith = function(e) {
		trace("Arc merge with"+e)
		ELEMENTS.removeMember(e.elementsM)	
	}

	
	this.deletedM = new RingMember(this)
	this.deleteAll = function() {
		
			if (this.deletedM.head == DELETED) {
				return
			}
		DELETED.addMember(this.deletedM)
		RENDERTARGET.overriddenClearRect(this.x() - this.outerR(), this.y() - this.outerR(), 2 * this.outerR(), 2 * this.outerR())
		

		this.dependentsDeleteAll()
		
		this.startPointM.head.subject.removeDependentM(this.startPointM)
		this.endPointM.head.subject.removeDependentM(this.endPointM)
		this.centerPointM.head.subject.removeDependentM(this.centerPointM)
		
		NEEDSRENDER.removeMember(this.needsRenderM)
		CHANGED.removeMember(this.changedM)
		ELEMENTS.removeMember(this.elementsM)
		NEAREST.removeMember(this.nearestM)
		ARCS.removeMember(this.typeM)
		
		this.e.deleteAll()
	}
	
	
	this.implementDependable = Dependable
	this.implementDependable()
	
	
	
	this.changedM = new RingMember(this)
	
	this.reset = function() {
		CHANGED.removeMember(this.changedM)
	}
	this.markAsChanged = function() {
		
		if (this.changedM.head == CHANGED) {
			return
		}
		CHANGED.addMember(this.changedM)
		this.markAsNeedingRender()
		
		this.startPointM.head.subject.markAsChanged()
		this.endPointM.head.subject.markAsChanged()
		this.centerPointM.head.subject.markAsChanged()
		
		this.markDependentsAsChanged()
		
		this.thetaStartCache = null
		this.thetaEndCache = null
		this.rCache = null
		this.outerRCache = null
		
		this.e.update()
	}
	
	
	
	this.needsRenderM = new RingMember(this)
	NEEDSRENDER.addMember(this.needsRenderM)
	
	this.render = function() {
		if (this.needsRenderM.head == NEEDSRENDER) {
			NEEDSRENDER.removeMember(this.needsRenderM)
		
			RENDERTARGET.beginPath()
			RENDERTARGET.moveTo(this.x1(), this.y1())
			RENDERTARGET.arc(this.x(), this.y(), this.r(), this.thetaStart(), this.thetaEnd(), false)
			RENDERTARGET.lineTo(this.x2(), this.y2())
			RENDERTARGET.stroke()
		}
	}
	
	this.markAsNeedingRender = function() {
			
		if (this.needsRenderM.head == NEEDSRENDER) {
			return
		}	
				
		NEEDSRENDER.addMember(this.needsRenderM)
		RENDERTARGET.overriddenClearRect(this.x() - this.outerR(), this.y() - this.outerR(), 2 * this.outerR(), 2 * this.outerR())
		
		this.startPointM.head.subject.markAsNeedingRender()
		this.endPointM.head.subject.markAsNeedingRender()
		this.centerPointM.head.subject.markAsNeedingRender()
		
		this.markDependentsAsNeedingRender()
	}
	
	this.toString = function () {
		return "Arc"
	}


	this.ID = getUniqueID()
	this.encode = function() {
		return [this.ID, 'Arc', this.startPointM.head.subject.ID, this.endPointM.head.subject.ID, this.centerPointM.head.subject.ID]
	}
	this.e = new Encoder(this)
	
	
	
}













function Text(s, p) {
	
	this.typeM = new RingMember(this)
	TEXTS.addMember(this.typeM)
	
	this.offset =  0
	
	this.stringM = new RingMember(this)
	s.addDependentM(this.stringM)
	
	this.centerPointM = new RingMember(this)
	p.addDependentM(this.centerPointM)
	
	
	this.widthCache = null
	this.heightCache = null
	this.s = function() {
		return this.stringM.head.subject.v
	}
	this.x = function() {
		return this.centerPointM.head.subject.x()
	}
	this.y = function() {
		return this.centerPointM.head.subject.y() + this.offset
	}
	this.width = function() {
		if (this.widthCache == null) {
			this.widthCache = RENDERTARGET.textWidth(this.s())
		}
		return this.widthCache
	}
	this.height = function() {
		if (this.heightCache == null) {
			this.heightCache = RENDERTARGET.textHeight(this.s())
		}
		return this.heightCache
	}
	
	this.move = function(deltaX, deltaY) {
		this.centerPointM.head.subject.move(deltaX, deltaY)
	}
	this.setString = function(s) {
		this.stringM.head.subject.changeTo(s)
	}
	
	
	this.inheritsArrangeable = Arrangeable
	this.inheritsArrangeable()
	this.distanceTo = function(p, q) {
		return this.centerPointM.head.subject.distanceTo(p, q)
	}
	this.mergeWith = function(e) {
		trace("Text merge with"+e)
		ELEMENTS.removeMember(e.elementsM)	
	}

	
	this.deletedM = new RingMember(this)
	this.deleteAll = function() {
		
		if (this.deletedM.head == DELETED) {
			return
		}
		DELETED.addMember(this.deletedM)
		RENDERTARGET.overriddenClearRect(this.x() - this.width()/2, this.y() - this.height()/2, this.width(), this.height())
		

		this.dependentsDeleteAll()
		
		this.stringM.head.subject.deleteAll()
		
		this.centerPointM.head.subject.removeDependentM(this.centerPointM)
		
		
		NEEDSRENDER.removeMember(this.needsRenderM)
		CHANGED.removeMember(this.changedM)
		ELEMENTS.removeMember(this.elementsM)
		NEAREST.removeMember(this.nearestM)
		TEXTS.removeMember(this.typeM)
		
		this.e.deleteAll()
	}
	
	
	this.implementDependable = Dependable
	this.implementDependable()
	
	
	
	this.changedM = new RingMember(this)
	this.reset = function() {
		CHANGED.removeMember(this.changedM)
	}
	this.markAsChanged = function() {
	
		if (this.changedM.head == CHANGED) {
			return
		}
		CHANGED.addMember(this.changedM)
		
		this.markAsNeedingRender()
		
		this.centerPointM.head.subject.markAsChanged()
			
		this.markDependentsAsChanged()
		
		this.heightCache = null
		this.widthCache = null
		
		this.e.update()
	}
	
	
	
	this.needsRenderM = new RingMember(this)
	NEEDSRENDER.addMember(this.needsRenderM)
	
	this.render = function() {
		if (this.needsRenderM.head == NEEDSRENDER) {
			NEEDSRENDER.removeMember(this.needsRenderM)
		
			RENDERTARGET.beginPath()
			RENDERTARGET.text(this.s(), this.x(), this.y())
			RENDERTARGET.overriddenStroke()
		}
	}
	
	this.markAsNeedingRender = function() {
		
		if (this.needsRenderM.head == NEEDSRENDER) {
			return
		}
			
		NEEDSRENDER.addMember(this.needsRenderM)
		RENDERTARGET.overriddenClearRect(this.x() - this.width()/2, this.y() - this.height()/2, this.width(), this.height())
	
		this.centerPointM.head.subject.markAsNeedingRender()
		
		this.markDependentsAsNeedingRender()
	}
	
	this.toString = function () {
		return "Text"
	}

	this.ID = getUniqueID()
	this.encode = function() {
		return [this.ID, 'Text', this.stringM.head.subject.ID, this.centerPointM.head.subject.ID]
	}
	this.e = new Encoder(this)
	
	
}


















function Point(v1) {
	
	this.typeM = new RingMember(this)
	POINTS.addMember(this.typeM)
	
	
	this.vM = new RingMember(this)
	v1.addDependentM(this.vM)
	
	this.style = "dot"
	
	this.setStyle = function(s) {
		this.markAsChanged()
		
		this.style = s
	}
	
	this.inheritsArrangeable = Arrangeable
	this.inheritsArrangeable()
	this.distanceTo = function(x, y) {
		return Math.sqrt(Math.pow(this.x() - x, 2) + Math.pow(this.y() - y, 2))
	}
	this.mergeWith = function(e) {
		trace("Point merge with"+e)
		switch (e.typeM.head) {
			case POINTS: {
				this.markAsChanged()
				var d = e.dependents.nextMember
				while (d != e.dependents) {
					e.removeDependentM(d)
					this.addDependentM(d)
					d = e.dependents.nextMember
				}
				e.deleteAll()
				break
			}
			default: {
				ELEMENTS.removeMember(e.elementsM)	
				break
			}
		}
	}
	
	
	this.move = function(deltaX, deltaY) {
		this.vM.head.subject.changeBy(deltaX, deltaY)
	}
	this.x = function() {
		return this.vM.head.subject.x
	}
	this.y = function() {
		return this.vM.head.subject.y
	}
	
	
	this.deletedM = new RingMember(this)
	this.deleteAll = function() {
		
			if (this.deletedM.head == DELETED) {
				return
			}
		DELETED.addMember(this.deletedM)
			RENDERTARGET.overriddenClearRect(this.x() - POINTRADIUS, this.y() - POINTRADIUS, POINTRADIUS*2,  POINTRADIUS*2)
		

		this.dependentsDeleteAll()
		
		this.vM.head.subject.deleteAll()
		
		NEEDSRENDER.removeMember(this.needsRenderM)
		ELEMENTS.removeMember(this.elementsM)
		CHANGED.removeMember(this.changedM)
		NEAREST.removeMember(this.nearestM)
		POINTS.removeMember(this.typeM)
		
		this.e.deleteAll()
	}
	
	
	this.implementDependable = Dependable
	this.implementDependable()
	
	
	
	this.changedM = new RingMember(this)
	this.reset = function() {
		CHANGED.removeMember(this.changedM)
	}
	this.markAsChanged = function() {
		
		if (this.changedM.head == CHANGED) {
			return
		}
		CHANGED.addMember(this.changedM)
		
		this.markAsNeedingRender()
		
		this.vM.head.subject.markAsChanged()
			
		this.markDependentsAsChanged()
	
		this.e.update()
	}
	
	
	
	this.needsRenderM = new RingMember(this)
	NEEDSRENDER.addMember(this.needsRenderM)
	
	this.render = function() {
		
		if (this.needsRenderM.head == NEEDSRENDER) {
			NEEDSRENDER.removeMember(this.needsRenderM)
			
			switch(this.style)
			{
				case "dot":
					RENDERTARGET.beginPath()
					RENDERTARGET.moveTo(this.x() + POINTRADIUS/2, this.y())
					RENDERTARGET.arc(this.x(), this.y(), POINTRADIUS/2, 0, 2*Math.PI, 0)
					RENDERTARGET.stroke()
					RENDERTARGET.fill()
					break
					
				case "circle":
					RENDERTARGET.beginPath()
					RENDERTARGET.moveTo(this.x() + POINTRADIUS, this.y())
					RENDERTARGET.arc(this.x(), this.y(), POINTRADIUS, 0, 2*Math.PI, 0)
					RENDERTARGET.stroke()
					break
				
				case "triangle":
    				RENDERTARGET.beginPath()
					RENDERTARGET.moveTo(this.x(), this.y() - POINTRADIUS)
					RENDERTARGET.lineTo(this.x() + 0.866*POINTRADIUS, this.y() + 0.5*POINTRADIUS)
					RENDERTARGET.lineTo(this.x() - 0.866*POINTRADIUS, this.y() + 0.5*POINTRADIUS)
    				RENDERTARGET.closePath()
					RENDERTARGET.stroke()
					break
				
				case "con-circle":
    				RENDERTARGET.beginPath()
					RENDERTARGET.moveTo(this.x() + POINTRADIUS, this.y())
					RENDERTARGET.arc(this.x(), this.y(), POINTRADIUS, 0, 2*Math.PI, 0)
					RENDERTARGET.moveTo(this.x() + POINTRADIUS - 10, this.y())
					RENDERTARGET.arc(this.x(), this.y(), POINTRADIUS - 10, 0, 2*Math.PI, 0)
					RENDERTARGET.stroke()
					break
			}
		}
	}
	
	this.markAsNeedingRender = function() {
		
		if (this.needsRenderM.head == NEEDSRENDER) {
			return
		}	
			
		NEEDSRENDER.addMember(this.needsRenderM)
		RENDERTARGET.overriddenClearRect(this.x() - POINTRADIUS, this.y() - POINTRADIUS, POINTRADIUS*2,  POINTRADIUS*2)
		
		this.markDependentsAsNeedingRender()
	}
	
	
		
	this.toString = function() {
		return "Point"
	}

	this.ID = getUniqueID()
	this.encode = function() {
		return [this.ID, 'Point', this.vM.head.subject.ID]
	}
	this.e = new Encoder(this)
	
	
	this.hasOneDependentLine = function() {
		var count = 0;
		var d = this.dependents.nextMember
		while (d != this.dependents) {
			if (d.subject.typeM.head == LINES)
				count += 1
			d = d.nextMember
		}
		return (count == 1)
	}
	
	this.connectedPointExcludingDependent = function(excluded) {
		var d = this.dependents.nextMember
		while (d != this.dependents) {
			if (d.subject.typeM.head == LINES) {
				var p = d.subject.startPointM.head.subject
				if (p == this)
				{
					var end = d.subject.endPointM.head.subject
					if (!end.hasDependent(excluded))
						return end
				} else
				{
					if (!p.hasDependent(excluded))
						return p
				}
			}
			d = d.nextMember
		}
		return null
	}
	

	
}







function Vector(x, y) {

	this.x = x
	this.y = y
	
	this.dot = function(v) {
		return v.x * this.x + v.y * this.y
	}
}


function VectorObject(x, y) {
	
	
	this.typeM = new RingMember(this)
	VECTOROBJECTS.addMember(this.typeM)
	
	this.inheritsVector = Vector
	this.inheritsVector(x, y)
	
	this.changeBy = function(deltaX, deltaY) {
		this.markAsChanged()
		
		this.x = this.x + deltaX
		this.y = this.y + deltaY
	}
	
	
	this.implementDependable = Dependable
	this.implementDependable()
	
	
	this.changedM = new RingMember(this)
	
	this.reset = function() {
		CHANGED.removeMember(this.changedM)
	}
	this.markAsChanged = function() {
		
		if (this.changedM.head == CHANGED) {
			return
		}
		CHANGED.addMember(this.changedM)
		
		this.markDependentsAsChanged()
	
		this.e.update()
	}
	
	this.deletedM = new RingMember(this)
	this.deleteAll = function() {
			if (this.deletedM.head == DELETED) {
				return
			}
		DELETED.addMember(this.deletedM)
		
		this.dependentsDeleteAll()
		
		CHANGED.removeMember(this.changedM)
		VECTOROBJECTS.removeMember(this.typeM)
		
		this.e.deleteAll()
	}
	
	this.toString = function () {
		return "VectorObject"
	}

	this.ID = getUniqueID()
	this.encode = function() {
		return [this.ID, 'VectorObject', this.x, this.y]
	}
	this.e = new Encoder(this)
	
	
}













function StringObject(v) {
	
	
	this.typeM = new RingMember(this)
	STRINGOBJECTS.addMember(this.typeM)
	
	this.v = v
	
	this.changeTo = function(s) {
		this.markAsChanged()
		
		this.v = s
	}
	
	this.implementDependable = Dependable
	this.implementDependable()
	
	
	this.changedM = new RingMember(this)
	
	this.reset = function() {
		CHANGED.removeMember(this.changedM)
	}
	this.markAsChanged = function() {
		
		if (this.changedM.head == CHANGED) {
			return
		}
		CHANGED.addMember(this.changedM)
			
		this.markDependentsAsChanged()
	
		this.e.update()
	}
	
	this.deletedM = new RingMember(this)
	this.deleteAll = function() {
			if (this.deletedM.head == DELETED) {
				return
			}
		DELETED.addMember(this.deletedM)

		this.dependentsDeleteAll()
		
		CHANGED.removeMember(this.changedM)
		STRINGOBJECTS.removeMember(this.typeM)
		
		this.e.deleteAll()
	}
	
	this.toString = function () {
		return "StringObject"
	}

	this.ID = getUniqueID()
	this.encode = function() {
		return [this.ID, 'StringObject', this.v]
	}
	this.e = new Encoder(this)
	
		
}










function ScalarObject(v) {


	this.typeM = new RingMember(this)
	SCALAROBJECTS.addMember(this.typeM)
	
	this.v = v
	
	this.changeBy = function(deltaV) {
		this.markAsChanged()
		
		this.v = this.v + deltaV
	}
	
	
	this.implementDependable = Dependable
	this.implementDependable()
	
	
	this.changedM = new RingMember(this)
	
	this.reset = function() {
		CHANGED.removeMember(this.changedM)
	}
	this.markAsChanged = function() {
		
		if (this.changedM.head == CHANGED) {
			return
		}
		CHANGED.addMember(this.changedM)
			
		this.markDependentsAsChanged()
	
		this.e.update()
	}
	
	this.deletedM = new RingMember(this)
	this.deleteAll = function() {
		
			if (this.deletedM.head == DELETED) {
				return
			}
		DELETED.addMember(this.deletedM)
		

		this.dependentsDeleteAll()
		
		
		CHANGED.removeMember(this.changedM)
		SCALAROBJECTS.removeMember(this.typeM)
		
		this.e.deleteAll()
	}
	
	this.toString = function () {
		return "ScalarObject"
	}

	this.ID = getUniqueID()
	this.encode = function() {
		return [this.ID, 'ScalarObject', this.v]
	}
	this.e = new Encoder(this)
	
	
}


















function Constraint(object, constraintType) {
	
	this.typeM = new RingMember(this)
	CONSTRAINTS.addMember(this.typeM)

	this.constraintsM = new RingMember(this)
	object.addDependentM(this.constraintsM)
	
	this.constraintType = constraintType
	
	this.v1 = object.startPointM.head.subject.vM.head.subject
	this.v2 = object.endPointM.head.subject.vM.head.subject
	
	this.originalLength = Math.sqrt(Math.pow(this.v1.x - this.v2.x, 2) + Math.pow(this.v1.y - this.v2.y, 2))
	
	this.currentAngle = Math.atan((this.v1.y - this.v2.y)/(this.v1.x - this.v2.x))
	
	this.inheritsArrangeable = Arrangeable
	this.inheritsArrangeable()
	this.distanceTo = function(x, y) {
		return Math.sqrt(Math.pow(this.x() - x, 2) + Math.pow(this.y() - y, 2))
	}
	this.mergeWith = function(e) {
		trace("Constraint merge with"+e)
		ELEMENTS.removeMember(e.elementsM)	
	}
	
	this.x = function() {
		return this.constraintsM.head.subject.x()
	}
	this.y = function() {
		return this.constraintsM.head.subject.y()
	}
	
	this.relax = function() {
		var currentError = this.error()
		if (Math.abs(currentError) > 0.01) {
		
		switch (this.constraintType) {
			case 'H': {
				this.v1.changeBy(0, currentError/2)
				this.v2.changeBy(0, -currentError/2)
				break
			}
			
			case 'V': {
				this.v1.changeBy(currentError/2, 0)
				this.v2.changeBy(-currentError/2, 0)
				break
			}
			
			case 'L': {
				this.v1.changeBy((this.v1.x - this.x()) * -currentError/2, (this.v1.y - this.y()) * -currentError/2)
				this.v2.changeBy((this.v2.x - this.x()) * -currentError/2, (this.v2.y - this.y()) * -currentError/2)
				break
			}
			
		}
		
		}
	}
	
	this.error = function() {
		//dE/dContraint is 1
		switch (this.constraintType) {
			case 'H': {
				return (this.v2.y - this.v1.y)
			}
			
			case 'V': {
				return (this.v2.x - this.v1.x)
			}
			
			case 'L': {
				return Math.sqrt(Math.pow(this.v1.x - this.v2.x, 2) + Math.pow(this.v1.y - this.v2.y, 2)) / this.originalLength - 1
			}
		}
		
	}
	
	
	this.changedM = new RingMember(this)
	
	this.reset = function() {
		CHANGED.removeMember(this.changedM)
	}
	this.markAsChanged = function() {
		if (this.changedM.head == CHANGED) {
			return
		}	
		CHANGED.addMember(this.changedM)
		
		this.markAsNeedingRender()
		
		var o = this.constraintsM.head.subject
		this.v1 = o.startPointM.head.subject.vM.head.subject
		this.v2 = o.endPointM.head.subject.vM.head.subject
		
		this.currentAngle = Math.atan((this.v1.y - this.v2.y)/(this.v1.x - this.v2.x))
	
		this.e.update()
	}
	
	this.needsRenderM = new RingMember(this)
	NEEDSRENDER.addMember(this.needsRenderM)
	this.render = function() {
		if (this.needsRenderM.head == NEEDSRENDER) {
			NEEDSRENDER.removeMember(this.needsRenderM)
			switch (this.constraintType) {
			
			case 'L': {
    				RENDERTARGET.beginPath()
				RENDERTARGET.translate(this.x(), this.y())
				RENDERTARGET.rotate(this.currentAngle)		
				RENDERTARGET.moveTo(-7, -7)
				RENDERTARGET.lineTo(-7, 7)
				RENDERTARGET.moveTo(7, -7)
				RENDERTARGET.lineTo(7, 7)
  				RENDERTARGET.rotate(-this.currentAngle)
  				RENDERTARGET.translate(-this.x(), -this.y())
    				RENDERTARGET.stroke()
  				break
			}
			
			default: {
    				RENDERTARGET.beginPath()
				RENDERTARGET.translate(this.x(), this.y())
				RENDERTARGET.rotate(Math.PI/4)
				RENDERTARGET.rect(-7, -7, 14, 14)
  				RENDERTARGET.rotate(-Math.PI/4)
  				RENDERTARGET.translate(-this.x(), -this.y())
    				RENDERTARGET.stroke()
  				break
  			}
			
			}
		}
	}
	this.markAsNeedingRender = function() {
		NEEDSRENDER.addMember(this.needsRenderM)
		RENDERTARGET.overriddenClearRect(this.x() - 10, this.y() - 10, 20, 20)
	}
	
	
	this.deletedM = new RingMember(this)
	this.deleteAll = function() {
		DELETED.addMember(this.deletedM)
		RENDERTARGET.overriddenClearRect(this.x() - 10, this.y() - 10, 20, 20)
		
		
		object.removeDependentM(this.constraintsM)
		this.v1 = null
		this.v2 = null
		
		CHANGED.removeMember(this.changedM)
		NEEDSRENDER.removeMember(this.needsRenderM)
		ELEMENTS.removeMember(this.elementsM)
		NEAREST.removeMember(this.nearestM)
		CONSTRAINTS.removeMember(this.typeM)
		
		this.e.deleteAll()
	}
	
	
	this.toString = function () {
		return "Constraint"
	}

	this.ID = getUniqueID()
	this.encode = function() {
		return [this.ID, 'Constraint', this.constraintsM.head.subject.ID, this.constraintType]
	}
	this.e = new Encoder(this)
	
}