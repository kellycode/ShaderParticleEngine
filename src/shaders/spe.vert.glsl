#version 300 es

precision highp float;

// defines
#define PACKED_COLOR_SIZE 256.0;
#define PACKED_COLOR_DIVISOR 255.0;

// uniforms
uniform float deltaTime;
uniform float runTime;
uniform sampler2D tex;
uniform vec4 textureAnimation;
uniform float scale;

// attributes
out vec4 acceleration;
out vec3 velocity;
out vec4 rotation;
out vec3 rotationCenter;
out vec4 params;
out vec4 size;
out vec4 angle;
out vec4 color;
out vec4 opacity;

// varyings
in vec4 vColor;

#ifdef SHOULD_ROTATE_TEXTURE
in float vAngle;
#endif

#ifdef SHOULD_CALCULATE_SPRITE
in vec4 vSpriteSheet;
#endif

/*****************************************************************************************************************************/
// THREE.ShaderChunk.common

// export default glsl
#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6

#ifndef saturate
// <tonemapping_pars_fragment> may have defined saturate() already
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )

float pow2(const in float x) {
    return x*x;
}
vec3 pow2(const in vec3 x) {
    return x*x;
}
float pow3(const in float x) {
    return x*x*x;
}
float pow4(const in float x) {
    float x2=x*x;
    return x2*x2;
}
float max3(const in vec3 v) {
    return max(max(v.x, v.y), v.z);
}
float average(const in vec3 v) {
    return dot(v, vec3(0.3333333f));
}

// expects values in the range of [0,1]x[0,1], returns values in the [0,1] range.
// do not collapse into a single function per: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
highp float rand(const in vec2 uv) {

    const highp float a=12.9898f, b=78.233f, c=43758.5453f;
    highp float dt=dot(uv.xy, vec2(a, b)), sn=mod(dt, PI);

    return fract(sin(sn)*c);

}

#ifdef HIGH_PRECISION
float precisionSafeLength(vec3 v) {
    return length(v);
}
#else
float precisionSafeLength(vec3 v) {
    float maxComponent=max3(abs(v));
    return length(v/maxComponent)*maxComponent;
}
#endif

struct IncidentLight {
    vec3 color;
    vec3 direction;
    bool visible;
};

struct ReflectedLight {
    vec3 directDiffuse;
    vec3 directSpecular;
    vec3 indirectDiffuse;
    vec3 indirectSpecular;
};

#ifdef USE_ALPHAHASH

varying vec3 vPosition;

#endif

vec3 transformDirection(in vec3 dir, in mat4 matrix) {

    return normalize((matrix*vec4(dir, 0.0f)).xyz);

}

vec3 inverseTransformDirection(in vec3 dir, in mat4 matrix) {

	// dir can be either a direction vector or a normal vector
	// upper-left 3x3 of matrix is assumed to be orthogonal

    return normalize((vec4(dir, 0.0f)*matrix).xyz);

}

mat3 transposeMat3(const in mat3 m) {

    mat3 tmp;

    tmp[0]=vec3(m[0].x, m[1].x, m[2].x);
    tmp[1]=vec3(m[0].y, m[1].y, m[2].y);
    tmp[2]=vec3(m[0].z, m[1].z, m[2].z);

    return tmp;

}

bool isPerspectiveMatrix(mat4 m) {

    return m[2][3]==-1.0f;

}

vec2 equirectUv(in vec3 dir) {

	// dir is assumed to be unit length

    float u=atan(dir.z, dir.x)*RECIPROCAL_PI2+0.5f;

    float v=asin(clamp(dir.y,-1.0f, 1.0f))*RECIPROCAL_PI+0.5f;

    return vec2(u, v);

}

vec3 BRDF_Lambert(const in vec3 diffuseColor) {

    return RECIPROCAL_PI*diffuseColor;

} // validated

vec3 F_Schlick(const in vec3 f0, const in float f90, const in float dotVH) {

	// Original approximation by Christophe Schlick 94
	// float fresnel = pow( 1.0 - dotVH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH 13)
	// https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
    float fresnel=exp2((-5.55473f*dotVH-6.98316f)*dotVH);

    return f0*(1.0f-fresnel)+(f90*fresnel);

} // validated

float F_Schlick(const in float f0, const in float f90, const in float dotVH) {

	// Original approximation by Christophe Schlick 94
	// float fresnel = pow( 1.0 - dotVH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH 13)
	// https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
    float fresnel=exp2((-5.55473f*dotVH-6.98316f)*dotVH);

    return f0*(1.0f-fresnel)+(f90*fresnel);

} // validated

// THREE.ShaderChunk.logdepthbuf_pars_vertex

#ifdef USE_LOGDEPTHBUF

varying float vFragDepth;
varying float vIsPerspective;

#endif

// THREE.ShaderChunk.fog_pars_vertex

#ifdef USE_FOG

varying float vFogDepth;

#endif

/*****************************************************************************************************************************/

