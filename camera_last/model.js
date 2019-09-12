var modelBufferID;
var modelBuffer;

/*new*/
var initialVert;
var previousVert;
var rotatedVert;

var colorArr = [vec4(1,0,0,1), vec4(0,1,0,1), vec4(0,0,1,1), vec4(1,1,0,1)]

var red = vec4(1,0,0,1);
var green = vec4(0,1,0,1);
var blue = vec4(0,0,1,1);
var yellow = vec4(1,1,0,1);

var white = vec4(0,0,0,0);

var ModelViewStack = [];

function pushModelView()
{
	ModelViewStack.push(modelViewMatrix);
}

function popModelView()
{
	modelViewMatrix = ModelViewStack.pop();
}

function sendModelView()
{
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
}


function initScene()
{
	modelBufferID = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelBufferID);
	gl.bufferData(gl.ARRAY_BUFFER, 16*64, gl.STATIC_DRAW);	
}

function drawScene()
{
	
	gl.bindBuffer(gl.ARRAY_BUFFER, modelBufferID);
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	
	gl.uniform4fv(objectColor, green);
	drawGround();
	pushModelView();
	
}

function drawCurveRotationQ1( shape )
{
   var all_vertices = [];
   var max = vec3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
   var min = vec3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);

	rotationBuffer = [];
	initialVert = [];
	rotatedVert = [];
	
	var center = vec4(0,0,0);
   var v4;
	

   // I Translate/Shift the original line down so that its Y-origin is at the worlds Y-origin (0)
   // x,z are already at the x,z origin so they dont have to be shifted
   // I keep track of the shift, so that later I can un-shift the shape's center so that it is 
   // drawn correctly... Before this we built the shape w.r.t the world, now its built w.rt to 
   // its own "center", then translated to where it should be w.r.t the world. 
   var max_y  = -Number.MAX_VALUE;
   var min_y  = Number.MAX_VALUE;

   for(var i = 0; i < shape.num_line_vertices; i++){
      max_y = Math.max(max_y, shape.line_verticies[i][1]);
      min_y = Math.min(min_y, shape.line_verticies[i][1]);
   }

   var dy = ((max_y + min_y) / 2);

   for(var i = 0; i < shape.num_line_vertices; i++){
      shape.line_verticies[i][1] -= dy;
   }
   // end section


   for(var i = 0; i < shape.num_line_vertices; i++){
      initialVert.push(shape.line_verticies[i]);
   }
	
	previousVert = initialVert;
	
	var totalVert = initialVert.length;
	var sections = 32;
	var incAngle = ((2*Math.PI)/sections);
	
	
   var ind = 0;
	
	//loop each incremental angle
	for (var j = 0; j <= (2*Math.PI + incAngle); j += incAngle) {
		
		rotationBuffer = [];
      
		
		//create rotated set of verticies
		for(var i = 0; i < totalVert; ++i){
         v4 = vec4(((Math.sin(j) * initialVert[i][0]) + center[0]),
                     initialVert[i][1],
                     ((Math.cos(j) * initialVert[i][0]) + center[2]));

			rotatedVert.push(v4);

         max = vec3( Math.max(max[0], v4[0]), Math.max(max[1], v4[1]), Math.max(max[2], v4[2]));
         min = vec3( Math.min(min[0], v4[0]), Math.min(min[1], v4[1]), Math.min(min[2], v4[2]));
		}
		
		//start connecting the verticies
		for(var i = 0; i < (totalVert - 1) && j != 0; ++i){
			
			rotationBuffer.push(previousVert[i]);
			rotationBuffer.push(rotatedVert[i]);
			rotationBuffer.push(rotatedVert[i+1]);
			rotationBuffer.push(previousVert[i]);
			
			rotationBuffer.push(previousVert[i]);
			rotationBuffer.push(previousVert[i+1]);
			rotationBuffer.push(rotatedVert[i+1]);
			rotationBuffer.push(previousVert[i]);
		}
      all_vertices[ind] = rotationBuffer;
      ind++;
      
		previousVert = rotatedVert;
		rotatedVert = [];
	}

   set_3D_verticies(shape, all_vertices);
   set_min_verticies(shape, min);
   set_max_verticies(shape, max);
   set_shape_center(shape, max, min);
   shape.shape_center[1] = dy; //reset the shape's y center to where it should be

}



