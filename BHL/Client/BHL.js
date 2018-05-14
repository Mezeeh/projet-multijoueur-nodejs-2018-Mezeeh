(function (){
    // Vues de linterface (ceux affichees)
    var accueilVue;
    var attenteVue;
	var jeuVue;
	var finVue;
    var vueActive = null;

	var joueur;
	var infosJoueur;
	
	var touchesDeplacement = {
        haut: 87, // w
        bas: 83, // s
        gauche: 65, // a
		droite: 68 // d
	};

	var directionDeplacement = {
		87: false, // w
        83: false, // s
        65: false, // a
		68: false // d
	};

	var etatDirectionDeplacement = {
		inactif : "INACTIF",
		haut : "HAUT",
		bas : "BAS",
		gauche : "GAUCHE",
		droite : "DROITE",
		hautGauche : "HAUT_GAUCHE",
		hautDroite : "HAUT_DROITE",
		basGauche : "BAS_GAUCHE",
		basDroite : "BAS_DROITE"
	};

	var dernierEtat;

	var dessin;
	var scene;
    
    function initialiser(){
        window.addEventListener("hashchange", interpreterEvenementsLocation);
		
		joueur = new Joueur();
        
		accueilVue = new AccueilVue(joueur);
        attenteVue = new AttenteVue();
		jeuVue = new JeuVue(joueur);
        finVue = new FinVue(joueur);

        accueilVue.afficher();
    }
	
	function initialiserConnexion(){
		connexion = new ConnexionNodeJS(demanderJoueur, commencerPartie);
	}

	function initialiserJeu(){
		console.log("initialiserJeu()");
		dessin = document.getElementById("canvas");
		scene = new createjs.Stage(dessin);
		joueur.setScene(scene);

		document.onkeydown = gererToucheAppuyer;
		document.onkeyup = gererToucheRelacher;

		joueur.setRole(infosJoueur.role);
		joueur.creerRepresentation();
		joueur.setPosition(infosJoueur.positionX, infosJoueur.positionY);
		joueur.afficher();
		
		createjs.Ticker.setFPS(25);
		createjs.Ticker.addEventListener("tick", rafraichirJeu);
	}

	function rafraichirJeu(evenement) {
		scene.update(evenement);
	}
	
	function demanderJoueur(){
		return joueur;
	}

	function commencerPartie(evenement){
		console.log("La partie va commencer");
		infosJoueur = JSON.parse(evenement);
		
		window.location = "#jeu";
	}

	function gererToucheAppuyer(evenement){
		var etat;

		if(evenement.keyCode in directionDeplacement){
			directionDeplacement[evenement.keyCode] = true;

			if(directionDeplacement[touchesDeplacement.haut] && directionDeplacement[touchesDeplacement.gauche])
				etat = etatDirectionDeplacement.hautGauche;
			else if(directionDeplacement[touchesDeplacement.haut] && directionDeplacement[touchesDeplacement.droite])
				etat = etatDirectionDeplacement.hautDroite;
			else if(directionDeplacement[touchesDeplacement.bas] && directionDeplacement[touchesDeplacement.gauche])
				etat = etatDirectionDeplacement.basGauche;
			else if(directionDeplacement[touchesDeplacement.bas] && directionDeplacement[touchesDeplacement.droite])
				etat = etatDirectionDeplacement.basDroite;
			else if(directionDeplacement[touchesDeplacement.haut])
				etat = etatDirectionDeplacement.haut;
			else if(directionDeplacement[touchesDeplacement.bas])
				etat = etatDirectionDeplacement.bas;
			else if(directionDeplacement[touchesDeplacement.gauche])
				etat = etatDirectionDeplacement.gauche;
			else if(directionDeplacement[touchesDeplacement.droite])
				etat = etatDirectionDeplacement.droite;

			if(dernierEtat != etat){
				console.log(etat);
				connexion.envoyerDeplacement(etat);
				dernierEtat = etat;
			}
		}
	}

	function gererToucheRelacher(evenement){
		var etat;

		if(evenement.keyCode in directionDeplacement){
			directionDeplacement[evenement.keyCode] = false;

			if(directionDeplacement[touchesDeplacement.haut] && directionDeplacement[touchesDeplacement.gauche])
				etat = etatDirectionDeplacement.hautGauche;
			else if(directionDeplacement[touchesDeplacement.haut] && directionDeplacement[touchesDeplacement.droite])
				etat = etatDirectionDeplacement.hautDroite;
			else if(directionDeplacement[touchesDeplacement.bas] && directionDeplacement[touchesDeplacement.gauche])
				etat = etatDirectionDeplacement.basGauche;
			else if(directionDeplacement[touchesDeplacement.bas] && directionDeplacement[touchesDeplacement.droite])
				etat = etatDirectionDeplacement.basDroite;
			else if(directionDeplacement[touchesDeplacement.haut])
				etat = etatDirectionDeplacement.haut;
			else if(directionDeplacement[touchesDeplacement.bas])
				etat = etatDirectionDeplacement.bas;
			else if(directionDeplacement[touchesDeplacement.gauche])
				etat = etatDirectionDeplacement.gauche;
			else if(directionDeplacement[touchesDeplacement.droite])
				etat = etatDirectionDeplacement.droite;
			else
				etat = etatDirectionDeplacement.inactif;

			dernierEtat = etat;
			connexion.envoyerDeplacement(etat);
		}
	}

    function interpreterEvenementsLocation(evenement){
		//hash est la partie suivant le # dans l'url
		var intructionNavigation = window.location.hash;
		if(!intructionNavigation || intructionNavigation.match(/^#$/) || intructionNavigation.match(/^#accueil$/)) {
			accueilVue.afficher();	
			vueActive = accueilVue;
		}
		else if(intructionNavigation.match(/^#attente$/)){
            console.log("En attente du second joueur...");
			attenteVue.afficher();
			initialiserConnexion();
            vueActive = attenteVue;
		}
		else if(intructionNavigation.match(/^#jeu$/)){
			jeuVue.afficher();
			initialiserJeu();
			vueActive = jeuVue;
		}
		else if(intructionNavigation.match(/^#gagnant$/)){
            finVue.afficher("gagne");
			vueActive = finVue;
		}
		else if(intructionNavigation.match(/^#perdant$/)){
			finVue.afficher("perdu");
			vueActive = finVue;
		}
    }
    
    initialiser();
})();