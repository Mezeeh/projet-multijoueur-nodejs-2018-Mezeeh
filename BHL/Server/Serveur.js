var http = require('http');
var io = require('socket.io');
Joueur = require('./modele/Joueur.js');
Roles = require('./modele/Roles.js');

const TEMPS_DE_JEU = 10;
const TEMPS_DE_PROLONGATION = 10;

serveur = this;

var nbJoueurs;
var listeConnexion = [];
var listeJoueurs = [];

var joueursRecus;

function init() {
	nbJoueurs = 0;

	joueursRecus = 0;

	var serveur = http.createServer(function (requete, reponse) { }).listen(8080);

	var priseEntreeSortie = io.listen(serveur);
	priseEntreeSortie.on('connection', gererConnexion);
}

function gererConnexion(connexion) {
	listeConnexion[nbJoueurs] = connexion;

	connexion.emit('identificationJoueur', nbJoueurs);

	nbJoueurs++;

	if (nbJoueurs == 2) {
		console.log("DEUX PERSONNES !!!");

		for (idConnexion in listeConnexion) {
			listeConnexion[idConnexion].emit('demandeJoueurs', true);
			listeConnexion[idConnexion].on('joueurs', gererJoueurs);
		}
	}
}

function gererJoueurs(joueur) {
	joueursRecus++;

	participant = JSON.parse(joueur);
	//console.log(participant.id);
	listeJoueurs[participant.id] = new Joueur(participant.nom, participant.id);
	//console.log(listeJoueurs[participant.id]);

	if (2 == joueursRecus) {
		for (idConnexion in listeConnexion)
			choisirRoleJoueur(idConnexion);

		for (idConnexion in listeConnexion) {
			console.log(JSON.stringify(listeJoueurs[idConnexion]));
			demarrerPartie(listeConnexion[idConnexion]);
		}
	}
}

function demarrerPartie(connexion) {
	connexion.emit('commencerPartie', JSON.stringify(listeJoueurs));
	connexion.emit('setMinuteur', JSON.stringify(TEMPS_DE_JEU));
	demarrerMinuteur(connexion);
	connexion.on('deplacement', gererDeplacement);
	connexion.on('collision', gererCollision);
}

serveur.vientDeDemarrerPartie = true;
serveur.nbReponseCollisionInitiale = 0;
function gererCollision(collision) {
	if (JSON.parse(collision)) {
		if (serveur.nbReponsePositionsJoueur >= nbJoueurs) {
			serveur.positionsJoueur = [];
			serveur.nbReponsePositionsJoueur = 0;
		}

		if (serveur.vientDeDemarrerPartie) {
			console.log("FK ME");
			this.emit('demandePosition', JSON.stringify(true));
			this.on('positionJoueur', verifierCollision);
			serveur.nbReponseCollisionInitiale++;

			if (serveur.nbReponseCollisionInitiale == nbJoueurs) {
				serveur.vientDeDemarrerPartie = false;
				console.log("LUL");
			}
		} else {
			console.log("FK ME SIDEWAYS");
			for (idConnexion in listeConnexion) {
				listeConnexion[idConnexion].emit('demandePosition', JSON.stringify(true));
				listeConnexion[idConnexion].on('positionJoueur', verifierCollision);
			}
		}
	}
}

serveur.positionsJoueur = [];
serveur.nbReponsePositionsJoueur = 0;
function verifierCollision(positionJoueur) {
	console.log(this.id + " " + positionJoueur);
	infosPositionsJoueur = JSON.parse(positionJoueur);
	serveur.positionsJoueur[infosPositionsJoueur.id] = infosPositionsJoueur.representation;
	serveur.nbReponsePositionsJoueur++;
	if (nbJoueurs == serveur.nbReponsePositionsJoueur) {
		console.log("Collision???");
		if (verifierIntersection(serveur.positionsJoueur[0], serveur.positionsJoueur[1])) {
			console.log("Collision!!!");
			for (joueur in listeJoueurs) {
				if (Roles.ATTAQUANT == listeJoueurs[joueur].getRole())
					listeJoueurs[joueur].points++;

				changerRoleJoueur(listeJoueurs[joueur]);
			}

			for (idConnexion in listeConnexion) {
				console.log(listeJoueurs[idConnexion].points);
				listeConnexion[idConnexion].emit('changementRole', JSON.stringify(listeJoueurs));
			}
		}
	}
}

function verifierIntersection(r1, r2) {
	return !(r2.x > r1.x + r1.widht ||
		r2.x + r1.width < r1.x ||
		r2.y > r1.y + r1.height ||
		r2.y + r2.height < r1.y);
}

function demarrerMinuteur(connexion) {
	setTimeout(() => {
		gererFinDePartie(connexion);
	}, TEMPS_DE_JEU * 1000);
}

function gererFinDePartie(connexion) {
	gagnant = null;
	pointsGagnant = 0;
	egalite = false;

	for (joueur in listeJoueurs) {
		if (listeJoueurs[joueur].points == pointsGagnant) {
			//egalite = true;
			gagnant = null;
		} else if (listeJoueurs[joueur].points > pointsGagnant) {
			gagnant = listeJoueurs[joueur];
			pointsGagnant = listeJoueurs[joueur].points;
			//egalite = false;
		}
	}

	if (/* !egalite &&  */null != gagnant) {
		console.log("FINI");
		connexion.emit('partieTerminee', JSON.stringify({ partieTerminee: true, gagnant: gagnant }));
	} else {
		console.log("PROLONGATION");
		prolongation(connexion);
	}
}

function prolongation(connexion) {
	connexion.emit('prolongation', JSON.stringify(TEMPS_DE_PROLONGATION));
	setTimeout(() => {
		gererFinDePartie(connexion);
		console.log("allo");
	}, TEMPS_DE_PROLONGATION * 1000);
}

function gererDeplacement(etat) {
	var direction = JSON.parse(etat);
	console.log(direction.etat + " " + direction.id);
	listeJoueurs[direction.id].setEtat(direction.etat);

	for (idConnexion in listeConnexion)
		listeConnexion[idConnexion].emit('etatJoueurs', JSON.stringify(listeJoueurs));
}

function choisirRoleJoueur(idJoueur) {
	if (0 == idJoueur) {
		choix = Math.round(Math.random());
		listeJoueurs[idJoueur].setRole(0 == choix ? Roles.ATTAQUANT : Roles.DEFENSEUR);
	} else {
		listeJoueurs[idJoueur].setRole(Roles.ATTAQUANT == listeJoueurs[0].getRole() ? Roles.DEFENSEUR : Roles.ATTAQUANT);
	}

	listeJoueurs[idJoueur].positionX = listeJoueurs[idJoueur].getRole() == Roles.ATTAQUANT ? (1280 / 2) : (1280 / 40);
	listeJoueurs[idJoueur].positionY = (720 / 2);
}

function changerRoleJoueur(joueur) {
	joueur.setRole(Roles.ATTAQUANT == joueur.getRole() ? Roles.DEFENSEUR : Roles.ATTAQUANT);
	joueur.positionX = joueur.getRole() == Roles.ATTAQUANT ? (1280 / 2) : (1280 / 40);
	joueur.positionY = (720 / 2);
}

init();