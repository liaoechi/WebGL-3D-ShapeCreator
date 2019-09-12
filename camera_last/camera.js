// John Amanatides, Oct 2015
// interactive webGL program that plays with the camera position
//
// Modified by Juan Guzman and E-Chien (James) Liao

var canvas;
var gl;
var program;

window.onload = init;

var modelViewMatrix, eyeMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var cameraLookFrom = vec3(5, 3, 10);
var cameraLookAt = vec3(0, 0, 0);
var cameraLookUp = vec3(0, 1, 0);
var fovY = 50;
var near = .1;
var far = 100;

var screenWidth, screenHeight, aspectRatio;
var middleX, middleY;
var gridSize = 10;

var vPosition;
var objectColor;
var theta; //used to rotate about the relative X and Y axis

//NEW A3
var MAX_VERTICES = 8;
var shapes = [];
var current_shape = -1;
var drawingShapeActive = false;
var SCALING_BOOL = false;
//var X_CHANGE_START;
//var Y_CHANGE_START;
//var Z_CHANGE_START;

var shearSliderQuadrant;


function init()
{
    canvas = document.getElementById( "gl-canvas" );

    //  Configure WebGL
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.6, 0.6, 0.6, 1.6 );
    
    screenWidth = canvas.width;
    screenHeight = canvas.height;
    middleX = screenWidth / 2;
    middleY = screenHeight / 2;
    aspectRatio = screenWidth/screenHeight;

    //new variables
    var dragAndDropActiveQ1 = false;
    var dragAndDropActiveQ2 = false;
    var dragAndDropActiveQ3 = false;
    var dragAndDropActiveQ4 = false;

    var dragAndDropActiveLookFrom = false;
    var dragAndDropActiveLookAt = false;
    var initialX = 0;
    var initialY = 0;


    //new A3 variables
    var dragAndDropActiveShape = false;
    var dragAndDropActiveScale = false;

    var v4;
    var new_coordinates;

    //  Load shaders 
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(program);
    
    vPosition = gl.getAttribLocation(program, "vPosition");
    objectColor = gl.getUniformLocation(program, "objectColor");
    
    // configure matrices
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    // initialize model
    initGrid(gridSize);
    initScene();

    // start listening to mouse
    canvas.addEventListener('mousedown', function(evt) {
    var rect = canvas.getBoundingClientRect()
		  var x = evt.clientX-rect.left;
		  var y = evt.clientY-rect.top;
        if ( x < middleX && y < middleY) {
            dragAndDropActiveQ1 = true;
            if (SCALING_BOOL == true){
               if (current_shape != -1 && shapes[current_shape].done_drawing == true && 
                   cornerTargetClickedQ1(x,y))
               {
                   dragAndDropActiveScale=true;
               } 

            }
            else if(event.shiftKey){
               if (drawingShapeActive && shapes[current_shape].quadrant != 'Q1'){
                  deleteShape(current_shape);
                  drawingShapeActive = false;
               }
               if (!drawingShapeActive){
                  var new_shape = new shape('Q1');
                  shapes.push(new_shape);
                  current_shape = shapes.length - 1;
                  drawingShapeActive = true;
               }
               new_coordinates = translateGridCoordinatesQ1(x,y, middleX, middleY);
               v4 = vec4(new_coordinates[0],new_coordinates[1],0,1);
               add_vertice(shapes[current_shape], v4);
               if (shapes[current_shape].num_line_vertices >= MAX_VERTICES){
                  endDrawing();
               }
               render();
            }
            else if (cameraTargetClickedQ1(x,y, cameraLookFrom, 0.35)){
                dragAndDropActiveLookFrom = true;
                dragAndDropActiveLookAt = false;
            }
            else if (cameraTargetClickedQ1(x,y, cameraLookAt, 0.2)){
                dragAndDropActiveLookFrom = false;
                dragAndDropActiveLookAt = true;
            }
            else if (shapeClickedQ1(x,y)){
                render();
                dragAndDropActiveShape=true;
            }
            else{
               if (current_shape != -1 && shapes[current_shape].done_drawing == true){
                  current_shape = -1;
                  render();
               }
            }
        } 
        else if ( x < middleX && y > middleY) {
            dragAndDropActiveQ3 = true;
            if (SCALING_BOOL == true){
               if (current_shape != -1 && shapes[current_shape].done_drawing == true &&
                   cornerTargetClickedQ3(x,y))
               {
                   dragAndDropActiveScale=true;
               } 

            }
            else if(event.shiftKey){
               if (drawingShapeActive && shapes[current_shape].quadrant != 'Q3'){
                  deleteShape(current_shape);
                  drawingShapeActive = false;
               }
               if (!drawingShapeActive){
                  var new_shape = new shape('Q3');
                  shapes.push(new_shape);
                  current_shape = shapes.length - 1;
                  drawingShapeActive = true;
               }
               new_coordinates = translateGridCoordinatesQ3(x,y, middleX, middleY);
               v4 = vec4(new_coordinates[0],0,new_coordinates[1],1);
               add_vertice(shapes[current_shape], v4);
               if (shapes[current_shape].num_line_vertices >= MAX_VERTICES){
                  endDrawing();
               }
               render();
            }
            else if (cameraTargetClickedQ3(x,y, cameraLookFrom, 0.35)) {
                dragAndDropActiveLookFrom = true;
                dragAndDropActiveLookAt = false;
            }
            else if (cameraTargetClickedQ3(x,y, cameraLookAt, 0.2)){
                dragAndDropActiveLookFrom = false;
                dragAndDropActiveLookAt = true;
            }
            else if (shapeClickedQ3(x,y)){
                dragAndDropActiveShape=true;
                render();
            }
            else{
               if (current_shape != -1 && shapes[current_shape].done_drawing == true){
                  current_shape = -1;
                  render();
               }
            }
        }
        else if ( x > middleX && y > middleY){
            dragAndDropActiveQ4 = true;
            if (SCALING_BOOL == true){
               if (current_shape != -1 && shapes[current_shape].done_drawing == true &&
                   cornerTargetClickedQ4(x,y))
               {
                   dragAndDropActiveScale=true;
               } 

            }
            else if(event.shiftKey){
               if (drawingShapeActive && shapes[current_shape].quadrant != 'Q4'){
                  deleteShape(current_shape);
                  drawingShapeActive = false;
               }
               if (!drawingShapeActive){
                  var new_shape = new shape('Q4');
                  shapes.push(new_shape);
                  current_shape = shapes.length - 1;
                  drawingShapeActive = true;
               }
               new_coordinates = translateGridCoordinatesQ4(x,y, middleX, middleY);
               v4 = vec4(0,new_coordinates[0],new_coordinates[1],1);
               add_vertice(shapes[current_shape], v4);
               if (shapes[current_shape].num_line_vertices >= MAX_VERTICES){
                  endDrawing();
               }
               render();
            }

            else if (cameraTargetClickedQ4(x,y,cameraLookFrom, 0.35)){
                dragAndDropActiveLookFrom = true;
                dragAndDropActiveLookAt = false;
            } 
            else if (cameraTargetClickedQ4(x,y, cameraLookAt, 0.2)){
                dragAndDropActiveLookFrom = false;
                dragAndDropActiveLookAt = true;
            }
            else if (shapeClickedQ4(x,y)){
                dragAndDropActiveShape=true;
                render();
            }
            else{
               if (current_shape != -1 && shapes[current_shape].done_drawing == true){
                  current_shape = -1;
                  render();
               }
            }
        }
        else if (x > middleX && y < middleY) { //checks if the perspective view window is being clicked
            dragAndDropActiveQ2 = true;
            initialX = x;
            initialY = y;
        }
    })
	 canvas.addEventListener('mouseup', function(evt) {
        var rect = canvas.getBoundingClientRect()
        var x = evt.clientX-rect.left;
        var y = evt.clientY-rect.top;
        dragAndDropActiveQ1 = false;
        dragAndDropActiveQ3 = false;
        dragAndDropActiveQ4 = false;
        dragAndDropActiveQ2 = false;
        dragAndDropActiveLookFrom = false;
        dragAndDropActiveLookAt = false;
        dragAndDropActiveShape=false;
        dragAndDropActiveScale=false;
        SCALING_BOOL=false;

    })
    canvas.addEventListener('mousemove', function(evt) {
        var rect = canvas.getBoundingClientRect()
        var x = evt.clientX-rect.left;
        var y = evt.clientY-rect.top;

        if (dragAndDropActiveQ1) {
            if (dragAndDropActiveLookFrom) { 
                handleLookFromQ1(x,y);
            }
            else if (dragAndDropActiveLookAt){
                handleLookAtQ1(x,y);
            }
            else if (dragAndDropActiveShape){
                handleShapeTranslationQ1(x,y);
            }
            else if (dragAndDropActiveScale){
                handleShapeScaleQ1(x,y);
            }
        }
        else if (dragAndDropActiveQ3) {
            if (dragAndDropActiveLookFrom) { 
                handleLookFromQ3(x,y);
            }
            else if (dragAndDropActiveLookAt){
                handleLookAtQ3(x,y)
            }
            else if (dragAndDropActiveShape){
                handleShapeTranslationQ3(x,y);
            }
            else if (dragAndDropActiveScale){
                handleShapeScaleQ3(x,y);
            }
        }
        else if (dragAndDropActiveQ4) {
            if (dragAndDropActiveLookFrom) { 
                handleLookFromQ4(x,y);
            }
            else if (dragAndDropActiveLookAt){
                handleLookAtQ4(x,y)
            }
            else if (dragAndDropActiveShape){
                handleShapeTranslationQ4(x,y);
            }
            else if (dragAndDropActiveScale){
                handleShapeScaleQ4(x,y);
            }
        }
        else if (dragAndDropActiveQ2){ 
		    //perspectie view hold and drag camera rotation
		    //keep track of initial mouse coordinate and the change in mouse coordinate as it updates
			
            var xdelta = x - initialX; 
            var ydelta = y - initialY;
			
            //used for rotating active shape
            if(evt.shiftKey && current_shape != -1){
               
               //rotation -1/1 means neg/pos rotation around relative Y-axis
               //rotate -2/2 means neg/pos rotation around relative X-axis
               
               //horizontal rotation
               shapes[current_shape].oldLookFrom = cameraLookFrom;
               
               if(xdelta < 0){
                  shapes[current_shape].zRotAng += Math.PI/4;
                  render();
               }
               if(xdelta > 0){
                  shapes[current_shape].zRotAng -= Math.PI/4;
                  render();
               }
               
               //vertical rotation
               if(ydelta < 0){
                  shapes[current_shape].xRotAng += Math.PI/4;
                  render();
               }
               if(ydelta > 0){
                  shapes[current_shape].xRotAng -= Math.PI/4;
                  render();
               }
               
               initialX = x;
               initialY = y;
            }
            
			if(!evt.shiftKey){
            
            console.log('deltas: '+ xdelta + ' ' + ydelta);
            if(xdelta != 0){
			    //rotate horizontally
                rotateXYZ(xdelta, 'X');
            }
		 
            if(ydelta != 0){
			    //rotate vertically
                rotateXYZ(ydelta, 'Y');
            }

            initialX = x;
            initialY = y;  
            render();
        }
      }
    })
    window.addEventListener('keyup', function(evt) {
        var key = event.keyCode;
        if(key == 90){
           SCALING_BOOL = false;
           render();
        }

    }, false)
	
    //custom event listeners for wheelmouse
    window.addEventListener('mousewheel', function(evt) {
        if(!event.shiftKey){
           var direction = evt.wheelDelta;
           //wheelmouse down = zoom in
           if( direction < 0 && gridSize > 2 && !evt.shiftKey){
               cameraLookFrom = add(cameraLookFrom,  mult(vec3(0.2, 0.2, 0.2), subtract(cameraLookAt,cameraLookFrom)));
               gridSize = gridSize - 2;
               render();
           }
           //wheelmouse up = zoom out
           if( direction > 0 && gridSize < 12 && !evt.shiftKey){
               cameraLookFrom = add(cameraLookFrom,  mult(vec3(-.25, -.25, -.25), subtract(cameraLookAt,cameraLookFrom)));
               gridSize = gridSize + 2;
               render();
           }
        }
        else{
           var direction = evt.wheelDelta;
           if( direction < 0 && (shapes[current_shape].scale[0] + 10/100) <= 2){
              shapes[current_shape].scale = vec3(shapes[current_shape].scale[0] + 10/100, 
              shapes[current_shape].scale[1] + 10/100, 
              shapes[current_shape].scale[2] + 10/100);
              render();
           }
           if( direction > 0 && (shapes[current_shape].scale[0] - 10/100) > (10/100)){
              shapes[current_shape].scale = vec3(shapes[current_shape].scale[0] - 10/100, 
              shapes[current_shape].scale[1] - 10/100, 
              shapes[current_shape].scale[2] - 10/100);
              render();
           }
		}

    }, false)
 
    //custom event listeners for direction keys
    window.addEventListener('keydown', function(evt) {
        var key = event.keyCode;
        var keyval = 'none';
        var diff = subtract(cameraLookAt, cameraLookFrom);
        diff[1] = 0;
        diff = mult(diff, vec3(0.1, 0.1, 0.1));
		
        //pan left 'A'
        if(key == 65){
            cameraLookFrom = add(cameraLookFrom, vec3(diff[2], 0, -1*diff[0]));
            cameraLookAt = add(cameraLookAt, vec3(diff[2], 0, -1*diff[0]));
            render();
        }
		
        //pan right 'D'
        if(key == 68){
            cameraLookFrom = add(cameraLookFrom, vec3(-1*diff[2], 0, diff[0]));
            cameraLookAt = add(cameraLookAt, vec3(-1*diff[2], 0, diff[0]));
            render();
        }
		
        //pan forward 'W'
        if(key == 87){
            cameraLookFrom = add(cameraLookFrom, vec3(diff[0], 0,diff[2]));
            cameraLookAt = add(cameraLookAt, vec3(diff[0], 0,diff[2]));
            render();
        }
		
        //pan backwards 'S'
        if(key == 83){
            cameraLookFrom = add(cameraLookFrom,vec3(-1*diff[0], 0,-1*diff[2]));
            cameraLookAt = add(cameraLookAt, vec3(-1*diff[0], 0,-1*diff[2]));
            render();
        }
        //pan up 'Q'
        if(key == 81){
            cameraLookFrom = add(cameraLookFrom, vec3(0,.2,0));
            cameraLookAt = add(cameraLookAt, vec3(0,.2,0));
            render();
        }
        //pan down 'E'
        if(key == 69){
            cameraLookFrom = add(cameraLookFrom, vec3(0,-.2,0));
            cameraLookAt = add(cameraLookAt, vec3(0,-.2,0));
            render();
        }
        //ESC to deselect shape
        if(key == 27){
            if (current_shape != -1 && shapes[current_shape].done_drawing==true){
               current_shape=-1;
               render();
            }
        }
		
        //ENTER to look @ Center
        if(key == 13){
            cameraLookAt = vec3(0,0,0);
            render();
        }

        //ENTER to look @ Center
        if(key == 90){
           SCALING_BOOL = true;
           render();
        }

        //DEL to delete currently clicked shape
        if(key == 46 || key == 8){
           deleteShape(current_shape);
        }})
	
    render();
};


