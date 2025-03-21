// Attendre que le DOM soit complètement chargé
window.addEventListener('load', function() {
    // Fonction pour obtenir un élément et vérifier son existence
    function getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Élément avec l'ID ${id} non trouvé`);
            return null;
        }
        return element;
    }

    // Obtenir les références aux éléments
    const thermometerLiquid = getElement('thermometer-liquid');
    const tempValue = getElement('temp-value');
    const tempControl = getElement('temp-control');

    // Vérifier que tous les éléments nécessaires sont présents
    if (!thermometerLiquid || !tempValue || !tempControl) {
        console.error('Certains éléments requis sont manquants');
        return;
    }

    // Fonction de mise à jour du thermomètre
    function updateThermometer(value) {
        try {
            // Calculer la hauteur du liquide
            const height = Math.min(Math.max(0, (value / 100) * 280), 280);
            
            // Mettre à jour l'affichage
            thermometerLiquid.style.height = `${height}px`;
            tempValue.textContent = value;

            // Envoyer la mise à jour au serveur
            fetch('/update_temperature', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    temperature: parseInt(value)
                })
            }).catch(error => {
                console.error('Erreur lors de la mise à jour:', error);
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du thermomètre:', error);
        }
    }

    // Écouter les changements du curseur
    tempControl.addEventListener('input', (e) => {
        updateThermometer(e.target.value);
    });

    // Initialisation
    updateThermometer(tempControl.value);
}); 