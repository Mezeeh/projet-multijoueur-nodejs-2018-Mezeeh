Joueur = function()
{
	this.nom;
	this.id;
	this.points = 0;
	
	var role;

	var scene;
	var representation;
	var etat = "INACTIF";

	this.representationRectangle = function () {
		representation.setBounds(representation.x, representation.y, 30, 30); // sert a creer une hitbox
        
        return representation.getBounds();
	}

	this.creerRepresentation = function(){
		representation = new createjs.Shape();
		representation.graphics.beginFill("Defenseur" == this.role ? "blue" : "red").drawRect(0, 0, 30, 30);
	}

	this.getEtat = function(){
		return this.etat;
	}

	this.setEtat = function(etat){
		this.etat = etat;
	}

	this.deplacer = function(etat, vitesse){
		switch (etat) {
			case "HAUT_GAUCHE":
				representation.x -= vitesse;
				representation.y -= vitesse;
				break;
			case "HAUT_DROITE":
				representation.x += vitesse;
				representation.y -= vitesse;
				break;
			case "BAS_GAUCHE":
				representation.x -= vitesse;
				representation.y += vitesse;
				break;
			case "BAS_DROITE":
				representation.x += vitesse;
				representation.y += vitesse;
				break;
			case "HAUT":
				representation.y -= vitesse;
				break;
			case "BAS":
				representation.y += vitesse;
				break;
			case "GAUCHE":
				representation.x -= vitesse;
				break;
			case "DROITE":
				representation.x += vitesse;
				break;
		}

		this.representationRectangle();
	}

	this.getPosition = function(){
		return {x: representation.x, y: representation.y};
	}

	this.setPosition = function(x, y){
		representation.x = x;
		representation.y = y;

		this.representationRectangle();
	}

	this.changerRole = function(){
		this.role = "Defenseur" == this.role ? "Attaquant" : "Defenseur";
	}

	this.afficher = function(){
		this.scene.addChild(representation);
	}

	this.getRole = function(){
		return this.role;
	}

	this.setRole = function(role){
		this.role = role
	}

	this.setScene = function(scene){
		this.scene = scene;
	}
}