function render()
{
    updateValues();
    gl.clear(gl.COLOR_BUFFER_BIT);
       
	 // size orthographic views
	 var range= gridSize*aspectRatio + 1;
    projectionMatrix = ortho(-gridSize*aspectRatio, gridSize*aspectRatio,
     					-gridSize, gridSize, -gridSize*aspectRatio, gridSize*aspectRatio);

     // draw XY ortho in top-left quadrant
     gl.viewport(0, middleY, middleX, middleY);
     eyeMatrix = lookAt(vec3(0,0,0), vec3(0,0,-1), vec3(0, 1, 0));
     setMatricies();
     drawGrid('XY', range);
     drawScene();
     drawCam();
     drawShapes(shapes, true); //true to draw bounding box
     
     // draw xz ortho in bottom left quadrant 
     gl.viewport(0, 0, middleX, middleY);
     eyeMatrix = lookAt(vec3(0, 0, 0), vec3(0, -1, 0), vec3(0, 0, -1));
     setMatricies();
     drawGrid('XZ', range);
     drawScene();
     drawCam();
     drawShapes(shapes, true);//true to draw bounding box

     
     // draw yz ortho in bottom right quadrant 
     gl.viewport(middleX, 0, middleX, middleY);
     eyeMatrix = lookAt(vec3(0,0,0), vec3(-1,0,0), vec3(0, 1, 0));
     setMatricies();
     drawGrid('YZ', range);
     drawScene();
     drawCam();
     drawShapes(shapes, true);//true to draw bounding box


     // draw perspective view in top right quadrant
     gl.viewport(middleX, middleY, middleX, middleY);
     projectionMatrix = perspective(fovY, aspectRatio, near, far);
     eyeMatrix = lookAt(cameraLookFrom, cameraLookAt, cameraLookUp);
	   setMatricies();
     drawScene();  // wireframe for now
     drawShapes(shapes, false);//false (do not draw boudning box)

     //drawCam();
     
     // draw quadrant boundaries
     gl.viewport(0, 0, screenWidth, screenHeight);
     projectionMatrix = ortho(-1, 1, -1, 1, -1, 1);
	   eyeMatrix = lookAt(vec3(0,0,0.5), vec3(0,0,0), vec3(0, 1, 0));
     setMatricies();
     drawQuadrantBoundaries();
}

