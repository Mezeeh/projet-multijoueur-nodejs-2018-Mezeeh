AttenteVue = function()
{
	var corps;
	
	function initialiser()
	{
		corps = document.getElementsByTagName("body")[0];
	}

	this.afficher = function()
	{
        corps.innerHTML = AttenteVue.pageJeuHTML;
        
	}
	
	initialiser();
	
}

AttenteVue.pageJeuHTML = document.getElementById("page-attente").innerHTML;