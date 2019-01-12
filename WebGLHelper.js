var WebGLHelper = {};

WebGLHelper.fov = 70;

WebGLHelper.vertexShaderSource = 
`
attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;

uniform mat4 u_world;
uniform mat4 u_camera;
uniform mat4 u_view;
uniform vec4 u_lightPosition;
uniform vec3 u_cameraPosition;

varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_toLight;
varying vec3 v_toCamera;

void main()
{
    gl_Position = u_view * u_camera * u_world * a_position; // u_view * u_camera * u_world * 

    v_normal = mat3(u_world) * (a_normal);

    vec4 worldPos = u_world * a_position;
    vec4 lightPos = u_lightPosition;

    v_toLight = (lightPos - worldPos).xyz;
    v_toCamera = u_cameraPosition - worldPos.xyz;

    v_texCoord = a_texCoord;
}
`;

WebGLHelper.fragmentShaderSource = 
`
precision mediump float;

uniform sampler2D u_image;
uniform float u_shine;
uniform vec4 u_color;

varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_toLight;
varying vec3 v_toCamera;

void main()
{
    vec4 color = texture2D(u_image, v_texCoord);
    color.a = 1.0;

    vec3 normal = normalize(v_normal);
    vec3 toLight = normalize(v_toLight.xyz);
    vec3 toCamera = normalize(v_toCamera.xyz);

    float lightValue = dot(toLight, normal);

    vec3 halfVector = normalize(toLight + toCamera);
    float specular = dot(normal, halfVector);

    if(specular > 0.0 && lightValue > 0.0)
    {
        specular = pow(specular, u_shine);
    }
    else
    {
        specular = 0.0;
    }

    if(lightValue < 0.2)
    {
        lightValue = 0.2;
    }

    color.rgb *= lightValue;
    color.rgb += specular;

    gl_FragColor = color;
}
`;

WebGLHelper.compileShader = function(gl, shaderType, shaderSource)
{
    gl = gl || WebGLHelper.gl;
    
    var shader = gl.createShader(shaderType);

    gl.shaderSource(shader, shaderSource);

    gl.compileShader(shader);

    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        return shader;
    }
    else
    {
        console.error("Shader Compile Error: " + gl.getShaderInfoLog(shader));

        gl.deleteShader(shader);
    }
};

WebGLHelper.linkProgram = function(gl, vertexShader, fragmentShader)
{
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if(gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        return program;
    }
    else
    {
        console.error("Program Link Error: " + gl.getProgramInfoLog(program));

        gl.deleteProgram(program);
    }
};

WebGLHelper.lookUpLocations = function(locationsToFind, lookupFunction)
{
    var locations = {};
    for(var index = 0; index < locationsToFind.length; index++)
    {
        locations[ locationsToFind[index] ] = 
                lookupFunction(locationsToFind[index]);
    }

    return locations;
};