function setMatricies() {
    modelViewMatrix = eyeMatrix;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
}

/*
    translateGridCoordinates

    This function takes in x,y mouse coordinates and returns 
    the in-grid coordinates, relative to the grid's axises

    Input: 
        x: x mouse coordinate
        y: y mouse coordinate
        quadrant_width: the width of the quadrant
        quadrant_height: the height of the quadrant

    Returns:
        vec2: two new in-grid coordinates (relative to grid's axis)
*/
function translateGridCoordinates (x,y,quadrant_width, quadrant_height){
    var factor = ((middleY-1)/2)/gridSize;

    mid_x = quadrant_width / 2;
    mid_y = quadrant_height / 2;

    var grid_x = x - mid_x;
    var grid_y = mid_y - y;

    grid_x = grid_x/factor;
    grid_y = grid_y/factor;

    return vec2(grid_x, grid_y);
}

/*
    translateGridCoordinatesQ1

    This function calls translateGridCoordinates to translate
    mouse x/y coordinates into Q1 in-grid coordinates, relative to the grid's axises

    Input: 
        x: x mouse coordinate
        y: y mouse coordinate
        quadrant_width: the width of the quadrant
        quadrant_height: the height of the quadrant

    Returns:
        vec2: two new in-grid coordinates (relative to grid's axis)
*/
function translateGridCoordinatesQ1 (x,y,quadrant_width, quadrant_height){
    return translateGridCoordinates (x,y,quadrant_width, quadrant_height);
}

