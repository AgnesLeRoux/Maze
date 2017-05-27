
var m = 10; //nbRows
var n = 10; //nbColumns

var scale= 20;
var zone = document.getElementById("zone");
var context = zone.getContext("2d");
 
console.log("width=" + zone.width);
console.log("height=" +zone.height);
 
zone.setAttribute("width",(n*scale)+"px");
zone.setAttribute("height",(m*scale)+"px");

//console.log("width="  + zone.width);
//console.log("height=" + zone.height);

var nbCells = m*n;
var infty = nbCells+1;
var graph = [];
var doors = [];
var walls = [];


function changeSize()
{
	erase();
	var nbRowsStr = document.getElementById("nbRows").value;
	m = Math.min(35,parseInt(nbRowsStr));
	var nbColsStr = document.getElementById("nbCols").value;
	n = Math.min(35,parseInt(nbColsStr));
	zone.setAttribute("width",(n*scale)+"px");
	zone.setAttribute("height",(m*scale)+"px");
	nbCells = m*n;
	infty = nbCells+1;
}


function generateMaze()
{
	erase();
	//adjacency list
	
	
	for(i=0;i<m;i++)
	{
		for(j=0;j<n;j++)
		{
			graph.push(neighbours(i,j));
		}
	}

	var weight = []; // weight[u][v] = weight of arc(i,j)
	for(var u=0; u<nbCells;u++)
	{
		var line = [];
		for(var v=0; v< nbCells; v++)
		{
			if(u !=v)
				line.push(infty); //initialize to infty
			else
				line.push(0);
		}  
		weight.push(line);
	}

	for(var u=0; u<nbCells; u++)
		for (var v=0; v<graph[u].length; v++)
		{
			if(weight[u][graph[u][v]] == infty)
			{
				weight[u][graph[u][v]] = Math.random();
				weight[graph[u][v]][u] = weight[u][graph[u][v]];
			}
		}
		
		var primRes = PRIM(graph, weight);
		doors = primRes[0];
		walls = primRes[1];
		
		drawMaze(walls);
		
		/*
		console.log("doors");;
		for(var i=0;i<doors.length;i++)
			console.log( doors[i] );
		*/
		/*
		console.log("walls");
		for(var i=0;i<walls.length;i++)
			console.log(walls[i]);
		*/
}

function erase()
{
	graph = [];
	doors = [];
	walls = [];
	context.clearRect(0,0,n*scale,m*scale);
}

function id2Coord(id)
{
	return [Math.floor(id/n),id%n];
}

function coord2Id(coord)
{
	return n * coord[0] + coord[1]; 
}

function neighbours(i,j)
{
	var neigh = [];
	if(i>0)
		neigh.push(coord2Id([i-1,j]));
	if(i<m-1)
		neigh.push(coord2Id([i+1,j]));
	if(j>0)
		neigh.push(coord2Id([i,j-1]));
	if(j<n-1)
		neigh.push(coord2Id([i,j+1]));
	
	return neigh;
}

//just to print///////////////////
/*
for(var u=0; u<nbCells; u++)
{
	var lineToPrint =[];
		for(var v=0;v<nbCells; v++)
		if(weight[u][v]==infty)
		{
			lineToPrint.push("");
		}
		else
		{
			lineToPrint.push(Math.floor(100 *weight[u][v])/100);
		}
	console.log(lineToPrint);
}
*/
//////////////////////////////////


function PRIM(graph, weight) //compute the minimum spanning tree with the PRIM algorithm
{
	//initializing the pred and c values
	var start = 0; //first vertex;
	var c = [];
	var pred = [];
	for(var u=0; u<nbCells; u++)
	{
		c.push(infty);
		pred.push(-1);
	}
	c[start] = 0;
	
	var Q = allTheVertices(nbCells);
	var F = [];
	while(Q.length > 0)
	{
		myQuickSort(Q,c,0,Q.length-1);
		var v = Q.shift(); //takes the first element
		F.push(v);
		for(var wId = 0; wId < graph[v].length; wId++)
		{
			var w = graph[v][wId];
			if(Q.indexOf(w)>=0 && weight[v][w]<c[w])
			{
				c[w] = weight[v][w];
				pred[w] = v;
			}
		}
	}
	//console.log("pred");
	//console.log(pred);
	//return types
	var walls = initializeTab(nbCells);//adjacency list
	var doors = initializeTab(nbCells);//adjacency list
	
	for(var u=0; u<nbCells; u++)
		for(var vId=0 ; vId<graph[u].length ; vId++)
		{
			var v = graph[u][vId];
			if(u < v)
			{
				if(pred[v]==u || pred[u]==v)
				{
					doors[u].push(v);
					doors[v].push(u);
				}
				else
				{
					walls[u].push(v);
					walls[v].push(u);
				}
			}
			
		}
	
	return [doors,walls];
}

