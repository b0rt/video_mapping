/*
 * Variables globales
 */

var box = null;
var mode_rendu = false;
corners_tab = new Array();

/*
 * Les matrices
 */

//Calcule la comatrice
 function adj(m) {
  return [
    m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
    m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
    m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]
  ];
}

//Multiplication entre 2 matrices
function multmm(a, b) {
  var c = Array(9);
  for (var i = 0; i != 3; ++i) {
    for (var j = 0; j != 3; ++j) {
      var cij = 0;
      for (var k = 0; k != 3; ++k) {
        cij += a[3*i + k]*b[3*k + j];
      }
      c[3*i + j] = cij;
    }
  }
  return c;
}

//Multiplication entre une matrice et un vecteur
function multmv(m, v) {
  return [
    m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
    m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
    m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
  ];
}

// Point affiché à l'écran -> Matrice des vecteurs bases
function basisToPoints(x1, y1, x2, y2, x3, y3, x4, y4) {
  var m = [
    x1, x2, x3,
    y1, y2, y3,
     1,  1,  1
  ];
  var v = multmv(adj(m), [x4, y4, 1]);
  return multmm(m, [
    v[0], 0, 0,
    0, v[1], 0,
    0, 0, v[2]
  ]);
}

// Matrice finale
function general2DProjection(
  x1s, y1s, x1d, y1d,
  x2s, y2s, x2d, y2d,
  x3s, y3s, x3d, y3d,
  x4s, y4s, x4d, y4d
) {
  var s = basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
  var d = basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
  return multmm(d, adj(s));
}

// Calcule la position des points avec la matrice finale
function project(m, x, y) {
  var v = multmv(m, [x, y, 1]);
  return [v[0]/v[2], v[1]/v[2]];
}

// Effectue la transformation pour un élément en fonction de 4 points
function transform2d(x1, y1, x2, y2, x3, y3, x4, y4) {
	if(box)
	{
		var w = box.offsetWidth, h = box.offsetHeight;
	  	var t = general2DProjection
	    (0, 0, x1, y1, w, 0, x2, y2, 0, h, x3, y3, w, h, x4, y4);
		  for(i = 0; i != 9; ++i) t[i] = t[i]/t[8];
	    	t = [t[0], t[3], 0, t[6],
	             t[1], t[4], 0, t[7],
	        	 0   , 0   , 1, 0   ,
	         	 t[2], t[5], 0, t[8]];
		t = "matrix3d(" + t.join(", ") + ")";
	  	box.style["-webkit-transform"] = t;
	  	box.style["-moz-transform"] = t;
	  	box.style["-o-transform"] = t;
		box.style.transform = t;
	}
}

// Met à jour la transformation de l'élément
function update() {
	if(box)
	{
		var corners = corners_tab[box.id];
		transform2d(corners[0], corners[1], corners[2], corners[3],
		            corners[4], corners[5], corners[6], corners[7]);
		for (var i = 0; i != 8; i += 2)
		{
			var elt = document.getElementById("marker" + i);
		    elt.style.left = corners[i] + "px";
		    elt.style.top = corners[i + 1] + "px";
		}
	}
}

// Récupère la position de la souris
function move(evnt) {
  	if(box)
 	{
		if (currentcorner < 0) return;
		corners_tab[box.id][currentcorner] = evnt.pageX;
		corners_tab[box.id][currentcorner + 1] = evnt.pageY;
		update();	
  	}
}

// Ajouts des événements
currentcorner = -1;
window.addEventListener('load', function() {
  document.documentElement.style.margin="0px";
  document.documentElement.style.padding="0px";
  document.body.style.margin="0px";
  document.body.style.padding="0px";
  update();
});

//Récupération du coin sur lequel on a cliqué
window.addEventListener('mousedown', function(evnt) {
 	if(box)
 	{
	  	var x = evnt.pageX, y = evnt.pageY, dx, dy;
	    var best = 400; // 20px grab radius
	    currentcorner = -1;
	    for (var i = 0; i != 8; i += 2) {
	  	dx = x - corners_tab[box.id][i];
	  	dy = y - corners_tab[box.id][i + 1];
	  	// Distance euclidienne ?
	  	if (best > dx*dx + dy*dy) {
	  	  best = dx*dx + dy*dy;
	  	  currentcorner = i;
	  	}
	    }
	    move(evnt);
	}
});

window.addEventListener('mouseup', function(evnt) {
  currentcorner = -1;
});

window.addEventListener('mousemove', move);


/*
 * Fini le copier/coller !
 * Maintenant c'est moi qui bosse :D
 */

// Affiche les 4 coins
function afficher_corners()
{
	var corners = document.querySelectorAll(".corner");
	var t = corners.length;
	
	for(var x = 0; x < t; x++)
	{
		corners[x].style.display = "block";
	}
}

function cacher_corners()
{
	var corners = document.querySelectorAll(".corner");
	var t = corners.length;
	
	for(var x = 0; x < t; x++)
	{
		corners[x].style.display = "none";
	}
}

function definir_corners()
{
	corners_tab[box.id] = [100, 100, 100 + box.offsetWidth, 100, 100, 100 + box.offsetHeight, 100 + box.offsetWidth, 100 + box.offsetHeight];
}