/*
    translateGridCoordinatesQ3

    This function calls translateGridCoordinates to translate
    mouse x/y coordinates into Q3 in-grid coordinates, relative to the grid's axises

    Input: 
        x: x mouse coordinate
        y: y mouse coordinate
        quadrant_width: the width of the quadrant
        quadrant_height: the height of the quadrant

    Returns:
        vec2: two new in-grid coordinates (relative to grid's axis)
*/
function translateGridCoordinatesQ3 (x,y,quadrant_width, quadrant_height){
    var newCoordinates = translateGridCoordinates (x,y - quadrant_height ,quadrant_width, quadrant_height);
    return vec2(newCoordinates[0], -newCoordinates[1]); //since second axis is negative
}

/*
    translateGridCoordinatesQ4

    This function calls translateGridCoordinates to translate
    mouse x/y coordinates into Q4 in-grid coordinates, relative to the grid's axises

    Input: 
        x: x mouse coordinate
        y: y mouse coordinate
        quadrant_width: the width of the quadrant
        quadrant_height: the height of the quadrant

    Returns:
        vec2: two new in-grid coordinates (relative to grid's axis)
*/
function translateGridCoordinatesQ4 (x,y,quadrant_width, quadrant_height){
    var newCoordinates = translateGridCoordinates (x - quadrant_width, y-quadrant_height,quadrant_width, quadrant_height);
    return vec2(newCoordinates[1], -newCoordinates[0]); //since axis are flipped, and second is negative
}

/*
    cameraTargetClicked

    This function takes in grid coordinates as well as a target (position) vector
    and the size of the target, and determines if the grid coordinates clicked
    where inside the target

    Input: 
        clickGridCoordinates: coodrinates of the target's position
        cameraTargetVector: position of the target (cameraLookFrom or cameraLookAt)
        targetSize: the length of one side of the target

    Returns:
        true: if the clicked coordinates are INSIDE the target
        false: if the clicked coordinates are OUTSIDE the target

*/
function cameraTargetClicked(clickGridCoordinates, cameraTargetVector, targetSize){
    if ( (clickGridCoordinates[0] <= (cameraTargetVector[0] + targetSize)) && 
         (clickGridCoordinates[0] >= (cameraTargetVector[0] - targetSize)) && 
         (clickGridCoordinates[1] <= (cameraTargetVector[1] + targetSize)) && 
         (clickGridCoordinates[1] >= (cameraTargetVector[1] - targetSize)) 
       )
    {
        return true;
    } 
    return false; //else
}

/*
    cameraTargetClickedQ1

    This function takes in grid coordinates as well as a target (position) vector
    and the size of the target, and determines if the grid coordinates clicked
    where inside the target by calling cameraTargetClicked after translating the 
    incoming coordinates into Q1 coordinates

    Input: 
        clickGridCoordinates: coodrinates of the target's position
        cameraTargetVector: position of the target (cameraLookFrom or cameraLookAt)
        targetSize: the length of one side of the target

    Returns:
        true: if the clicked coordinates are INSIDE the target
        false: if the clicked coordinates are OUTSIDE the target

*/
function cameraTargetClickedQ1(x,y, cameraTargetVector, targetSize){
    var clickGridCoordinates = translateGridCoordinatesQ1 (x,y,middleX, middleY);
    return cameraTargetClicked(clickGridCoordinates, vec2(cameraTargetVector[0], cameraTargetVector[1]), targetSize);
}

/*
    cameraTargetClickedQ3

    This function takes in grid coordinates as well as a target (position) vector
    and the size of the target, and determines if the grid coordinates clicked
    where inside the target by calling cameraTargetClicked after translating the 
    incoming coordinates into Q3 coordinates

    Input: 
        clickGridCoordinates: coodrinates of the target's position
        cameraTargetVector: position of the target (cameraLookFrom or cameraLookAt)
        targetSize: the length of one side of the target

    Returns:
        true: if the clicked coordinates are INSIDE the target
        false: if the clicked coordinates are OUTSIDE the target

*/
function cameraTargetClickedQ3(x,y, cameraTargetVector, targetSize){
    var clickGridCoordinates = translateGridCoordinatesQ3 (x,y,middleX, middleY);
    return cameraTargetClicked(clickGridCoordinates, vec2(cameraTargetVector[0], cameraTargetVector[2]), targetSize);
}

/*
    cameraTargetClickedQ4

    This function takes in grid coordinates as well as a target (position) vector
    and the size of the target, and determines if the grid coordinates clicked
    where inside the target by calling cameraTargetClicked after translating the 
    incoming coordinates into Q4 coordinates

    Input: 
        clickGridCoordinates: coodrinates of the target's position
        cameraTargetVector: position of the target (cameraLookFrom or cameraLookAt)
        targetSize: the length of one side of the target

    Returns:
        true: if the clicked coordinates are INSIDE the target
        false: if the clicked coordinates are OUTSIDE the target

*/
function cameraTargetClickedQ4(x,y, cameraTargetVector, targetSize){
    var clickGridCoordinates = translateGridCoordinatesQ4 (x,y,middleX, middleY);
    return cameraTargetClicked(clickGridCoordinates, vec2(cameraTargetVector[1], cameraTargetVector[2]), targetSize);
}


/*
    handleLookFromQ1

    This function handles the movement of the LookFrom camera target in Q1. It takes in
    x,y screen coordinates and translate's them into grid coordinates, and changes the (x,y) position of 
    the cameraLookFrom target.

    Input: 
        x: x-coordinate of the mouse on screen
        y: y-coordinate of the mouse on screen

    Returns:
        N/A

*/
function handleLookFromQ1(x,y){
    new_coordinates = translateGridCoordinatesQ1(x,y, middleX, middleY);

    cameraLookFrom = vec3(new_coordinates[0], new_coordinates[1], cameraLookFrom[2]);
      
    new_max_coordinates = translateGridCoordinatesQ1(middleX, middleY, middleX, middleY);
    new_min_coordinates = translateGridCoordinatesQ1(0, 0, middleX, middleY);

    //make sure the cameraLookFrom is bounded
    cameraLookFrom[0] = Math.max(Math.min(cameraLookFrom[0], new_max_coordinates[0]), new_min_coordinates[0]);
    cameraLookFrom[1] = Math.min(Math.max(cameraLookFrom[1], new_max_coordinates[1]), new_min_coordinates[1]);

    render();
}

