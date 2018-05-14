Joueur = function()
{
	this.nom;
	this.id;
	
	var role;

	var scene;
	var representation;

	this.creerRepresentation = function(){
		representation = new createjs.Shape();
		affichageSelonRole(this.role);
	}

	function affichageSelonRole(role){
		representation.graphics.beginFill("Defenseur" == role ? "blue" : "red").drawRect(0, 0, 30, 30);
		representation.x = "Defenseur" == role ? /* this.scene.canvas.width */ 20 : /* this.scene.canvas.width */ 640;
		representation.y = /* this.scene.canvas.height */ (720 / 2);
		console.log(role);
	}

	this.changerRole = function(){
		this.role = "Defenseur" == this.role ? "Attaquant" : "Defenseur";
	}

	this.afficher = function(){
		this.scene.addChild(representation);
	}

	this.setRole = function(role){
		this.role = role
		console.log(this.nom + " " + this.role);
	}

	this.setScene = function(scene){
		this.scene = scene;
	}
}
