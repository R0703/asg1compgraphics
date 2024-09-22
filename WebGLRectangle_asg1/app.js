// Wait for the page to load
window.onload = function() {
    // Get the canvas element
    const canvas = document.getElementById('glCanvas');
    
    // Set a fixed width and height for the canvas
    canvas.width = 1000;
    canvas.height = 700;

    // Initialize the GL context
    const gl = canvas.getContext('webgl');

    // Only continue if WebGL is available and working
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser may not support it.');
        return;
    }

    // Function to set up the viewport and draw the scene
    function setupCanvasAndViewport() {
        // Set the viewport to match the canvas size
        gl.viewport(0, 0, canvas.width, canvas.height);
        // Redraw the scene
        drawScene();
    }

    // Set color
    gl.clearColor(0.53, 0.81, 0.92, 1.0);

    // Vertex shader program
    const vsSource = `
        attribute vec4 aVertexPosition;
        void main() {
            gl_Position = aVertexPosition;
        }
    `;

    // Fragment shader program (with uniform for color)
    const fsSource = `
        precision mediump float;
        uniform vec4 uFragColor;
        void main() {
            gl_FragColor = uFragColor;
        }
    `;

    // Initialize a shader program
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Get the attribute location for vertex position
    const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    
    // Get the uniform location for fragment color
    const fragColorLocation = gl.getUniformLocation(shaderProgram, 'uFragColor');

    // Create a buffer for the rectangle's positions
    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer operations to
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Create an array of positions for the rectangle (still covering [-0.5, 0.5] range)
    const positions = [
        -0.6,  0.5,
         0.4,  0.5,
        -0.6, -0.5,
         0.4, -0.5,
    ];

    // Pass the list of positions into WebGL to build the shape
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute
    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosition);

    // Use our shader program
    gl.useProgram(shaderProgram);

    // Initial color (light pink)
    let currentColor = [1.0, 0.84, 0.0, 1.0]; 

    // Function to draw the rectangle
    function drawScene() {
        // Clear the canvas
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Set the color in the fragment shader
        gl.uniform4fv(fragColorLocation, currentColor);

        // Draw the rectangle
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // Initial draw
    setupCanvasAndViewport();

    // Convert mouse coordinates to WebGL coordinates
    function getMousePositionInWebGL(event) {
        // Get the canvas bounding rectangle to adjust for any scrolling or positioning
        const rect = canvas.getBoundingClientRect();

        // Convert the mouse position to WebGL's normalized device coordinates (NDC)
        const x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
        const y = ((rect.bottom - event.clientY) / canvas.height) * 2 - 1;  // Invert y-coordinate for WebGL space

        return { x, y };
    }

    // Check if the click is inside the rectangle
    function isInsideRectangle(x, y) {
        // The rectangle is defined from [-0.5, 0.5] in both X and Y directions in WebGL space
        return (x >= -0.5 && x <= 0.5 && y >= -0.5 && y <= 0.5);
    }

    // Handle click event
    canvas.addEventListener('click', function(event) {
        // Get mouse position in WebGL coordinates
        const mousePos = getMousePositionInWebGL(event);
        
        // Check if the mouse click was inside the rectangle
        if (isInsideRectangle(mousePos.x, mousePos.y)) {
            // Toggle between red and green
            if (currentColor[0] === 0.0) {
                currentColor = [1.0, 0.84, 0.0, 1.0]; //yellow
            } else {
                currentColor = [0.0, 0.8, 0.8, 1.0];  // Switch to cyan
            }
            drawScene();
        }
    });
};

// Initialize a shader program, so WebGL knows how to draw our data
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

// Creates a shader of the given type, uploads the source and compiles it.
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}
