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

			// TEST ICI PAS FINAL
			listeConnexion[idConnexion].on('positionJoueur', verifierCollision);
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

// soccupe de tout ce qui concerne le debut de la partie pour sassurer du bon fonctionnement
function demarrerPartie(connexion) {
	connexion.emit('commencerPartie', JSON.stringify(listeJoueurs));
	connexion.emit('setMinuteur', JSON.stringify(TEMPS_DE_JEU));
	demarrerMinuteur(connexion);
	connexion.on('deplacement', gererDeplacement);
	connexion.on('collision', gererCollision);
}

serveur.vientDeDemarrerPartie = true;
serveur.nbReponseCollisionInitiale = 0;
// sert seulement a demander la position de chaque joueur pour sassurer davoir les infos necessaire aux verifications futurs
function gererCollision(collision) {
	if (JSON.parse(collision)) {
		// sert a renitialiser les infos des collisions apres quil en est deja eu une
		// se fait avant demander la position aux joueurs pour sassurer de ne pas garder dinfos obsolettes
		if (serveur.nbReponsePositionsJoueur >= nbJoueurs) {
			serveur.positionsJoueur = [];
			serveur.nbReponsePositionsJoueur = 0;
		}
		this.emit('demandePosition', JSON.stringify(true));
	}
}

serveur.positionsJoueur = [];
serveur.nbReponsePositionsJoueur = 0;
function verifierCollision(positionJoueur) {
	console.log(this.id + " " + positionJoueur);
	infosPositionsJoueur = JSON.parse(positionJoueur);
	// met les jouers dans un array avec la position = a leur id pour faciliter la verification futur
	serveur.positionsJoueur[infosPositionsJoueur.id] = infosPositionsJoueur.representation;
	serveur.nbReponsePositionsJoueur++;
	console.log(serveur.nbReponsePositionsJoueur);
	// si les deux joueurs ont repondu
	if (nbJoueurs == serveur.nbReponsePositionsJoueur) {
		console.log("Collision???");
		// envoie les position du joueur 1 et 2
		if (verifierIntersection(serveur.positionsJoueur[0], serveur.positionsJoueur[1])) {
			console.log("Collision!!!");
			for (joueur in listeJoueurs) {
				// temporaire pour cette version mais va changer
				if (Roles.ATTAQUANT == listeJoueurs[joueur].getRole())
					listeJoueurs[joueur].points++;
				
				changerRoleJoueur(listeJoueurs[joueur]);
			}

			// dit a tout les joueurs de mettre a jour leur role avec ce quil recoivent
			for (idConnexion in listeConnexion) {
				console.log(listeJoueurs[idConnexion].points);
				listeConnexion[idConnexion].emit('changementRole', JSON.stringify(listeJoueurs));
			}
		}
	}
}

// simple verification pour savoir si lun des carres des joueurs embarque sur celui du lautre
function verifierIntersection(r1, r2) {
	return !(r2.x > r1.x + r1.widht ||
		r2.x + r1.width < r1.x ||
		r2.y > r1.y + r1.height ||
		r2.y + r2.height < r1.y);
}

// attend le temps de jeu en milliseconds avant de verifier la fin de partie
function demarrerMinuteur(connexion) {
	setTimeout(() => {
		gererFinDePartie(connexion);
	}, TEMPS_DE_JEU * 1000); // * 1000 pour representer les ms
}

function gererFinDePartie(connexion) {
	gagnant = null; // null pour pas que ca cree des donnees eronnees par exemple le joueur 1 pert malgre quil a plus de point que le 2
	pointsGagnant = 0;

	for (joueur in listeJoueurs) {
		if (listeJoueurs[joueur].points == pointsGagnant) {
			gagnant = null;
		} else if (listeJoueurs[joueur].points > pointsGagnant) {
			gagnant = listeJoueurs[joueur];
			pointsGagnant = listeJoueurs[joueur].points;
		}
	}

	// si ya un gagnant
	if (null != gagnant) {
		console.log("FINI");
		connexion.emit('partieTerminee', JSON.stringify({ partieTerminee: true, gagnant: gagnant }));
	} else { // si ya pas de gagnant
		console.log("PROLONGATION");
		prolongation(connexion);
	}
}

// meme chose que demarrerMiniteur() mais ca envoie aussi au joueur quil ya une prolongation et le temps de cette derniere
function prolongation(connexion) {
	connexion.emit('prolongation', JSON.stringify(TEMPS_DE_PROLONGATION));
	setTimeout(() => {
		gererFinDePartie(connexion);
	}, TEMPS_DE_PROLONGATION * 1000);
}

// sert a garder en memoire ce que fait le joueur sil va a droite, quil est inactif, etc.
function gererDeplacement(etat) {
	var direction = JSON.parse(etat);
	console.log(direction.etat + " " + direction.id);
	listeJoueurs[direction.id].setEtat(direction.etat);

	// envoie a chaque joueur letat de chacun pour sync les deux ensemble mais surtout pour que le joueur ennemi puisse gerer ses deplacements
	for (idConnexion in listeConnexion)
		listeConnexion[idConnexion].emit('etatJoueurs', JSON.stringify(listeJoueurs));
}

// utile en debut de partie pour decider qui est quoi et leurs donner la position relative a leur role
function choisirRoleJoueur(idJoueur) {
	if (0 == idJoueur) {
		choix = Math.round(Math.random()); // renvoie 0 ou 1
		listeJoueurs[idJoueur].setRole(0 == choix ? Roles.ATTAQUANT : Roles.DEFENSEUR);
	} else {
		listeJoueurs[idJoueur].setRole(Roles.ATTAQUANT == listeJoueurs[0].getRole() ? Roles.DEFENSEUR : Roles.ATTAQUANT);
	}

	listeJoueurs[idJoueur].positionX = listeJoueurs[idJoueur].getRole() == Roles.ATTAQUANT ? (1280 / 2) : (1280 / 40);
	listeJoueurs[idJoueur].positionY = (720 / 2);
}

// fait juste inverser les roles en testant ce quil a comme role pour lui mettre ce quil nest pas
// change aussi la position sur la map pour le role quil a
function changerRoleJoueur(joueur) {
	joueur.setRole(Roles.ATTAQUANT == joueur.getRole() ? Roles.DEFENSEUR : Roles.ATTAQUANT);
	joueur.positionX = joueur.getRole() == Roles.ATTAQUANT ? (1280 / 2) : (1280 / 40);
	joueur.positionY = (720 / 2);
}

init();