// branchAvoidanceFunctions
float when_gt(float x, float y) {
    return max(sign(x-y), 0.0f);
}

float when_lt(float x, float y) {
    return min(max(1.0f-sign(x-y), 0.0f), 1.0f);
}

float when_eq(float x, float y) {
    return 1.0f-abs(sign(x-y));
}

float when_ge(float x, float y) {
    return 1.0f-when_lt(x, y);
}

float when_le(float x, float y) {
    return 1.0f-when_gt(x, y);
}

// Branch-avoiding logical operators
// (to be used with above comparison fns)
float and(float a, float b) {
    return a*b;
}

float or(float a, float b) {
    return min(a+b, 1.0f);
}

// unpackColor
vec3 unpackColor(in float hex) {
    vec3 c=vec3(0.0f);

    float r=mod((hex/PACKED_COLOR_SIZE/PACKED_COLOR_SIZE), PACKED_COLOR_SIZE);
    float g=mod((hex/PACKED_COLOR_SIZE), PACKED_COLOR_SIZE);
    float b=mod(hex, PACKED_COLOR_SIZE);

    c.r=r/PACKED_COLOR_DIVISOR;
    c.g=g/PACKED_COLOR_DIVISOR;
    c.b=b/PACKED_COLOR_DIVISOR;

    return c;
}

// unpackRotationAxis
vec3 unpackRotationAxis(in float hex) {
    vec3 c=vec3(0.0f);

    float r=mod((hex/PACKED_COLOR_SIZE/PACKED_COLOR_SIZE), PACKED_COLOR_SIZE);
    float g=mod((hex/PACKED_COLOR_SIZE), PACKED_COLOR_SIZE);
    float b=mod(hex, PACKED_COLOR_SIZE);

    c.r=r/PACKED_COLOR_DIVISOR;
    c.g=g/PACKED_COLOR_DIVISOR;
    c.b=b/PACKED_COLOR_DIVISOR;

    c*=vec3(2.0f);
    c-=vec3(1.0f);

    return c;
}

// floatOverLifetime
float getFloatOverLifetime(in float positionInTime, in vec4 attr) {
    const int VEC4_SIZE=4;
    float value=0.0f;
    float deltaAge=clamp(positionInTime*float(VEC4_SIZE-2), 0.0f, float(VEC4_SIZE-2));

    if(deltaAge==0.0f)
        return attr[0];
    if(deltaAge>=float(VEC4_SIZE-1))
        return attr[VEC4_SIZE-1];

    for(int i=0 ; i<VEC4_SIZE-1 ; ++i) {
        float fIndex=float(i);
        float shouldApplyValue=and(when_gt(deltaAge, fIndex), when_le(deltaAge, fIndex+1.0f));
        if(i<=3) {
            value+=shouldApplyValue*mix(attr[i], attr[i+1], deltaAge-fIndex);
        }
    }

    return value;
}

// colorOverLifetime
vec3 getColorOverLifetime(in float positionInTime, in vec3 color1, in vec3 color2, in vec3 color3, in vec3 color4) {
    vec3 value=vec3(0.0f);
    value.x=getFloatOverLifetime(positionInTime, vec4(color1.x, color2.x, color3.x, color4.x));
    value.y=getFloatOverLifetime(positionInTime, vec4(color1.y, color2.y, color3.y, color4.y));
    value.z=getFloatOverLifetime(positionInTime, vec4(color1.z, color2.z, color3.z, color4.z));
    return value;
}

// paramFetchingFunctions
float getAlive() {
    return params.x;
}

float getAge() {
    return params.y;
}

float getMaxAge() {
    return params.z;
}

float getWiggle() {
    return params.w;
}

// forceFetchingFunctions
vec4 getPosition(in float age) {
    return modelViewMatrix*vec4(position, 1.0f);
}

vec3 getVelocity(in float age) {
    return velocity*age;
}

vec3 getAcceleration(in float age) {
    return acceleration.xyz*age;
}

// rotationFunctions
#ifdef SHOULD_ROTATE_PARTICLES

mat4 getRotationMatrix(in vec3 axis, in float angle) {
    axis=normalize(axis);
    float s=sin(angle);
    float c=cos(angle);
    float oc=1.0f-c;

    return mat4(oc*axis.x*axis.x+c, oc*axis.x*axis.y-axis.z*s, oc*axis.z*axis.x+axis.y*s, 0.0f, oc*axis.x*axis.y+axis.z*s, oc*axis.y*axis.y+c, oc*axis.y*axis.z-axis.x*s, 0.0f, oc*axis.z*axis.x-axis.y*s, oc*axis.y*axis.z+axis.x*s, oc*axis.z*axis.z+c, 0.0f, 0.0f, 0.0f, 0.0f, 1.0f);
}

