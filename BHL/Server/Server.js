var http = require('http');
var io = require('socket.io');
Joueur = require('./modele/Joueur.js');

var nbJoueurs;
var listeConnexion = [];
var listeJoueurs = [];

function init() {
	nbJoueurs = 0;

	var server = http.createServer(function (requete, reponse) {

	}).listen(8080);

	var priseEntreeSortie = io.listen(server);
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
			listeConnexion[idConnexion].emit('commencerPartie', true);
		}
	}
}

function gererJoueurs(joueur) {
	//console.log("Nom = " + nom);
	//console.log(joueur);
	participant = JSON.parse(joueur);
	listeJoueurs[participant.id] = new Joueur(participant.nom, participant.id);
	//console.log(listeJoueurs[participant.id]);
}

init();