//+X / +Y
//+Y / -Z
function drawCurveRotationQ4( shape )
{
   var all_vertices = [];
   var max = vec3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
   var min = vec3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);

	rotationBuffer = [];
	initialVert = [];
	rotatedVert = [];
	
	var center = vec4(0,0,0);
   var v4;
	

   // I Translate/Shift the original line down so that its Y-origin is at the worlds Y-origin (0)
   // x,z are already at the x,z origin so they dont have to be shifted
   // I keep track of the shift, so that later I can un-shift the shape's center so that it is 
   // drawn correctly... Before this we built the shape w.r.t the world, now its built w.rt to 
   // its own "center", then translated to where it should be w.r.t the world. 
   var max_z  = -Number.MAX_VALUE;
   var min_z  = Number.MAX_VALUE;

   for(var i = 0; i < shape.num_line_vertices; i++){
      max_z = Math.max(max_z, shape.line_verticies[i][2]);
      min_z = Math.min(min_z, shape.line_verticies[i][2]);
   }

   var dz = ((max_z + min_z) / 2);

   for(var i = 0; i < shape.num_line_vertices; i++){
      shape.line_verticies[i][2] -= dz;
   }
   // end section


   for(var i = 0; i < shape.num_line_vertices; i++){
      initialVert.push(shape.line_verticies[i]);
   }
	
	previousVert = initialVert;
	
	var totalVert = initialVert.length;
	var sections = 32;
	var incAngle = ((2*Math.PI)/sections);
	
	
   var ind = 0;
	
	//loop each incremental angle
	for (var j = 0; j <= (2*Math.PI + incAngle); j += incAngle) {
		
		rotationBuffer = [];
		
		//create rotated set of verticies
		for(var i = 0; i < totalVert; ++i){
         //FIND ME
         v4 = vec4(
                     ((Math.sin(j) * initialVert[i][1]) + center[1]),
                     ((Math.cos(j) * initialVert[i][1]) + center[0]),
                     initialVert[i][2]
                  );
			rotatedVert.push(v4);

         max = vec3( Math.max(max[0], v4[0]), Math.max(max[1], v4[1]), Math.max(max[2], v4[2]));
         min = vec3( Math.min(min[0], v4[0]), Math.min(min[1], v4[1]), Math.min(min[2], v4[2]));
		}
		
		//start connecting the verticies
		for(var i = 0; i < (totalVert - 1) && j != 0; ++i){
			
			rotationBuffer.push(previousVert[i]);
			rotationBuffer.push(rotatedVert[i]);
			rotationBuffer.push(rotatedVert[i+1]);
			rotationBuffer.push(previousVert[i]);
			
			rotationBuffer.push(previousVert[i]);
			rotationBuffer.push(previousVert[i+1]);
			rotationBuffer.push(rotatedVert[i+1]);
			rotationBuffer.push(previousVert[i]);
		}
      all_vertices[ind] = rotationBuffer;
      ind++;
      
		previousVert = rotatedVert;
		rotatedVert = [];
	}

   set_3D_verticies(shape, all_vertices);
   set_min_verticies(shape, min);
   set_max_verticies(shape, max);
   set_shape_center(shape, max, min);
   shape.shape_center[2] = dz; //reset the shape's y center to where it should be

}

