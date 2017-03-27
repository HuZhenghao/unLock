/*
	Created by HuZhenghao
	2017/3/27
*/
(function(){
function get(id) {
	return document.getElementById(id);
}
//定义添加事件的兼容函数
function addEvent(ele,event,func) {
	if(ele.addEventListener) {
		ele.addEventListener(event,func,false);
	}
	else if(ele.attachEvent) {
		ele.attachEvent("on" + event,func);
	}
	else{
		ele["on" + event] = func;
	}
}
//定义储存九个点坐标的数组
var point = [
	{x:20,y:20,},
	{x:100,y:20},
	{x:180,y:20},
	{x:20,y:100},
	{x:100,y:100},
	{x:180,y:100},
	{x:20,y:180},
	{x:100,y:180},
	{x:180,y:180},
];
//解锁点的半径
var r = 15;
//储存经过的点的数组
var password = [];
//储存剩余的点的数组
var rest = null;
//存储设置的密码的数组
var stored = [];
//定义构造函数
var MyCanvas= function(ele) {
	this.ele = ele;
	this.istouched = false;
	this.init();
	this.start();
}
//为MyCanvas添加方法
MyCanvas.prototype = {
	init: function(){
		if(this.ele.getContext){
			var ctx = this.ele.getContext("2d");
			ctx.lineWidth = 2;
			function paintCircle(x,y){	
				ctx.beginPath();
				ctx.arc(x, y, r, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.strokeStyle = "#bbb";
				ctx.stroke();
				ctx.fillStyle = "#fff";
				ctx.fill();
			}			
			//画出九个点
			for(var i = 0; i < point.length; i ++) {
				paintCircle(point[i].x,point[i].y);
			}
		}
	},
	//获取当前点在canvas上的坐标
	getPosition: function(e){
		var position = {
			x: e.touches[0].clientX - e.currentTarget.getBoundingClientRect().left,
			y: e.touches[0].clientY - e.currentTarget.getBoundingClientRect().top
		};
		return position;
	},
	//绘制被选中的点
	drawPoint: function(x,y){
		var ctx = this.ele.getContext("2d");
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.strokeStyle = "#fb8c00";
		ctx.stroke();
		ctx.fillStyle = "#ffa726";
		ctx.fill();
	},
	//画线
	drawLine: function(p) {
		var self = this;
		var ctx = this.ele.getContext("2d");
		//每次划线前清空canvas
		ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
		//将原来的点重新绘制
		this.init();
		if(password[0]) {
		for(var i = 0; i < password.length; i ++) {
			self.drawPoint(password[i].x,password[i].y);
		}
		//开始划线
		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.moveTo(password[0].x,password[0].y);
		for(var i = 0; i < password.length; i ++) {
			ctx.lineTo(password[i].x,password[i].y);
		}
		ctx.lineTo(p.x,p.y);
		ctx.strokeStyle = "red";
		ctx.stroke();
		ctx.closePath();
		}
	},
	//检测密码是否相同
	checkPassword: function(pa1,pa2){
		var p1 ="";
		var p2 ="";
		for (var i = 0 ; i < pa1.length ; i++) {
            p1 += "x:" + pa1[i].x + "y:" + pa1[i].y;
        }
        for (var i = 0 ; i < pa2.length ; i++) {
            p2 += "x:" + pa2[i].x + "y:" + pa2[i].y;
        }
		return p1 === p2;
	},
	start: function(){
		var self = this;
		rest = point.slice();
		//添加触摸事件		
		addEvent(this.ele,"touchstart",function(event){
			var p = self.getPosition(event);
			self.istouched = true;
			for(var i = 0; i < point.length; i++){
				//判断触摸点是否在圆内								
				if((Math.abs(p.x - point[i].x) < r) && (Math.abs(p.y - point[i].y) < r)){					
					self.drawPoint(point[i].x,point[i].y);
					password.push({x:point[i].x,y:point[i].y});
					rest.splice(i,1);										
				}				
			}
		});
		//添加滑动事件
		addEvent(this.ele,"touchmove",function(event){
			var p = self.getPosition(event);
			if (self.istouched) {
				self.drawLine(p);
				for(var i = 0; i < rest.length; i ++) {
					if((Math.abs(p.x - rest[i].x) < r) && (Math.abs(p.y - rest[i].y) < r)){
						self.drawPoint(rest[i].x,rest[i].y);
						password.push({x:rest[i].x,y:rest[i].y});
						rest.splice(i,1);
					}
				}
			};
		});
		addEvent(this.ele,"touchend",function(){
			istouched = false;
			//初始化
			var ctx = self.ele.getContext("2d");
			ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
			self.init();
			//如果选择设置密码
			if(get("set").checked){
				//若密码少于5位
				if(password.length < 5){
					get("hint").innerHTML = "密码太短,至少需要5个点";
					password = [];
					rest = point.slice();
				}
				//密码位数正确
				else{
					//若已经输入过一次
					if(stored.length >= 5){
						if(self.checkPassword(password,stored)){
							get("hint").innerHTML = "密码设置成功";
							//密码设置成功后跳到验证密码阶段
							localStorage.setItem("key", JSON.stringify(stored));
						}
						else{
							get("hint").innerHTML = "两次输入不一致";
							stored = [];
						}
						password = [];
						rest = point.slice();
						stored = [];
					}
					//第一次输入
					else{
						stored = password.slice();
						get("hint").innerHTML = "请再次输入手势密码";
						password = [];
						rest = point.slice();
					}
				}
			}
			//验证密码
			if(get("verify").checked){
				//若密码少于5位
				if(password.length < 5){
					get("hint").innerHTML = "密码太短,至少需要5个点";
					password = [];
					rest = point.slice();
				}
				//密码位数正确
				else{
					//密码和localstorage里储存的一致
					if(self.checkPassword(password, JSON.parse(localStorage.getItem("key"))) ){
						get("hint").innerHTML = "密码正确！";						
					}
					//密码错误
					else{
						get("hint").innerHTML = "输入的密码不正确";
					}
					password = [];
					rest = point.slice();
				}
			}
		});
	},
}

var canvas = new MyCanvas(get("myCanvas"));
addEvent(get("set-block"),"click",function(){
	stored = [];
	get("set").checked = true;
	localStorage.setItem("key","");
	get("hint").innerHTML = "";
});
addEvent(get("verify-block"),"click",function(){
	get("verify").checked = true;
	get("hint").innerHTML = "请输入密码";
});

})();