vec3 getRotation(in vec3 pos, in float positionInTime) {
    if(rotation.y==0.0f) {
        return pos;
    }

    vec3 axis=unpackRotationAxis(rotation.x);
    vec3 center=rotationCenter;
    vec3 translated;
    mat4 rotationMatrix;

    float angle=0.0f;
    angle+=when_eq(rotation.z, 0.0f)*rotation.y;
    angle+=when_gt(rotation.z, 0.0f)*mix(0.0f, rotation.y, positionInTime);
    translated=rotationCenter-pos;
    rotationMatrix=getRotationMatrix(axis, angle);
    return center-vec3(rotationMatrix*vec4(translated, 0.0f));
}

#endif

// rotateTexture
vec2 vUv=vec2(gl_PointCoord.x, 1.0f-gl_PointCoord.y);

#ifdef SHOULD_ROTATE_TEXTURE

float x=gl_PointCoord.x-0.5f;
float y=1.0f-gl_PointCoord.y-0.5f;
float c=cos(-vAngle);
float s=sin(-vAngle);

vUv=vec2(c*x+s*y+0.5f, c*y-s*x+0.5f);

#endif

// Spritesheets overwrite angle calculations.
#ifdef SHOULD_CALCULATE_SPRITE

float framesX=vSpriteSheet.x;
float framesY=vSpriteSheet.y;
float columnNorm=vSpriteSheet.z;
float rowNorm=vSpriteSheet.w;

vUv.x=gl_PointCoord.x*framesX+columnNorm;
vUv.y=1.0f-(gl_PointCoord.y*framesY+rowNorm);

#endif,

vec4 rotatedTexture=texture2D(tex, vUv);

void main() {

//
// Setup...
//
highp float age=getAge();
highp float alive=getAlive();
highp float maxAge=getMaxAge();
highp float positionInTime=(age/maxAge);
highp float isAlive=when_gt(alive, 0.0f);

#ifdef SHOULD_WIGGLE_PARTICLES
float wiggleAmount=positionInTime*getWiggle();
float wiggleSin=isAlive*sin(wiggleAmount);
float wiggleCos=isAlive*cos(wiggleAmount);
#endif,

//
// Forces
//

// Get forces & position
vec3 vel=getVelocity(age);
vec3 accel=getAcceleration(age);
vec3 force=vec3(0.0f);
vec3 pos=vec3(position);

// Calculate the required drag to apply to the forces.
float drag=1.0f-(positionInTime*0.5f)*acceleration.w;

// Integrate forces...
force+=vel;
force*=drag;
force+=accel*age;
pos+=force;

// Wiggly wiggly wiggle!
#ifdef SHOULD_WIGGLE_PARTICLES
pos.x+=wiggleSin;
pos.y+=wiggleCos;
pos.z+=wiggleSin;
#endif

// Rotate the emitter around its central point
#ifdef SHOULD_ROTATE_PARTICLES
pos=getRotation(pos, positionInTime);
#endif

// Convert pos to a world-space value
vec4 mvPosition=modelViewMatrix*vec4(pos, 1.0f);

// Determine point size.
highp float pointSize=getFloatOverLifetime(positionInTime, size)*isAlive;

// Determine perspective
#ifdef HAS_PERSPECTIVE
float perspective=scale/length(mvPosition.xyz);
#else
float perspective=1.0f;
#endif

// Apply perpective to pointSize value
float pointSizePerspective=pointSize*perspective;

//
// Appearance
//

// Determine color and opacity for this particle
#ifdef COLORIZE
vec3 c=isAlive*getColorOverLifetime(positionInTime,, unpackColor(color.x), unpackColor(color.y), unpackColor(color.z), unpackColor(color.w));
#else
vec3 c=vec3(1.0f);
#endif

float o=isAlive*getFloatOverLifetime(positionInTime, opacity);

// Assign color to vColor varying.
vColor=vec4(c, o);

// Determine angle
#ifdef SHOULD_ROTATE_TEXTURE
vAngle=isAlive*getFloatOverLifetime(positionInTime, angle);
#endif

// If this particle is using a sprite-sheet as a texture, well have to figure out
// what frame of the texture the particle is using at its current position in time.
#ifdef SHOULD_CALCULATE_SPRITE
float framesX=textureAnimation.x;
float framesY=textureAnimation.y;
float loopCount=textureAnimation.w;
float totalFrames=textureAnimation.z;
float frameNumber=mod((positionInTime*loopCount)*totalFrames, totalFrames);

float column=floor(mod(frameNumber, framesX));
float row=floor((frameNumber-column)/framesX);

float columnNorm=column/framesX;
float rowNorm=row/framesY;

vSpriteSheet.x=1.0f/framesX;
vSpriteSheet.y=1.0f/framesY;
vSpriteSheet.z=columnNorm;
vSpriteSheet.w=rowNorm;
#endif

//
// Write values
//

// Set PointSize according to size at current point in time.
gl_PointSize=pointSizePerspective;
gl_Position=projectionMatrix*mvPosition;

//THREE.ShaderChunk.logdepthbuf_vertex
#ifdef USE_LOGDEPTHBUF

	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );

#endif


//THREE.ShaderChunk.fog_vertex,
#ifdef USE_FOG

	vFogDepth = - mvPosition.z;

#endif

}