function drawCurveRotationQ3(shape )
{
//

   var all_vertices = [];
   var max = vec3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
   var min = vec3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);

	rotationBuffer = [];
	initialVert = [];
	rotatedVert = [];
	
	var center = vec4(0,0,0);
   var v4;
	

   // I Translate/Shift the original line down so that its Y-origin is at the worlds Y-origin (0)
   // x,z are already at the x,z origin so they dont have to be shifted
   // I keep track of the shift, so that later I can un-shift the shape's center so that it is 
   // drawn correctly... Before this we built the shape w.r.t the world, now its built w.rt to 
   // its own "center", then translated to where it should be w.r.t the world. 
   var max_x  = -Number.MAX_VALUE;
   var min_x  = Number.MAX_VALUE;

   for(var i = 0; i < shape.num_line_vertices; i++){
      max_x = Math.max(max_x, shape.line_verticies[i][0]);
      min_x = Math.min(min_x, shape.line_verticies[i][0]);
   }

   var dx = ((max_x + min_x) / 2);

   for(var i = 0; i < shape.num_line_vertices; i++){
      shape.line_verticies[i][0] -= dx;
   }
   // end section


   for(var i = 0; i < shape.num_line_vertices; i++){
      initialVert.push(shape.line_verticies[i]);
   }
	
	previousVert = initialVert;
	
	var totalVert = initialVert.length;
	var sections = 32;
	var incAngle = ((2*Math.PI)/sections);
	
	
   var ind = 0;
	
	//loop each incremental angle
	for (var j = 0; j <= (2*Math.PI + incAngle); j += incAngle) {
		
		rotationBuffer = [];
		
		//create rotated set of verticies
		for(var i = 0; i < totalVert; ++i){
         //FIND ME
         v4 = vec4(
                     initialVert[i][0],
                     ((Math.sin(j) * initialVert[i][2]) + center[2]),
                     ((Math.cos(j) * initialVert[i][2]) + center[1])
                  );

			rotatedVert.push(v4);

         max = vec3( Math.max(max[0], v4[0]), Math.max(max[1], v4[1]), Math.max(max[2], v4[2]));
         min = vec3( Math.min(min[0], v4[0]), Math.min(min[1], v4[1]), Math.min(min[2], v4[2]));
		}
		
		//start connecting the verticies
		for(var i = 0; i < (totalVert - 1) && j != 0; ++i){
			
			rotationBuffer.push(previousVert[i]);
			rotationBuffer.push(rotatedVert[i]);
			rotationBuffer.push(rotatedVert[i+1]);
			rotationBuffer.push(previousVert[i]);
			
			rotationBuffer.push(previousVert[i]);
			rotationBuffer.push(previousVert[i+1]);
			rotationBuffer.push(rotatedVert[i+1]);
			rotationBuffer.push(previousVert[i]);
		}
      all_vertices[ind] = rotationBuffer;
      ind++;
      
		previousVert = rotatedVert;
		rotatedVert = [];
	}

   set_3D_verticies(shape, all_vertices);
   set_min_verticies(shape, min);
   set_max_verticies(shape, max);
   set_shape_center(shape, max, min);
   shape.shape_center[0] = dx; //reset the shape's y center to where it should be
//
}
//test function
function drawRotationVert(yVal,xVal,numofDots) {
	var rotationBuffer = [];
	var center = vec4(0,yVal,0);
	var radius = xVal
    var incAngle = ((2*Math.PI)/numofDots);
	
    for (a = 0; a <= (2*Math.PI)-incAngle; a += incAngle) {
      rotationBuffer.push(vec4(((Math.sin(a) * radius) + center[0]),center[1], ((Math.cos(a) * radius) + center[2])));
    }
	
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(rotationBuffer));
	gl.drawArrays(gl.LINE_LOOP, 0, rotationBuffer.length);
}

function drawMiniSquare(shape, center)
{  
   if (!(current_shape != -1 && shape == shapes[current_shape] && SCALING_BOOL==true)){
      return;
   }

   gl.bindBuffer(gl.ARRAY_BUFFER, modelBufferID);
   gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(vPosition);

   pushModelView();

   modelViewMatrix = mult(modelViewMatrix, translate(shape.shape_center[0], shape.shape_center[1], shape.shape_center[2]));
   modelViewMatrix = mult(modelViewMatrix, scale(shape.scale[0], shape.scale[1], shape.scale[2]));

   modelViewMatrix = mult(modelViewMatrix, translate(center[0], center[1], center[2]));
   modelViewMatrix = mult(modelViewMatrix, scale(0.25, 0.25, 0.25));
   sendModelView();
   gl.uniform4fv(objectColor, red);
   drawCube2(shape.scale[0], shape.scale[1], shape.scale[2]);

   popModelView();

}

function drawCam()
{

   gl.bindBuffer(gl.ARRAY_BUFFER, modelBufferID);
   gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(vPosition);

   pushModelView();

   modelViewMatrix = mult(modelViewMatrix, translate(cameraLookFrom[0], cameraLookFrom[1], cameraLookFrom[2]));
	modelViewMatrix = mult(modelViewMatrix, scale(0.5, 0.5, 0.5));
   sendModelView();
   gl.uniform4fv(objectColor, white);
   drawCube();

   popModelView();

   pushModelView();
   modelViewMatrix = mult(modelViewMatrix, translate(cameraLookAt[0], cameraLookAt[1], cameraLookAt[2]));
	modelViewMatrix = mult(modelViewMatrix, scale(0.2, 0.2, 0.2));
   sendModelView();
   gl.uniform4fv(objectColor, white);
   drawCube();

   popModelView();

   pushModelView();
   sendModelView();
   gl.uniform4fv(objectColor, blue);
   drawLine();
}