WebGLHelper.getContext = function()
{
    if(!WebGLHelper.gl)
    {
        WebGLHelper.canvas = document.createElement("canvas");
        WebGLHelper.gl = WebGLHelper.canvas.getContext("webgl")
             || WebGLHelper.canvas.getContext("experimental-webgl");

        var gl = WebGLHelper.gl;
        
        // Shader and setup.
        WebGLHelper.vertexShader = WebGLHelper.compileShader(gl,
             gl.VERTEX_SHADER, WebGLHelper.vertexShaderSource);
        WebGLHelper.fragmentShader = WebGLHelper.compileShader(gl,
             gl.FRAGMENT_SHADER, WebGLHelper.fragmentShaderSource);

        WebGLHelper.program = WebGLHelper.linkProgram(gl, 
                WebGLHelper.vertexShader, WebGLHelper.fragmentShader);
        var program = WebGLHelper.program;

        gl.useProgram(program);

        WebGLHelper.gl.clearColor(0.0, 0.0, 1.0, 1.0);

        // Create Matricies.
        var worldMatrix = new Matrix(4, 4);

        worldMatrix.toIdentityMatrix();
        WebGLHelper.worldMatrix = worldMatrix;

        var viewMatrix = Mat44Helper.perspective(WebGLHelper.fov * Math.PI / 180, // 70 degree view
                1,
                2000,
                gl.drawingBufferHeight / gl.drawingBufferWidth).getInverse();
        WebGLHelper.viewMatrix = viewMatrix;
        
        var cameraMatrix = new Matrix(4, 4);
        cameraMatrix.toIdentityMatrix();
        WebGLHelper.cameraMatrix = cameraMatrix;

        var locationsToFind = ["u_world", "u_view", "u_camera"];

        WebGLHelper.matrixLocations = {};

        for(var index = 0; index < locationsToFind.length; index++)
        {
            WebGLHelper.matrixLocations[ locationsToFind[index] ] = 
                    gl.getUniformLocation(WebGLHelper.program, locationsToFind[index]);
        }

        locationsToFind = ["a_position", "a_normal", "a_texCoord"];

        WebGLHelper.attribLocations = {};

        for(var index = 0; index < locationsToFind.length; index++)
        {
            WebGLHelper.attribLocations[ locationsToFind[index] ] = 
                    gl.getAttribLocation(WebGLHelper.program, locationsToFind[index]);

            if(WebGLHelper.attribLocations[ locationsToFind[index] ] === -1)
            {
                WebGLHelper.attribLocations[ locationsToFind[index] ] = 2;
            }
            console.log(locationsToFind[index] + ": " + WebGLHelper.attribLocations[ locationsToFind[index] ]);
        }

        WebGLHelper.vertexBuffer = WebGLHelper.gl.createBuffer();
        WebGLHelper.gl.bindBuffer(WebGLHelper.gl.ARRAY_BUFFER, WebGLHelper.vertexBuffer);

        var verticies = object3D.getScaledCubeVerticies(1 / 20);
        WebGLHelper.verticies = verticies;

        WebGLHelper.gl.enableVertexAttribArray(WebGLHelper.attribLocations.a_position);

        WebGLHelper.gl.vertexAttribPointer(WebGLHelper.attribLocations.a_position, 
                3, // Use 3 elements per calling of shader.
                gl.FLOAT, // Data type.
                false, // No normalization.
                0, 0); // Stride and offset.

        gl.bufferData(WebGLHelper.gl.ARRAY_BUFFER, new Float32Array(verticies),
                gl.STATIC_DRAW);

        WebGLHelper.normalsBuffer = WebGLHelper.gl.createBuffer();
        WebGLHelper.gl.bindBuffer(WebGLHelper.gl.ARRAY_BUFFER, WebGLHelper.normalsBuffer);

        var normals = object3D.getNormals(verticies, true);

        WebGLHelper.gl.enableVertexAttribArray(WebGLHelper.attribLocations.a_normal);

        WebGLHelper.gl.vertexAttribPointer(WebGLHelper.attribLocations.a_normal, 
                3, // Use 3 elements per calling of shader.
                gl.FLOAT, // Data type.
                false, // No normalization.
                0, 0); // Stride and offset.

        gl.bufferData(WebGLHelper.gl.ARRAY_BUFFER, new Float32Array(normals),
                gl.STATIC_DRAW);


        WebGLHelper.texCoordsBuffer = WebGLHelper.gl.createBuffer();
        WebGLHelper.gl.bindBuffer(WebGLHelper.gl.ARRAY_BUFFER, WebGLHelper.texCoordsBuffer);

        var texCoords = object3D.getTextureLocations(verticies.length / 3);

        WebGLHelper.gl.enableVertexAttribArray(WebGLHelper.attribLocations.a_texCoord);

        WebGLHelper.gl.vertexAttribPointer(WebGLHelper.attribLocations.a_texCoord, 
                2, // Use 2 elements per calling of shader.
                gl.FLOAT, // Data type.
                false, // No normalization.
                0, 0); // Stride and offset.

        gl.bufferData(WebGLHelper.gl.ARRAY_BUFFER, new Float32Array(texCoords),
                gl.STATIC_DRAW);

        WebGLHelper.lightPositionLocation = WebGLHelper.gl.getUniformLocation(program, "u_lightPosition");
        WebGLHelper.cameraPositionLocation = WebGLHelper.gl.getUniformLocation(program, "u_cameraPosition");
        WebGLHelper.shineLocation = WebGLHelper.gl.getUniformLocation(program, "u_shine");

        WebGLHelper.lightPosition = new Vector3(0, 0.0, 3.0);
        WebGLHelper.cameraPosition = new Vector3(0, 0.0, 3.0);
        WebGLHelper.upDirection = new Vector3(0.0, 1.0, 0.0);
        WebGLHelper.lookAt = new Vector3(0.0, 0.0, 0.0);

        WebGLHelper.setSpecular(150.0);

        WebGLHelper.updateLightLocation();
        WebGLHelper.updateCameraLocation();

        WebGLHelper.resetCameraMatrix();

        WebGLHelper.updateMatricies(true, true, true);

        WebGLHelper.gl.enable(gl.CULL_FACE);
        WebGLHelper.gl.enable(gl.DEPTH_TEST);

        WebGLHelper.createTexture();
    }

    return WebGLHelper.gl;
};