/*
    handleLookFromQ3

    This function handles the movement of the LookFrom camera target in Q3. It takes in
    x,y screen coordinates and translate's them into grid coordinates, and changes the (x,z) position of 
    the cameraLookFrom target.

    Input: 
        x: x-coordinate of the mouse on screen
        y: y-coordinate of the mouse on screen

    Returns:
        N/A

*/
function handleLookFromQ3(x,y){
    new_coordinates = translateGridCoordinatesQ3(x,y, middleX, middleY);
    cameraLookFrom = vec3(new_coordinates[0], cameraLookFrom[1], new_coordinates[1]);

    new_max_coordinates = translateGridCoordinatesQ3(middleX, screenHeight, middleX, middleY);
    new_min_coordinates = translateGridCoordinatesQ3(0, middleY, middleX, middleY);
      
    //make sure the cameraLookFrom is bounded
    cameraLookFrom[0] = Math.max(Math.min(cameraLookFrom[0], new_max_coordinates[0]), new_min_coordinates[0]);
    cameraLookFrom[2] = Math.min( Math.max(cameraLookFrom[2], new_min_coordinates[1]), new_max_coordinates[1]);

    render();
}

/*
    handleLookFromQ4

    This function handles the movement of the LookFrom camera target in Q4. It takes in
    x,y screen coordinates and translate's them into grid coordinates, and changes the (y,z) position of 
    the cameraLookFrom target.

    Input: 
        x: x-coordinate of the mouse on screen
        y: y-coordinate of the mouse on screen

    Returns:
        N/A

*/
function handleLookFromQ4(x,y){
    new_coordinates = translateGridCoordinatesQ4(x,y, middleX, middleY);
    cameraLookFrom = vec3(cameraLookFrom[0], new_coordinates[0], new_coordinates[1]);

    new_max_coordinates = translateGridCoordinatesQ4(screenWidth, screenHeight, middleX, middleY);
    new_min_coordinates = translateGridCoordinatesQ4(middleX, middleY, middleX, middleY);
      
    //make sure the cameraLookFrom is bounded
    cameraLookFrom[1] = Math.min(Math.max(cameraLookFrom[1], new_max_coordinates[0]), new_min_coordinates[0]);
    cameraLookFrom[2] = Math.max( Math.min(cameraLookFrom[2], new_min_coordinates[1]), new_max_coordinates[1]);

    render();
}

/*
    handleLookAtQ1

    This function handles the movement of the LookFrom camera target in Q1. It takes in
    x,y screen coordinates and translate's them into grid coordinates, and changes the (x,y) position of 
    the cameraLookAt target.

    Input: 
        x: x-coordinate of the mouse on screen
        y: y-coordinate of the mouse on screen

    Returns:
        N/A
*/
function handleLookAtQ1(x,y){
    new_coordinates = translateGridCoordinatesQ1(x,y, middleX, middleY);
    cameraLookAt = vec3(new_coordinates[0], new_coordinates[1], cameraLookAt[2]);
      

    new_max_coordinates = translateGridCoordinatesQ1(middleX, middleY, middleX, middleY);
    new_min_coordinates = translateGridCoordinatesQ1(0, 0, middleX, middleY);

    //make sure the cameraLookFrom is bounded
    cameraLookAt[0] = Math.max(Math.min(cameraLookAt[0], new_max_coordinates[0]), new_min_coordinates[0]);
    cameraLookAt[1] = Math.min(Math.max(cameraLookAt[1], new_max_coordinates[1]), new_min_coordinates[1]);

    render();
}
/*
    handleAtFromQ3

    This function handles the movement of the LookAt camera target in Q3. It takes in
    x,y screen coordinates and translate's them into grid coordinates, and changes the (x,z) position of 
    the cameraLookAt target.

    Input: 
        x: x-coordinate of the mouse on screen
        y: y-coordinate of the mouse on screen

    Returns:
        N/A
*/
function handleLookAtQ3(x,y){
    new_coordinates = translateGridCoordinatesQ3(x,y, middleX, middleY);
    cameraLookAt = vec3(new_coordinates[0], cameraLookAt[1], new_coordinates[1]);

    new_max_coordinates = translateGridCoordinatesQ3(middleX, screenHeight, middleX, middleY);
    new_min_coordinates = translateGridCoordinatesQ3(0, middleY, middleX, middleY);

    //make sure the cameraLookAt is bounded
    cameraLookAt[0] = Math.max(Math.min(cameraLookAt[0], new_max_coordinates[0]), new_min_coordinates[0]);
    cameraLookAt[2] = Math.min( Math.max(cameraLookAt[2], new_min_coordinates[1]), new_max_coordinates[1]);

    render();
}

/*
    handleLookAtQ4

    This function handles the movement of the LookAt camera target in Q4. It takes in
    x,y screen coordinates and translate's them into grid coordinates, and changes the (y,z) position of 
    the cameraLookAt target.

    Input: 
        x: x-coordinate of the mouse on screen
        y: y-coordinate of the mouse on screen

    Returns:
        N/A
*/
function handleLookAtQ4(x,y){
    new_coordinates = translateGridCoordinatesQ4(x,y, middleX, middleY);
    cameraLookAt = vec3(cameraLookAt[0], new_coordinates[0], new_coordinates[1]);

    new_max_coordinates = translateGridCoordinatesQ4(screenWidth, screenHeight, middleX, middleY);
    new_min_coordinates = translateGridCoordinatesQ4(middleX, middleY, middleX, middleY);

    //make sure the cameraLookAt is bounded
    cameraLookAt[1] = Math.min(Math.max(cameraLookAt[1], new_max_coordinates[0]), new_min_coordinates[0]);
    cameraLookAt[2] = Math.max( Math.min(cameraLookAt[2], new_min_coordinates[1]), new_max_coordinates[1]);

    render();
}