function drawLine()
{
	modelBuffer = [];
   gl.uniform4fv(objectColor, white);

//
   var dots = 20;

   var dx = (cameraLookFrom[0] - cameraLookAt[0])/dots;
   var dy = (cameraLookFrom[1] - cameraLookAt[1])/dots;
   var dz = (cameraLookFrom[2] - cameraLookAt[2])/dots;

   var start = cameraLookAt;

   for (var i = 0; i < dots; i++){
       if (i % 2 == 0){
	       modelBuffer = [];
          modelBuffer.push(vec4(start[0] + dx*i, start[1] +dy*i, start[2] + dz*i));
          modelBuffer.push(vec4(start[0] + dx*(i+1), start[1] +dy*(i+1), start[2] + dz*(i+1)));
	       gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(modelBuffer));
	       gl.drawArrays(gl.LINE_LOOP, 0, modelBuffer.length);
       }
   }

//
	//modelBuffer.push(vec4(cameraLookAt[0], cameraLookAt[1], cameraLookAt[2]));
	//modelBuffer.push(vec4(cameraLookFrom[0], cameraLookFrom[1], cameraLookFrom[2]));
	//gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(modelBuffer));
	//gl.drawArrays(gl.LINE_LOOP, 0, modelBuffer.length);
}

function drawGround()
{
	modelBuffer = [];
	modelBuffer.push(vec4(-5, 0, -5));
	modelBuffer.push(vec4( 5, 0, -5));
	modelBuffer.push(vec4( 5, 0,  5));
	modelBuffer.push(vec4(-5, 0,  5));
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(modelBuffer));
	gl.drawArrays(gl.LINE_LOOP, 0, modelBuffer.length);
}

function drawBoundingBox(shape){
     gl.uniform4fv(objectColor, white);

     var x_min = shape.min_vertices[0];
     var x_max = shape.max_vertices[0];
     var y_min = shape.min_vertices[1];
     var y_max = shape.max_vertices[1];
     var z_min = shape.min_vertices[2];
     var z_max = shape.max_vertices[2];
     
     var verticies = [vec4(x_min, y_min, z_min),
                      vec4(x_min, y_min, z_max),
                      vec4(x_min, y_max, z_min),
                      vec4(x_min, y_max, z_max),
                      vec4(x_max, y_min, z_min),
                      vec4(x_max, y_min, z_max),
                      vec4(x_max, y_max, z_min),
                      vec4(x_max, y_max, z_max)
                     ];
     drawCube_helper(verticies);
}
function drawCube(){
	var verticies = [vec4(-1, -1, -1), vec4(-1, -1, 1), vec4(-1, 1, -1), vec4(-1, 1, 1),
					vec4(1, -1, -1), vec4(1, -1, 1), vec4(1, 1, -1), vec4(1, 1, 1)]; 
   drawCube_helper(verticies);
}
function drawCube2(x,y,z) {
   var min = vec3(-1/x, -1/y, -1/z);
   var max = vec3(1/x, 1/y, 1/z);

   var verticies = [vec4(min[0], min[1], min[2]), 
                    vec4(min[0], min[1], max[2]), 
                    vec4(min[0], max[1], min[2]),
                    vec4(min[0], max[1], max[2]),
                    vec4(max[0], min[1], min[2]),
                    vec4(max[0], min[1], max[2]),
                    vec4(max[0], max[1], min[2]), 
                    vec4(max[0], max[1], max[2])];
   drawCube_helper(verticies);
}
function drawCube_helper(verticies){
					
	modelBuffer = [];
	modelBuffer.push(verticies[0]);
	modelBuffer.push(verticies[1]);
	modelBuffer.push(verticies[3]);
	modelBuffer.push(verticies[2]);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(modelBuffer));
	gl.drawArrays(gl.LINE_LOOP, 0, modelBuffer.length);
	modelBuffer = [];
	modelBuffer.push(verticies[5]);
	modelBuffer.push(verticies[4]);
	modelBuffer.push(verticies[6]);
	modelBuffer.push(verticies[7]);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(modelBuffer));
	gl.drawArrays(gl.LINE_LOOP, 0, modelBuffer.length);
	modelBuffer = [];
	modelBuffer.push(verticies[1]);
	modelBuffer.push(verticies[5]);
	modelBuffer.push(verticies[7]);
	modelBuffer.push(verticies[3]);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(modelBuffer));
	gl.drawArrays(gl.LINE_LOOP, 0, modelBuffer.length);
	modelBuffer = [];
	modelBuffer.push(verticies[4]);
	modelBuffer.push(verticies[0]);
	modelBuffer.push(verticies[2]);
	modelBuffer.push(verticies[6]);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(modelBuffer));
	gl.drawArrays(gl.LINE_LOOP, 0, modelBuffer.length);
	modelBuffer = [];
	modelBuffer.push(verticies[2]);
	modelBuffer.push(verticies[3]);
	modelBuffer.push(verticies[7]);
	modelBuffer.push(verticies[6]);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(modelBuffer));
	gl.drawArrays(gl.LINE_LOOP, 0, modelBuffer.length);
	modelBuffer = [];
	modelBuffer.push(verticies[1]);
	modelBuffer.push(verticies[0]);
	modelBuffer.push(verticies[4]);
	modelBuffer.push(verticies[5]);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(modelBuffer));
	gl.drawArrays(gl.LINE_LOOP, 0, modelBuffer.length);
}

