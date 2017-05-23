var m = 4; //nbRows
var n = 10; //nbColumns

var scale= 20;
var zone = document.getElementById("zone");
var context = zone.getContext("2d");
 
console.log("width=" + zone.width);
console.log("height=" +zone.height);
 
//zone.style.width = (n*scale)+"px";
//zone.style.height = (m*scale)+"px";

zone.setAttribute("width",(n*scale)+"px");
zone.setAttribute("height",(m*scale)+"px");

function getWidth()
{
	return (n*scale)+"px";
}

function getHeight()
{
	return (m*scale)+"px";
}


console.log("width=" + zone.width);
console.log("height=" +zone.height);


var nbCells = m*n;
var infty = nbCells+1;

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


//adjacency list
var graph = [];

for(i=0;i<m;i++)
{
	for(j=0;j<n;j++)
	{
		graph.push(neighbours(i,j));
	}
}


//for(var nb=0;nb<graph.length;nb++)
//	console.log(graph[nb]);


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
	console.log("pred");
	console.log(pred);
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

var primRes = PRIM(graph, weight);
var doors = primRes[0];
var walls = primRes[1];

console.log("doors");
for(var i=0;i<doors.length;i++)
	console.log( doors[i] );

console.log("walls");
for(var i=0;i<walls.length;i++)
	console.log(walls[i]);

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
	console.log("dessine wall" + u+" "+v);
	context.strokeStyle = "black";
	context.beginPath();
	var point1 = id2Coord(u);
	var point2 = id2Coord(v);
	if(point1[0]==point2[0])
	{
		context.moveTo(scale*point1[0], point1[1]*scale);
		context.lineTo(scale*(point1[0]+1), point1[1]*scale);
	}
	
	context.closePath();
	context.stroke();
}

//drawMaze(walls);

function drawGrid()
{
	context.strokeStyle = "blue";
	context.beginPath();
	for(var i=0; i< m-1; i++)
	{
		console.log("draw line");
		context.moveTo(0*scale,(i+1)*scale);
		context.lineTo((n+1)*scale,(i+1)*scale);
	}
	context.closePath();
	context.stroke();
}

drawGrid();


function drawRectangle()
{
	console.log(scale);
	context.fillStyle = "green";
	context.fillRect(scale,scale,(2*scale),scale);
	console.log(scale);
	
}

//drawRectangle();

/* test de la fonction myQuickSort
var N = 4;
var Atest = allTheVertices(N);
console.log(Atest);

var cTest = [12,2,65,10];

console.log(cTest);

myQuickSort(Atest,cTest,0,Atest.length-1);
console.log(Atest);
console.log(cTest);
*/




