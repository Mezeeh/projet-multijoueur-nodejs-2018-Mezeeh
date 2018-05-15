(function () {
	// Vues de linterface (ceux affichees)
	var accueilVue;
	var attenteVue;
	var jeuVue;
	var finVue;
	var vueActive = null;

	var jeu = this;

	var joueur;
	var infosJoueurs = [];

	var adversaire;

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
		inactif: "INACTIF",
		haut: "HAUT",
		bas: "BAS",
		gauche: "GAUCHE",
		droite: "DROITE",
		hautGauche: "HAUT_GAUCHE",
		hautDroite: "HAUT_DROITE",
		basGauche: "BAS_GAUCHE",
		basDroite: "BAS_DROITE"
	};

	var dernierEtat;

	var dessin;
	var scene;
	var minuteur;

	var joueursEnCollision = false;

	function initialiser() {
		window.addEventListener("hashchange", interpreterEvenementsLocation);

		joueur = new Joueur();

		accueilVue = new AccueilVue(joueur);
		attenteVue = new AttenteVue();
		jeuVue = new JeuVue(joueur);
		finVue = new FinVue(joueur);

		accueilVue.afficher();
	}

	function initialiserConnexion() {
		connexion = new ConnexionNodeJS(demanderJoueur, commencerPartie, setMinuteur, setPartieTerminee, gererEtatJoueurs, demanderPosition);
	}

	function initialiserJeu() {
		console.log("initialiserJeu()");
		dessin = document.getElementById("canvas");
		scene = new createjs.Stage(dessin);
		joueur.setScene(scene);

		document.onkeydown = gererToucheAppuyer;
		document.onkeyup = gererToucheRelacher;

		for (info in infosJoueurs) {
			if (infosJoueurs[info].id == joueur.id) {
				console.log("joueur : " + infosJoueurs[info].nom + " " + infosJoueurs[info].role + " " + infosJoueurs[info].positionX + " " + infosJoueurs[info].positionY);
				joueur.setRole(infosJoueurs[info].role);
				joueur.creerRepresentation();
				joueur.setPosition(infosJoueurs[info].positionX, infosJoueurs[info].positionY);
				joueur.afficher();
			}

			if (infosJoueurs[info].id != joueur.id) {
				console.log("adversaire : " + infosJoueurs[info].nom + " " + infosJoueurs[info].role + " " + infosJoueurs[info].positionX + " " + infosJoueurs[info].positionY);
				adversaire = new Joueur();
				adversaire.setScene(scene);
				adversaire.id = infosJoueurs[info].id;
				adversaire.nom = infosJoueurs[info].nom;
				adversaire.setRole(infosJoueurs[info].role);
				adversaire.creerRepresentation();
				adversaire.setPosition(infosJoueurs[info].positionX, infosJoueurs[info].positionY);
				adversaire.afficher();
			}
		}

		createjs.Ticker.setFPS(25);
		createjs.Ticker.addEventListener("tick", rafraichirJeu);
	}

	function detruireJeu(){
		createjs.Ticker.removeEventListener("tick", rafraichirJeu);
		document.onkeydown = null;
		document.onkeyup = null;
	}

	function setMinuteur(minuteur){
		jeu.minuteur = JSON.parse(minuteur);
		demarrerMinuteur(jeu.minuteur);
	}

	function demarrerMinuteur(minuteur){
		var interv = setInterval(function(){
			jeu.minuteur -= 1;

			if(0 == jeu.minuteur)
				clearInterval(interv);
		}, 1000);
	}

	function setPartieTerminee(estTerminee){
		if(JSON.parse(estTerminee)){
			window.location = "#gagnant";
		}
	}

	function rafraichirJeu(evenement) {
		vitesse = evenement.delta / 1000 * 200;

		if(joueur && adversaire){
			if("INACTIF" != joueur.getEtat() && "INACTIF" != adversaire.getEtat()){
				joueur.deplacer(joueur.getEtat(), vitesse);
				adversaire.deplacer(adversaire.getEtat(), vitesse);

				if(!joueursEnCollision && joueur.representationRectangle().intersects(adversaire.representationRectangle())){
					joueursEnCollision = true;
					
					connexion.envoyerEnCollision({enCollision: joueursEnCollision, idJoueur: joueur.id});
				}
				else if(!joueur.representationRectangle().intersects(adversaire.representationRectangle()))
					joueursEnCollision = false;
			}

			jeuVue.raffraichirHUD({j1Nom: joueur.nom, j2Nom: adversaire.nom, j1Pointage: joueur.points, j2Pointage: adversaire.points, temps: jeu.minuteur});
		}

		scene.update(evenement);
	}

	function demanderPosition(){
		connexion.envoyerPosition({representation: joueur.representationRectangle(), id: joueur.id});
	}

	function demanderJoueur() {
		return joueur;
	}

	function commencerPartie(evenement) {
		console.log("La partie va commencer");
		infosJoueurs = JSON.parse(evenement);

		window.location = "#jeu";
	}

	function gererEtatJoueurs(etatJoueurs) {
		var listeEtatJoueurs = JSON.parse(etatJoueurs);

		for (j in listeEtatJoueurs) {
			if (joueur.id == listeEtatJoueurs[j].id)
				joueur.setEtat(listeEtatJoueurs[j].etat);
			else
				adversaire.setEtat(listeEtatJoueurs[j].etat);
		}

		console.log("adv " + adversaire.getEtat());
		console.log("j " + joueur.getEtat());
	}

	function gererToucheAppuyer(evenement) {
		var etat;

		if (evenement.keyCode in directionDeplacement) {
			directionDeplacement[evenement.keyCode] = true;

			if (directionDeplacement[touchesDeplacement.haut] && directionDeplacement[touchesDeplacement.gauche])
				etat = etatDirectionDeplacement.hautGauche;
			else if (directionDeplacement[touchesDeplacement.haut] && directionDeplacement[touchesDeplacement.droite])
				etat = etatDirectionDeplacement.hautDroite;
			else if (directionDeplacement[touchesDeplacement.bas] && directionDeplacement[touchesDeplacement.gauche])
				etat = etatDirectionDeplacement.basGauche;
			else if (directionDeplacement[touchesDeplacement.bas] && directionDeplacement[touchesDeplacement.droite])
				etat = etatDirectionDeplacement.basDroite;
			else if (directionDeplacement[touchesDeplacement.haut])
				etat = etatDirectionDeplacement.haut;
			else if (directionDeplacement[touchesDeplacement.bas])
				etat = etatDirectionDeplacement.bas;
			else if (directionDeplacement[touchesDeplacement.gauche])
				etat = etatDirectionDeplacement.gauche;
			else if (directionDeplacement[touchesDeplacement.droite])
				etat = etatDirectionDeplacement.droite;

			if (dernierEtat != etat) {
				console.log(etat);
				connexion.envoyerDeplacement({ "etat": etat, "id": joueur.id });
				dernierEtat = etat;
			}
		}
	}

	function gererToucheRelacher(evenement) {
		var etat;

		if (evenement.keyCode in directionDeplacement) {
			directionDeplacement[evenement.keyCode] = false;

			if (directionDeplacement[touchesDeplacement.haut] && directionDeplacement[touchesDeplacement.gauche])
				etat = etatDirectionDeplacement.hautGauche;
			else if (directionDeplacement[touchesDeplacement.haut] && directionDeplacement[touchesDeplacement.droite])
				etat = etatDirectionDeplacement.hautDroite;
			else if (directionDeplacement[touchesDeplacement.bas] && directionDeplacement[touchesDeplacement.gauche])
				etat = etatDirectionDeplacement.basGauche;
			else if (directionDeplacement[touchesDeplacement.bas] && directionDeplacement[touchesDeplacement.droite])
				etat = etatDirectionDeplacement.basDroite;
			else if (directionDeplacement[touchesDeplacement.haut])
				etat = etatDirectionDeplacement.haut;
			else if (directionDeplacement[touchesDeplacement.bas])
				etat = etatDirectionDeplacement.bas;
			else if (directionDeplacement[touchesDeplacement.gauche])
				etat = etatDirectionDeplacement.gauche;
			else if (directionDeplacement[touchesDeplacement.droite])
				etat = etatDirectionDeplacement.droite;
			else
				etat = etatDirectionDeplacement.inactif;

			console.log(etat);
			connexion.envoyerDeplacement({ "etat": etat, "id": joueur.id });
			joueur.setEtat(etat);
			dernierEtat = etat;
		}
	}

	function interpreterEvenementsLocation(evenement) {
		//hash est la partie suivant le # dans l'url
		var intructionNavigation = window.location.hash;
		if (!intructionNavigation || intructionNavigation.match(/^#$/) || intructionNavigation.match(/^#accueil$/)) {
			if(vueActive instanceof JeuVue)
				detruireJeu();

			accueilVue.afficher();
			vueActive = accueilVue;
		}
		else if (intructionNavigation.match(/^#attente$/)) {
			console.log("En attente du second joueur...");
			attenteVue.afficher();
			vueActive = attenteVue;
			initialiserConnexion();
		}
		else if (intructionNavigation.match(/^#jeu$/)) {
			jeuVue.afficher();
			vueActive = jeuVue;
			initialiserJeu();
		}
		else if (intructionNavigation.match(/^#gagnant$/)) {
			if(vueActive instanceof JeuVue)
				detruireJeu();
			
			finVue.afficher("gagne");
			vueActive = finVue;
		}
		else if (intructionNavigation.match(/^#perdant$/)) {
			if(vueActive instanceof JeuVue)
				detruireJeu();
			
			finVue.afficher("perdu");
			vueActive = finVue;
		}
	}

	initialiser();
})();