function drawShapes(shapes, drawBoundingBoxBool)
{
   for (var i = 0; i < shapes.length; i++){
      if (shapes[i].done_drawing == false){
         drawShape(shapes[i]);
      }
      else {
         draw3DShape(shapes[i]);
         if (drawBoundingBoxBool){
            drawBoundingBox(shapes[i]);
            for (var j = 0; j < shapes[i].corners.length; j++){
               drawMiniSquare(shapes[i], shapes[i].corners[j]);
            }
         }
      }
   }
}


function draw3DShape(shape){
   gl.bindBuffer(gl.ARRAY_BUFFER, modelBufferID);
   gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(vPosition);

   pushModelView();

   if (current_shape != -1 && shape == shapes[current_shape] && SCALING_BOOL==true)
   {
      modelViewMatrix = mult(modelViewMatrix, translate(shape.shape_center[0], shape.shape_center[1], shape.shape_center[2]));
      modelViewMatrix = mult(modelViewMatrix, scale(shape.scale[0], shape.scale[1], shape.scale[2]));
   } else {

      modelViewMatrix = mult(modelViewMatrix, translate(shape.shape_center[0], shape.shape_center[1], shape.shape_center[2]));
      //shear start
      modelViewMatrix = mult(shearOnX(shape.shearVal[0]),modelViewMatrix);
      modelViewMatrix = mult(shearOnY(shape.shearVal[1]),modelViewMatrix);
      modelViewMatrix = mult(modelViewMatrix,shearOnZ(shape.shearVal[2]));
      //end shear
	
      modelViewMatrix = mult(modelViewMatrix, scale(shape.scale[0], shape.scale[1], shape.scale[2]));
      modelViewMatrix = mult(modelViewMatrix, rotate(shape.xRotAng,[1,0,0]));
      modelViewMatrix = mult(modelViewMatrix, rotate(shape.yRotAng,[0,1,0]));
      modelViewMatrix = mult(modelViewMatrix, rotate(shape.zRotAng,[0,0,1]));
   
      //perspectiveRotation
      modelViewMatrix = mult(modelViewMatrix, perspectiveRot(shape.xRotAng, shape.zRotAng));
   }
   sendModelView();

   gl.uniform4fv(objectColor, getColor(shape));

   for (var i = 0; i < shape.all_3D_vertices.length; i++){
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(shape.all_3D_vertices[i]));
      gl.drawArrays(gl.LINE_STRIP, 0, shape.all_3D_vertices[i].length);
   }

   popModelView();

}

function getColor(shape)
{
   var color = colorArr[shape.color];
   if (current_shape != -1 && shapes[current_shape] == shape){
      return vec4(color[0], color[1], color[2], 0);
   }
   return color;
}

function drawShape(shape)
{
   var verticies = shape.line_verticies;

   if (shape.num_line_vertices == 0){
      return;
   }
   //gl.bindBuffer(gl.ARRAY_BUFFER, modelBufferID);
   //gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
   //gl.enableVertexAttribArray(vPosition);
   pushModelView();
   sendModelView();

   gl.uniform4fv(objectColor, getColor(shape));

   modelBuffer = [];
   for (var i = 0; i < verticies.length; i++){
          modelBuffer.push(verticies[i]);
   }
   gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(modelBuffer));
   gl.drawArrays(gl.LINE_STRIP, 0, modelBuffer.length);

   popModelView();
}

