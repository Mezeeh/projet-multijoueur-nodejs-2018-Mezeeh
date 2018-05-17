Joueur = function()
{
	this.nom;
	this.id;
	this.points = 0;
	
	var role;

	var scene;
	var representation;
	var etat = "INACTIF";

	var joueur = this;

	this.representationRectangle = function () {
		joueur.representation.setBounds(joueur.representation.x, joueur.representation.y, 30, 30); // sert a creer une hitbox
        
        return joueur.representation.getBounds();
	}

	this.creerRepresentation = function(){
		joueur.representation = new createjs.Shape();
		joueur.representation.graphics.beginFill("Defenseur" == this.role ? "blue" : "red").drawRect(0, 0, 30, 30);
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
			joueur.representation.x -= vitesse;
			joueur.representation.y -= vitesse;
				break;
			case "HAUT_DROITE":
			joueur.representation.x += vitesse;
				joueur.representation.y -= vitesse;
				break;
			case "BAS_GAUCHE":
			joueur.representation.x -= vitesse;
				joueur.representation.y += vitesse;
				break;
			case "BAS_DROITE":
			joueur.representation.x += vitesse;
				joueur.representation.y += vitesse;
				break;
			case "HAUT":
			joueur.representation.y -= vitesse;
				break;
			case "BAS":
			joueur.representation.y += vitesse;
				break;
			case "GAUCHE":
			joueur.representation.x -= vitesse;
				break;
			case "DROITE":
			joueur.representation.x += vitesse;
				break;
		}

		this.representationRectangle();
	}

	this.getPosition = function(){
		return {x: joueur.representation.x, y: joueur.representation.y};
	}

	this.setPosition = function(x, y){
		joueur.representation.x = x;
		joueur.representation.y = y;

		this.representationRectangle();
	}

	this.changerRole = function(role, positionX, positionY){
		console.log(joueur.nom + " etait " + joueur.role);
		joueur.role = role;
		console.log(joueur.nom + " est maintenant " + joueur.role);
		joueur.scene.removeChild(joueur.representation);
		joueur.creerRepresentation();
		joueur.afficher();
		//joueur.representation.graphics.beginFill("Defenseur" == joueur.role ? "blue" : "red");
		joueur.representation.x = positionX;
		joueur.representation.y = positionY;
	}

	this.afficher = function(){
		this.scene.addChild(joueur.representation);
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
