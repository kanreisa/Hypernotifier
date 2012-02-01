/*!
 * Hypernotifier/dev for Prototype.js
 *
 * Copyright (c) 2012 Yuki KAN
 * Licensed under the MIT-License.
 *
 * http://akkar.in/projects/hypernotifier/
**/
var Hypernotifier = Class.create({
	/**
	 * Constructor
	**/
	initialize: function(element, param){
		/*- Target element -*/
		this.target      = $(element);
		
		/*- Options -*/
		this.classPrefix   = param.classPrefix   || 'hypernotifier';
		this.desktopNotify = param.desktopNotify || false;//Notification API(experimental)
		this.scriptaculous = param.scriptaculous || true;
		
		this.hAlign  = param.hAlign  || 'right';
		this.vAlign  = param.vAlign  || 'bottom';
		this.hMargin = param.hMargin || 10;//pixels
		this.vMargin = param.vMargin || 10;//pixels
		this.spacing = param.spacing || 5;//pixels
		this.timeout = param.timeout || 3;//seconds
		
		this.icon    = param.icon    || null;
		this.title   = param.title   || 'Notification';
	}//<--initialize()
	,
	/**
	 * Create
	**/
	create: function(param){
		/*- Desktop notify -*/
		if(this.desktopNotify === true){
			if(this.createDesktopNotify(param) === true){
				return true;
			}
		}
		
		/*- Setting up -*/
		var icon    = param.icon    || this.icon;
		var title   = param.title   || this.title;
		var message = param.message || null;
		var onClick = param.onClick || null;
		var onClose = param.onClose || null;
		var timeout = (typeof param.timeout != 'undefined') ? param.timeout : this.timeout;
		
		var isAlive = true;
		var closeTimer;
		
		/*- Positions -*/
		var hPosition   = this.hMargin;
		var vPosition   = this.vMargin;
		
		/*- Get showing -*/
		var showing = this.target.getElementsByClassName(this.classPrefix + '-notify');
		
		if(showing.length !== 0){
			if(typeof this.target.getHeight == 'undefined'){
				var targetHeight = window.innerHeight || document.body.clientHeight;
			}else{
				var targetHeight = this.target.getHeight() || window.innerHeight || document.body.clientHeight;
			}
			
			for(var i = 0; showing.length > i; i++){
				vPosition += this.spacing + showing[i].getHeight();
				if(vPosition > (targetHeight + this.vMargin)){
					vPosition = this.vMargin;
					hPosition += this.spacing + showing[i].getWidth();
				}
			}
		}
		
		/*- Create a new element for notify -*/
		//
		// <div class="hypernotifier-notify">
		//   <div class="hypernotifier-title">Notification</div>
		//   <div class="hypernotifier-message">yadda yadda yadda..</div>
		//   <div class="hypernotifier-close">&#xd7;</div>
		// </div>
		//
		var notify = new Element('div', {className: this.classPrefix + '-notify'}).insert(
			//title
			new Element('div', {className: this.classPrefix + '-title'}).insert(title)
		).insert(
			//message
			new Element('div', {className: this.classPrefix + '-message'}).insert(message)
		).insert(
			//close
			new Element('div', {className: this.classPrefix + '-close'}).insert('&#xd7;').observe('click', function(e){
				e.stop();
				if(isAlive){
					closeNotify();
				}
			})
		).hide();
		if(icon !== null){
			notify.addClassName(this.classPrefix + '-icon');
			notify.style.backgroundImage = 'url(' + icon + ')';
		}
		notify.style.position      = 'absolute';
		notify.style[this.hAlign] = hPosition + 'px';
		notify.style[this.vAlign] = vPosition + 'px';
		
		/*- onClick event -*/
		if(onClick === null){
			notify.observe('click', function(e){
				closeNotify();
			});
		}else{
			notify.style.cursor = 'pointer';
			notify.observe('click', function(e){
				e.stop();
				onClick();
				closeNotify();
			});
		}
		
		/*- Insert to the target -*/
		this.target.insert(notify);
		
		/*- Show notify -*/
		if(this.scriptaculous){
			notify.appear({duration:0.3});
		}else{
			notify.show();
		}
		
		/*- Set timeout -*/
		if(timeout !== 0){
			closeTimer = setTimeout(function(){
				if(isAlive){
					closeNotify();
				}
			}, timeout * 1000);
			
			//Clear timeout
			notify.observe('mouseover', function(){
				notify.stopObserving('mouseover');
				clearTimeout(closeTimer);
			});
		}
		
		/*- Remove a notify element -*/
		var closeNotify = function(){
			isAlive = false;
			
			if(this.scriptaculous){
				notify.fade({duration:0.4});
			}else{
				notify.hide();
			}
			
			//onClose event
			if(onClose !== null){
				onClose();
			}
			
			setTimeout(function(){
				notify.remove();
			}, 500);
		}.bind(this);
		
		return true;
	}//<--create()
	,
	createDesktopNotify: function(param){
		/*- Setting up -*/
		var icon    = param.icon    || this.icon;
		var title   = param.title   || this.title;
		var message = param.message || null;
		var onClick = param.onClick || null;
		var onClose = param.onClose || null;
		var timeout = (typeof param.timeout != 'undefined') ? param.timeout : this.timeout;
		
		var isAlive = true;
		var notify  = null;
		var vendor  = null;
		var closeTimer;
		
		/*- Check supported -*/
		if(typeof window.webkitNotifications == 'undefined'){
			return false;
		}else{
			vendor = 'webkit';
		}
		
		/*- Get Permissions -*/
		if((vendor == 'webkit') && (window.webkitNotifications.checkPermission() !== 0)) {
			window.webkitNotifications.requestPermission(function(){ this.createDesktopNotify(param) }.bind(this));
			return false;
		}
		
		/*- Create a desktop notification -*/
		if(vendor == 'webkit'){
			notify = window.webkitNotifications.createNotification(icon, title, message.stripTags());
		}
		
		/*- Set timeout -*/
		if(timeout !== 0){
			closeTimer = setTimeout(function(){
				if(isAlive){
					notify.cancel();
				}
			}, timeout * 1000);
		}
		
		/*- onClick event -*/
		notify.onclick = function(){
			if(onClick !== null){
				onClick();
			}
			notify.cancel();
		};
		
		/*- onClose event -*/
		notify.onclose = function(){
			isAlive = false;
			if(onClose !== null){
				onClose();
			}
		};
		
		/*- Show notify -*/
		notify.show();
		
		return true;
	}//<--createDesktopNotify()
});