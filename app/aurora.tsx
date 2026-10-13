'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createRibbonMesh,
  restPose,
  samplePose,
  type Landmarks,
} from './aurora-scene';

const ribbonVertex = `
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
}`;

const ribbonFragment = `
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
}`;

const screenVertex = `attribute vec2 aPosition; varying highp vec2 vUv; void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;
const blurFragment = `
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
}`;
const compositeFragment = `
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
}`;

type RenderTarget = { texture: WebGLTexture; buffer: WebGLFramebuffer };

export default function Aurora({
  paused,
  reduced,
  diagnostics = false,
}: {
  paused: boolean;
  reduced: boolean;
  diagnostics?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pauseRef = useRef(paused);
  const reducedRef = useRef(reduced);
  const [generation, setGeneration] = useState(0);
  const testContext = useRef<WEBGL_lose_context | null>(null);
  const invalidate = useRef<(() => void) | null>(null);
  useEffect(() => {
    pauseRef.current = paused;
    reducedRef.current = reduced;
    invalidate.current?.();
  }, [paused, reduced]);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const gl = el.getContext('webgl', {
      alpha: false,
      antialias: false,
      powerPreference: 'default',
    });
    if (!gl) return;
    const bindProgram = gl.useProgram.bind(gl);
    // Half-float targets let overlapping light add up past 1 without clipping
    // a channel, which would shift bright green toward yellow.
    const halfFloat = gl.getExtension('OES_texture_half_float');
    let hdr = Boolean(
      halfFloat &&
      gl.getExtension('OES_texture_half_float_linear') &&
      (gl.getExtension('EXT_color_buffer_half_float') ||
        gl.getExtension('WEBGL_color_buffer_float')),
    );
    const programs: WebGLProgram[] = [],
      shaders: WebGLShader[] = [],
      buffers: WebGLBuffer[] = [],
      targets: RenderTarget[] = [];
    let frame = 0;
    const dispose = () => {
      cancelAnimationFrame(frame);
      programs.forEach((p) => gl.deleteProgram(p));
      shaders.forEach((s) => gl.deleteShader(s));
      buffers.forEach((b) => gl.deleteBuffer(b));
      targets.forEach((t) => {
        gl.deleteTexture(t.texture);
        gl.deleteFramebuffer(t.buffer);
      });
    };
    const makeProgram = (vs: string, fs: string, scene = false) => {
      const program = gl.createProgram();
      if (!program) throw new Error('Cannot create aurora program');
      programs.push(program);
      for (const [type, source] of [
        [gl.VERTEX_SHADER, vs],
        [gl.FRAGMENT_SHADER, fs],
      ] as const) {
        const shader = gl.createShader(type);
        if (!shader) throw new Error('Cannot create aurora shader');
        shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
          throw new Error(
            gl.getShaderInfoLog(shader) || 'Aurora shader compilation failed',
          );
        gl.attachShader(program, shader);
      }
      gl.bindAttribLocation(program, 0, scene ? 'aParameter' : 'aPosition');
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error(
          gl.getProgramInfoLog(program) || 'Aurora shader link failed',
        );
      return program;
    };
    const makeBuffer = (data: Float32Array | Uint16Array, element = false) => {
      const buffer = gl.createBuffer();
      if (!buffer) throw new Error('Cannot create aurora buffer');
      buffers.push(buffer);
      gl.bindBuffer(
        element ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER,
        buffer,
      );
      gl.bufferData(
        element ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER,
        data,
        gl.STATIC_DRAW,
      );
      return buffer;
    };
    const makeTarget = () => {
      const texture = gl.createTexture(),
        buffer = gl.createFramebuffer();
      if (!texture || !buffer)
        throw new Error('Cannot create aurora render target');
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0,
      );
      const target = { texture, buffer };
      targets.push(target);
      return target;
    };

    try {
      const derivatives = gl.getExtension('OES_standard_derivatives')
        ? '#extension GL_OES_standard_derivatives : enable\n#define DERIVATIVES\n'
        : '';
      const scene = makeProgram(
          ribbonVertex,
          derivatives + ribbonFragment,
          true,
        ),
        blur = makeProgram(screenVertex, blurFragment),
        composite = makeProgram(screenVertex, compositeFragment);
      const mesh = createRibbonMesh();
      const params = makeBuffer(mesh.parameters),
        indices = makeBuffer(mesh.indices, true);
      const quad = makeBuffer(
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      );
      const sceneTarget = makeTarget(),
        bloomA = makeTarget(),
        bloomB = makeTarget(),
        haze = makeTarget();
      const locations = (program: WebGLProgram, names: string[]) =>
        Object.fromEntries(
          names.map((name) => [name, gl.getUniformLocation(program, name)]),
        );
      const sceneU = locations(scene, [
        'uPoseA',
        'uPoseB',
        'uPlacement',
        'uPointer',
        'uMotion',
        'uTime',
        'uAspect',
      ]);
      const blurU = locations(blur, ['uImage', 'uDirection']);
      const compositeU = locations(composite, [
        'uImage',
        'uBloom',
        'uHaze',
        'uResolution',
        'uSky',
      ]);
      let landmarks: Landmarks = { hero: 0, end: 0, skyline: 0 };
      const hero = document.getElementById('home');
      const call = document.querySelector<HTMLElement>('.footer-call');
      let dirty = true,
        last = 0,
        elapsed = 7,
        smoothScroll = window.scrollY,
        scrollTarget = window.scrollY,
        previousScroll = window.scrollY;
      // sway: a spring pulled by scroll speed. reveal: the opening unfurl,
      // played once on a fresh load at the top of the page.
      let sway = 0,
        swayVelocity = 0,
        reveal =
          generation === 0 && window.scrollY < 8 && !reducedRef.current ? 0 : 1;
      let pointerX = 0,
        pointerY = 0,
        targetX = 0,
        targetY = 0;
      let width = 1,
        height = 1,
        bloomWidth = 1,
        bloomHeight = 1,
        sceneWidth = 1,
        sceneHeight = 1;
      let contextLost = false;
      let quality = 1,
        averageFrame = 16.7,
        sampleCount = 0,
        renderCount = 0;
      const wake = () => {
        dirty = true;
        if (!frame && !document.hidden && !contextLost) {
          last = 0;
          frame = requestAnimationFrame(render);
        }
      };
      const measure = () => {
        const viewport = window.innerHeight,
          end = Math.max(0, document.documentElement.scrollHeight - viewport);
        // Where the footer's call to action starts once the page is fully
        // scrolled, as a clip-space y for the closing curtain to rest on.
        const callTop = call
          ? call.getBoundingClientRect().top + window.scrollY - end
          : viewport * 0.5;
        landmarks = {
          hero: hero?.offsetHeight || viewport * 2.1,
          end,
          skyline: 1 - (2 * callTop) / viewport,
        };
        wake();
      };
      const resize = () => {
        const ratio =
          Math.min(
            window.devicePixelRatio,
            window.innerWidth < 700 ? 1.25 : 1.4,
          ) * quality;
        width = Math.max(1, Math.round(window.innerWidth * ratio));
        height = Math.max(1, Math.round(window.innerHeight * ratio));
        bloomWidth = Math.max(1, Math.round(width / 4));
        bloomHeight = Math.max(1, Math.round(height / 4));
        // Aurora is soft light: drawing it below screen resolution and letting
        // it be smoothed on the way up reads as a long exposure, and costs less.
        sceneWidth = Math.max(1, Math.round(width * 0.7));
        sceneHeight = Math.max(1, Math.round(height * 0.7));
        el.width = width;
        el.height = height;
        const allocate = () =>
          targets.every((target) => {
            gl.bindTexture(gl.TEXTURE_2D, target.texture);
            gl.texImage2D(
              gl.TEXTURE_2D,
              0,
              gl.RGBA,
              target === sceneTarget ? sceneWidth : bloomWidth,
              target === sceneTarget ? sceneHeight : bloomHeight,
              0,
              gl.RGBA,
              hdr && halfFloat ? halfFloat.HALF_FLOAT_OES : gl.UNSIGNED_BYTE,
              null,
            );
            gl.bindFramebuffer(gl.FRAMEBUFFER, target.buffer);
            return (
              gl.checkFramebufferStatus(gl.FRAMEBUFFER) ===
              gl.FRAMEBUFFER_COMPLETE
            );
          });
        if (!allocate()) {
          // Some devices advertise half-float but cannot render to it.
          if (!hdr) throw new Error('Incomplete aurora render target');
          hdr = false;
          if (!allocate()) throw new Error('Incomplete aurora render target');
        }
        el.dataset.range = hdr ? 'high' : 'standard';
        measure();
      };
      const onScroll = () => {
        scrollTarget = window.scrollY;
        wake();
      };
      const onPointer = (event: PointerEvent) => {
        if (event.pointerType === 'mouse' && !pauseRef.current) {
          targetX = event.clientX / window.innerWidth - 0.5;
          targetY = event.clientY / window.innerHeight - 0.5;
          wake();
        }
      };
      const onVisibility = () => {
        last = 0;
        dirty = true;
        if (!document.hidden && !frame && !contextLost)
          frame = requestAnimationFrame(render);
      };
      const onContextLost = (event: Event) => {
        event.preventDefault();
        contextLost = true;
        cancelAnimationFrame(frame);
        frame = 0;
        el.style.opacity = '0';
        el.dataset.state = 'context-lost';
        el.parentElement?.classList.remove('is-rendering');
      };
      const onContextRestored = () => setGeneration((value) => value + 1);
      const safeResize = () => {
        try {
          resize();
        } catch {
          contextLost = true;
          dispose();
          el.style.opacity = '0';
          el.parentElement?.classList.remove('is-rendering');
          el.dataset.state = 'fallback';
        }
      };
      const bindQuad = () => {
        gl.bindBuffer(gl.ARRAY_BUFFER, quad);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      };
      const blurPass = (
        source: RenderTarget,
        destination: RenderTarget,
        x: number,
        y: number,
      ) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, destination.buffer);
        gl.viewport(0, 0, bloomWidth, bloomHeight);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, source.texture);
        gl.uniform2f(blurU.uDirection, x, y);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      };
      const render = (now: number) => {
        frame = 0;
        if (document.hidden || contextLost) return;
        if (!pauseRef.current && last && now - last < 15.5) {
          frame = requestAnimationFrame(render);
          return;
        }
        const interval = last ? now - last : 16.7;
        const dt = Math.min(interval / 1000, 0.05);
        last = now;
        const still = pauseRef.current;
        if (still && !dirty) return;
        if (!still && interval < 150) {
          averageFrame += (interval - averageFrame) * 0.025;
          if (++sampleCount >= 150) {
            if (averageFrame > 24 && quality > 0.56) {
              quality = Math.max(0.55, quality * 0.8);
              safeResize();
              if (contextLost) return;
            }
            sampleCount = 0;
            el.dataset.frameMs = averageFrame.toFixed(1);
            el.dataset.quality = quality.toFixed(2);
          }
        }
        if (!still) elapsed += dt;
        const damping = 1 - Math.exp(-dt * 9);
        smoothScroll = still
          ? scrollTarget
          : smoothScroll + (scrollTarget - smoothScroll) * damping;
        pointerX += ((still ? 0 : targetX) - pointerX) * damping;
        pointerY += ((still ? 0 : targetY) - pointerY) * damping;
        const view = { width: window.innerWidth, height: window.innerHeight };
        if (still) {
          sway = swayVelocity = 0;
          reveal = 1;
        } else {
          const speed =
            (smoothScroll - previousScroll) / Math.max(dt, 0.001) / view.height;
          const pull = Math.max(-1, Math.min(1, speed * 0.45));
          swayVelocity += ((pull - sway) * 70 - swayVelocity * 10) * dt;
          sway += swayVelocity * dt;
          reveal = Math.min(1, reveal + dt / 1.6);
        }
        previousScroll = smoothScroll;
        const pose = reducedRef.current
          ? restPose(scrollTarget, view, landmarks)
          : samplePose(smoothScroll, view, landmarks);
        gl.bindFramebuffer(gl.FRAMEBUFFER, sceneTarget.buffer);
        gl.viewport(0, 0, sceneWidth, sceneHeight);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        bindProgram(scene);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.bindBuffer(gl.ARRAY_BUFFER, params);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
        gl.uniform4f(
          sceneU.uPoseA,
          pose.pitch,
          pose.yaw,
          pose.roll,
          pose.spread,
        );
        gl.uniform4f(
          sceneU.uPoseB,
          pose.height,
          pose.thickness,
          pose.scale,
          pose.fold,
        );
        gl.uniform3f(sceneU.uPlacement, pose.x, pose.y, pose.opacity);
        gl.uniform2f(sceneU.uPointer, pointerX, pointerY);
        gl.uniform2f(
          sceneU.uMotion,
          sway,
          Math.max(0.03, 1 - (1 - reveal) ** 3),
        );
        gl.uniform1f(sceneU.uTime, elapsed);
        gl.uniform1f(sceneU.uAspect, width / height);
        gl.drawElements(
          gl.TRIANGLES,
          mesh.indices.length,
          gl.UNSIGNED_SHORT,
          0,
        );
        gl.disable(gl.BLEND);
        bindQuad();
        bindProgram(blur);
        gl.uniform1i(blurU.uImage, 0);
        blurPass(sceneTarget, bloomA, 2 / bloomWidth, 0);
        blurPass(bloomA, bloomB, 0, 2 / bloomHeight);
        // A second, much wider blur of the bloom gives the light its atmosphere.
        blurPass(bloomB, bloomA, 3.5 / bloomWidth, 0);
        blurPass(bloomA, haze, 0, 3.5 / bloomHeight);
        blurPass(haze, bloomA, 7 / bloomWidth, 0);
        blurPass(bloomA, haze, 0, 7 / bloomHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, width, height);
        bindProgram(composite);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sceneTarget.texture);
        gl.uniform1i(compositeU.uImage, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, bloomB.texture);
        gl.uniform1i(compositeU.uBloom, 1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, haze.texture);
        gl.uniform1i(compositeU.uHaze, 2);
        gl.uniform2f(compositeU.uResolution, width, height);
        gl.uniform2f(
          compositeU.uSky,
          elapsed,
          (smoothScroll / view.height) * 0.04,
        );
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        el.style.opacity = '1';
        el.parentElement?.classList.add('is-rendering');
        dirty = false;
        renderCount++;
        const settled = Math.abs(scrollTarget - smoothScroll) < 0.25;
        if (renderCount === 1 || renderCount % 30 === 0 || still) {
          el.dataset.state = 'ready';
          el.dataset.renderCount = String(renderCount);
          el.dataset.light = pose.opacity.toFixed(3);
        }
        // Between the opening and the finale there is no light to animate.
        if (
          !frame &&
          !still &&
          (pose.opacity > 0 || !settled || Math.abs(sway) > 0.002)
        )
          frame = requestAnimationFrame(render);
      };
      resize();
      const observer = new ResizeObserver(measure);
      if (document.querySelector('main'))
        observer.observe(document.querySelector('main')!);
      invalidate.current = wake;
      window.addEventListener('resize', safeResize);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('pointermove', onPointer, { passive: true });
      document.addEventListener('visibilitychange', onVisibility);
      el.addEventListener('webglcontextlost', onContextLost);
      el.addEventListener('webglcontextrestored', onContextRestored);
      wake();
      return () => {
        invalidate.current = null;
        observer.disconnect();
        window.removeEventListener('resize', safeResize);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('pointermove', onPointer);
        document.removeEventListener('visibilitychange', onVisibility);
        el.removeEventListener('webglcontextlost', onContextLost);
        el.removeEventListener('webglcontextrestored', onContextRestored);
        dispose();
      };
    } catch (error) {
      console.warn('Aurora is using its static fallback.', error);
      el.style.opacity = '0';
      el.parentElement?.classList.remove('is-rendering');
      dispose();
    }
  }, [generation]);
  return (
    <>
      <div className="aurora-background" aria-hidden="true">
        <svg
          className="aurora-fallback"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="veil" x1="0" y1="1" x2=".3" y2="0">
              <stop stopColor="#92efad" stopOpacity=".8" />
              <stop offset=".35" stopColor="#229d83" stopOpacity=".32" />
              <stop offset="1" stopColor="#9675c8" stopOpacity="0" />
            </linearGradient>
            <filter id="haze">
              <feGaussianBlur stdDeviation="18" />
            </filter>
          </defs>
          <g transform="translate(-325 0)">
            <path
              d="M700 670C850 610 880 710 1030 600S1150 620 1390 440L1370 70C1150 190 1080 130 940 200S850 120 700 190Z"
              fill="url(#veil)"
              filter="url(#haze)"
            />
            <path
              d="M700 670C850 610 880 710 1030 600S1150 620 1390 440"
              stroke="#b9edc0"
              strokeWidth="2"
              fill="none"
              opacity=".35"
            />
          </g>
        </svg>
        <canvas ref={canvas} data-state="initializing" />
      </div>
      {process.env.NODE_ENV === 'development' && diagnostics && (
        <aside className="qa-tools" aria-label="Development graphics checks">
          <button
            type="button"
            onClick={() => {
              testContext.current =
                canvas.current
                  ?.getContext('webgl')
                  ?.getExtension('WEBGL_lose_context') ?? null;
              testContext.current?.loseContext();
            }}
          >
            Lose graphics context
          </button>
          <button
            type="button"
            onClick={() => testContext.current?.restoreContext()}
          >
            Restore graphics context
          </button>
        </aside>
      )}
    </>
  );
}