function initializeTab(size)
{
	var tab = [];
	for(var i=0;i<size;i++)
		tab.push([]);
	return tab;
}


function allTheVertices(size)
{
	var tab = [];
	for(var i=0;i<size;i++)
	{
		tab.push(i);
	}
	return tab;
}

function myQuickSort(A,c,p,r)
{
	
	if(p<r)
	{
		var q = partition(A,c,p,r)
		myQuickSort(A,c,p,q-1)
		myQuickSort(A,c,q+1,r)
	}
	
	
}

function partition(A,c,p,r)
{
	var x = c[A[r]];
	var i = p-1;
	for(var j=p; j<r ; j++)
	{
		if(c[A[j]]<=x)
		{
			i++;
			var swap = A[i];
			A[i] = A[j];
			A[j] = swap;
		}
	}
	var swap1 = A[i+1];
	A[i+1] = A[r];
	A[r] = swap1;
	return (i+1);
}

function drawMaze(walls)
{
	for(var u=0 ; u< walls.length; u++)
		for(var idV=0; idV<walls[u].length ; idV++)
		{
			var v = walls[u][idV];
			if(u < v)
				drawWall(u,v);
		}
}

function drawWall(u,v)
{
	context.strokeStyle = "black";
	context.beginPath();
	
	var point1 = id2Coord(u);
	var point2 = id2Coord(v);
	//vertical wall
	if(point1[0] == point2[0])
	{
		context.moveTo(scale*(Math.max(point1[1],point2[1])), point1[0]*scale);
		context.lineTo(scale*(Math.max(point1[1],point2[1])), (point1[0]+1)*scale);
	}
	else //horizontal wall
	{
		context.moveTo(scale*(point1[1]), scale*(Math.max(point1[0],point2[0])));
		context.lineTo(scale*(point1[1]+1), scale*(Math.max(point1[0],point2[0])));
	}
	context.closePath();
	context.stroke();
}

function solveMaze()
{
	
	var pred = [];
	for(var i=0 ; i < nbCells ; i++)
	{
		pred.push(-1);
	}
	var stack = [];
	var start = 0;
	var end = nbCells - 1;
	
	var e = start;
	stack.push(e);
	while(e != end && stack.length>0)
	{
		e = stack.pop();
		for(var nextId=0; nextId < doors[e].length; nextId++)
		{
			next = doors[e][nextId];
			if(next != pred[e])
			{
				pred[next]= e;
				stack.push(next);
			}
		} 
	}
	drawSolution(pred,end);
	drawMaze(walls);
}
function drawSolution(pred, e)
{
	while(pred[e] != -1)
	{
		drawRectangle(id2Coord(e),"red");
		e = pred[e];
	}
	drawRectangle(id2Coord(e),"red");
}


function solveDynamic()
{
	var pred = [];
	for(var i=0 ; i < nbCells ; i++)
	{
		pred.push(-1);
	}
	
	var stack = [];
	var start = 0;
	var end = nbCells - 1;
	
	var e = start;
	var exploreNext = true;
	
	var id = setInterval(nextStep, 125);
	
	function nextStep()
	{
		if(exploreNext)
		{
			for(var nextId=0; nextId < doors[e].length; nextId++)
			{
				next = doors[e][nextId];
				if(next != pred[e])
				{
					pred[next]= e;
					stack.push(next);
				}
			}
			lastExplored = e;
			
			drawRectangle(id2Coord(e),"red");
			drawMaze(walls);
			
			if(e!=end)
			{
				e = stack.pop();
			}
			else
			{
				clearInterval(id);
			}
			
			
			if(pred[e] != lastExplored)
			{
				exploreNext = false;
				toErase = lastExplored;
			}
		}
		else
		{
			console.log(toErase);
			drawRectangle(id2Coord(toErase),"lightblue");
			drawMaze(walls);
			toErase = pred[toErase];
			if(toErase == pred[e])
				exploreNext = true;
		}
	}	
	
	
}

function drawRectangle(coord,color)
{
	context.fillStyle = color;
	context.fillRect(scale*coord[1] , scale*coord[0],  scale, scale);
}