/*
    rotateXYZ

    This function takes a direction, dir (a negative or positive integer) and a rotation axis
    It computes the relate z-axis and normalizes it
    It also computes the relative x and y-axis by taking cross products
    If direction is positive increase theta, else decrease theta
    Calculate the rotation transformation matrix by passing the relative axis vector and the angle theta
    Use rotation transformation to multiply it by the cameraLookFrom vector
    Set and update the new cameraLookFrom position

    Input: 
        dir: +/- integer 
        rotationAxis: X or Y

    Returns:
        N/A
*/
function rotateXYZ(dir, rotationAxis){
    //Rotate around Y axis (horizontal rotation)

    var z_axis = vec3(cameraLookFrom[0]-cameraLookAt[0],cameraLookFrom[1]-cameraLookAt[1],cameraLookFrom[2]-cameraLookAt[2]);

    z_axis = normalize(z_axis);

    var x_axis = cross(z_axis,cameraLookUp);

    var y_axis = cross(z_axis, x_axis);

    theta = 0;

    (dir > 0) ? theta+=Math.PI/4: theta -= Math.PI/4; //determine which way to rotate

    var rotMat = (rotationAxis == 'X') ? rotate(theta, y_axis) : rotate(theta, x_axis);

    var xyzMat = mat4(vec4(cameraLookFrom[0],0,0,0),
                      vec4(cameraLookFrom[1],0,0,0),
                      vec4(cameraLookFrom[2],0,0,0),
                      vec4(1,0,0,0));

    var resultMat = mult(rotMat,xyzMat);
	
    //new bound to prevent spinning when the x and z values are really close to the CameraLookAt coordinates
    if(Math.abs(resultMat[0][0]-cameraLookAt[0]) > .3|| Math.abs(resultMat[2][0]-cameraLookAt[2]) > .3){
        cameraLookFrom = vec3(resultMat[0][0], resultMat[1][0], resultMat[2][0]);
    }
}

/*sets up the relative X and Y axis vectors for rotating a shape in Perspective View*/
function perspectiveRot(rotAngleX, rotAngleY){
   
    var z_axis = vec3(0,0,1);
    //vec3(cameraLoc[0]-shapeLoc[0],cameraLoc[1]-shapeLoc[1],cameraLoc[2]-shapeLoc[2]);
    //z_axis = normalize(z_axis);
    var x_axis = vec3(1,0,0);

    var rotMat = rotate(rotAngleX, x_axis);
    rotMat = mult(rotMat,rotate(rotAngleY, z_axis));
    
    return rotMat;
}

//NEW A3 CODE

//SHAPE OBJECT CLASS
function shape(quad) {
    this.quadrant = quad;

    this.shearVal = [0,0,0];
    this.lastShear = 0;
    
    this.done_drawing = false;
    this.line_verticies = [];
    this.num_line_vertices = 0;
    this.all_3D_vertices = [];

    this.color = 0;

    this.shape_center_orig = vec3(0,0,0);
    this.shape_center = vec3(0,0,0);
    this.world_center = vec3(0,0,0);

    this.scale = vec3(1,1,1);

    this.min_vertices = [];
    this.max_vertices = [];

    //new angles for rotation
    this.xRotAng = 0;
    this.yRotAng = 0;
    this.zRotAng = 0;
    
    this.X_CHANGE_START;
    this.Y_CHANGE_START;
    this.Z_CHANGE_START;


    this.corners = [];
}

function add_vertice(shape, v4){
   shape.line_verticies.push(v4);
   shape.num_line_vertices++;
}
function set_3D_verticies(shape, vertices){
   shape.all_3D_vertices = vertices;
}
function set_min_verticies(shape, vertices){
   shape.min_vertices = vertices;
}
function set_max_verticies(shape, vertices){
   shape.max_vertices = vertices;
}
function set_shape_center(shape, max, min){
   shape.shape_center = vec3(((max[0]+min[0])/2),
                             ((max[1]+min[1])/2),
                             ((max[2]+min[2])/2)
                        );
}
// END SHAPE OBJECT CLASS
function resetShape_button(){
   if (shapes[current_shape] && shapes[current_shape].done_drawing == true){
    shapes[current_shape].shearVal = [0,0,0];
    shapes[current_shape].lastShear = 0;

    shapes[current_shape].color = 0;

    shapes[current_shape].shape_center = vec3(
       shapes[current_shape].shape_center_orig[0],
       shapes[current_shape].shape_center_orig[1],
       shapes[current_shape].shape_center_orig[2]
    );

    shapes[current_shape].scale = vec3(1,1,1);

    //new angles for rotation
    shapes[current_shape].xRotAng = 0;
    shapes[current_shape].yRotAng = 0;
    shapes[current_shape].zRotAng = 0;
    shapes[current_shape].perspAngX = 0;
    shapes[current_shape].perspAngZ = 0;
    shapes[current_shape].X_CHANGE_START = undefined;
    shapes[current_shape].Y_CHANGE_START = undefined;
    shapes[current_shape].Z_CHANGE_START = undefined;

      render();
   }
}
function deleteShape_button(){
   if (current_shape != -1){
      deleteShape(current_shape)
   }
}
function unselectShape_button(){
   if (current_shape != -1 && shapes[current_shape].done_drawing==true){
       current_shape=-1;
       render();
   }
}

function endDrawing_button(){
   if (shapes[current_shape] && shapes[current_shape].done_drawing == false){
      endDrawing();
      render();
   }
} 
function endDrawing(){                  
   if (shapes[current_shape] && shapes[current_shape].done_drawing==false){
      shapes[current_shape].done_drawing = true;
      drawingShapeActive = false;
      if (shapes[current_shape].quadrant == 'Q1'){
         drawCurveRotationQ1(shapes[current_shape]);
      }
      else if (shapes[current_shape].quadrant == 'Q3'){
         drawCurveRotationQ3(shapes[current_shape]);
      }
      else if (shapes[current_shape].quadrant == 'Q4'){
         drawCurveRotationQ4(shapes[current_shape]);
      }
      setCornerSquares(shapes[current_shape]);

      shapes[current_shape].shape_center_orig = vec3(shapes[current_shape].shape_center[0], shapes[current_shape].shape_center[1],shapes[current_shape].shape_center[2]);
   }
}

function setCornerSquares(shape){
   shape.corners = [
      shape.max_vertices,
      vec3(shape.max_vertices[0],shape.max_vertices[1],shape.min_vertices[2]),
      vec3(shape.max_vertices[0],shape.min_vertices[1],shape.max_vertices[2]),
      vec3(shape.min_vertices[0],shape.max_vertices[1],shape.max_vertices[2]),
      vec3(shape.max_vertices[0],shape.min_vertices[1],shape.min_vertices[2]),
      vec3(shape.min_vertices[0],shape.max_vertices[1],shape.min_vertices[2]),
      vec3(shape.min_vertices[0],shape.min_vertices[1],shape.max_vertices[2]),
      shape.min_vertices
   ];
}
function shapeColor(){
   var selection = document.getElementById("shape_color").selectedIndex;
   if (current_shape != -1){
      shapes[current_shape].color = selection;
      render();
   }
}

