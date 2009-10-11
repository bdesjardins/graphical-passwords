/* © 2009 Zoltan Foley-Fisher ALL RIGHTS RESERVED */



var SITES = new RingMember(null)

var NEXTINDEX = 0
function getIncreasingIndex() {
	return NEXTINDEX++
}

function calculateSiteIndexes() {
	//assume each site has at most two lines
	//find each site with only one line
	//if all the connected sites are on average increasing
	//then assign indexes
	var startSites = []
	var c = SITES.nextMember
	while (c != SITES)
	{
		var s = c.subject
		if (s.hasOnePath())
			startSites.push(s)
		
		s.textM.head.subject.centerPointM.head.subject.setStyle("circle")
		s.textM.head.subject.setString("")
		
		c = c.nextMember
	}
	
	for (i in startSites) {
		if (startSites[i].neighboursIncreaasing())
			startSites[i].setIndexes()
	}
}

function siteBelongingToPoint(p) {
	if (p != null)
	{
		var t = p.dependentTypeOf(TEXTS)
		if (t != null)
		{
			var s = t.dependentTypeOf(SITES)
			return s
		}
	}
	return null
}

//BASIC:
//must have type member
//must implement deleteAll
//must implement encoding
//must implement deleteAll using DELETED ring
//must notify encoder during deleteAll
//must remove type member during deleteAll


//If DEPENDENT:
//must implement markAsChanged, markAsNeedingRender, 
//must removeDependent during deleteAll


function Site(textObject) {
	
	this.typeM = new RingMember(this)
	SITES.addMember(this.typeM)

	this.increasingIndex = getIncreasingIndex()
	
	this.textM = new RingMember(this)
	textObject.addDependentM(this.textM)
	
	textObject.offset = - POINTRADIUS - LINEWIDTH - 20
	
	this.deletedM = new RingMember(this)
	this.deleteAll = function() {
		DELETED.addMember(this.deletedM)
		
		this.textM.head.subject.deleteAll()
		
		SITES.removeMember(this.typeM)
		
		this.e.deleteAll()
	}
	
	
	this.markAsChanged = function() {
	}
	
	
	this.markAsNeedingRender = function() {
	}
	
	
	
	
	this.toString = function () {
		return "Site"
	}

	this.ID = getUniqueID()
	this.encode = function() {
		return [this.ID, 'Site', this.textM.head.subject.ID]
	}
	this.e = new Encoder(this)
	
	this.hasOnePath = function() {
		return this.textM.head.subject.centerPointM.head.subject.hasOneDependentLine()
	}
	
	
	this.neighbourExcluding = function(site) {
		var p
		if (site != null)
		{
			var t = site.textM.head.subject
			p = this.textM.head.subject.centerPointM.head.subject.connectedPointExcludingDependent(t)
		} else
		{
			p = this.textM.head.subject.centerPointM.head.subject.connectedPointExcludingDependent(null)
		}
		return siteBelongingToPoint(p)
	}
	
	this.neighboursIncreaasing = function() {
		var p = this.textM.head.subject.centerPointM.head.subject.connectedPointExcludingDependent(null)
		var s = siteBelongingToPoint(p)
		if (s != null)
		{
			return (s.increasingIndex > this.increasingIndex)
		}
		return false
	}
	
	
	this.setIndexes = function() {
		var index = 0;
		var s = this;
		var excluded = null;
		do
		{
			index++
			
			var oldSite = s
			s = s.neighbourExcluding(excluded)
			excluded = oldSite
			
			if (index == 1)
			{
				oldSite.textM.head.subject.centerPointM.head.subject.setStyle("triangle")
				oldSite.textM.head.subject.setString("")
			} else if (s == null)
			{
				oldSite.textM.head.subject.centerPointM.head.subject.setStyle("con-circle")
				oldSite.textM.head.subject.setString("")
			} else
			{
				oldSite.textM.head.subject.centerPointM.head.subject.setStyle("circle")
				oldSite.textM.head.subject.setString(""+(index-1))
			}
		}
		while (s != null)
	}
}












