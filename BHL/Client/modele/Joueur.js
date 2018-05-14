Joueur = function()
{
	this.nom;
	this.id;
	
	var role;

	var scene;
	var representation;

	this.creerRepresentation = function(){
		representation = new createjs.Shape();
		representation.graphics.beginFill("Defenseur" == this.role ? "blue" : "red").drawRect(0, 0, 30, 30);
	}

	this.setPosition = function(x, y){
		representation.x = x;
		representation.y = y;
	}

	this.changerRole = function(){
		this.role = "Defenseur" == this.role ? "Attaquant" : "Defenseur";
	}

	this.afficher = function(){
		this.scene.addChild(representation);
	}

	this.setRole = function(role){
		this.role = role
	}

	this.setScene = function(scene){
		this.scene = scene;
	}
}