function translateShape(shape){
   shape.world_center = vec3(shape.world_center[0],shape.world_center[1] + 1,shape.world_center[2]);
   shape.shape_center = vec3(shape.shape_center[0],shape.shape_center[1] + 1,shape.shape_center[2]);
   render();
}

/*function scaleShape(){
   value = document.getElementById( "scale_slider").value;
   shapes[current_shape].scale=vec3(
                                     value/100,
                                     value/100,
                                     value/100
                                   )
   render();
}
*/
function rotateShapeX_slider(){
   if (current_shape != -1){
      value = document.getElementById( "xAng_slider").value;
      shapes[current_shape].xRotAng = value;
      render();
   }
}

function rotateShapeY_slider(){
   if (current_shape != -1){
      value = document.getElementById( "yAng_slider").value;
      shapes[current_shape].yRotAng = value;
      render();
   }
}
function rotateShapeZ_slider(){
   if (current_shape != -1){
      value = document.getElementById( "zAng_slider").value;
      shapes[current_shape].zRotAng = value;
      render();
   }
}

//-----HTML UI related functions-------

function rotateShapeX(dir){
   //value = document.getElementById( "xAng_slider").value;

   if(dir > 0){
       shapes[current_shape].xRotAng += Math.PI/4;
   }
   else{
       shapes[current_shape].xRotAng -= Math.PI/4;
   }
   render();
}

function rotateShapeY(dir){

   if(dir > 0){
       shapes[current_shape].yRotAng += Math.PI/4;
   }
   else{
       shapes[current_shape].yRotAng -= Math.PI/4;
   }
   render();
}
function rotateShapeZ(dir){

  if(dir > 0){
       shapes[current_shape].zRotAng += Math.PI/4;
   }
   else{
       shapes[current_shape].zRotAng -= Math.PI/4;
   }
   render();
}


//----Helper functions------

function rotateX(theta) {
  var c = Math.cos( radians(theta) );
  var s = Math.sin( radians(theta) );
  var rx = mat4( 1.0,  0.0,  0.0, 0.0,
      0.0,  c,  s, 0.0,
      0.0, -s,  c, 0.0,
      0.0,  0.0,  0.0, 1.0 );
  return rx;
}
function rotateY(theta) {
  var c = Math.cos( radians(theta) );
  var s = Math.sin( radians(theta) );
  var ry = mat4( c, 0.0, -s, 0.0,
      0.0, 1.0,  0.0, 0.0,
      s, 0.0,  c, 0.0,
      0.0, 0.0,  0.0, 1.0 );
  return ry;
}
function rotateZ(theta) {
  var c = Math.cos( radians(theta) );
  var s = Math.sin( radians(theta) );
  var rz = mat4( c, -1*s, 0.0, 0.0,
             s,  c, 0.0, 0.0,
             0.0, 0.0, 1.0, 0.0,
             0.0, 0.0, 0.0, 1.0 );
  return rz;
}

//new shear functions

function shearFunc(){
   if (current_shape != -1){
      value = document.getElementById( "shear_slider").value;
      var shearDir = radioButtonValue(); //document.radioForm.Q.value;
      shapes[current_shape].shearVal[shearDir] = value/50;
      shapes[current_shape].lastShear = shearDir;
      render();
   }
}

function shearOnX(s){
var t = mat4( vec4(1, s, 0, 0),
              vec4(0, 1, 0, 0),
              vec4(0, 0, 1, 0),
              vec4(0, 0, 0, 1));
return t
}

function shearOnY(s){
var t = mat4( vec4(1, 0, 0, 0),
              vec4(s, 1, 0, 0),
              vec4(0, 0, 1, 0),
              vec4(0, 0, 0, 1));
return t
}

function shearOnZ(s){
var t = mat4( vec4(1, 0, 0, 0),
              vec4(0, 1, 0, 0),
              vec4(0, s, 1, 0),
              vec4(0, 0, 0, 1));
return t
}

function radioButtonValue (){
   var radios = document.getElementsByName('Q');
   for (var i = 0, length = radios.length; i < length; i++) {
      if (radios[i].checked) {
         // do whatever you want with the checked radio
         return radios[i].value; //will be 0,1,2
      }
   }
}
