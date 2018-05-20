Joueur = function()
{
	this.nom;
	this.id;
	this.points = 0;
	
	var role;

	var scene;
	var representation;
	var etat = "INACTIF"; // inactif plutot que "" pour ne pas creer une erreur et des deplacements non representatif au debut

	var joueur = this;

	// donne une genre de hitbox a la forme qui represente le joueur
	// utile pour verifier les collision du cote client mais serveur aussi
	this.representationRectangle = function () {
		joueur.representation.setBounds(joueur.representation.x, joueur.representation.y, 30, 30); // sert a creer une hitbox
        
        return joueur.representation.getBounds();
	}

	// cree la forme et lui donne une couleur selon le role quil a bleu pour defenseur et rouge pour attaquant
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

	// bouge sur le canvas selon letat quil recoit
	// la vitesse est base sur le temps pour sassurer que les fps ninfluence pas trop la sync des joueurs
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

	// change le role et donne la position relative au role quil recoit par le serveur
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

	// fait juste lafficher sur le stage createjs
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