function updateValues(){
   if (current_shape == -1){

      document.getElementById("shape_color").selectedIndex = 0;

      document.getElementById("xAng_slider").value = 0;
      document.getElementById("yAng_slider").value = 0;
      document.getElementById("zAng_slider").value = 0;

      document.getElementById("shear_slider").value = 0;
      document.getElementById("0").checked = true;
      return;
   }


   document.getElementById("shape_color").selectedIndex = shapes[current_shape].color;

   document.getElementById("xAng_slider").value = shapes[current_shape].xRotAng;
   document.getElementById("yAng_slider").value = shapes[current_shape].yRotAng;
   document.getElementById("zAng_slider").value = shapes[current_shape].zRotAng;

   document.getElementById(shapes[current_shape].lastShear).checked = true;
   document.getElementById("shear_slider").value = shapes[current_shape].shearVal[shapes[current_shape].lastShear] * 50;
}

//new delete current shape function
function deleteShape(i){
    shapes.splice(i, 1);
    current_shape = -1;
    drawingShapeActive = false;
    render();
}

//SHAPE CLICKED 
function shapeClickedQ1(x,y){
    var clickGridCoordinates = translateGridCoordinatesQ1 (x,y,middleX, middleY);
    var s;
    //return false;
 
    for (var i = 0; i < shapes.length; i ++){
      s = shapes[i];
      if ((s.done_drawing == true) &&
          (clickGridCoordinates[0] <= (s.shape_center[0] + (s.scale[0]*(s.max_vertices[0] - s.min_vertices[0])/2))) &&
          (clickGridCoordinates[0] >= (s.shape_center[0] - (s.scale[0]*(s.max_vertices[0] - s.min_vertices[0])/2))) &&
          (clickGridCoordinates[1] <= (s.shape_center[1] + (s.scale[1]*(s.max_vertices[1] - s.min_vertices[1])/2))) &&
          (clickGridCoordinates[1] >= (s.shape_center[1] - (s.scale[1]*(s.max_vertices[1] - s.min_vertices[1])/2))))
       {
           current_shape = i;
           return true;
       }
    }
    return false; //else
}

function shapeClickedQ3(x,y){
    var clickGridCoordinates = translateGridCoordinatesQ3 (x,y,middleX, middleY);
    var s;


    for (var i = 0; i < shapes.length; i ++){
      s = shapes[i];
      if ((s.done_drawing == true) &&
          (clickGridCoordinates[0] <= (s.shape_center[0] + (s.scale[0]*(s.max_vertices[0] - s.min_vertices[0])/2))) &&
          (clickGridCoordinates[0] >= (s.shape_center[0] - (s.scale[0]*(s.max_vertices[0] - s.min_vertices[0])/2))) &&
          (clickGridCoordinates[1] <= (s.shape_center[2] + (s.scale[2]*(s.max_vertices[2] - s.min_vertices[2])/2))) &&
          (clickGridCoordinates[1] >= (s.shape_center[2] - (s.scale[2]*(s.max_vertices[2] - s.min_vertices[2])/2))))
       {
           current_shape = i;
           return true;
       }
    }
    return false; //else
}

function shapeClickedQ4(x,y){
    var clickGridCoordinates = translateGridCoordinatesQ4 (x,y,middleX, middleY);
    var s;

    for (var i = 0; i < shapes.length; i ++){
      s = shapes[i];
      if ((s.done_drawing == true) &&
          (clickGridCoordinates[0] <= (s.shape_center[1] + (s.scale[1]*(s.max_vertices[1] - s.min_vertices[1])/2))) &&
          (clickGridCoordinates[0] >= (s.shape_center[1] - (s.scale[1]*(s.max_vertices[1] - s.min_vertices[1])/2))) &&
          (clickGridCoordinates[1] <= (s.shape_center[2] + (s.scale[2]*(s.max_vertices[2] - s.min_vertices[2])/2))) &&
          (clickGridCoordinates[1] >= (s.shape_center[2] - (s.scale[2]*(s.max_vertices[2] - s.min_vertices[2])/2))))
       {
           current_shape = i;
           return true;
       }
    }
    return false; //else
}

//END SHAPE CLICKED 

//SHAPE TRANSLATION
function handleShapeTranslationQ1(x,y){
    new_coordinates = translateGridCoordinatesQ1(x,y, middleX, middleY);


    shapes[current_shape].shape_center = vec3(new_coordinates[0], new_coordinates[1], shapes[current_shape].shape_center[2]);

    new_max_coordinates = translateGridCoordinatesQ1(middleX, middleY, middleX, middleY);
    new_min_coordinates = translateGridCoordinatesQ1(0, 0, middleX, middleY);

    //make sure the cameraLookFrom is bounded
    shapes[current_shape].shape_center[0] = Math.max(Math.min(shapes[current_shape].shape_center[0], new_max_coordinates[0]), new_min_coordinates[0]);
    shapes[current_shape].shape_center[1] = Math.min(Math.max(shapes[current_shape].shape_center[1], new_max_coordinates[1]), new_min_coordinates[1]);
    //
    render();
}
function handleShapeTranslationQ3(x,y){
    new_coordinates = translateGridCoordinatesQ3(x,y, middleX, middleY);

    shapes[current_shape].shape_center = vec3(new_coordinates[0], shapes[current_shape].shape_center[1], new_coordinates[1]);

    new_max_coordinates = translateGridCoordinatesQ3(middleX, screenHeight, middleX, middleY);
    new_min_coordinates = translateGridCoordinatesQ3(0, middleY, middleX, middleY);

    //make sure the cameraLookFrom is bounded
    shapes[current_shape].shape_center[0] = Math.max(Math.min(shapes[current_shape].shape_center[0], new_max_coordinates[0]), new_min_coordinates[0]);
    shapes[current_shape].shape_center[2] = Math.min(Math.max(shapes[current_shape].shape_center[2], new_min_coordinates[1]), new_max_coordinates[1]);
    //
    render();
}
function handleShapeTranslationQ4(x,y){
    new_coordinates = translateGridCoordinatesQ4(x,y, middleX, middleY);

    shapes[current_shape].shape_center = vec3(shapes[current_shape].shape_center[0], new_coordinates[0], new_coordinates[1]);

    new_max_coordinates = translateGridCoordinatesQ4(screenWidth, screenHeight, middleX, middleY);
    new_min_coordinates = translateGridCoordinatesQ4(middleX, middleY, middleX, middleY);

    //make sure the cameraLookFrom is bounded
    shapes[current_shape].shape_center[1] = Math.min(Math.max(shapes[current_shape].shape_center[1], new_max_coordinates[0]), new_min_coordinates[0]);
    shapes[current_shape].shape_center[2] = Math.max(Math.min(shapes[current_shape].shape_center[2], new_min_coordinates[1]), new_max_coordinates[1]);
    //
    render();
}
//END SHAPE TRANSLATION