WebGLHelper.updateMatricies = function(updateView, updateWorld, updateCamera)
{
    var gl = WebGLHelper.getContext();

    if(updateView)
    {
        gl.uniformMatrix4fv(WebGLHelper.matrixLocations.u_view, false, 
                WebGLHelper.viewMatrix.to1DArray());
    }

    if(updateWorld)
    {
        gl.uniformMatrix4fv(WebGLHelper.matrixLocations.u_world, false, 
                WebGLHelper.worldMatrix.to1DArray());
    }

    if(updateCamera)
    {
        gl.uniformMatrix4fv(WebGLHelper.matrixLocations.u_camera, false, 
                WebGLHelper.cameraMatrix.to1DArray());
    }
};

WebGLHelper.clear = function()
{
    var gl = WebGLHelper.getContext();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

WebGLHelper.resizeTo = function(width, height)
{
    var gl = WebGLHelper.getContext();

    if(width !== WebGLHelper.gl.canvas.width || height !== WebGLHelper.canvas.height)
    {
        WebGLHelper.gl.canvas.width = width;
        WebGLHelper.gl.canvas.height = height;

        WebGLHelper.gl.viewport(0, 0, 
                WebGLHelper.gl.drawingBufferWidth, WebGLHelper.gl.drawingBufferHeight);

        WebGLHelper.viewMatrix = Mat44Helper.perspective(WebGLHelper.fov * Math.PI / 180, // 70 degree view
                    1, // zNear
                    2000, // zFar
                    gl.drawingBufferHeight / gl.drawingBufferWidth); // Aspect

        //WebGLHelper.viewMatrix.toIdentityMatrix();

        WebGLHelper.updateMatricies(true, false, false);
    }
};

WebGLHelper.updateLightLocation = function()
{
    WebGLHelper.getContext();

    var lightPositionArray = WebGLHelper.lightPosition.toArray();
    lightPositionArray.push(0.0);

    WebGLHelper.gl.uniform4fv(WebGLHelper.lightPositionLocation, lightPositionArray);
};

WebGLHelper.updateCameraLocation = function()
{
    WebGLHelper.getContext();

    var cameraPositionArray = WebGLHelper.cameraPosition.toArray();

    WebGLHelper.gl.uniform3fv(WebGLHelper.cameraPositionLocation, cameraPositionArray);
};

WebGLHelper.resetCameraMatrix = function()
{
    WebGLHelper.getContext();

    WebGLHelper.cameraMatrix = Mat44Helper.lookAt(WebGLHelper.cameraPosition,
        WebGLHelper.upDirection, WebGLHelper.lookAt);
};

WebGLHelper.setSpecular = function(shine)
{
    WebGLHelper.getContext();

    WebGLHelper.gl.uniform1f(WebGLHelper.shineLocation, shine);
};

WebGLHelper.createTexture = function()
{
    var gl = WebGLHelper.getContext();
    var texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Allow non-power of two textures.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
};

WebGLHelper.imageToTexture = function(image)
{
    var gl = WebGLHelper.getContext();

    try
    {
        gl.texImage2D(gl.TEXTURE_2D, //Target
            0, // Level
            gl.RGBA, gl.RGBA, // Internal and external format.
            gl.UNSIGNED_BYTE, // Source format/
            image); // Source
    }
    catch(e)
    {
        console.warn(e);
    }
};

WebGLHelper.renderObject = function()
{
    var gl = WebGLHelper.getContext();
    gl.drawArrays(gl.TRIANGLES, 
        0, // Offset
        WebGLHelper.verticies.length / 3); // Verticies length.
};

WebGLHelper.setClearColorString = function(colorString)
{
    var gl = WebGLHelper.getContext();

    if(colorString != WebGLHelper.lastColorString)
    {
        var parts = JSHelper.colorStringToArray(colorString);

        if(parts.length >= 4)
        {
            gl.clearColor(parts[0], parts[1], parts[2], parts[3]);
        }
        else
        {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
        }

        console.log("Updated! Color: " + JSON.stringify(parts));
        WebGLHelper.lastColorString = colorString;
    }
};
