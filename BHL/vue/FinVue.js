FinVue = function(joueur)
{
  this.afficher = function(etat)
  {
    var nouveauHTML = "";
    //{MESSAGE} est seulement une chaine à remplacer par une vraie valeur.
    //alert(etat);
    switch(etat)
    {
      case "perdu":
        nouveauHTML = FinVue.html.replace("{MESSAGE}","Vous avez perdu :(");
        //alert(nouveauHTML);
      break;        
      case "gagne":
        //alert(joueur.points);
        nouveauHTML = FinVue.html.replace("{MESSAGE}","Vous avez gagné :)");
        break;
    }
      //{NOM} est seulement une chaine à remplacer par une vraie valeur.
    nouveauHTML = nouveauHTML.replace("{POINTS}", joueur.points + " points");
    nouveauHTML = nouveauHTML.replace("{NOM}", joueur.nom);
    document.getElementsByTagName("body")[0].innerHTML = nouveauHTML;
  }
}

FinVue.html = document.getElementById("page-fin").innerHTML;