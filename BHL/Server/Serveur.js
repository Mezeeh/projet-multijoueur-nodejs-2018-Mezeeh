var http = require('http');
var io = require('socket.io');
Joueur = require('./modele/Joueur.js');
Roles = require('./modele/Roles.js');

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

	/* var joueur = new Joueur(nbJoueurs);
	listeJoueurs[nbJoueurs] = joueur; */

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
	console.log(participant.id);
	listeJoueurs[participant.id] = new Joueur(participant.nom, participant.id);
	//console.log(listeJoueurs[participant.id]);

	if (2 == joueursRecus) {
		for (idConnexion in listeConnexion) {
			choisirRoleJoueur(idConnexion);
			console.log(listeJoueurs[idConnexion].getRole());
			console.log(JSON.stringify(listeJoueurs[idConnexion]));
			listeConnexion[idConnexion].emit('commencerPartie', JSON.stringify(listeJoueurs[idConnexion]));
		}
	}

	listeConnexion[participant.id].on('deplacement', gererDeplacement);
}

function gererDeplacement(etat){
	var direction = JSON.parse(etat);
	console.log(direction + " " + Date.now());
}

function choisirRoleJoueur(idJoueur) {
	if (0 == idJoueur) {
		choix = Math.round(Math.random());
		listeJoueurs[idJoueur].setRole(0 == choix ? Roles.ATTAQUANT : Roles.DEFENSEUR);
	} else {
		listeJoueurs[idJoueur].setRole(Roles.ATTAQUANT == listeJoueurs[0].getRole() ? Roles.DEFENSEUR : Roles.ATTAQUANT);
	}
}

init();