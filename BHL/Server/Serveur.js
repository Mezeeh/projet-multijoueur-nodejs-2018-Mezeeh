var http = require('http');
var io = require('socket.io');
Joueur = require('./modele/Joueur.js');
Roles = require('./modele/Roles.js');

const TEMPS_DE_JEU = 60;

var nbJoueurs;
var listeConnexion = [];
var listeJoueurs = [];

var joueursRecus;

function init() {
	nbJoueurs = 0;

	joueursRecus = 0;

	var serveur = http.createServer(function (requete, reponse) {}).listen(8080);

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
			/* listeConnexion[idConnexion].emit('commencerPartie', JSON.stringify(listeJoueurs));
			listeConnexion[idConnexion].on('deplacement', gererDeplacement); */
			demarrerPartie(listeConnexion[idConnexion]);
		}
	}	
}

function demarrerPartie(connexion){
	connexion.emit('commencerPartie', JSON.stringify(listeJoueurs));
	connexion.emit('setMinuteur', JSON.stringify(TEMPS_DE_JEU));
	demarrerMinuteur(connexion);
	connexion.on('deplacement', gererDeplacement);
}

function demarrerMinuteur(connexion){
	setTimeout(() => {
		connexion.emit('partieTerminee', JSON.stringify(true));
		console.log("FINI");
	}, TEMPS_DE_JEU * 1000);
}

function gererDeplacement(etat){
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

init();