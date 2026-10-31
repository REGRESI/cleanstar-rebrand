import{S as ae,x as we,p as H,s as Ue,y as ve,z as _,I as X,G as De,H as je,O as xe,k as te,J as ce,i as L,K as fe,a as E,Q as ee,X as ne,Y as Ke,Z as $e,h as A,V as k,_ as q,r as I,$ as Ye,e as Ze,a0 as Xe,a1 as qe,a2 as Je,a3 as et,A as Oe,a4 as tt,a5 as st,a6 as it,l as se,q as J,a7 as Le,t as Ne,a8 as ot,a9 as rt,aa as at,ab as nt,ac as lt,W as ut,f as Fe,b as ht,P as ct,ad as ft,D as me,ae as dt,af as ze,ag as mt,ah as pt,ai as _e,aj as gt,ak as Ie,al as vt,v as le,am as xt,an as wt,U as yt,n as bt}from"./three.module-XT6OFAac.js";import{aO as W,aL as O,bd as Mt,be as He,aQ as pe,bf as N}from"./app-Citdc-T5.js";class St extends ae{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;const e=new we;e.deleteAttribute("uv");const t=new H({side:Ue}),i=new H,r=new ve(16777215,900,28,2);r.position.set(.418,16.199,.3),this.add(r);const o=new _(e,t);o.position.set(-.757,13.219,.717),o.scale.set(31.713,28.305,28.591),this.add(o);const a=new X(e,i,6),n=new De;n.position.set(-10.906,2.009,1.846),n.rotation.set(0,-.195,0),n.scale.set(2.328,7.905,4.651),n.updateMatrix(),a.setMatrixAt(0,n.matrix),n.position.set(-5.607,-.754,-.758),n.rotation.set(0,.994,0),n.scale.set(1.97,1.534,3.955),n.updateMatrix(),a.setMatrixAt(1,n.matrix),n.position.set(6.167,.857,7.803),n.rotation.set(0,.561,0),n.scale.set(3.927,6.285,3.687),n.updateMatrix(),a.setMatrixAt(2,n.matrix),n.position.set(-2.017,.018,6.124),n.rotation.set(0,.333,0),n.scale.set(2.002,4.566,2.064),n.updateMatrix(),a.setMatrixAt(3,n.matrix),n.position.set(2.291,-.756,-2.621),n.rotation.set(0,-.286,0),n.scale.set(1.546,1.552,1.496),n.updateMatrix(),a.setMatrixAt(4,n.matrix),n.position.set(-2.193,-.369,-5.547),n.rotation.set(0,.516,0),n.scale.set(3.875,3.487,2.986),n.updateMatrix(),a.setMatrixAt(5,n.matrix),this.add(a);const h=new _(e,Q(50));h.position.set(-16.116,14.37,8.208),h.scale.set(.1,2.428,2.739),this.add(h);const u=new _(e,Q(50));u.position.set(-16.109,18.021,-8.207),u.scale.set(.1,2.425,2.751),this.add(u);const c=new _(e,Q(17));c.position.set(14.904,12.198,-1.832),c.scale.set(.15,4.265,6.331),this.add(c);const p=new _(e,Q(43));p.position.set(-.462,8.89,14.52),p.scale.set(4.38,5.441,.088),this.add(p);const d=new _(e,Q(20));d.position.set(3.235,11.486,-12.541),d.scale.set(2.5,2,.1),this.add(d);const f=new _(e,Q(100));f.position.set(0,20,0),f.scale.set(1,.1,1),this.add(f)}dispose(){const e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(const t of e)t.dispose()}}function Q(s){return new je({color:0,emissive:16777215,emissiveIntensity:s})}const ue={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class ${constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Tt=new xe(-1,1,1,-1,0,1);class Ct extends te{constructor(){super(),this.setAttribute("position",new ce([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new ce([0,2,0,0,2,0],2))}}const zt=new Ct;class ye{constructor(e){this._mesh=new _(zt,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Tt)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class _t extends ${constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof L?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=fe.clone(e.uniforms),this.material=new L({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new ye(this.material)}render(e,t,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class Ae extends ${constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,i){const r=e.getContext(),o=e.state;o.buffers.color.setMask(!1),o.buffers.depth.setMask(!1),o.buffers.color.setLocked(!0),o.buffers.depth.setLocked(!0);let a,n;this.inverse?(a=0,n=1):(a=1,n=0),o.buffers.stencil.setTest(!0),o.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),o.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),o.buffers.stencil.setClear(n),o.buffers.stencil.setLocked(!0),e.setRenderTarget(i),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),o.buffers.color.setLocked(!1),o.buffers.depth.setLocked(!1),o.buffers.color.setMask(!0),o.buffers.depth.setMask(!0),o.buffers.stencil.setLocked(!1),o.buffers.stencil.setFunc(r.EQUAL,1,4294967295),o.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),o.buffers.stencil.setLocked(!0)}}class At extends ${constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class Pt{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const i=e.getSize(new E);this._width=i.width,this._height=i.height,t=new ee(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:ne}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new _t(ue),this.copyPass.material.blending=Ke,this.timer=new $e}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());const t=this.renderer.getRenderTarget();let i=!1;for(let r=0,o=this.passes.length;r<o;r++){const a=this.passes[r];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(r),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,i),a.needsSwap){if(i){const n=this.renderer.getContext(),h=this.renderer.state.buffers.stencil;h.setFunc(n.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),h.setFunc(n.EQUAL,1,4294967295)}this.swapBuffers()}Ae!==void 0&&(a instanceof Ae?i=!0:a instanceof At&&(i=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new E);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const i=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(i,r),this.renderTarget2.setSize(i,r);for(let o=0;o<this.passes.length;o++)this.passes[o].setSize(i,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class kt extends ${constructor(e,t,i=null,r=null,o=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=i,this.clearColor=r,this.clearAlpha=o,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new A}render(e,t,i){const r=e.autoClear;e.autoClear=!1;let o,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(o=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(o),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}}const Et={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new A(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class K extends ${constructor(e,t=1,i,r){super(),this.strength=t,this.radius=i,this.threshold=r,this.resolution=e!==void 0?new E(e.x,e.y):new E(256,256),this.clearColor=new A(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let o=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new ee(o,a,{type:ne,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let c=0;c<this.nMips;c++){const p=new ee(o,a,{type:ne,depthBuffer:!1});p.texture.name="UnrealBloomPass.h"+c,p.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(p);const d=new ee(o,a,{type:ne,depthBuffer:!1});d.texture.name="UnrealBloomPass.v"+c,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),o=Math.round(o/2),a=Math.round(a/2)}const n=Et;this.highPassUniforms=fe.clone(n.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new L({uniforms:this.highPassUniforms,vertexShader:n.vertexShader,fragmentShader:n.fragmentShader}),this.separableBlurMaterials=[];const h=[6,10,14,18,22];o=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let c=0;c<this.nMips;c++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(h[c])),this.separableBlurMaterials[c].uniforms.invSize.value=new E(1/o,1/a),o=Math.round(o/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const u=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=u,this.bloomTintColors=[new k(1,1,1),new k(1,1,1),new k(1,1,1),new k(1,1,1),new k(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=fe.clone(ue.uniforms),this.blendMaterial=new L({uniforms:this.copyUniforms,vertexShader:ue.vertexShader,fragmentShader:ue.fragmentShader,premultipliedAlpha:!0,blending:q,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new A,this._oldClearAlpha=1,this._basic=new I,this._fsQuad=new ye(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let i=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(i,r);for(let o=0;o<this.nMips;o++)this.renderTargetsHorizontal[o].setSize(i,r),this.renderTargetsVertical[o].setSize(i,r),this.separableBlurMaterials[o].uniforms.invSize.value=new E(1/i,1/r),i=Math.round(i/2),r=Math.round(r/2)}render(e,t,i,r,o){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),o&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=i.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let n=this.renderTargetBright;for(let h=0;h<this.nMips;h++)this._fsQuad.material=this.separableBlurMaterials[h],this.separableBlurMaterials[h].uniforms.colorTexture.value=n.texture,this.separableBlurMaterials[h].uniforms.direction.value=K.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[h]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[h].uniforms.colorTexture.value=this.renderTargetsHorizontal[h].texture,this.separableBlurMaterials[h].uniforms.direction.value=K.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[h]),e.clear(),this._fsQuad.render(e),n=this.renderTargetsVertical[h];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,o&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(i),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=a}_getSeparableBlurMaterial(e){const t=[],i=e/3;for(let a=0;a<e;a++)t.push(.39894*Math.exp(-.5*a*a/(i*i))/i);const r=[],o=[];for(let a=1;a<e;a+=2){const n=t[a],h=a+1<e?t[a+1]:0,u=n+h;r.push((a*n+(a+1)*h)/u),o.push(u)}return new L({defines:{KERNEL_PAIRS:r.length},uniforms:{colorTexture:{value:null},invSize:{value:new E(.5,.5)},direction:{value:new E(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:r},gaussianWeights:{value:o}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new L({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}}K.BlurDirectionX=new E(1,0);K.BlurDirectionY=new E(0,1);const ie={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class Rt extends ${constructor(){super(),this.isOutputPass=!0,this.uniforms=fe.clone(ie.uniforms),this.material=new Ye({name:ie.name,uniforms:this.uniforms,vertexShader:ie.vertexShader,fragmentShader:ie.fragmentShader}),this._fsQuad=new ye(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Ze.getTransfer(this._outputColorSpace)===Xe&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===qe?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Je?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===et?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Oe?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===tt?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===st?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===it&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}const Z=new k;function U(s,e,t,i,r,o){const a=2*Math.PI*r/4,n=Math.max(o-2*r,0),h=Math.PI/4;Z.copy(e),Z[i]=0,Z.normalize();const u=.5*a/(a+n),c=1-Z.angleTo(s)/h;return Math.sign(Z[t])===1?c*u:n/(a+n)+u+u*(1-c)}class de extends we{constructor(e=1,t=1,i=1,r=2,o=.1){const a=r*2+1;if(o=Math.min(e/2,t/2,i/2,o),super(1,1,1,a,a,a),this.type="RoundedBoxGeometry",this.parameters={width:e,height:t,depth:i,segments:r,radius:o},a===1)return;const n=this.toNonIndexed();this.index=null,this.attributes.position=n.attributes.position,this.attributes.normal=n.attributes.normal,this.attributes.uv=n.attributes.uv;const h=new k,u=new k,c=new k(e,t,i).divideScalar(2).subScalar(o),p=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,w=p.length/6,g=new k,R=.5/a;for(let l=0,v=0;l<p.length;l+=3,v+=2)switch(h.fromArray(p,l),u.copy(h),u.x-=Math.sign(u.x)*R,u.y-=Math.sign(u.y)*R,u.z-=Math.sign(u.z)*R,u.normalize(),p[l+0]=c.x*Math.sign(h.x)+u.x*o,p[l+1]=c.y*Math.sign(h.y)+u.y*o,p[l+2]=c.z*Math.sign(h.z)+u.z*o,d[l+0]=u.x,d[l+1]=u.y,d[l+2]=u.z,Math.floor(l/w)){case 0:g.set(1,0,0),f[v+0]=U(g,u,"z","y",o,i),f[v+1]=1-U(g,u,"y","z",o,t);break;case 1:g.set(-1,0,0),f[v+0]=1-U(g,u,"z","y",o,i),f[v+1]=1-U(g,u,"y","z",o,t);break;case 2:g.set(0,1,0),f[v+0]=1-U(g,u,"x","z",o,e),f[v+1]=U(g,u,"z","x",o,i);break;case 3:g.set(0,-1,0),f[v+0]=1-U(g,u,"x","z",o,e),f[v+1]=1-U(g,u,"z","x",o,i);break;case 4:g.set(0,0,1),f[v+0]=1-U(g,u,"x","y",o,e),f[v+1]=1-U(g,u,"y","x",o,t);break;case 5:g.set(0,0,-1),f[v+0]=U(g,u,"x","y",o,e),f[v+1]=1-U(g,u,"y","x",o,t);break}}static fromJSON(e){return new de(e.width,e.height,e.depth,e.segments,e.radius)}}function Gt(s,e=!1){const t=s[0].index!==null,i=new Set(Object.keys(s[0].attributes)),r=new Set(Object.keys(s[0].morphAttributes)),o={},a={},n=s[0].morphTargetsRelative,h=new te;let u=0;for(let c=0;c<s.length;++c){const p=s[c];let d=0;if(t!==(p.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+c+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const f in p.attributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+c+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;o[f]===void 0&&(o[f]=[]),o[f].push(p.attributes[f]),d++}if(d!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+c+". Make sure all geometries have the same number of attributes."),null;if(n!==p.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+c+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const f in p.morphAttributes){if(!r.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+c+".  .morphAttributes must be consistent throughout all geometries."),null;a[f]===void 0&&(a[f]=[]),a[f].push(p.morphAttributes[f])}if(e){let f;if(t)f=p.index.count;else if(p.attributes.position!==void 0)f=p.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+c+". The geometry must have either an index or a position attribute"),null;h.addGroup(u,f,c),u+=f}}if(t){let c=0;const p=[];for(let d=0;d<s.length;++d){const f=s[d].index;for(let w=0;w<f.count;++w)p.push(f.getX(w)+c);c+=s[d].attributes.position.count}h.setIndex(p)}for(const c in o){const p=Pe(o[c]);if(!p)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+c+" attribute."),null;h.setAttribute(c,p)}for(const c in a){const p=a[c][0].length;if(p!==0){h.morphAttributes=h.morphAttributes||{},h.morphAttributes[c]=[];for(let d=0;d<p;++d){const f=[];for(let g=0;g<a[c].length;++g)f.push(a[c][g][d]);const w=Pe(f);if(!w)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+c+" morphAttribute."),null;h.morphAttributes[c].push(w)}}}return h}function Pe(s){let e,t,i,r=-1,o=0;for(let u=0;u<s.length;++u){const c=s[u];if(e===void 0&&(e=c.array.constructor),e!==c.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=c.itemSize),t!==c.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=c.normalized),i!==c.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(r===-1&&(r=c.gpuType),r!==c.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;o+=c.count*t}const a=new e(o),n=new se(a,t,i);let h=0;for(let u=0;u<s.length;++u){const c=s[u];if(c.isInterleavedBufferAttribute){const p=h/t;for(let d=0,f=c.count;d<f;d++)for(let w=0;w<t;w++){const g=c.getComponent(d,w);n.setComponent(d+p,w,g)}}else a.set(c.array,h);h+=c.count*t}return r!==void 0&&(n.gpuType=r),n}const C=14,P=9,S=3,x={white:new A("#eef0ee"),wall:new A("#f3f4f2"),floor:new A("#e6e7e3"),plinth:new A("#dfe1dd"),wood:new A("#c8a27c"),navy:new A("#1b2a44"),blue:new A("#2b5be6"),screen:new A("#1a2233"),leaf:new A("#a9b9a2"),steel:new A("#c9ccd0")};function Y(s,e){const t=s.attributes.position.count,i=new Float32Array(t*3);for(let r=0;r<t;r++)i.set([e.r,e.g,e.b],r*3);return s.setAttribute("color",new se(i,3)),s.attributes.uv||s.setAttribute("uv",new se(new Float32Array(t*2),2)),s}function b(s,e,t,i,r,o,a,n=.02,h=2){const u=new de(s,e,t,h,Math.min(n,s/2,e/2,t/2));return u.translate(i,r,o),Y(u.toNonIndexed(),a)}function V(s,e,t,i,r,o,a,n=20){const h=new Le(s,e,t,n);return h.translate(i,r,o),Y(h.toNonIndexed(),a)}function Bt(s,e,t,i,r,o=24){const a=new Ne(s.map(([n,h])=>new E(n,h)),o);return a.translate(e,t,i),Y(a.toNonIndexed(),r)}function ge(s,e,t,i,r,o=1){const a=new ot(s,2);return a.scale(1,o,1),a.translate(e,t,i),Y(a.toNonIndexed(),r)}function be(s){const e=Gt(s,!1);return e.computeVertexNormals(),e}const M={w:1.6,d:.8,h:.74},We=[{cx:2.2,cz:3.5},{cx:5.9,cz:3.5}],F=We.flatMap((s,e)=>[-1,1].flatMap(t=>[-1,1].map(i=>({island:e,x:s.cx+t*M.w/2,z:s.cz+i*M.d/2,facing:i})))),T={cx:11.05,cz:2.15,w:3,d:1.15},he=[...F.map((s,e)=>{const t=s.z+s.facing*.62,i=s.facing>0?0:Math.PI,r=[[.35,.4,.6],[-.25,.55,-.5],[.1,.25,.9],[.45,.6,-.35],[-.4,.3,.45],[.2,.7,-.8],[-.15,.45,.3],[.3,.35,-.6]][e];return{tidy:[s.x,t,i],messy:[s.x+r[0],t+s.facing*r[1],i+r[2]],zone:0}}),...[-1,0,1].flatMap((s,e)=>[-1,1].map((t,i)=>{const r=T.cz+t*(T.d/2+.38),o=t>0?0:Math.PI,a=[.25,-.2,.15,-.3,.2,.1][e*2+i];return{tidy:[T.cx+s*.95,r,o],messy:[T.cx+s*.95+a,r+t*.32,o+a*1.6],zone:1}}))],ke=[...F.filter((s,e)=>e%3!==1).map(s=>({x:s.x+.45,y:M.h,z:s.z-s.facing*.12,zone:0})),{x:T.cx-.9,y:M.h,z:T.cz+.2,zone:1},{x:T.cx+.3,y:M.h,z:T.cz-.25,zone:1},{x:T.cx+1.1,y:M.h,z:T.cz+.15,zone:1},{x:9.1,y:.92,z:4.72,zone:2},{x:9.35,y:.92,z:4.68,zone:2}],Ee=F.filter((s,e)=>e%2===0).map((s,e)=>({x:s.x-.35,z:s.z-s.facing*.05,rot:[.4,-.55,.3,-.35][e],zone:0})),Ut=[[1.4,3.5,0],[4.1,2.6,0],[6.9,4.4,0],[9.4,2.2,1],[12.6,2.2,1],[10.6,5.1,2],[8.9,5.1,2],[12,5.9,3],[13.3,5.9,3],[11,8.1,4],[4,8.1,4]].map(([s,e,t],i)=>({x:s,z:e,zone:t,n:i+1})),z={z:8.1,w:1,h:2.15},j={x:.04,y:1.45,z:7.35};function Dt(){const s=x.navy;return be([b(.5,.08,.48,0,.46,0,s,.035,3),b(.48,.5,.06,0,.78,.23,s,.03,3),V(.025,.025,.36,0,.26,0,x.steel,10),...[0,1,2,3,4].map(e=>{const t=e/5*Math.PI*2,i=b(.3,.03,.045,.15,.06,0,x.steel,.012,1);return i.rotateY(t),i})])}function Ot(s,e){return[b(M.w-.04,.035,M.d-.04,s,M.h,e,x.wood,.012,2),b(.04,M.h-.02,M.d-.12,s-M.w/2+.08,M.h/2,e,x.white,.015),b(.04,M.h-.02,M.d-.12,s+M.w/2-.08,M.h/2,e,x.white,.015)]}function Lt(s,e,t){const i=e-t*.22;return[b(.62,.38,.03,s,M.h+.36,i,x.white,.012),V(.018,.018,.16,s,M.h+.1,i-t*.03,x.white,8),b(.2,.012,.14,s,M.h+.025,i-t*.03,x.white,.005),b(.42,.012,.14,s,M.h+.025,e+t*.08,x.white,.005)]}function Nt(s,e,t){const i=s+.62,r=e-t*.25;return[V(.07,.08,.02,i,M.h+.03,r,x.white,16),V(.008,.008,.42,i,M.h+.24,r,x.steel,6)]}function oe(s,e,t=1){return[Bt([[.001,0],[.16*t,0],[.2*t,.38*t],[.21*t,.4*t],[.001,.4*t]],s,0,e,x.white,20),ge(.32*t,s,.78*t,e,x.leaf,1.25),ge(.22*t,s+.16*t,1.08*t,e-.05,x.leaf,1.1),ge(.2*t,s-.14*t,1*t,e+.1,x.leaf,1.2)]}function Ft(){const s=[b(C,.5,.18,C/2,.25,.09,x.wall,.02),b(C,.06,.26,C/2,.52,.13,x.white,.015)];s.push(b(C,.12,.18,C/2,S-.06,.09,x.wall,.02));for(let e=0;e<=10;e++)s.push(b(.07,S-.62,.12,e/10*C,.5+(S-.62)/2,.07,x.white,.015));return s}function It(){const s=[];s.push(b(C+1.2,.36,P+1.2,C/2,-.18,P/2,x.plinth,.06,3)),s.push(b(C,.02,P,C/2,.01,P/2,x.floor,.005,1)),s.push(b(.16,S,P-1.4,-.08,S/2,(P-1.4)/2,x.wall,.02)),s.push(b(.16,S-z.h,z.w,-.08,z.h+(S-z.h)/2,z.z,x.wall,.02)),s.push(b(.16,S,P-z.z-z.w/2,-.08,S/2,z.z+z.w/2+(P-z.z-z.w/2)/2,x.wall,.02)),s.push(b(.16,S,P,C+.08,S/2,P/2,x.wall,.02)),s.push(...Ft());for(const e of[.1,1.5,2.9,4.3])s.push(b(.05,S,.05,8.1,S/2,e,x.white,.01));for(const e of[9.4,11,12.6,13.95])s.push(b(.05,S,.05,e,S/2,4.36,x.white,.01));s.push(b(2.7,.9,.62,9.65,.45,4.72,x.white,.02)),s.push(b(2.74,.04,.66,9.65,.92,4.72,x.wood,.01)),s.push(b(.3,.4,.34,10.6,1.14,4.62,x.navy,.04,3)),s.push(b(.5,.14,.4,9.9,.93,4.66,x.steel,.01)),s.push(b(2.7,.7,.36,9.65,2.15,4.56,x.white,.02)),s.push(b(.1,S,2.7,11.3,S/2,5.72,x.wall,.015)),s.push(b(2.7,S,.1,12.65,S/2,7.07,x.wall,.015)),s.push(b(.86,2.05,.04,12.65,1.03,7.13,x.blue,.015)),s.push(V(.012,.012,.14,12.95,1,7.17,x.steel,6));for(const e of F)s.push(...Ot(e.x,e.z),...Lt(e.x,e.z,e.facing),...Nt(e.x,e.z,e.facing));return s.push(b(T.w,.04,T.d,T.cx,M.h,T.cz,x.wood,.02,3)),s.push(V(.05,.05,M.h-.04,T.cx-.9,M.h/2,T.cz,x.white,12)),s.push(V(.05,.05,M.h-.04,T.cx+.9,M.h/2,T.cz,x.white,12)),s.push(b(1.8,1.05,.55,2.4,.52,7.75,x.white,.03,3)),s.push(b(1.82,.04,.6,2.4,1.06,7.75,x.wood,.01)),s.push(b(2.2,.62,.42,4.1,.31,.45,x.white,.02)),s.push(...oe(.55,.55,1.05),...oe(7.6,.6,.9),...oe(13.45,.6,1.1),...oe(5.2,6.7,.8)),s.push(b(.04,.2,.14,j.x,j.y,j.z,x.white,.01)),be(s)}function Ht(){const s=[];for(let e=0;e<10;e++)s.push(b(C/10-.07,S-.64,.01,(e+.5)/10*C,.5+(S-.62)/2,.07,x.white,.002,1));return s.push(b(.01,S-.05,4.3,8.1,S/2,2.2,x.white,.002,1)),s.push(b(5.8,S-.05,.01,11.05,S/2,4.36,x.white,.002,1)),be(s)}function Wt(){return F.map(s=>{const e=new J(.56,.32),t=s.z-s.facing*.22+s.facing*.017;return s.facing<0&&e.rotateY(Math.PI),e.translate(s.x,M.h+.36,t),e})}function Vt(){return F.map(s=>{const e=new Le(.06,.11,.1,18,1,!0);return e.translate(s.x+.62,M.h+.45,s.z-s.facing*.25),e})}const Qt=Dt,jt=()=>{const s=new Ne([[.001,0],[.035,0],[.042,.09],[.038,.09],[.03,.006],[.001,.006]].map(([e,t])=>new E(e,t)),16);return Y(s.toNonIndexed(),x.white)},Kt=()=>Y(new de(.3,.05,.22,1,.004).toNonIndexed(),x.white);function $t(){const s=[],e=(i,r,o,a,n=.03)=>{const h=[[i,r],[o,r],[o,a],[i,a]];for(let u=0;u<4;u++)s.push(h[u][0],n,h[u][1],h[(u+1)%4][0],n,h[(u+1)%4][1])};e(0,0,C,P);for(const i of F)e(i.x-M.w/2+.02,i.z-M.d/2+.02,i.x+M.w/2-.02,i.z+M.d/2-.02);for(const i of he)e(i.tidy[0]-.24,i.tidy[1]-.24,i.tidy[0]+.24,i.tidy[1]+.24);e(T.cx-T.w/2,T.cz-T.d/2,T.cx+T.w/2,T.cz+T.d/2),e(8.3,4.41,11,5.03),e(11.3,4.36,C,7.07),e(1.5,7.47,3.3,8.03),e(3,.24,5.2,.66),s.push(8.1,.03,0,8.1,.03,7.09,0,.03,7.09,C,.03,7.09,8.1,.03,4.36,C,.03,4.36);const t=new te;return t.setAttribute("position",new ce(s,3)),t}const Yt=[1.849,1.801,1.817,1.828,1.921,1.938,1.977,1.973,1.918,1.922,2.01,2.015,2.069,2.033,1.971,1.905,2.047,2.137,2.164,2.17,2.172,2.172,2.168,2.145,2.118,2.094,2.081,2.036,2.099,2.099,2.095,2.098,2.091,2.113,2.173,2.241,2.245,2.221,2.188,2.161,2.116,2.075,2.073,2.077,2.099,2.075,2.053,2.013,1.94,2.093,2.219,2.338,2.439,2.519,2.632,2.732,2.796,2.815,2.89,2.945,2.945,2.936,2.869,2.816,2.793,2.831,2.984,3.088,3.172,3.287,3.342,3.505,3.726,3.949,4.134,4.134,4.277,4.324,4.289,4.289,4.248,4.452,4.593,4.636,4.649,4.649,4.61,4.609,4.576,4.544,4.544,4.455,4.322,4.292,4.262,4.223,4.128,4.128,4,3.848,3.716,3.675,3.637,3.702,3.84,3.802,3.802,3.749,3.884,4.009,3.992,4.054,4.046,4.046,4.03,4.023,3.985,4.051,4.132,4.132,4.186,4.214,4.214,4.279,4.368,4.385,4.461,4.448,4.517,4.528,4.528,4.61,4.61,4.639,4.467,4.467,4.436,4.476,4.328,4.47,4.47,4.405,4.502,4.502,4.468,4.26,4.191,3.983,3.881,3.691,3.691,3.563,3.374,3.374,3.205,3.205,3.105,3.091,2.961,2.961,2.923],Zt={angles:Yt},B=le.lerp,m=s=>new A(s),re=[[0,{sunColor:m("#ffb06a"),sun:4.4,sunElev:.13,hemiSky:m("#f3d2b4"),hemiGround:m("#8f8277"),hemi:.5,skyTop:m("#5d78ab"),skyHorizon:m("#eeb98f"),glow:m("#ffc58a"),ridge:m("#4f5d7c"),exposure:.92,env:.16}],[.1,{sunColor:m("#ff9560"),sun:3.2,sunElev:.08,hemiSky:m("#d9b7a8"),hemiGround:m("#7a6e6c"),hemi:.45,skyTop:m("#4d6496"),skyHorizon:m("#df9b82"),glow:m("#ffaf82"),ridge:m("#435071"),exposure:.92,env:.13}],[.2,{sunColor:m("#7d8fc8"),sun:.35,sunElev:.05,hemiSky:m("#33466e"),hemiGround:m("#1b2438"),hemi:.55,skyTop:m("#1b2a4a"),skyHorizon:m("#3e5480"),glow:m("#6c7fb0"),ridge:m("#18223a"),exposure:.95,env:.1}],[.3,{sunColor:m("#6f84c0"),sun:.15,sunElev:.05,hemiSky:m("#26365a"),hemiGround:m("#131a2b"),hemi:.42,skyTop:m("#0f1a33"),skyHorizon:m("#22345a"),glow:m("#3d5288"),ridge:m("#0d1426"),exposure:1,env:.05}],[.72,{sunColor:m("#6f84c0"),sun:.15,sunElev:.05,hemiSky:m("#26365a"),hemiGround:m("#131a2b"),hemi:.42,skyTop:m("#0c1630"),skyHorizon:m("#1d2e52"),glow:m("#34497c"),ridge:m("#0b1224"),exposure:1,env:.05}],[.84,{sunColor:m("#6f84c0"),sun:.12,sunElev:.03,hemiSky:m("#202f50"),hemiGround:m("#11182a"),hemi:.38,skyTop:m("#0a1430"),skyHorizon:m("#1a2b50"),glow:m("#2f4475"),ridge:m("#0a1122"),exposure:1,env:.05}],[.9,{sunColor:m("#ffd3ad"),sun:2.6,sunElev:.04,hemiSky:m("#b3c8e6"),hemiGround:m("#7d8896"),hemi:.45,skyTop:m("#6f95cc"),skyHorizon:m("#f7cfb2"),glow:m("#ffe0c0"),ridge:m("#3d4e72"),exposure:.95,env:.14}],[1,{sunColor:m("#eef4ff"),sun:3.6,sunElev:.12,hemiSky:m("#cfdff3"),hemiGround:m("#8e99a6"),hemi:.55,skyTop:m("#7fa6dd"),skyHorizon:m("#dde9f7"),glow:m("#fff1dc"),ridge:m("#5b6e92"),exposure:.92,env:.2}]];function Xt(s){let e=1;for(;e<re.length-1&&s>re[e][0];)e++;const[t,i]=re[e-1],[r,o]=re[e],a=N(Math.min(1,Math.max(0,(s-t)/(r-t)))),n=(h,u)=>h.clone().lerp(u,a);return{sunColor:n(i.sunColor,o.sunColor),sun:B(i.sun,o.sun,a),sunElev:B(i.sunElev,o.sunElev,a),hemiSky:n(i.hemiSky,o.hemiSky),hemiGround:n(i.hemiGround,o.hemiGround),hemi:B(i.hemi,o.hemi,a),skyTop:n(i.skyTop,o.skyTop),skyHorizon:n(i.skyHorizon,o.skyHorizon),glow:n(i.glow,o.glow),ridge:n(i.ridge,o.ridge),exposure:B(i.exposure,o.exposure,a),env:B(i.env,o.env,a)}}function qt(s){const e=s?1.55:1,t=[{p:0,pos:[7,7.2*e,23*e],at:[7,1.2,4.2]},{p:.1,pos:[6.6,6.2*e,19*e],at:[6.6,1.1,4.2]},{p:.2,pos:[3.4,4.6*e,15*e],at:[1.6,1.3,7.2]},{p:.3,pos:[1.6,3*e,11.4*(s?1.12:1)],at:[2.4,.9,4.6]}],i={arbeitsplaetze:{y:4.8,back:7,lead:-2.2},besprechung:{y:4.8,back:7.2,lead:-2.2},kueche:{y:5,back:5.8,lead:-2.6},sanitaer:{y:8.2,back:3.2,lead:-1.2},flur:{y:3.6,back:4.4,lead:-2.4}};for(const r of W){const o=(r.z0+r.z1)/2,a=i[r.id];for(const n of[.08,.92]){const h=He(r,n);t.push({p:B(r.start,r.end,n),pos:[h+a.lead,a.y*(s?1.35:1),o+a.back*e],at:[h,.6,o]})}}return t.push({p:.76,pos:[7,18.5*(s?1.7:1),5.5],at:[7,0,4.5]},{p:.81,pos:[7,19*(s?1.7:1),5.35],at:[7,0,4.5]},{p:.87,pos:[7.4,2.7,7.4],at:[7.2,1.6,0]},{p:.92,pos:[7.3,2.55,6.6],at:[7.2,1.75,0]},{p:1,pos:[7,5.2*e,22*e],at:[7,1.5,1.5]}),t}const D=W.length;function Jt(){return{uZone:{value:W.map(s=>new Ie(s.x0,s.z0,s.x1,s.z1))},uEdge:{value:new Array(D).fill(0)},uK:{value:new Array(D).fill(0)},uDir:{value:W.map(s=>s.dir)},uPlan:{value:0},uEdgeColor:{value:new A("#cfe4ff")},uAO:{value:null},uAOOn:{value:0}}}const es=`
uniform vec4 uZone[${D}];
uniform float uEdge[${D}];
uniform float uK[${D}];
uniform float uDir[${D}];
uniform float uPlan;
uniform vec3 uEdgeColor;
uniform sampler2D uAO;
uniform float uAOOn;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash21(i), b = hash21(i + vec2(1.0, 0.0)), c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
// Sauberkeit (0 staubig, 1 sauber) und Leuchten der Lichtkante an einer Bodenstelle
vec2 cleanState(vec2 xz) {
  for (int i = 0; i < ${D}; i++) {
    vec4 r = uZone[i];
    if (xz.x >= r.x - 0.001 && xz.x <= r.z + 0.001 && xz.y >= r.y - 0.001 && xz.y <= r.w + 0.001) {
      float k = uK[i];
      if (k <= 0.0) return vec2(0.0, 0.0);
      if (k >= 1.0) return vec2(1.0, 0.0);
      float d = (uEdge[i] - xz.x) * uDir[i];
      return vec2(smoothstep(-0.05, 0.35, d), exp(-abs(d) * 7.0));
    }
  }
  return vec2(1.0, 0.0);
}
`;function Re(s,e){s.onBeforeCompile=t=>{Object.assign(t.uniforms,e),t.vertexShader=t.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vWorldPos;
varying vec3 vWorldNormal;`).replace("#include <worldpos_vertex>",`#include <worldpos_vertex>
        vec4 wp = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          wp = instanceMatrix * wp;
        #endif
        wp = modelMatrix * wp;
        vWorldPos = wp.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`),t.fragmentShader=t.fragmentShader.replace("#include <common>",`#include <common>
${es}`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
        float up = smoothstep(0.7, 0.95, vWorldNormal.y);
        vec2 cs = cleanState(vWorldPos.xz);
        float dust = up * (1.0 - cs.x);
        // Staubschicht aus Rauschen: matt, leicht grau und fleckig
        float n = vnoise(vWorldPos.xz * 7.0) * 0.6 + vnoise(vWorldPos.xz * 23.0) * 0.4;
        diffuseColor.rgb *= mix(1.0, 0.83 + 0.1 * n, dust);
        // Hinter der Kante: feiner Glanz auf Böden und Tischplatten
        roughnessFactor = mix(roughnessFactor, mix(0.92, 0.22, cs.x), up);
        // Vorberechnete Umgebungsverdeckung am Boden (weiche Kontaktschatten unter Möbeln und an Wänden)
        if (uAOOn > 0.5 && vWorldPos.y < 0.06 && up > 0.5) {
          float ao = texture2D(uAO, vec2(vWorldPos.x / ${C.toFixed(1)}, 1.0 - vWorldPos.z / ${P.toFixed(1)})).r;
          diffuseColor.rgb *= 1.0 - ao * 0.55;
        }
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.97, 0.975, 0.97), uPlan);`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
        totalEmissiveRadiance += uEdgeColor * cs.y * (0.35 + 0.65 * up) * 1.6;
        totalEmissiveRadiance += vec3(0.86, 0.88, 0.9) * uPlan * 0.9;`)},s.customProgramCacheKey=()=>"cs-clean"}const ts=`
attribute vec4 aRand;
uniform float uTime;
uniform float uPixel;
uniform float uScale;  // Bildhöhe / (2 · tan(fov/2)): Weltgröße → Pixel
uniform vec4 uZone[${D}];
uniform float uEdge[${D}];
uniform float uK[${D}];
uniform float uDir[${D}];
uniform vec3 uMouse;   // xy: Zeiger in NDC, z: aktiv (0/1)
uniform vec4 uSwirl;   // xy: Tipp in NDC, z: Startzeit, w: aktiv
varying float vAlpha;
varying float vSpark;
void main() {
  vec3 p = position;
  // ruhiges Schweben
  float t = uTime * (0.05 + aRand.x * 0.06);
  p += vec3(sin(t * 6.283 + aRand.y * 40.0) * 0.18, sin(t * 3.1 + aRand.z * 30.0) * 0.12, cos(t * 5.0 + aRand.w * 20.0) * 0.18);
  float phase = 0.0;
  float gone = 0.0;
  for (int i = 0; i < ${D}; i++) {
    vec4 r = uZone[i];
    if (position.x >= r.x && position.x <= r.z && position.z >= r.y && position.z <= r.w) {
      if (uK[i] >= 1.0) gone = 1.0;
      else if (uK[i] > 0.0) phase = clamp(((uEdge[i] - position.x) * uDir[i] + 0.1) / 1.1, 0.0, 1.0);
    }
  }
  // von der Kante erfasst: kurz mitwirbeln, aufsteigen und als Funken verglühen
  float a = phase * 9.0 + aRand.x * 6.283;
  float rad = 0.35 * sin(phase * 3.1416);
  p += vec3(cos(a) * rad, phase * phase * 0.9, sin(a) * rad);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec4 clip = projectionMatrix * mv;
  // Zeiger (Desktop): Partikel weichen aus, Tipp (Touch): kleiner Wirbel
  vec2 ndc = clip.xy / clip.w;
  if (uMouse.z > 0.5) {
    vec2 dm = ndc - uMouse.xy;
    float dl = length(dm);
    mv.xy += normalize(dm + 1e-5) * smoothstep(0.16, 0.0, dl) * 0.35 * (1.0 - phase);
  }
  if (uSwirl.w > 0.5) {
    float age = uTime - uSwirl.z;
    vec2 ds = ndc - uSwirl.xy;
    float f = smoothstep(0.22, 0.0, length(ds)) * exp(-age * 1.6);
    float ang = f * 6.0;
    mv.xy += vec2(-ds.y, ds.x) * f * 2.2 + ds * f * 0.6;
  }
  gl_Position = projectionMatrix * mv;
  float spark = smoothstep(0.25, 0.55, phase) * (1.0 - smoothstep(0.7, 1.0, phase));
  vSpark = spark;
  vAlpha = (1.0 - gone) * (1.0 - smoothstep(0.75, 1.0, phase));
  // Staubkörnchen als feine Lichtpunkte: 1 bis 3 Pixel, Funken etwas größer
  float size = mix(0.0045, 0.009, spark) * (0.6 + aRand.w * 0.8);
  gl_PointSize = clamp(size * uScale / -mv.z, 1.0, 6.0) * uPixel;
}
`,ss=`
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;
varying float vSpark;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  vec3 col = mix(uColor, vec3(0.85, 0.93, 1.0) * 3.0, vSpark);
  gl_FragColor = vec4(col, a * vAlpha * mix(uOpacity, 1.0, vSpark));
}
`;function Me(s,e){const t=document.createElement("canvas");t.width=t.height=s,e(t.getContext("2d"),s);const i=new bt(t);return i.colorSpace=Fe,i.anisotropy=4,i}function Ge(s,e){return Me(128,(t,i)=>{t.clearRect(0,0,i,i),t.lineWidth=4,t.strokeStyle=e?"#2b5be6":"rgba(255,255,255,0.9)",t.fillStyle=e?"#ffffff":"rgba(11,18,32,0.55)",t.beginPath(),t.arc(i/2,i/2,i/2-8,0,Math.PI*2),t.fill(),t.stroke(),e?(t.strokeStyle="#2b5be6",t.lineWidth=8,t.lineCap="round",t.lineJoin="round",t.beginPath(),t.moveTo(i*.32,i*.52),t.lineTo(i*.45,i*.65),t.lineTo(i*.7,i*.37),t.stroke()):(t.fillStyle="#ffffff",t.font=`500 ${i*.42}px system-ui, sans-serif`,t.textAlign="center",t.textBaseline="middle",t.fillText(String(s),i/2,i/2+2))})}function is(){return Me(128,(s,e)=>{const t=e/2,i=s.createRadialGradient(t,t,0,t,t,t);i.addColorStop(0,"rgba(255,255,255,1)"),i.addColorStop(.15,"rgba(200,225,255,0.6)"),i.addColorStop(1,"rgba(120,170,255,0)"),s.fillStyle=i,s.beginPath();for(let r=0;r<8;r++){const o=r/8*Math.PI*2-Math.PI/2,a=r%2===0?t:t*.16;s.lineTo(t+Math.cos(o)*a,t+Math.sin(o)*a)}s.closePath(),s.fill()})}function Be(){return Me(256,(s,e)=>{const t=s.createLinearGradient(0,0,e,0);t.addColorStop(0,"rgba(255,255,255,0)"),t.addColorStop(.5,"rgba(255,255,255,1)"),t.addColorStop(1,"rgba(255,255,255,0)"),s.fillStyle=t,s.fillRect(0,0,e,e);const i=s.createLinearGradient(0,0,0,e);i.addColorStop(0,"rgba(0,0,0,1)"),i.addColorStop(.2,"rgba(0,0,0,0)"),i.addColorStop(.85,"rgba(0,0,0,0)"),i.addColorStop(1,"rgba(0,0,0,1)"),s.globalCompositeOperation="destination-out",s.fillStyle=i,s.fillRect(0,0,e,e)})}class as{renderer;scene=new ae;camera;composer=null;bloom=null;U=Jt();sun=new rt("#ffffff",2);hemi=new at("#ffffff","#888888",1);edgeLight=new ve("#cfe4ff",0,5,1.6);doorLight=new nt("#ffe2b8",0,9,.55,.6,1.4);islandLights=We.map(e=>{const t=new ve("#ffd7a0",0,5.5,1.5);return t.position.set(e.cx,1.55,e.cz),t});sky;ridges=[];screens=[];lamps=[];chairs;cups;papers;door;doorGlow;alarm;sheet;shafts=[];plan;markers=[];dust;keys;curve;targets;mouse=new E;mouseOn=!1;look=new E;p=0;time=0;dummy=new De;fog=new lt("#1b2a4a",70,190);constructor(e,t){const i=t.quality==="high",r=new URLSearchParams(location.search).get("dbg")??"";this.renderer=new ut({canvas:e,antialias:!t.mobile,powerPreference:"high-performance",alpha:!1,preserveDrawingBuffer:new URLSearchParams(location.search).has("still")}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,t.mobile?1.5:2)),this.renderer.outputColorSpace=Fe,this.renderer.toneMapping=Oe,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=ht,this.camera=new ct(t.mobile?50:34,1,.1,400),this.scene.fog=this.fog;const o=new ft(this.renderer);r.includes("e")||(this.scene.environment=o.fromScene(new St,.04).texture),o.dispose();const a=new H({vertexColors:!0,roughness:.86,metalness:0,envMapIntensity:.55});Re(a,this.U);const n=new _(It(),a);n.castShadow=n.receiveShadow=!0,this.scene.add(n);const h=new _(Ht(),new H({color:"#dbe7f2",transparent:!0,opacity:.16,roughness:.04,metalness:0,envMapIntensity:1.2,depthWrite:!1}));r.includes("g")||this.scene.add(h);for(const w of Wt()){const g=new _(w,new I({color:"#0d1424",toneMapped:!1}));this.screens.push(g),this.scene.add(g)}for(const w of Vt()){const g=new _(w,new I({color:"#f2efe8",side:me,toneMapped:!1}));this.lamps.push(g),this.scene.add(g)}this.islandLights.forEach(w=>this.scene.add(w));const u=new H({vertexColors:!0,roughness:.6,envMapIntensity:.6});Re(u,this.U),this.chairs=new X(Qt(),u,he.length),this.chairs.castShadow=!0,this.cups=new X(jt(),new H({vertexColors:!0,roughness:.35,envMapIntensity:.9}),ke.length),this.papers=new X(Kt(),new H({vertexColors:!0,roughness:.95}),Ee.length),this.cups.castShadow=this.papers.castShadow=!0,this.scene.add(this.chairs,this.cups,this.papers),this.door=new dt,this.door.position.set(-.08,0,z.z-z.w/2);const c=new _(new we(.05,z.h,z.w-.02),new H({color:"#f1f2ef",roughness:.8}));c.position.set(0,z.h/2,z.w/2),c.castShadow=!0,this.door.add(c),this.scene.add(this.door),this.doorGlow=new _(new J(z.w,z.h),new I({color:"#000000",toneMapped:!1})),this.doorGlow.rotation.y=Math.PI/2,this.doorGlow.position.set(-.2,z.h/2,z.z),this.scene.add(this.doorGlow),this.doorLight.position.set(-1.2,2,z.z),this.doorLight.target.position.set(3,0,z.z-.6),this.scene.add(this.doorLight,this.doorLight.target),this.alarm=new _(new ze(.022,12,8),new I({color:"#333",toneMapped:!1})),this.alarm.position.set(j.x+.03,j.y+.05,j.z),this.scene.add(this.alarm),this.sheet=new _(new J(1,1),new I({map:Be(),color:"#d9ebff",transparent:!0,opacity:0,blending:q,depthWrite:!1,toneMapped:!1})),this.sheet.rotation.y=Math.PI/2,this.scene.add(this.sheet,this.edgeLight),this.sun.castShadow=!0,this.sun.shadow.mapSize.set(i?2048:1024,i?2048:1024);const p=this.sun.shadow.camera;p.left=-11,p.right=11,p.top=9,p.bottom=-9,p.near=1,p.far=80,this.sun.shadow.bias=-4e-4,this.sun.shadow.normalBias=.02,this.sun.target.position.set(C/2,0,P/2),this.scene.add(this.sun,this.sun.target,this.hemi),this.sky=this.buildSky(),r.includes("s")||this.scene.add(this.sky),this.buildRidges();const d=Be();for(let w=0;w<5;w++){const g=new _(new J(1.2,7),new I({map:d,color:"#fff4e2",transparent:!0,opacity:0,blending:q,depthWrite:!1,side:me}));g.position.set(1.8+w*2.6,1.35,3.1),g.rotation.set(-1.15,0,.12),this.shafts.push(g),this.scene.add(g)}this.plan=new mt($t(),new pt({color:"#1a4fe0",transparent:!0,opacity:0,depthTest:!1})),this.plan.renderOrder=5,this.scene.add(this.plan);const f=is();for(const w of Ut){const g=y=>{const G=new xt(new wt({map:y,transparent:!0,opacity:0,depthTest:!1,toneMapped:!1}));return G.position.set(w.x,1.25,w.z),G.scale.setScalar(.34),G.renderOrder=6,this.scene.add(G),G},R=g(Ge(w.n,!1)),l=g(Ge(w.n,!0)),v=g(f);v.material.blending=q,this.markers.push({open:R,done:l,star:v,x:w.x,zone:w.zone})}this.bakeAO(n),this.dust=this.buildDust(t.mobile?5e3:i?2e4:9e3),r.includes("d")||this.scene.add(this.dust),this.keys=qt(t.mobile),this.curve=new _e(this.keys.map(w=>new k(...w.pos)),!1,"centripetal"),this.targets=new _e(this.keys.map(w=>new k(...w.at)),!1,"centripetal"),i&&!t.mobile&&!r.includes("b")&&(this.composer=new Pt(this.renderer),this.composer.addPass(new kt(this.scene,this.camera)),this.bloom=new K(new E(512,512),.4,.5,2.2),this.composer.addPass(this.bloom),this.composer.addPass(new Rt)),this.setProgress(0)}bakeAO(e){const i=l=>new ee(512,l,{type:yt}),r=Math.round(512*P/C),o=i(r),a=i(r),n=new xe(0,C,0,-P,.1,20);n.position.set(0,10,0),n.rotation.set(-Math.PI/2,0,0),n.updateProjectionMatrix();const h=new L({vertexShader:`varying float vY;
        void main() {
          vec4 wp = vec4(position, 1.0);
          #ifdef USE_INSTANCING
            wp = instanceMatrix * wp;
          #endif
          wp = modelMatrix * wp;
          vY = wp.y;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,fragmentShader:"varying float vY; void main(){ if (vY < 0.03) discard; gl_FragColor = vec4(vec3(0.9), 1.0); }"}),u=new ae;u.background=new A("#000");const c=new _(e.geometry,h),p=new X(this.chairs.geometry,h,this.chairs.count);for(let l=0;l<this.chairs.count;l++){const v=new gt,y=he[l];this.dummy.position.set(y.tidy[0],0,y.tidy[1]),this.dummy.rotation.set(0,y.tidy[2],0),this.dummy.updateMatrix(),v.copy(this.dummy.matrix),p.setMatrixAt(l,v)}u.add(c,p);const d=this.renderer;d.setRenderTarget(o),d.render(u,n);const f=new L({uniforms:{tMap:{value:null},uDir:{value:new E}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:`uniform sampler2D tMap; uniform vec2 uDir; varying vec2 vUv;
        void main(){ float s = 0.0; float w = 0.0;
          for (int i = -12; i <= 12; i++) { float k = exp(-float(i*i) / 60.0); s += texture2D(tMap, vUv + uDir * float(i)).r * k; w += k; }
          gl_FragColor = vec4(vec3(s / w), 1.0); }`,depthTest:!1}),w=new _(new J(2,2),f),g=new ae;g.add(w);const R=new xe(-1,1,1,-1,0,1);for(let l=0;l<2;l++)f.uniforms.tMap.value=o.texture,f.uniforms.uDir.value.set(1.4/512,0),d.setRenderTarget(a),d.render(g,R),f.uniforms.tMap.value=a.texture,f.uniforms.uDir.value.set(0,1.4/r),d.setRenderTarget(o),d.render(g,R);d.setRenderTarget(null),a.dispose(),h.dispose(),f.dispose(),this.U.uAO.value=o.texture,this.U.uAOOn.value=1}buildSky(){const e=new L({side:Ue,depthWrite:!1,fog:!1,uniforms:{uTop:{value:new A},uHorizon:{value:new A},uGlow:{value:new A},uSun:{value:new k(0,.1,-1)},uSunSize:{value:0}},vertexShader:"varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",fragmentShader:`uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uGlow; uniform vec3 uSun; uniform float uSunSize; varying vec3 vDir;
        void main(){ float h = clamp(vDir.y * 2.2, 0.0, 1.0); vec3 c = mix(uHorizon, uTop, pow(h, 0.7));
          float s = max(dot(normalize(vDir), normalize(uSun)), 0.0);
          c += uGlow * pow(s, 8.0) * 0.55 + uGlow * pow(s, 900.0) * uSunSize * 3.0;
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`}),t=new _(new ze(180,32,16),e);return t.position.set(C/2,0,P/2),t}buildRidges(){const e=Zt.angles,t=(i,r,o,a)=>{const n=e.length,h=[],u=[];for(let d=0;d<n;d++){let f=0,w=0;for(let y=Math.max(0,d-o);y<=Math.min(n-1,d+o);y++)f+=e[y],w++;f/=w;const g=le.degToRad(-35+70*d/(n-1)),R=C/2+Math.sin(g)*i,l=P/2-Math.cos(g)*i,v=Math.tan(le.degToRad(f))*i*r-2;h.push(R,-6,l,R,v,l),d<n-1&&u.push(d*2,d*2+1,d*2+2,d*2+1,d*2+3,d*2+2)}const c=new te;c.setAttribute("position",new ce(h,3)),c.setIndex(u);const p=new _(c,new I({color:"#2a3550",transparent:a<1,opacity:a,side:me,fog:!0}));this.ridges.push(p),this.scene.add(p)};t(78,2.1,0,1),t(52,1.3,6,.92)}buildDust(e){const t=new Float32Array(e*3),i=new Float32Array(e*4);for(let n=0;n<e;n++)t.set([Math.random()*C,.15+Math.pow(Math.random(),.8)*(S-.4),Math.pow(Math.random(),1.3)*P],n*3),i.set([Math.random(),Math.random(),Math.random(),Math.random()],n*4);const r=new te;r.setAttribute("position",new se(t,3)),r.setAttribute("aRand",new se(i,4));const o=new L({vertexShader:ts,fragmentShader:ss,transparent:!0,depthWrite:!1,blending:q,uniforms:{...this.U,uTime:{value:0},uPixel:{value:this.renderer.getPixelRatio()},uScale:{value:800},uMouse:{value:new k},uSwirl:{value:new Ie(0,0,-10,0)},uColor:{value:new A("#ffd9a8")},uOpacity:{value:.5}}}),a=new vt(r,o);return a.frustumCulled=!1,a}resize(e,t){this.renderer.setSize(e,t,!1),this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.composer?.setSize(e,t),this.dust.material.uniforms.uScale.value=t/(2*Math.tan(le.degToRad(this.camera.fov/2))),this.bloom?.resolution.set(e/2,t/2)}pointer(e,t,i){this.mouse.set(e,t),this.mouseOn=i}tap(e,t){this.dust.material.uniforms.uSwirl.value.set(e,t,this.time,1)}setProgress(e){this.p=e;const t=Xt(e),i=this.U,r=e<.84?.35:-.25,o=new k(Math.sin(r),Math.max(.02,t.sunElev),-Math.cos(r)).normalize();this.sun.position.copy(o.clone().multiplyScalar(40).add(new k(C/2,0,P/2))),this.sun.color.copy(t.sunColor),this.sun.intensity=t.sun,this.hemi.color.copy(t.hemiSky),this.hemi.groundColor.copy(t.hemiGround),this.hemi.intensity=t.hemi;const a=this.sky.material.uniforms;a.uTop.value.copy(t.skyTop),a.uHorizon.value.copy(t.skyHorizon),a.uGlow.value.copy(t.glow),a.uSun.value.copy(o),a.uSunSize.value=O(e,.86,.95),this.fog.color.copy(t.skyHorizon),this.ridges[0].material.color.copy(t.ridge),this.ridges[1].material.color.copy(t.ridge.clone().lerp(t.skyHorizon,.35)),this.renderer.toneMappingExposure=t.exposure,this.scene.environmentIntensity=t.env;const n=l=>O(e,pe.leave[0]+.012+l*.04,pe.leave[0]+.03+l*.04);this.screens.forEach((l,v)=>{const y=1-n(F[v].island)*(1+v%4*.08);l.material.color.setRGB(.05+.55*Math.max(0,y),.08+.7*Math.max(0,y),.14+1.05*Math.max(0,y))}),this.lamps.forEach((l,v)=>{const y=1-n(F[v].island);l.material.color.setRGB(.9+1.6*y,.88+1.2*y,.84+.6*y)}),this.islandLights.forEach((l,v)=>l.intensity=2.2*(1-n(v)));const h=N(O(e,.2,.235))*(1-N(O(e,.81,.835)));this.door.rotation.y=-h*1.45;const u=Math.max(h,O(e,.2,.22)*(e<.84?1:0));this.doorGlow.material.color.setRGB(1.6*u,1.35*u,1*u),this.doorLight.intensity=26*h;const c=e>.205&&e<.25?Math.sin(this.time*9)>0?1:.15:0,p=N(O(e,.79,.81))*(e<.86?1:0);this.alarm.material.color.setRGB(.25+2.2*c,.25+1.6*p,.25+.6*p);const d=Mt(e);let f=-1;if(d.forEach((l,v)=>{i.uK.value[v]=l,i.uEdge.value[v]=He(W[v],l),l>0&&l<1&&(f=v)}),f>=0){const l=W[f],v=i.uEdge.value[f],y=Math.min(1,d[f]*8,(1-d[f])*8);this.sheet.position.set(v,1.3,(l.z0+l.z1)/2),this.sheet.scale.set(l.z1-l.z0,2.6,1),this.sheet.material.opacity=.16*y,this.edgeLight.position.set(v,1.1,(l.z0+l.z1)/2),this.edgeLight.intensity=7*y}else this.sheet.material.opacity=0,this.edgeLight.intensity=0;const w=(l,v)=>{const y=W[l],G=d[l];return G<=0?0:G>=1?1:N(Math.min(1,Math.max(0,((i.uEdge.value[l]-v)*y.dir+.2)/1)))};he.forEach((l,v)=>{const y=w(l.zone,l.tidy[0]);this.dummy.position.set(B(l.messy[0],l.tidy[0],y),0,B(l.messy[1],l.tidy[1],y)),this.dummy.rotation.set(0,B(l.messy[2],l.tidy[2],y),0),this.dummy.scale.setScalar(1),this.dummy.updateMatrix(),this.chairs.setMatrixAt(v,this.dummy.matrix)}),this.chairs.instanceMatrix.needsUpdate=!0,ke.forEach((l,v)=>{const y=w(l.zone,l.x),G=y<.5?1+y*.3:Math.max(0,1.15-(y-.5)*2.3);this.dummy.position.set(l.x,l.y+y*.05,l.z),this.dummy.rotation.set(0,0,0),this.dummy.scale.setScalar(Math.max(1e-4,G)),this.dummy.updateMatrix(),this.cups.setMatrixAt(v,this.dummy.matrix)}),this.cups.instanceMatrix.needsUpdate=!0,Ee.forEach((l,v)=>{const y=w(l.zone,l.x);this.dummy.position.set(l.x,.76+.025,l.z),this.dummy.rotation.set(0,B(l.rot,0,y),0),this.dummy.scale.set(1,B(1,.55,y),1),this.dummy.updateMatrix(),this.papers.setMatrixAt(v,this.dummy.matrix)}),this.papers.instanceMatrix.needsUpdate=!0;const g=N(O(e,.735,.765))*(1-N(O(e,.8,.83)));this.markers.forEach(l=>{const v=W[l.zone],y=d[l.zone],G=(y>0&&y<1?Math.min(1,y*10):0)+g,Se=y>=1||y>0&&(i.uEdge.value[l.zone]-l.x)*v.dir>0,Ve=Se?Math.min(1,(i.uEdge.value[l.zone]-l.x)*v.dir/.9):0,Te=Se?1:0;l.open.material.opacity=Math.min(1,G)*(1-Te),l.done.material.opacity=Math.min(1,G)*Te;const Ce=y>0&&y<1?Math.sin(Math.min(1,Ve)*Math.PI):0;l.star.material.opacity=Ce,l.star.scale.setScalar(.3+Ce*.5);const Qe=B(1.25,.2,g);l.open.position.y=l.done.position.y=l.star.position.y=Qe}),i.uPlan.value=g*.9,this.plan.material.opacity=g,this.dust.material.uniforms.uOpacity.value=B(.35,.1,O(e,.1,.22))*(e>.72?0:1),this.dust.material.uniforms.uColor.value.set(e<.15?"#ffd9a8":"#a9c4ff");const R=N(O(e,.88,.94))*(1-O(e,.98,1)*.4);this.shafts.forEach((l,v)=>l.material.opacity=R*(.06+.025*Math.sin(v*1.7))),this.bloom&&(this.bloom.strength=e>.86?.22:.4)}render(e){this.time+=e,this.dust.material.uniforms.uTime.value=this.time,this.dust.material.uniforms.uMouse.value.set(this.mouse.x,this.mouse.y,this.mouseOn&&this.p<pe.clean[1]?1:0);const i=this.keys.length;let r=0;for(;r<i-2&&this.p>this.keys[r+1].p;)r++;const o=this.keys[r],a=this.keys[r+1],n=Math.min(1,Math.max(0,(this.p-o.p)/(a.p-o.p))),h=(r+N(n))/(i-1),u=this.curve.getPoint(h),c=this.targets.getPoint(h);this.look.lerp(this.mouseOn?this.mouse:new E,.05);const p=new k().subVectors(u,c);p.applyAxisAngle(new k(0,1,0),-this.look.x*.045),u.copy(c).add(p),u.y+=this.look.y*.18,this.camera.position.copy(u),this.camera.up.set(0,1,0),this.camera.lookAt(c),this.composer?this.composer.render(e):this.renderer.render(this.scene,this.camera)}dispose(){this.scene.traverse(e=>{const t=e;t.geometry?.dispose();const i=t.material;Array.isArray(i)?i.forEach(r=>r.dispose()):i?.dispose()}),this.composer?.dispose(),this.renderer.dispose()}}export{as as NightWorld};
