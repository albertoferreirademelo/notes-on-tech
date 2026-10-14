import{r as e}from"./rolldown-runtime-hePW80VL.js";import{i as t,r as n}from"./framework-5hhgsyNd.js";var r=e(t(),1),i=(e,t=0,n=1)=>Math.max(t,Math.min(n,e)),a=e=>{let t=i(e);return t*t*(3-2*t)},o=(e,t,n)=>a((n-e)/(t-e)),s=e=>Object.keys(e),c=(e,t,n)=>Object.fromEntries(s(e).map(r=>[r,e[r]+(t[r]-e[r])*a(n)])),l={pitch:-.16,yaw:-.5,roll:-.17,spread:.8,height:1.5,thickness:1,x:0,y:.21,scale:1.12,fold:.15,drop:.31,opacity:1},u={...l,pitch:.35,yaw:.3,roll:.08,spread:1.12,height:1.15,x:.04,scale:1.3,fold:.55},d={...l,pitch:1.51,yaw:-.06,roll:-.035,spread:2.15,height:.9,thickness:.28,x:0,y:.02,scale:1.25,fold:.3,drop:0},f={...d,spread:2.5,y:.42,scale:1.1,opacity:.65},p=[[0,l],[.34,u],[.8,d],[1,f]],m=.55,h=1,g=1.2,_=2.3/4.8,v=1.3,y=1.5;function ee(e,t,n){let r=e.length-1;if(n<=e[0])return t[0];if(n>=e[r])return t[r];let i=n=>(t[n+1]-t[n])/(e[n+1]-e[n]),a=e=>{if(e===0)return i(0);if(e===r)return i(r-1);let t=i(e-1),n=i(e);return t*n<=0?0:2*t*n/(t+n)},o=0;for(;n>=e[o+1];)o++;let s=e[o+1]-e[o],c=(n-e[o])/s;return(2*c*c*c-3*c*c+1)*t[o]+(c*c*c-2*c*c+c)*s*a(o)+(-2*c*c*c+3*c*c)*t[o+1]+(c*c*c-c*c)*s*a(o+1)}var te=e=>{let t=p.map(([e])=>e);return Object.fromEntries(s(l).map(n=>[n,ee(t,p.map(([,e])=>e[n]),e)]))},b=e=>e.width/Math.max(1,e.height),x=(e,t)=>{let n=o(.6,1.4,Math.abs(t));return Math.min(1,e*1.65)*(1-n)+Math.min(1,e*.8)*n},S=(e,t,n=0)=>{let r=b(t),i=1-o(.7,1.2,r),a=i*o(.6,1.4,Math.abs(e.pitch));return{...e,pitch:e.pitch-Math.sign(e.pitch)*a*.24,x:e.x*(1-i*.9),y:e.y-i*e.drop+n,scale:e.scale*x(r,e.pitch)*(1+a*.45),opacity:Math.min(1,e.opacity*(1+a*.5))}};function C(e,t){let n=b(e),r=.24,a=1.15,o=_*a*x(n,r),s=i((1-t)*.84/(y*o),.62,1.55);return{pitch:r,yaw:.05,roll:.02,spread:i(1.12*n/(1.325*o),1.6,3.2),height:s,thickness:1,x:0,y:t+.05+v*s*o,scale:a,fold:.5,drop:0,opacity:1}}function ne(e,t,n){let r=Math.max(1,t.height),o=Math.max(1,n.hero-r);if(e<o)return S(te(e/o),t);let s=Math.max(o+2,n.end),l=(o+s)/2;if(e<l){let n=(e-o)/Math.min(r*h,l-o);return S({...f,opacity:f.opacity*(1-a(n))},t,(e-o)/r*2*m)}let u=C(t,n.skyline),d=i(1-(s-e)/Math.min(r*g,s-l));return S({...c({...u,pitch:1.45,yaw:-.06,height:u.height*.8,thickness:.3,fold:.3,y:u.y-.2},u,d),opacity:a(d/.55)},t,-Math.max(0,s-e)/r*2*m)}function re(e,t,n){return S(e>n.end-t.height*.4?C(t,n.skyline):l,t)}function ie(e=432,t=18,n=2){let r=n*(e+1)*(t+1);if(r>65535||![e,t,n].every(e=>Number.isInteger(e)&&e>=1))throw Error(`Unsupported ribbon mesh dimensions`);let i=new Float32Array(r*3),a=new Uint16Array(n*e*t*6),o=0,s=0;for(let r=0;r<n;r++){let n=o;for(let n=0;n<=e;n++)for(let a=0;a<=t;a++)i.set([n/e,a/t,r],o++*3);for(let r=0;r<e;r++)for(let e=0;e<t;e++){let i=n+r*(t+1)+e,o=i+t+1;a.set([i,o,i+1,i+1,o,o+1],s),s+=6}}return{parameters:i,indices:a,count:r}}var w=n(),ae=`
precision highp float;
attribute vec3 aParameter;
uniform vec4 uPoseA;
uniform vec4 uPoseB;
uniform vec3 uPlacement;
uniform vec2 uPointer;
uniform vec2 uMotion;
uniform float uTime;
uniform float uAspect;
varying vec3 vParameter;
varying float vLight;
varying float vDepth;
varying float vFacing;
const float TAU=6.28318530718;
// Sine-free hash: sin() is imprecise on many phone GPUs, and scaling it up
// turns that error into a hard step between noise cells.
float hash(float n){n=fract(n*.1031);n*=n+33.33;n*=n+n;return fract(n);}
float noise(float x){float i=floor(x),f=fract(x);return mix(hash(i),hash(i+1.),f*f*(3.-2.*f));}
float fbm(float x){return noise(x)*.72+noise(x*2.03+11.)*.18;}
vec3 ribbon(vec3 param){
 float u=param.x, v=param.y, layer=param.z;
 float theta=u*TAU;
 float drift=uTime*.19;
 float fold=sin(theta*1.6+drift)*.22+sin(theta*3.4-drift*.7)*.07;
 fold+=sin(theta*4.1-uTime*.3+sin(theta*.9+drift)*1.6)*.03;
 fold+=(fbm(u*3.4+uTime*.03)-.46)*.6;
 float ripple=sin(theta*13.-drift*2.)*.025+sin(theta*27.+drift)*.009;
 float crest=1.45+.28*sin(theta*1.7+1.)+.16*sin(theta*4.1-drift*.2);
 crest*=(1.+.1*sin(theta*2.6-uTime*.5))*uMotion.y;
 float base=-.72+.14*sin(theta*1.5-.4)+(noise(u*4.3-uTime*.02+7.)-.5)*.16+ripple;
 vec3 p=vec3((u-.5)*2.65*uPoseA.w, (base+v*crest-.2)*uPoseB.x, 0.);
 p.x+=sin(theta*1.7+drift*.4)*.17+v*v*sin(theta*2.+drift)*.13;
 p.z=(fold*(1.+uPoseB.w)+layer*.17)*uPoseB.y;
 p.z+=v*v*sin(theta*2.3+drift*.5)*.18*uPoseB.y;
 p.y+=layer*.09+sin(theta*5.+drift)*.025*v;
 p.y-=uMotion.x*v*v*.42;
 p.x+=uMotion.x*v*v*sin(theta*1.3+drift)*.2;
 return p;
}
vec3 rotate(vec3 p){
 float a=uPoseA.x+uPointer.y*.13;
 float b=uPoseA.y+uPointer.x*.22;
 float c=uPoseA.z;
 p=vec3(p.x,p.y*cos(a)-p.z*sin(a),p.y*sin(a)+p.z*cos(a));
 p=vec3(p.x*cos(b)+p.z*sin(b),p.y,-p.x*sin(b)+p.z*cos(b));
 return vec3(p.x*cos(c)-p.y*sin(c),p.x*sin(c)+p.y*cos(c),p.z);
}
void main(){
 vec3 p=ribbon(aParameter);
 vec3 du=ribbon(aParameter+vec3(.001,0.,0.))-p;
 vec3 dv=ribbon(aParameter+vec3(0.,.001,0.))-p;
 vec3 sheet=normalize(cross(du,dv));
 vec3 normal=rotate(sheet);
 float turn=uPoseA.y+uPointer.x*.22;
 vFacing=sheet.z*cos(turn)-sheet.x*sin(turn);
 p=rotate(p)*uPoseB.z;
 float depth=4.8-p.z;
 vec2 projected=p.xy*2.3/depth;
 projected.x/=uAspect;
 projected+=uPlacement.xy;
 gl_Position=vec4(projected*depth,0.,depth);
 vParameter=aParameter;
 vLight=.82+.18*abs(dot(normal,normalize(vec3(-.4,.6,1.))));
 vDepth=clamp(1.-(depth-3.8)*.18,.45,1.);
}`,oe=`
precision highp float;
uniform float uTime;
uniform vec3 uPlacement;
uniform vec4 uPoseA;
uniform vec2 uMotion;
varying vec3 vParameter;
varying float vLight;
varying float vDepth;
varying float vFacing;
const float TAU=6.28318530718;
float hash(float n){n=fract(n*.1031);n*=n+33.33;n*=n+n;return fract(n);}
float noise(float x){float i=floor(x),f=fract(x);return mix(hash(i),hash(i+1.),f*f*(3.-2.*f));}
float hash2(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float noise2(vec2 p){
 vec2 i=floor(p),f=fract(p);
 f=f*f*(3.-2.*f);
 return mix(mix(hash2(i),hash2(i+vec2(1.,0.)),f.x),mix(hash2(i+vec2(0.,1.)),hash2(i+vec2(1.,1.)),f.x),f.y);
}
void main(){
 float u=vParameter.x,v=vParameter.y,layer=vParameter.z,t=uTime;
 // Gathering: the faint light is slowly drawn toward a few places along the
 // curtain, crowding together there and thinning out between, then let go.
 float pull=smoothstep(.3,.78,noise(u*1.7+t*.085+layer*.2+3.))*.86;
 float phase=TAU*(u*2.6-t*.008+.35*sin(t*.021));
 float x=u+pull*sin(phase)/(TAU*2.6);
 float density=1.+pull*cos(phase);
 float gathered=density*density*.55;
 // Rays are broad, soft columns of differing width that lean a little.
 x+=v*.02*(noise(u*6.+layer*3.)-.5);
 // Each ray is a streak, not a ruled line: it swells and fades along its own
 // height. Where the curtain is seen so obliquely that rays would be squeezed
 // into thin stripes, they melt into the glow instead.
 #ifdef DERIVATIVES
 float squeeze=fwidth(x);
 #else
 float squeeze=.0007;
 #endif
 float broad=1.-smoothstep(.033,.083,12.*squeeze);
 float narrow=1.-smoothstep(.033,.083,27.*squeeze);
 float rays=mix(.5,noise2(vec2(x*12.+t*.05+layer*7.,v*1.5-t*.05)),broad)*.7
  +mix(.5,noise2(vec2(x*27.-t*.09+layer*3.,v*2.4+t*.04+5.)),narrow)*.3;
 float detail=1.-smoothstep(.033,.083,9.*squeeze);
 rays=smoothstep(.12,.92,rays)*mix(1.,.8+.4*noise(x*9.-t*.5),detail);
 float surge=noise(u*6.-t*.33+layer*.7)*.6+noise(u*2.3+t*.17)*.4;
 float activity=smoothstep(.45,.85,surge);
 float pockets=mix(.78,.55+.45*smoothstep(.17,.7,noise(u*9.-t*.1+layer*.4)),detail);
 // Gathered light stands taller; everywhere it fades out rather than ending.
 float reach=(.2+.3*noise(x*6.+layer*4.+t*.05)+.12*rays)*(.75+.3*density);
 float foot=smoothstep(0.,.13,v);
 float core=foot*exp(-v/reach)*(1.-smoothstep(.8,1.,v));
 float body=mix(1.,rays,.3+.5*smoothstep(0.,.3,v));
 // The veil: a tall, very faint wash that is always there.
 float veil=smoothstep(0.,.2,v)*exp(-v*1.15)*(1.-smoothstep(.82,1.,v))*(.6+.4*rays);
 float endFade=smoothstep(0.,.095,u)*(1.-smoothstep(.87,1.,u));
 // Emission by altitude, summed as light: oxygen green through the body, a
 // faint oxygen red high up, and nitrogen violet-pink under the border where
 // the display is most energetic.
 vec3 green=mix(vec3(.43,.96,.4),vec3(.24,.8,.33),smoothstep(.05,.4,v));
 green=mix(green,vec3(.15,.46,.27),smoothstep(.3,.8,v));
 float greenLight=veil*.085+core*body*.5*gathered;
 float redLight=exp(-pow((v-.74)/.3,2.))*(.012+.05*activity)*(.6+.4*rays);
 float violetLight=exp(-pow((v-.04)/.04,2.))*activity*density*.07;
 vec3 light=green*greenLight+vec3(.95,.13,.2)*redLight+vec3(.78,.3,.9)*violetLight;
 float energy=.8+.4*surge+abs(uMotion.x)*.35;
 float gain=pockets*energy*vLight*vDepth*endFade;
 // A strip of curtain seen obliquely is squeezed into fewer pixels, which would
 // pile its light into a bright line. Scaling by how squarely it faces us keeps
 // the brightness per pixel level, and it falls to nothing where a fold turns.
 float flat_=smoothstep(.8,1.5,abs(uPoseA.x));
 float facing=abs(vFacing);
 gain*=mix(facing*smoothstep(.04,.62,facing)*1.7,1.,flat_);
 gain*=(1.+flat_*2.4)*uPlacement.z;
 gl_FragColor=vec4(light*gain*1.2,1.);
}`,se=`attribute vec2 aPosition; varying highp vec2 vUv; void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`,ce=`
precision mediump float;
varying highp vec2 vUv;
uniform sampler2D uImage;
uniform vec2 uDirection;
void main(){
 vec3 color=texture2D(uImage,vUv).rgb*.227027;
 color+=texture2D(uImage,vUv+uDirection*1.384615).rgb*.316216;
 color+=texture2D(uImage,vUv-uDirection*1.384615).rgb*.316216;
 color+=texture2D(uImage,vUv+uDirection*3.230769).rgb*.070270;
 color+=texture2D(uImage,vUv-uDirection*3.230769).rgb*.070270;
 gl_FragColor=vec4(color,1.);
}`,le=`
precision highp float;
varying highp vec2 vUv;
uniform sampler2D uImage;
uniform sampler2D uBloom;
uniform sampler2D uHaze;
uniform vec2 uResolution;
uniform vec2 uSky;
float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float stars(vec2 sky,float density,float rarity,float size){
 vec2 grid=sky*density, cell=floor(grid);
 float h=hash(cell);
 vec2 place=vec2(hash(cell+7.3),hash(cell+13.1))*.6+.2;
 float twinkle=.72+.28*sin(uSky.x*(.8+h*2.6)+h*90.);
 return step(rarity,h)*exp(-length(fract(grid)-place)*size)*twinkle;
}
void main(){
 vec2 uv=vUv;
 vec3 light=texture2D(uImage,uv).rgb;
 vec3 glow=light+texture2D(uBloom,uv).rgb*.7+texture2D(uHaze,uv).rgb*.9;
 vec2 sky=uv*vec2(uResolution.x/uResolution.y,1.)-vec2(0.,uSky.y);
 float star=stars(sky,180.,.996,21.)+stars(sky+3.7,46.,.99,17.)*2.2;
 star*=1.-smoothstep(.03,.3,dot(glow,vec3(.3,.6,.1)));
 vec3 color=vec3(.006,.014,.021)+glow+star*vec3(.19,.28,.29);
 // Tone-map by brightness so strong light stays green rather than bleaching.
 float peak=max(color.r,max(color.g,color.b));
 vec3 kept=color*(1.-exp(-peak*1.55))/max(peak,.0001);
 color=mix(kept,1.-exp(-color*1.55),.5);
 color*=1.-smoothstep(.3,.9,length(uv-.5))*.4;
 color+=(hash(gl_FragCoord.xy)-.5)*.008;
 gl_FragColor=vec4(color,1.);
}`;function T({paused:e,reduced:t,diagnostics:n=!1}){let i=(0,r.useRef)(null),a=(0,r.useRef)(e),o=(0,r.useRef)(t),[s,c]=(0,r.useState)(0);(0,r.useRef)(null);let l=(0,r.useRef)(null);return(0,r.useEffect)(()=>{a.current=e,o.current=t,l.current?.()},[e,t]),(0,r.useEffect)(()=>{let e=i.current;if(!e)return;let t=e.getContext(`webgl`,{alpha:!1,antialias:!1,powerPreference:`default`});if(!t)return;let n=t.useProgram.bind(t),r=t.getExtension(`OES_texture_half_float`),u=!!(r&&t.getExtension(`OES_texture_half_float_linear`)&&(t.getExtension(`EXT_color_buffer_half_float`)||t.getExtension(`WEBGL_color_buffer_float`))),d=[],f=[],p=[],m=[],h=0,g=()=>{cancelAnimationFrame(h),d.forEach(e=>t.deleteProgram(e)),f.forEach(e=>t.deleteShader(e)),p.forEach(e=>t.deleteBuffer(e)),m.forEach(e=>{t.deleteTexture(e.texture),t.deleteFramebuffer(e.buffer)})},_=(e,n,r=!1)=>{let i=t.createProgram();if(!i)throw Error(`Cannot create aurora program`);d.push(i);for(let[r,a]of[[t.VERTEX_SHADER,e],[t.FRAGMENT_SHADER,n]]){let e=t.createShader(r);if(!e)throw Error(`Cannot create aurora shader`);if(f.push(e),t.shaderSource(e,a),t.compileShader(e),!t.getShaderParameter(e,t.COMPILE_STATUS))throw Error(t.getShaderInfoLog(e)||`Aurora shader compilation failed`);t.attachShader(i,e)}if(t.bindAttribLocation(i,0,r?`aParameter`:`aPosition`),t.linkProgram(i),!t.getProgramParameter(i,t.LINK_STATUS))throw Error(t.getProgramInfoLog(i)||`Aurora shader link failed`);return i},v=(e,n=!1)=>{let r=t.createBuffer();if(!r)throw Error(`Cannot create aurora buffer`);return p.push(r),t.bindBuffer(n?t.ELEMENT_ARRAY_BUFFER:t.ARRAY_BUFFER,r),t.bufferData(n?t.ELEMENT_ARRAY_BUFFER:t.ARRAY_BUFFER,e,t.STATIC_DRAW),r},y=()=>{let e=t.createTexture(),n=t.createFramebuffer();if(!e||!n)throw Error(`Cannot create aurora render target`);t.bindTexture(t.TEXTURE_2D,e),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.bindFramebuffer(t.FRAMEBUFFER,n),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,e,0);let r={texture:e,buffer:n};return m.push(r),r};try{let i=_(ae,(t.getExtension(`OES_standard_derivatives`)?`#extension GL_OES_standard_derivatives : enable
#define DERIVATIVES
`:``)+oe,!0),d=_(se,ce),f=_(se,le),p=ie(),ee=v(p.parameters),te=v(p.indices,!0),b=v(new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1])),x=y(),S=y(),C=y(),w=y(),T=(e,n)=>Object.fromEntries(n.map(n=>[n,t.getUniformLocation(e,n)])),E=T(i,[`uPoseA`,`uPoseB`,`uPlacement`,`uPointer`,`uMotion`,`uTime`,`uAspect`]),ue=T(d,[`uImage`,`uDirection`]),D=T(f,[`uImage`,`uBloom`,`uHaze`,`uResolution`,`uSky`]),O={hero:0,end:0,skyline:0},de=document.getElementById(`home`),k=document.querySelector(`.footer-call`),A=!0,j=0,M=7,N=window.scrollY,P=window.scrollY,F=window.scrollY,I=0,L=0,R=s===0&&window.scrollY<8&&!o.current?0:1,z=0,B=0,fe=0,pe=0,V=1,H=1,U=1,W=1,G=1,K=1,q=!1,J=1,Y=16.7,me=0,X=0,Z=()=>{A=!0,!h&&!document.hidden&&!q&&(j=0,h=requestAnimationFrame($))},he=()=>{let e=window.innerHeight,t=Math.max(0,document.documentElement.scrollHeight-e),n=k?k.getBoundingClientRect().top+window.scrollY-t:e*.5;O={hero:de?.offsetHeight||e*2.1,end:t,skyline:1-2*n/e},Z()},ge=()=>{let n=Math.min(window.devicePixelRatio,window.innerWidth<700?1.25:1.4)*J;V=Math.max(1,Math.round(window.innerWidth*n)),H=Math.max(1,Math.round(window.innerHeight*n)),U=Math.max(1,Math.round(V/4)),W=Math.max(1,Math.round(H/4)),G=Math.max(1,Math.round(V*.7)),K=Math.max(1,Math.round(H*.7)),e.width=V,e.height=H;let i=()=>m.every(e=>(t.bindTexture(t.TEXTURE_2D,e.texture),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,e===x?G:U,e===x?K:W,0,t.RGBA,u&&r?r.HALF_FLOAT_OES:t.UNSIGNED_BYTE,null),t.bindFramebuffer(t.FRAMEBUFFER,e.buffer),t.checkFramebufferStatus(t.FRAMEBUFFER)===t.FRAMEBUFFER_COMPLETE));if(!i()&&(!u||(u=!1,!i())))throw Error(`Incomplete aurora render target`);e.dataset.range=u?`high`:`standard`,he()},_e=()=>{P=window.scrollY,Z()},ve=e=>{e.pointerType===`mouse`&&!a.current&&(fe=e.clientX/window.innerWidth-.5,pe=e.clientY/window.innerHeight-.5,Z())},ye=()=>{j=0,A=!0,!document.hidden&&!h&&!q&&(h=requestAnimationFrame($))},be=t=>{t.preventDefault(),q=!0,cancelAnimationFrame(h),h=0,e.style.opacity=`0`,e.dataset.state=`context-lost`,e.parentElement?.classList.remove(`is-rendering`)},xe=()=>c(e=>e+1),Se=()=>{try{ge()}catch{q=!0,g(),e.style.opacity=`0`,e.parentElement?.classList.remove(`is-rendering`),e.dataset.state=`fallback`}},Ce=()=>{t.bindBuffer(t.ARRAY_BUFFER,b),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0)},Q=(e,n,r,i)=>{t.bindFramebuffer(t.FRAMEBUFFER,n.buffer),t.viewport(0,0,U,W),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,e.texture),t.uniform2f(ue.uDirection,r,i),t.drawArrays(t.TRIANGLES,0,6)},$=r=>{if(h=0,document.hidden||q)return;if(!a.current&&j&&r-j<15.5){h=requestAnimationFrame($);return}let s=j?r-j:16.7,c=Math.min(s/1e3,.05);j=r;let l=a.current;if(l&&!A)return;if(!l&&s<150&&(Y+=(s-Y)*.025,++me>=150)){if(Y>24&&J>.56&&(J=Math.max(.55,J*.8),Se(),q))return;me=0,e.dataset.frameMs=Y.toFixed(1),e.dataset.quality=J.toFixed(2)}l||(M+=c);let u=1-Math.exp(-c*9);N=l?P:N+(P-N)*u,z+=((l?0:fe)-z)*u,B+=((l?0:pe)-B)*u;let m={width:window.innerWidth,height:window.innerHeight};if(l)I=L=0,R=1;else{let e=(N-F)/Math.max(c,.001)/m.height,t=Math.max(-1,Math.min(1,e*.45));L+=((t-I)*70-L*10)*c,I+=L*c,R=Math.min(1,R+c/1.6)}F=N;let g=o.current?re(P,m,O):ne(N,m,O);t.bindFramebuffer(t.FRAMEBUFFER,x.buffer),t.viewport(0,0,G,K),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT),n(i),t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE),t.disable(t.DEPTH_TEST),t.disable(t.CULL_FACE),t.bindBuffer(t.ARRAY_BUFFER,ee),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,3,t.FLOAT,!1,0,0),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,te),t.uniform4f(E.uPoseA,g.pitch,g.yaw,g.roll,g.spread),t.uniform4f(E.uPoseB,g.height,g.thickness,g.scale,g.fold),t.uniform3f(E.uPlacement,g.x,g.y,g.opacity),t.uniform2f(E.uPointer,z,B),t.uniform2f(E.uMotion,I,Math.max(.03,1-(1-R)**3)),t.uniform1f(E.uTime,M),t.uniform1f(E.uAspect,V/H),t.drawElements(t.TRIANGLES,p.indices.length,t.UNSIGNED_SHORT,0),t.disable(t.BLEND),Ce(),n(d),t.uniform1i(ue.uImage,0),Q(x,S,2/U,0),Q(S,C,0,2/W),Q(C,S,3.5/U,0),Q(S,w,0,3.5/W),Q(w,S,7/U,0),Q(S,w,0,7/W),t.bindFramebuffer(t.FRAMEBUFFER,null),t.viewport(0,0,V,H),n(f),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,x.texture),t.uniform1i(D.uImage,0),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,C.texture),t.uniform1i(D.uBloom,1),t.activeTexture(t.TEXTURE2),t.bindTexture(t.TEXTURE_2D,w.texture),t.uniform1i(D.uHaze,2),t.uniform2f(D.uResolution,V,H),t.uniform2f(D.uSky,M,N/m.height*.04),t.drawArrays(t.TRIANGLES,0,6),e.style.opacity=`1`,e.parentElement?.classList.add(`is-rendering`),A=!1,X++;let _=Math.abs(P-N)<.25;(X===1||X%30==0||l)&&(e.dataset.state=`ready`,e.dataset.renderCount=String(X),e.dataset.light=g.opacity.toFixed(3)),!h&&!l&&(g.opacity>0||!_||Math.abs(I)>.002)&&(h=requestAnimationFrame($))};ge();let we=new ResizeObserver(he);return document.querySelector(`main`)&&we.observe(document.querySelector(`main`)),l.current=Z,window.addEventListener(`resize`,Se),window.addEventListener(`scroll`,_e,{passive:!0}),window.addEventListener(`pointermove`,ve,{passive:!0}),document.addEventListener(`visibilitychange`,ye),e.addEventListener(`webglcontextlost`,be),e.addEventListener(`webglcontextrestored`,xe),Z(),()=>{l.current=null,we.disconnect(),window.removeEventListener(`resize`,Se),window.removeEventListener(`scroll`,_e),window.removeEventListener(`pointermove`,ve),document.removeEventListener(`visibilitychange`,ye),e.removeEventListener(`webglcontextlost`,be),e.removeEventListener(`webglcontextrestored`,xe),g()}}catch(t){console.warn(`Aurora is using its static fallback.`,t),e.style.opacity=`0`,e.parentElement?.classList.remove(`is-rendering`),g()}},[s]),(0,w.jsxs)(w.Fragment,{children:[(0,w.jsxs)(`div`,{className:`aurora-background`,"aria-hidden":`true`,children:[(0,w.jsxs)(`svg`,{className:`aurora-fallback`,viewBox:`0 0 1440 900`,preserveAspectRatio:`xMidYMid slice`,children:[(0,w.jsxs)(`defs`,{children:[(0,w.jsxs)(`linearGradient`,{id:`veil`,x1:`0`,y1:`1`,x2:`.3`,y2:`0`,children:[(0,w.jsx)(`stop`,{stopColor:`#92efad`,stopOpacity:`.8`}),(0,w.jsx)(`stop`,{offset:`.35`,stopColor:`#229d83`,stopOpacity:`.32`}),(0,w.jsx)(`stop`,{offset:`1`,stopColor:`#9675c8`,stopOpacity:`0`})]}),(0,w.jsx)(`filter`,{id:`haze`,children:(0,w.jsx)(`feGaussianBlur`,{stdDeviation:`18`})})]}),(0,w.jsxs)(`g`,{transform:`translate(-325 0)`,children:[(0,w.jsx)(`path`,{d:`M700 670C850 610 880 710 1030 600S1150 620 1390 440L1370 70C1150 190 1080 130 940 200S850 120 700 190Z`,fill:`url(#veil)`,filter:`url(#haze)`}),(0,w.jsx)(`path`,{d:`M700 670C850 610 880 710 1030 600S1150 620 1390 440`,stroke:`#b9edc0`,strokeWidth:`2`,fill:`none`,opacity:`.35`})]})]}),(0,w.jsx)(`canvas`,{ref:i,"data-state":`initializing`})]}),!1]})}var E=`28 16 252 162`,ue=[`M268 122.5C215 107 162 72 124 36C112 24 96 24 83 34L70 39.5L81 43C88 45 89 52 88 63C86 92 114 111 162 111.5L202 111.5C206 111.5 206 114 202 116.5C180 128 160 139 162 151C164 161 184 166 208 169.5C209 169.7 209 168.5 208 168.2C186 164 167 159 165.5 150.5C164 140.5 184 129.5 205 118C211 114.5 210 108.5 202 108.5L162 108.5C117 108 90 90 91.5 63C92.5 50 90 42.5 81 40L77 38.8L85 36C96 27.5 110 27.5 121.5 38.5C159 74.5 213 109.5 268 123.5Z`,`M164 109.5C145 110.5 75 114.5 42 116C39 116.2 39 117.5 42 119C62 128.5 96 133 98.5 148C100 156 94 163 88 168.5C87.2 169.2 88.2 170 89.2 169.3C96.5 163.5 103.5 156 102 147C99 130.5 65 126 45 116.8L126 114.5C143 113.6 153 111.5 164 111.5Z`],D=e=>e?{role:`img`,"aria-label":e}:{"aria-hidden":!0};function O({className:e=``,title:t}){return(0,w.jsx)(`span`,{className:`anvil-bird-mark ${e}`.trim(),children:(0,w.jsx)(`svg`,{viewBox:E,width:`252`,height:`162`,...D(t),children:(0,w.jsx)(`g`,{className:`anvil-bird-lines`,fill:`currentColor`,children:ue.map(e=>(0,w.jsx)(`path`,{d:e},e))})})})}function de({current:e}){let t=e===`home`,n=e=>t?`#${e}`:`/#${e}`;return(0,w.jsxs)(`header`,{className:`site-header`,children:[(0,w.jsx)(`a`,{className:`brand`,href:t?`#home`:`/`,"aria-label":`Alberto Ferreira de Melo Filho, home`,children:(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(O,{}),(0,w.jsxs)(`span`,{children:[`Alberto`,(0,w.jsx)(`span`,{className:`brand-sub`,children:`Ferreira de Melo Filho`})]})]})}),(0,w.jsxs)(`nav`,{"aria-label":`Main navigation`,children:[(0,w.jsx)(`a`,{href:n(`about`),children:`About`}),(0,w.jsx)(`a`,{href:n(`explorations`),children:`Experiments`}),(0,w.jsx)(`a`,{href:`/games`,"aria-current":e===`games`?`page`:void 0,children:`Games`}),(0,w.jsxs)(`a`,{className:`nav-contact`,href:n(`footer`),children:[`Say hello `,(0,w.jsx)(`span`,{"aria-hidden":`true`,children:`↗`})]})]})]})}var k=`https://github.com/albertoferreirademelo`,A=e=>{let t=window.matchMedia(`(prefers-reduced-motion: reduce)`);return t.addEventListener(`change`,e),()=>t.removeEventListener(`change`,e)},j=()=>window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,M=()=>!1,N=()=>()=>{},P=()=>!1;function F(){let[e,t]=(0,r.useState)(!1);return(0,w.jsxs)(`div`,{className:`light-experiment ${e?`beam-broken`:``}`,children:[(0,w.jsxs)(`div`,{className:`experiment-top`,children:[(0,w.jsx)(`span`,{children:`LIGHT → SIGNAL → SOUND`}),(0,w.jsx)(`span`,{className:`experiment-status`,"aria-live":`polite`,children:e?`Signal received`:`Beam connected`})]}),(0,w.jsxs)(`div`,{className:`beam-scene`,"aria-hidden":`true`,children:[(0,w.jsx)(`span`,{className:`emitter`}),(0,w.jsx)(`span`,{className:`laser-beam`}),(0,w.jsx)(`span`,{className:`beam-object`}),(0,w.jsx)(`span`,{className:`receiver`}),(0,w.jsx)(`div`,{className:`signal-bars`,children:[11,28,44,22,52,35,16,40,25].map((e,t)=>(0,w.jsx)(`i`,{style:{height:e}},t))})]}),(0,w.jsxs)(`button`,{className:`beam-button`,type:`button`,"aria-pressed":e,onClick:()=>t(!e),children:[e?`Reconnect the beam`:`Break the beam`,` `,(0,w.jsx)(`span`,{"aria-hidden":`true`,children:e?`↺`:`↗`})]}),(0,w.jsx)(`p`,{className:`experiment-caption`,children:`A small, silent illustration of the original experiment.`})]})}function I(){let[e,t]=(0,r.useState)(!1),n=(0,r.useSyncExternalStore)(A,j,M),[i,o]=(0,r.useState)(!1),s=n||i,c=(0,r.useSyncExternalStore)(N,P,M),l=(0,r.useRef)(null),u=(0,r.useRef)(null),d=(0,r.useRef)(null);return(0,r.useEffect)(()=>{document.documentElement.dataset.reducedMotion=String(s)},[s]),(0,r.useEffect)(()=>{let e=()=>{let e=window.innerHeight;if(l.current&&(l.current.style.transform=`scaleX(${window.scrollY/Math.max(1,document.documentElement.scrollHeight-e)})`),!u.current||!d.current)return;let t=window.scrollY/Math.max(1,u.current.offsetHeight-e),n=a((t-.74)/.22),r=d.current.style;r.setProperty(`--name-fade`,String(1-a(t/.3))),r.setProperty(`--name-drift`,`${a(t/.4)*80}px`),r.setProperty(`--invite-fade`,String(1-a(t/.1))),r.setProperty(`--statement-fade`,String(n)),r.setProperty(`--statement-rise`,`${(1-n)*26}px`)};return window.addEventListener(`scroll`,e,{passive:!0}),window.addEventListener(`resize`,e),e(),()=>{window.removeEventListener(`scroll`,e),window.removeEventListener(`resize`,e)}},[]),(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(`a`,{href:`#about`,className:`skip-link`,children:`Skip to introduction`}),(0,w.jsx)(T,{paused:e||s,reduced:s,diagnostics:c}),(0,w.jsx)(`div`,{className:`reading-progress`,ref:l}),(0,w.jsx)(de,{current:`home`}),(0,w.jsxs)(`main`,{children:[(0,w.jsx)(`section`,{className:`hero-scroll`,id:`home`,"aria-labelledby":`hero-title`,ref:u,children:(0,w.jsxs)(`div`,{className:`hero-stage`,ref:d,children:[(0,w.jsxs)(`h1`,{id:`hero-title`,className:`hero-name`,children:[(0,w.jsx)(`span`,{children:`Alberto`}),` `,(0,w.jsx)(`span`,{children:`Ferreira de Melo`})]}),(0,w.jsxs)(`p`,{className:`hero-statement`,children:[`It starts with `,(0,w.jsx)(`em`,{children:`a question.`})]}),(0,w.jsxs)(`span`,{className:`scroll-invite`,"aria-hidden":`true`,children:[`Scroll`,(0,w.jsx)(`span`,{className:`scroll-line`})]})]})}),(0,w.jsxs)(`section`,{className:`intro section-shell`,id:`about`,"aria-label":`About`,children:[(0,w.jsxs)(`p`,{className:`lede`,children:[`I like finding out how things work. The surest way I know is to build, test, learn, `,(0,w.jsx)(`em`,{children:`and build again.`})]}),(0,w.jsx)(`p`,{className:`intro-body`,children:`I’m Alberto. My path runs through bioinformatics, economics, and machine learning; these days it brings together data, design, and public service. The subjects keep changing. The habit stays.`})]}),(0,w.jsxs)(`section`,{className:`explorations section-shell`,id:`explorations`,"aria-labelledby":`explorations-title`,children:[(0,w.jsxs)(`div`,{className:`section-label`,children:[(0,w.jsx)(`span`,{children:`FROM THE WORKBENCH`}),(0,w.jsxs)(`a`,{href:k,target:`_blank`,rel:`noopener noreferrer`,children:[`The full archive `,(0,w.jsx)(`span`,{"aria-hidden":`true`,children:`↗`})]})]}),(0,w.jsxs)(`div`,{className:`work-heading`,children:[(0,w.jsxs)(`h2`,{id:`explorations-title`,children:[`A question.`,(0,w.jsx)(`br`,{}),`Then, `,(0,w.jsx)(`em`,{children:`an experiment.`})]}),(0,w.jsxs)(`p`,{children:[`Two early experiments.`,(0,w.jsx)(`br`,{}),`Each began as a what-if.`]})]}),(0,w.jsxs)(`div`,{className:`projects-grid`,children:[(0,w.jsxs)(`article`,{className:`project project-light`,children:[(0,w.jsx)(F,{}),(0,w.jsxs)(`div`,{className:`project-meta`,children:[(0,w.jsx)(`span`,{children:`01 / PHYSICAL COMPUTING`}),(0,w.jsx)(`span`,{children:`ARDUINO + PYTHON`})]}),(0,w.jsxs)(`h3`,{children:[`What if light`,(0,w.jsx)(`br`,{}),(0,w.jsx)(`em`,{children:`could start a song?`})]}),(0,w.jsx)(`p`,{children:`A laser, a light sensor, and a connection between Arduino and Python. Walk through the beam, and the computer starts playing music. A university experiment that brought code into the room.`}),(0,w.jsxs)(`details`,{className:`circuit-details`,children:[(0,w.jsxs)(`summary`,{children:[`Inside the circuit `,(0,w.jsx)(`span`,{"aria-hidden":`true`,children:`+`})]}),(0,w.jsxs)(`figure`,{children:[(0,w.jsx)(`img`,{src:`/assets/arduino.png`,alt:`Original breadboard layout showing the Arduino Uno, light sensor, LEDs, resistors, and connecting wires`,width:`1094`,height:`725`,loading:`lazy`}),(0,w.jsx)(`figcaption`,{children:`The original project’s breadboard layout.`})]})]}),(0,w.jsxs)(`a`,{className:`text-link`,href:`${k}/12-Playing-arduino-with-Python`,target:`_blank`,rel:`noopener noreferrer`,children:[`Explore the experiment `,(0,w.jsx)(`span`,{"aria-hidden":`true`,children:`↗`})]})]}),(0,w.jsxs)(`article`,{className:`project project-data`,children:[(0,w.jsxs)(`div`,{className:`research-sheet`,children:[(0,w.jsxs)(`div`,{className:`sheet-top`,children:[(0,w.jsx)(`span`,{children:`RESEARCH NOTE / 02`}),(0,w.jsx)(`span`,{children:`OMXS30`})]}),(0,w.jsxs)(`p`,{className:`sheet-question`,children:[`Learning the pattern.`,(0,w.jsx)(`br`,{}),(0,w.jsx)(`em`,{children:`Questioning the prediction.`})]}),(0,w.jsxs)(`figure`,{children:[(0,w.jsx)(`img`,{src:`/assets/market-study.png`,alt:`Archived OMX Stockholm 30 adjusted closing-price chart from the thesis repository`,width:`1000`,height:`400`,loading:`lazy`}),(0,w.jsx)(`figcaption`,{children:`Source material from the thesis archive`})]}),(0,w.jsxs)(`div`,{className:`sheet-bottom`,children:[(0,w.jsx)(`span`,{children:`LSTM / TIME SERIES`}),(0,w.jsx)(`span`,{children:`↗`})]})]}),(0,w.jsxs)(`div`,{className:`project-meta`,children:[(0,w.jsx)(`span`,{children:`02 / MACHINE LEARNING`}),(0,w.jsx)(`span`,{children:`BACHELOR’S THESIS`})]}),(0,w.jsxs)(`h3`,{children:[`Can a model`,(0,w.jsx)(`br`,{}),(0,w.jsx)(`em`,{children:`read the market?`})]}),(0,w.jsx)(`p`,{children:`A study of the Swedish stock market using neural networks. The useful lesson lives beyond the prediction: preparing the data, testing assumptions, and recognising when a model may be overfitting.`}),(0,w.jsxs)(`a`,{className:`text-link`,href:`${k}/19-DNN-LSTM-SwedishStockMarket`,target:`_blank`,rel:`noopener noreferrer`,children:[`Read the study & its limitations`,` `,(0,w.jsx)(`span`,{"aria-hidden":`true`,children:`↗`})]})]})]}),(0,w.jsxs)(`div`,{className:`offscreen`,children:[(0,w.jsx)(`span`,{className:`eyebrow`,children:`ALSO, OFF SCREEN`}),(0,w.jsxs)(`p`,{children:[`A camera. A 3D print.`,(0,w.jsx)(`br`,{}),(0,w.jsx)(`em`,{children:`One more coffee.`})]}),(0,w.jsx)(`span`,{className:`offscreen-symbol`,"aria-hidden":`true`,children:`✳`})]})]}),(0,w.jsxs)(`footer`,{id:`footer`,className:`site-footer section-shell`,children:[(0,w.jsxs)(`div`,{className:`footer-call`,children:[(0,w.jsx)(`p`,{className:`eyebrow`,children:`THE NEXT THREAD STARTS WITH A CONVERSATION`}),(0,w.jsxs)(`h2`,{children:[`Something on`,(0,w.jsx)(`br`,{}),(0,w.jsx)(`em`,{children:`your mind?`})]}),(0,w.jsxs)(`div`,{className:`footer-links`,children:[(0,w.jsxs)(`a`,{className:`text-link`,href:`https://www.linkedin.com/in/albertomelo/`,target:`_blank`,rel:`noopener noreferrer`,children:[`Say hello on LinkedIn `,(0,w.jsx)(`span`,{"aria-hidden":`true`,children:`↗`})]}),(0,w.jsx)(`a`,{className:`footer-github`,href:k,target:`_blank`,rel:`noopener noreferrer`,children:`Find me on GitHub ↗`})]})]}),(0,w.jsxs)(`div`,{className:`footer-bottom`,children:[(0,w.jsx)(`span`,{children:`© 2026 Alberto Ferreira de Melo Filho`}),(0,w.jsx)(`a`,{href:`#home`,children:`Back to the light ↑`})]})]})]}),(0,w.jsxs)(`button`,{className:`motion-control`,type:`button`,onClick:()=>t(!e),"aria-label":s?`Motion reduced by your system preference`:e?`Play aurora animation`:`Pause aurora animation`,"aria-pressed":e||s,disabled:s,children:[(0,w.jsx)(`span`,{"aria-hidden":`true`,children:e||s?`▷`:`Ⅱ`}),(0,w.jsx)(`span`,{children:s?`Reduced motion`:e?`Motion paused`:`Aurora in motion`})]}),!1]})}export{I as default};