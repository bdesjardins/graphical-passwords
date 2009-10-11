/* © 2006 Zoltan Foley-Fisher ALL RIGHTS RESERVED */

	
var FONTDATA = new Image()
FONTDATA.src = "LucidaConsole.png";

FONTDATA.characters = "abcdefghijklmnopqrstuvwxyz0123456789?!()"
FONTDATA.characterWidth = 3.6*6
FONTDATA.characterHeight = 36

var STRINGS = new Array()
var STRINGCOUNT = 0

var COLOUR = '#9117FF'
var BACKGROUNDIMAGE
var WIDTH
var HEIGHT

var C2D


function canvasSetSize(width, height) {
		if (C2D) {
			
			WIDTH = width
			HEIGHT = height
			
	        var element = document.getElementById('canvas1');
			element.setAttribute('height', HEIGHT);
			element.setAttribute('width', WIDTH);
			
			C2D.strokeStyle = COLOUR
			C2D.fillStyle = COLOUR
		}
}


function canvasXCoordinateForFraction(f) {
		if (C2D) {
			return WIDTH*f;
		}
		return 0;
}
function canvasYCoordinateForFraction(f) {
		if (C2D) {  
			return HEIGHT*f;
		}
		return 0;
}



function canvasSetBackgroundImage(i) {
		if (C2D) {
			
			BACKGROUNDIMAGE = i
			if (BACKGROUNDIMAGE)
       			C2D.drawImage(BACKGROUNDIMAGE, 0, 0);
		}
}

function canvasInitialise() {
		C2D = document.getElementById('canvas1').getContext('2d')
		if (C2D) {
			C2D.globalAlpha = 1
			C2D.globalCompositeOperation = 'source-over'
			C2D.lineCap = 'round'
			C2D.lineJoin = 'round'
			C2D.miterLimit = 10
			C2D.strokeStyle = COLOUR
			C2D.fillStyle = COLOUR
			//C2D.shadowOffsetX = 2
			//C2D.shadowOffsetY = 3
			//C2D.shadowBlur = 5
			//C2D.shadowColor = '#000000'
			
	
			C2D.text = function(s, x, y) {
				STRINGCOUNT++
				STRINGS[STRINGCOUNT] = new Array(s, x, y)
			}

			C2D.textWidth = function(s) {
				return s.length*FONTDATA.characterWidth
			}

			C2D.textHeight = function(s) {
				return FONTDATA.characterHeight
			}
	
			C2D.overriddenStroke = function() {
				C2D.stroke()
				while (STRINGCOUNT > 0) {
					
					
					var s = STRINGS[STRINGCOUNT][0]
					var x = STRINGS[STRINGCOUNT][1]
					var y = STRINGS[STRINGCOUNT][2]
					
									s = s.split('')

				var renderX = x - s.length*FONTDATA.characterWidth/2
				var renderY = y - FONTDATA.characterHeight/2
				var i = 0, index = 0
				while (i < s.length) {
					index = FONTDATA.characters.indexOf(s[i])
					if (index >= 0) {
						this.drawImage(FONTDATA,
										index*FONTDATA.characterWidth, 0,
										FONTDATA.characterWidth, FONTDATA.characterHeight,
										renderX, renderY, 
										FONTDATA.characterWidth, FONTDATA.characterHeight)
					}
					renderX += (FONTDATA.characterWidth + 1)
					i++
				}
				
				
					STRINGCOUNT--
				}
			}
			
			C2D.overriddenClearRect = function(x1, y1, w, h) {
				if (w < 0) {
					w = -w
					x1 = x1 - w
				}
				if (h < 0) {
					h = -h
					y1 = y1 - h
				} 
				if (BACKGROUNDIMAGE)
        			C2D.drawImage(BACKGROUNDIMAGE,
									x1 - LINEWIDTH,
									y1 - LINEWIDTH,
									w +LINEWIDTH*2,
									h+LINEWIDTH*2,
									x1 - LINEWIDTH,
									y1 - LINEWIDTH,
									w +LINEWIDTH*2,
									h+LINEWIDTH*2);
				else
					C2D.clearRect(x1 - LINEWIDTH, y1 - LINEWIDTH, w +LINEWIDTH*2, h+LINEWIDTH*2)
			}
			
			return true
		}
		
		return false
	}
	