function radioButtons(){
   var radioButtonVal = radioButtonValue(); 
   if (current_shape == -1){
      document.getElementById( "shear_slider").value=0;
   }
   else{
      document.getElementById("shear_slider").value = shapes[current_shape].shearVal[radioButtonVal] * 50;
   }
}


function cornerTargetClickedQ1(x,y, cameraTargetVector, targetSize){

    var clickGridCoordinates = translateGridCoordinatesQ1 (x,y,middleX, middleY);

    var dx = shapes[current_shape].shape_center[0];
    var dy = shapes[current_shape].shape_center[1];
    var dz = shapes[current_shape].shape_center[2];

    for (var i = 0; i < shapes[current_shape].corners.length; i++){
       c = vec3(shapes[current_shape].scale[0] * shapes[current_shape].corners[i][0] + dx,
                shapes[current_shape].scale[1] * shapes[current_shape].corners[i][1] + dy,
                shapes[current_shape].scale[2] * shapes[current_shape].corners[i][2] + dz);
       //if (cameraTargetClicked(clickGridCoordinates, c , 0.4)){
       if (cameraTargetClicked(clickGridCoordinates, vec2(c[0],c[1]) , 0.4)){

          if (!shapes[current_shape].X_CHANGE_START && !shapes[current_shape].Y_CHANGE_START && !shapes[current_shape].Z_CHANGE_START){
             //where the corner actually is
             shapes[current_shape].X_CHANGE_START = c[0] - dx;
             shapes[current_shape].Y_CHANGE_START = c[1] - dy;
             shapes[current_shape].Z_CHANGE_START = c[2] - dz;
          }
          return true;
       }
    }
    return false;

}
function cornerTargetClickedQ3(x,y, cameraTargetVector, targetSize){

    var clickGridCoordinates = translateGridCoordinatesQ3 (x,y,middleX, middleY);

    var dx = shapes[current_shape].shape_center[0];
    var dy = shapes[current_shape].shape_center[1];
    var dz = shapes[current_shape].shape_center[2];

    for (var i = 0; i < shapes[current_shape].corners.length; i++){
       c = vec3(shapes[current_shape].scale[0] * shapes[current_shape].corners[i][0] + dx,
                shapes[current_shape].scale[1] * shapes[current_shape].corners[i][1] + dy,
                shapes[current_shape].scale[2] * shapes[current_shape].corners[i][2] + dz);
       if (cameraTargetClicked(clickGridCoordinates, vec2(c[0], c[2]), 0.4)){

          if (!shapes[current_shape].X_CHANGE_START && !shapes[current_shape].Y_CHANGE_START && !shapes[current_shape].Z_CHANGE_START){
             //where the corner actually is
             shapes[current_shape].X_CHANGE_START = c[0] - dx;
             shapes[current_shape].Y_CHANGE_START = c[1] - dy;
             shapes[current_shape].Z_CHANGE_START = c[2] - dz;
          }

          return true;
       }
    }
    return false;
}
function cornerTargetClickedQ4(x,y, cameraTargetVector, targetSize){

    var clickGridCoordinates = translateGridCoordinatesQ4 (x,y,middleX, middleY);

    var dx = shapes[current_shape].shape_center[0];
    var dy = shapes[current_shape].shape_center[1];
    var dz = shapes[current_shape].shape_center[2];

    for (var i = 0; i < shapes[current_shape].corners.length; i++){
       c = vec3(shapes[current_shape].scale[0] * shapes[current_shape].corners[i][0] + dx,
                shapes[current_shape].scale[1] * shapes[current_shape].corners[i][1] + dy,
                shapes[current_shape].scale[2] * shapes[current_shape].corners[i][2] + dz);
       if (cameraTargetClicked(clickGridCoordinates, vec2(c[1], c[2]), 0.4)){
          if (!shapes[current_shape].X_CHANGE_START && !shapes[current_shape].Y_CHANGE_START && !shapes[current_shape].Z_CHANGE_START){
             //where the corner actually is
             shapes[current_shape].X_CHANGE_START = c[0] - dx;
             shapes[current_shape].Y_CHANGE_START = c[1] - dy;
             shapes[current_shape].Z_CHANGE_START = c[2] - dz;
          }
          return true;
       }
    }
    return false;
}

function handleShapeScaleQ1(x,y){
    if (SCALING_BOOL == false) {
        return;
    }
    var new_coordinates = translateGridCoordinatesQ1(x,y, middleX, middleY);

    shapes[current_shape].scale[0] = 
       Math.abs(
          (new_coordinates[0]-shapes[current_shape].shape_center[0])/shapes[current_shape].X_CHANGE_START
       )
       ;
    shapes[current_shape].scale[1] =
       Math.abs(
          (new_coordinates[1]-shapes[current_shape].shape_center[1])/shapes[current_shape].Y_CHANGE_START
       )
       ;
    render();
}

function handleShapeScaleQ3(x,y){
    if (SCALING_BOOL == false) {
        return;
    }
    var new_coordinates = translateGridCoordinatesQ3 (x,y,middleX, middleY);

    shapes[current_shape].scale[0] =
       Math.abs(
          (new_coordinates[0]-shapes[current_shape].shape_center[0])/shapes[current_shape].X_CHANGE_START
       )
       ;
    shapes[current_shape].scale[2] =
       Math.abs(
          (new_coordinates[1]-shapes[current_shape].shape_center[2])/shapes[current_shape].Z_CHANGE_START
       )
       ;

    render();
}
      
function handleShapeScaleQ4(x,y){
    if (SCALING_BOOL == false) {
        return;
    } 
    var new_coordinates = translateGridCoordinatesQ4 (x,y,middleX, middleY);

    shapes[current_shape].scale[1] =
       Math.abs(
       (new_coordinates[0]-shapes[current_shape].shape_center[1])/shapes[current_shape].Y_CHANGE_START
       )
       ;
    shapes[current_shape].scale[2] =
       Math.abs(
       (new_coordinates[1]-shapes[current_shape].shape_center[2])/shapes[current_shape].Z_CHANGE_START
       )
       ;

    render();
}
