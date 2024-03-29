﻿
/**
 * Copyright (c) 2009 Zoltan Foley-Fisher (http://foley-fisher.com/)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) 
 * 
 * jquery.graphical-passwords.js 1
 * 
 **/


//this code is derived from http://www.kelvinluck.com/assets/jquery/datePicker/v2/demo/index.html

       
function zoomOut(event)
{
        var fraction = 300 / HEIGHT;
        $('#canvas1').height(300);
        $('#canvas1').width(fraction * WIDTH);
}


function clearData()
{
	deleteAll();
	NEXTID = 0;
	
    reset();
	
	trace("clearData");
}

function loadData(d)
{
	deleteAll();
	NEXTID = 0;
	
    decodeData(d);
    reset();
 
    markAllPointsAsNeedingRender();
    render();
	
	trace("loadData "+d);
}

function loadBackgroundImage()
{
    var v = "/images/QE.gif";  
    
    var img = new Image();  
    img.onload = function()
    {  
		canvasSetSize(img.width, img.height)
		
		canvasSetBackgroundImage(img);
		
        zoomOut();
		
        markAllPointsAsNeedingRender();
        render();
    }  
    img.src = v;
	
	trace("loadBackgroundImage from "+v);
    
}






(function($){
    
	$.fn.extend({


		graphicalPassword : function(s)
		{			
			if (!$.event._dpCache) $.event._dpCache = [];
			
			// initialise the date picker controller with the relevant settings...
			s = $.extend({}, $.fn.graphicalPassword.defaults, s);
			
			return this.each(
				function()
				{
					var $this = $(this);
					var alreadyExists = true;
					
					if (!this._dpId) {
						this._dpId = $.event.guid++;
						$.event._dpCache[this._dpId] = new GraphicalPassword(this);
						alreadyExists = false;
					}
					
					
					var controller = $.event._dpCache[this._dpId];
					
					controller.init(s);
					
					if (!alreadyExists && $this.is(':text')) {
						$this
							.bind(
								'choiceMade',
								function(e, password)
								{
									this.value = password;
								}
							);
							
					}
					
				}
			)
		},


		dpDisplay : function(e, passwordData)
		{
			return _w.call(this, 'display', e, passwordData);
		},
		
		dpClose : function()
		{
			return _w.call(this, 'closePassword', false, this[0]);
		},
		
		dpClose : function()
		{
			return _w.call(this, 'clearPassword', false, this[0]);
		}

	});

	
	
	function GraphicalPassword(ele)
	{
		this.ele = ele;
		
		// initial values...
		this.verticalPosition	=	null;
		this.horizontalPosition	=	null;
		this.verticalOffset		=	null;
		this.horizontalOffset	=	null;
		this.context			=	'#dp-popup';
		this.settings			=	{};
	};
	$.extend(
		GraphicalPassword.prototype,
		{	
			init : function(s)
			{
				this.verticalPosition = s.verticalPosition;
				this.horizontalPosition = s.horizontalPosition;
				this.settings = s;
			},
			
			setPassword :  function(p)
			{
				$e = $(this.ele);
				$e.trigger('choiceMade', [p]);
			},
			
			
			closePassword : function(programatic, ele)
			{
				if (!ele || ele == this.ele)
				{
					$('#dp-popup').empty().remove();
					if (!programatic) {
						$(this.ele).trigger('dpClosed', this);
					}
					
					C2D = null;
				}
			},
			
			
			clearPassword : function(programatic, ele)
			{
				if (!ele || ele == this.ele)
				{
					clearData();
				}
			},
			
			display : function(eleAlignTo, passwordData)
			{
				//only open one at once
				if (C2D) return;
				
				
				eleAlignTo = eleAlignTo || this.ele;
				var c = this;
				var $ele = $(eleAlignTo);
				var eleOffset = $ele.offset();
				
				$('body')
					.append(
						$('<div></div>')
							.attr({
								'id'	:	'dp-popup',
								'class'	:	'dp-popup'
							})
							.css({
								'top'	:	eleOffset.top + c.verticalOffset,
								'left'	:	eleOffset.left + c.horizontalOffset
							})
							.append(
								$('<a href="#" class="dp-close" title="Close">Close</a>')
								.bind(
									'click',
									function()
									{
										c.closePassword(false);
										return false;
									})
							)
							.append(
								$('<a href="#" class="dp-reset" title="Clear">Clear</a>')
								.bind(
									'click',
									function()
									{
										c.clearPassword(false);
										return false;
									})
							)
							.append(
								$('<br><canvas id="canvas1" onmousedown="controlMouseDown(event)" onmousemove="controlMouseMove(event)" onmouseup="controlMouseUp(event)"></canvas>')
							)
							.bgIframe()
						);
						

						
						
						
//old graphics code
		if (controlInitialise())
		{
				
			if (canvasInitialise('canvas1'))
			{
			
				setTargetForRender(C2D);
				setDataCallback(function(s)
				{
					c.setPassword(s);
				})
				setResetCallback(function()
				{
					calculateSiteIndexes();
				})

				loadBackgroundImage();
				setFunction("functionSite");

			    loadData(passwordData);

			}
			
		}			
						
						
					
				var $pop = $('#dp-popup');

				$(this.ele).trigger('dpDisplayed', $pop);
				
				
				if (this.verticalPosition == $.dpConst.POS_BOTTOM) {
					$pop.css('top', eleOffset.top + $ele.height() - $pop.height() + c.verticalOffset);
				}
				if (this.horizontalPosition == $.dpConst.POS_RIGHT) {
					$pop.css('left', eleOffset.left + $ele.width() - $pop.width() + c.horizontalOffset);
				}
				
				
			},
			
		}
	);
	

	$.dpConst = {
		POS_TOP				:	0,
		POS_BOTTOM			:	1,
		POS_LEFT			:	0,
		POS_RIGHT			:	1,
	};

	$.dpText = {
	};

	$.fn.graphicalPassword.defaults = {
		verticalPosition	: $.dpConst.POS_TOP,
		horizontalPosition	: $.dpConst.POS_LEFT,
		verticalOffset		: 0,
		horizontalOffset	: 0,
	};


	var _w = function(f, a1, a2, a3, a4)
	{
		return this.each(
			function()
			{
				var c = _getController(this);
				if (c) {
					c[f](a1, a2, a3, a4);
				}
			}
		);
	};
	
	function _getController(ele)
	{
		if (ele._dpId) return $.event._dpCache[ele._dpId];
		return false;
	};
	
	// make it so that no error is thrown if bgIframe plugin isn't included (allows you to use conditional
	// comments to only include bgIframe where it is needed in IE without breaking this plugin).
	if ($.fn.bgIframe == undefined) {
		$.fn.bgIframe = function() {return this; };
	};


	// clean-up
	$(window)
		.bind('unload', function() {
			var els = $.event._dpCache || [];
			for (var i in els) {
				$(els[i].ele)._dpDestroy();
			}
		});
		
	
})(jQuery);



 


