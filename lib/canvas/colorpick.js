var ColorPicker=function(){
        var math=Math;
        //hsv转换成RGB
        var HSVToRGB=function(h,s,v){
            var i;
            var f, p, q, t;
            var r,g,b;
            if( s == 0 ) {
                v = math.floor(v*255);
                return {
                    r:v,
                    g:v,
                    b:v
                };
            }
            h /= 60;
            i = math.floor( h );
            f = h - i;
            p = v * ( 1 - s );
            q = v * ( 1 - s * f );
            t = v * ( 1 - s * ( 1 - f ) );
            switch( i ) {
                case 0:r = v;g = t;b = p;break;
                case 1:r = q;g = v;b = p; break;
                case 2: r = p;g = v;b = t;break;
                case 3:r = p;g = q;b = v;break;
                case 4:r = t;g = p;b = v;break;
                default:r = v;g = p;b = q;break;
            }
            return {
                r:math.round(r*255),
                g:math.round(g*255),
                b:math.round(b*255)
            };
        };
        var $=function(el){
            return document.getElementById(el)
        }
        var mix=function(target,prototypes){
            for(var i in prototypes){
                target[i]=prototypes[i];
            }
        }
        var getXY=function(el){
            if (document.documentElement.getBoundingClientRect) { // IE,FF3.0+,Opera9.5+
                var box = el.getBoundingClientRect();
                return {x:box.left+document.body.scrollLeft,
                    y:box.top+document.body.scrollTop }
            } else {
                var pos = [el.offsetLeft, el.offsetTop];
                var op = el.offsetParent;
                if (op != el) {
                    while (op) {
                        pos[0] += op.offsetLeft + parseInt(op.style.borderLeftWidth) || 0;
                        pos[1] += op.offsetTop + parseInt(op.style.borderTopWidth) || 0;
                        op = op.offsetParent;
                    }
                }
                return {x:pos[0],y:pos[1]}
            }
        }
        var addClass=function(el,className){
            var str=el.className;
            //过滤多余的空格,同时在首尾添加空格
            str=(" "+str+" ").replace( /\s{2,}/g," ");
            if(str.indexOf(" "+className+" ")==-1){
                str+=" "+className;
            }
            el.className=str;
        }
        var removeClass=function(el,className){
            var str=el.className;
            //过滤多余的空格,同时在首尾添加空格
            str=(" "+str+" ").replace( /\s{2,}/g," ");
            str=str.replace(" "+className+" "," ");
            el.className=str;
        }
        var hasClass=function(el,className){

            var class_arr=el.className.replace(/\s{2,}/g," ").split(" ");
            for(var i=0;i<class_arr.length;i++){
                if(class_arr[i]==className) return true;
            }
            return false;
        }
        var c=function(tagName,params,childs){
            var ele=document.createElement(tagName);
            if(params!=undefined){
                if(params.i){
                    ele.innerHTML=params.i;
                }
                if(params.c){
                    ele.className=params.c;
                }
                if(params.a){
                    var attr=params.a;
                    for(var i in attr){
                        ele.setAttribute(i, attr[i])
                    }
                }
                if(params.s){
                    mix(ele.style,params.s)
                }
            }
            if(childs==undefined) return ele;
            for(var i=0,n=childs.length;i<n;i++){
                ele.appendChild(childs[i])
            }
            return ele;
        }
        var RGBtos=function(rgb){
            return "RGB("+math.round(rgb.r)+","+math.round(rgb.g)+","+math.round(rgb.b)+")"
        }
        var rgbTo16=function(rgb){
            return "#"+rgb.r.toString(16)+rgb.g.toString(16)+rgb.b.toString(16)
        }
        var Event=function(el,type,eve){
            if(document.all){
                el.attachEvent("on"+type, eve);
            }else{
                el.addEventListener(type, eve, false);
            }
        }
        var picker=function(){
            //    this.ele=
            //     this.init();
            var now=this;
            now.el=null;
            now.el_xy=null;
            now.el_disc=null;
            now.el_light=null;
            now.el_ok=null;
            now.el_value=null;
            now.h=0
            now.s=0
            now.l=1
            now.lightItems=[]
            now.lastItem=null
            now.color="#fff";
            now.onchangeCall=[]
            now.onpickCall=[]
            now.config={
                type:"html",
                parent:document.body
            }
        }
        picker.prototype={
            init:function(){

                this.createHtml();

                this.setXY();

                this.config.parent.appendChild(this.el)
                this.bindEvent();
            },
            createHtml:function(){
                var now=this;

                this.el=c("div",{c:"CP-con",s:{display:"none"}},[
                    c("div",{c:"CP-wrap"},[
                        c("div",{c:"CP-hd",i:"拾色器"}),
                        c("div",{c:"CP-bd"},[
                            this.el_disc=c("div",{c:"CP-disc"},[
                                c("img",{a:{
                                        src:"http://img04.taobaocdn.com/tps/i4/T15ZeeXoxbXXXXXXXX-160-160.png",
                                        width:"160",
                                        height:"160"
                                    }}),
                                this.el_xy=c("div",{c:"CP-xy"})
                            ]),
                            this.el_light=c("div",{c:"CP-light"},
                            this.lightItems=((function(){
                                for(var i=0,arr=[];i<40;i++){
                                    arr.push(c("div",{c:"CP-lightItem",s:{
                                            background:RGBtos(HSVToRGB(0,0,i/40))
                                        }}));
                                }
                                (now.lastItem=arr[arr.length-1]).className+=" CP-lightSelected";
                                return arr;
                            })())
                        ),
                            this.el_value=c("input",{c:"CP-value",a:{type:"input",value:"#ffffff"}}),
                            this.el_ok=c("button",{c:"CP-ok",a:{type:"button"},i:"确定"}),
                            c("div",{c:"CP-power"}),
                        ])
                    ])
                ]);

                mix(this.el_xy.style,{
                    left:"80px",
                    top:"80px"
                })
            },
            bindEvent:function(){
                var now=this;
                Event(now.el_disc,"mousemove",function(e){
                    var e=window.event||e

                })
                Event(now.el_disc,"click",function(e){
                    var e=window.event||e
                    var x=e.pageX-getXY(this).x,
                    y=e.pageY-getXY(this).y

                    var r=math.sqrt((x-80)*(x-80)+(y-80)*(y-80));
                    if(r<80){
                        mix(now.el_xy.style,{
                            left:(x-3)+"px",
                            top:(y-3)+"px"
                        })
                        var angle=(math.atan2((80-y),(80-x)))*180/math.PI
                        angle<0&&(angle+=360);
                        now.h=angle
                        now.s=r/80
                        now.color=now.config.type=="html"?rgbTo16(HSVToRGB(now.h,now.s,now.l)):RGBtos(HSVToRGB(now.h,now.s,now.l))
                        now.pick();
                        now.updateL()
                    }
                })
                Event( now.el_light,"click",function(e){
                    var e=window.event||e
                    var t=e.target;
                    if(hasClass(t,"CP-lightItem")){
                        now.lastItem&&(removeClass(now.lastItem,"CP-lightSelected"));
                        addClass(t,"CP-lightSelected")
                        now.lastItem=t
                        now.l=(getXY(t).y-getXY(t.parentNode).y)/163
                        now.color=now.config.type=="html"?rgbTo16(HSVToRGB(now.h,now.s,now.l)):RGBtos(HSVToRGB(now.h,now.s,now.l))
                        now.pick();
                    }
                });
                Event(now.el_ok,"click",function(){
                    now.change();
                })
            },
            updateL:function(){
                var l=this.lightItems
                for(var i=0;i<l.length;i++){
                    l[i].style.background=RGBtos(HSVToRGB(this.h,this.s,i/40))
                }
            },
            appendTo:function(el){
                el.appendChild(this.el)
            },
            onchange:function(callback){
                this.onchangeCall.push(callback)
            },
            onpick:function(callback){
                this.onpickCall.push(callback)
            },
            change:function(){
                this.hide();
                for(var i =0;i<this.onchangeCall.length;i++){
                    this.onchangeCall[i].call(this,this.color)
                }
            },
            pick:function(){
                this.el_value.value=this.color;
                for(var i =0;i<this.onpickCall.length;i++){
                    this.onpickCall[i].call(this,this.color)
                }
            },
            hide:function(){
                this.el.style.display="none";
            },
            show:function(){
                this.el.style.display="block";
            },
            setXY:function(){
                var xy=getXY(this.config.trigger);
                var xy2=getXY(this.config.parent)
                mix(this.el.style,{
                    left:((xy.x-xy2.x)+this.config.trigger.offsetWidth)+"px",
                     top:((xy.y-xy2.y)+this.config.trigger.offsetHeight)+"px"
                })
            }
        }
        return picker;
    }();

    var picker=new ColorPicker()
    picker.config={
        type:"html",
        parent:document.body,
        trigger:document.getElementById("pickcolor")
    }
    picker.init();
    document.getElementById("pickcolor").onclick=function(){
        picker.show();
    }
    picker.onpick(function(color){
        document.body.style.background=color;
    })
    picker.onchange(function(color){
        this.hide();
        document.getElementById("pickcolor").value=this.color;
    })