function cacher_popup()
{
	var popups = document.querySelectorAll(".fenetre_popup");
	var t = popups.length;
	
	for(var x = 0; x < t; x++)
	{
		popups[x].style.display = "none";
	}
}

function vider_box()
{
	var children = box.childNodes;
	var t = children.length;
	
	for(var x = 0; x < t; x++)
	{
		box.removeChild(children[x]);
	}
}

function afficher_box()
{
	cacher_popup();
	afficher_corners();
	definir_corners();
	update();
}

function afficher_popup(txt)
{
	cacher_popup();
	document.getElementById(txt + "_popup").style.display = "block";
}

function creer_site()
{
	var adresse = document.getElementById("site_adresse").value;
	var w = document.getElementById("site_largeur").value;
	var h = document.getElementById("site_hauteur").value;
	
	var iframe = document.createElement("iframe");
	iframe.src = adresse;
	iframe.width = w;
	iframe.height = h;
	
	return iframe;
}

function creer_image()
{
	var img = document.createElement("img");
  	var file    = document.querySelector('input[type=file]').files[0];
  	var reader  = new FileReader();

	reader.onloadend = function () {
		img.src = reader.result;
  		definir_corners();
  		update();
	}

	if (file) {
	  reader.readAsDataURL(file);
	} else {
		img.src = "";
	 	alert("Erreur lors du chargement de l'image");
	}
	
	return img;
}

function creer_texte()
{
	var contenu = document.getElementById("texte").value;
	
	var p = document.createElement("p");
	p.style.display = "inline-block";
	p.innerHTML = contenu;
	
	return p;
}

function creer_zone_texte()
{
	var w = 500;
	var h = 500;
	
	var textarea = document.createElement("textarea");
	textarea.id = "textarea";
	
	return textarea;
}

function ajouter_box()
{
	var boxs = document.querySelectorAll(".box");
	var id = boxs.length;

	var parent = document.getElementById("container");
	var box = document.createElement("div");
	box.id = "box" + id;
	box.classList.add("box");

	parent.appendChild(box);
	return box;
}

function modifier_box(type)
{
	vider_box();

	var content;
	switch(type)
	{
		case 1:
			content = creer_site();
			break;
	
		case 2:
			content = creer_image();
			break;

		case 3:
			content = creer_texte();
			break;

		case 4:
			content = creer_zone_texte();
			break;

		default:
			content = creer_zone_texte();
			break;
	}

	box.appendChild(content);
	afficher_box();
	cacher_popup();
	return false;
}

function creer_box()
{
	var newBox = ajouter_box();
	newBox.addEventListener("click", function() {select_box(newBox.id);}, false);
	box = newBox;
	afficher_box();
	updateMenu();
}

function supprimer_box()
{
	var parent = document.getElementById("container");
	parent.removeChild(box);
	box = null;
	cacher_corners();
	updateMenu();
}

function select_box(id)
{
	if(mode_rendu == false && (box == null || box.id != id))
	{
		box = document.getElementById(id);
		//recuperer_corners();
		afficher_corners();
		update();
	}
}

function updateMenu()
{
	if(box != null)
	{
		var elements = document.querySelectorAll(".modif");
		var t = elements.length;

		for(var x = 0; x < t; x++)
		{
			elements[x].style.display = "inline";
		}
	}
	else
	{
		var elements = document.querySelectorAll(".modif");
		var t = elements.length;

		for(var x = 0; x < t; x++)
		{
			elements[x].style.display = "none";
		}
	}
}

function Mode_rendu()
{
	var elements = document.querySelectorAll(".edit");
	var t = elements.length;

	for(var x = 0; x < t; x++)
	{
		elements[x].style.display = "none";
	}

	cacher_corners();

	document.body.style.backgroundColor = "#000";
	document.getElementById("mode_rendu").style.display = "none";
	document.getElementById("mode_edit").style.display = "inline";
	mode_rendu = true;
	box = null;
}

function Mode_edit()
{
	var elements = document.querySelectorAll(".edit");
	var t = elements.length;

	for(var x = 0; x < t; x++)
	{
		elements[x].style.display = "inline";
	}

	document.body.style.backgroundColor = "#FFF";
	document.getElementById("mode_rendu").style.display = "inline";
	document.getElementById("mode_edit").style.display = "none";

	if(box) afficher_corners();
	updateMenu();
	mode_rendu = false;
}
Mode_edit();

document.getElementById("ajouter_box").addEventListener("click", creer_box, false);
document.getElementById("supprimer_box").addEventListener("click", supprimer_box, false);
document.getElementById("ajouter_site").addEventListener("click", function() {afficher_popup("site");}, false);
document.getElementById("ajouter_image").addEventListener("click", function() {afficher_popup("image");}, false);
document.getElementById("ajouter_texte").addEventListener("click", function() {afficher_popup("texte");}, false);

document.getElementById("site_fermer").addEventListener("click", cacher_popup, false);
document.getElementById("image_fermer").addEventListener("click", cacher_popup, false);
document.getElementById("texte_fermer").addEventListener("click", cacher_popup, false);

document.getElementById("mode_rendu").addEventListener("click", Mode_rendu, false);
document.getElementById("mode_edit").addEventListener("click", Mode_edit, false);

