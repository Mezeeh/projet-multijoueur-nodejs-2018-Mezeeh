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

	// cre une connexion et lui donne ses callbacks
	function initialiserConnexion() {
		connexion = new ConnexionNodeJS(demanderJoueur,
			commencerPartie,
			setMinuteur,
			setPartieTerminee,
			gererEtatJoueurs,
			demanderPosition,
			changerRole,
			setProlongation);
	}
	// initialise tout ce qui concerne le jeu et son affichage
	function initialiserJeu() {
		console.log("initialiserJeu()");
		dessin = document.getElementById("canvas");
		scene = new createjs.Stage(dessin);
		joueur.setScene(scene);

		// pour savoir la direction du joueur
		document.onkeydown = gererToucheAppuyer;
		document.onkeyup = gererToucheRelacher;

		// cre un joueur et un adversaire et lui donne les infos quil a besoin pour safficher correctement a lecran
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

	// utile pour les ecrans de fin de partie pour que le tick et les touches ne creent pas dactions non desirer
	function detruireJeu() {
		createjs.Ticker.removeEventListener("tick", rafraichirJeu);
		document.onkeydown = null;
		document.onkeyup = null;
	}

	// fait juste dire au joueur de changer de role en lui donnant ce quil a besoin pour le faire
	function changerRole(listeJoueurs) {
		joueurs = JSON.parse(listeJoueurs);

		for (j in joueurs) {
			if (joueurs[j].id == joueur.id) {
				joueur.changerRole(joueurs[j].role, joueurs[j].positionX, joueurs[j].positionY);
				joueur.points = joueurs[j].points; // TODO : retirer
			}
			else if (adversaire.id == joueurs[j].id) {
				adversaire.changerRole(joueurs[j].role, joueurs[j].positionX, joueurs[j].positionY);
				adversaire.points = joueurs[j].points; // TODO : retirer
			}
		}
	}

	// sert seulement a donner un temps a la partie qui sera afficher sur le hud
	function setMinuteur(minuteur) {
		jeu.minuteur = JSON.parse(minuteur);
		demarrerMinuteur(jeu.minuteur);
	}

	// semblable a setMiniteur() mais pour si la partie necessite une prolongation
	function setProlongation(prolongation) {
		jeu.minuteur = JSON.parse(prolongation);
		clearInterval(interv); // clear pour sassurer que linterval nes pas toujours en cours et ne pas creer des donnes erronnees et des bugs daffichage
		demarrerMinuteur(jeu.minuteur);
	}

	var interv;
	// descend la temps de 1s a toute les 1s
	function demarrerMinuteur(minuteur) {
		interv = setInterval(function () {
			jeu.minuteur -= 1;

			if (jeu.minuteur <= 0) {
				jeu.minuteur = 0;
				clearInterval(interv);
			}
		}, 1000);
	}

	// change la page quand la partie est terminee selon que le joueur est gagne ou non
	function setPartieTerminee(estTerminee) {
		etatPartie = JSON.parse(estTerminee);
		if (etatPartie.partieTerminee) {
			window.location = etatPartie.gagnant.id == joueur.id ? "#gagnant" : "#perdant";
		}
	}

	// se fait a chaque tick de createjs
	function rafraichirJeu(evenement) {
		vitesse = evenement.delta / 1000 * 200;

		if (joueur && adversaire) {
			if ("INACTIF" != joueur.getEtat() && "INACTIF" != adversaire.getEtat()) {
				joueur.deplacer(joueur.getEtat(), vitesse);
				adversaire.deplacer(adversaire.getEtat(), vitesse);

				// si les joueurs rentrent en collision il lenvoie au sereur avec son id
				// le joueursEnCollision sert que levent enCollision ne soit pas appeler tant que les joueurs se touchent mais seulement la premiere fois quil se touche
				// joueursEnCollision est renitialiser quand les joueurs ne se touchent plus
				if (!joueursEnCollision && joueur.representationRectangle().intersects(adversaire.representationRectangle())) {
					joueursEnCollision = true;
					console.log("Collision selon moi (" + joueur.nom + ")");
					connexion.envoyerEnCollision({ enCollision: joueursEnCollision, idJoueur: joueur.id });
				}
				else if (!joueur.representationRectangle().intersects(adversaire.representationRectangle()))
					joueursEnCollision = false;
			}

			jeuVue.raffraichirHUD({ j1Nom: joueur.nom, j2Nom: adversaire.nom, j1Pointage: joueur.points, j2Pointage: adversaire.points, temps: jeu.minuteur });
		}

		scene.update(evenement);
	}

	// callback utiliser dans ConnexionNodeJS pour avour la representation du joueur et son id
	function demanderPosition() {
		connexion.envoyerPosition({ representation: joueur.representationRectangle(), id: joueur.id });
	}

	// callback qui renvoit lobjet joueur en entier
	function demanderJoueur() {
		return joueur;
	}

	// affiche la page de jeu
	function commencerPartie(evenement) {
		console.log("La partie va commencer");
		infosJoueurs = JSON.parse(evenement);

		window.location = "#jeu";
	}

	// callback qui set letat du joueur pour que les deplacements a lecran se fassent correctement
	function gererEtatJoueurs(etatJoueurs) {
		var listeEtatJoueurs = JSON.parse(etatJoueurs);

		for (j in listeEtatJoueurs) {
			if (joueur.id == listeEtatJoueurs[j].id) {
				joueur.setEtat(listeEtatJoueurs[j].etat);
				console.log("j " + joueur.getEtat());
			} else {
				adversaire.setEtat(listeEtatJoueurs[j].etat);
				console.log("adv " + adversaire.getEtat());
			}
		}

	}

	// set letat selon les touches appuyes et envoie ensuite au serveur letat avec lid du joueur pour les differentier
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

			// pour que levent ne soit pas envoyer si la touche est maintenu
			if (dernierEtat != etat) {
				console.log(etat);
				connexion.envoyerDeplacement({ "etat": etat, "id": joueur.id });
				dernierEtat = etat;
			}
		}
	}

	// meme chose que gererToucheAppuyer mais si rien nest appuyer letat est inactif
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

	// affiche la page selon le changement du hash
	function interpreterEvenementsLocation(evenement) {
		//hash est la partie suivant le # dans l'url
		var intructionNavigation = window.location.hash;
		if (!intructionNavigation || intructionNavigation.match(/^#$/) || intructionNavigation.match(/^#accueil$/)) {
			// si la vue active est celle du jeu il detruir le jeu avant de changer la page afficher pour ne pas creer derreurs
			if (vueActive instanceof JeuVue)
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
			if (vueActive instanceof JeuVue)
				detruireJeu();

			finVue.afficher("gagne");
			vueActive = finVue;
		}
		else if (intructionNavigation.match(/^#perdant$/)) {
			if (vueActive instanceof JeuVue)
				detruireJeu();

			finVue.afficher("perdu");
			vueActive = finVue;
		}
	}

	initialiser();
})();