# Simulateur de Température avec Prometheus et Alertmanager

Ce projet est un simulateur de température qui utilise Prometheus pour la surveillance et Alertmanager pour les notifications par email lorsqu'une température critique est détectée.

## Architecture

Le projet utilise les composants suivants :

- **Application Web** : Une interface web simple permettant d'ajuster une température simulée
- **Prometheus** : Pour la collecte et le stockage des métriques de température
- **Alertmanager** : Pour la gestion des alertes et l'envoi de notifications par email
- **Grafana** : Pour la visualisation des métriques (optionnel)

## Fonctionnalités

- Simulation de température via une interface utilisateur interactive
- Monitoring des métriques avec Prometheus
- Déclenchement d'alertes lorsque la température dépasse 70°C pendant plus de 5 secondes
- Envoi de notifications par email via Alertmanager

## Prérequis

- Docker et Docker Compose
- Une connexion Internet pour les images Docker
- Un serveur SMTP pour l'envoi d'emails

## Installation et Configuration

1. Clonez ce dépôt :
   ```
   git clone <url-du-repo>
   cd altermanager
   ```

2. Configurez les variables d'environnement pour Alertmanager en modifiant le fichier `.env` :
   ```
   SMTP_FROM=votre-email@exemple.com
   SMTP_HOST=smtp.exemple.com
   SMTP_USERNAME=votre-username
   SMTP_PASSWORD=votre-password
   NOTIFICATION_EMAIL=destinataire@exemple.com
   SMTP_HELLO=exemple.com
   ```

3. Démarrez les services avec Docker Compose :
   ```
   docker-compose up -d
   ```

## Structure du Projet

- `app/` : Code source de l'application web de simulation
- `alertmanager.yml` : Fichier de configuration template pour Alertmanager
- `prometheus.yml` : Configuration de Prometheus
- `alert_rules.yml` : Définition des règles d'alerte
- `docker-compose.yml` : Configuration des services Docker

## Fonctionnement Technique

### Substitution des Variables d'Environnement

Alertmanager ne prend pas en charge nativement la substitution des variables d'environnement dans son fichier de configuration. Pour contourner cette limitation, nous utilisons une approche basée sur `sed` dans l'entrypoint du conteneur Alertmanager :

```yaml
entrypoint:
  - sh
  - -c
  - "cat /etc/alertmanager/alertmanager.template.yml | sed 's/\\$${SMTP_FROM}/${SMTP_FROM}/g; s/\\$${SMTP_HOST}/${SMTP_HOST}/g; s/\\$${SMTP_USERNAME}/${SMTP_USERNAME}/g; s/\\$${SMTP_PASSWORD}/${SMTP_PASSWORD}/g; s/\\$${NOTIFICATION_EMAIL}/${NOTIFICATION_EMAIL}/g; s/\\$${SMTP_HELLO}/${SMTP_HELLO}/g' > /etc/alertmanager/alertmanager.yml && /bin/alertmanager --config.file=/etc/alertmanager/alertmanager.yml"
```

Cette commande :
1. Lit le fichier template (`alertmanager.template.yml`)
2. Utilise `sed` pour remplacer toutes les références aux variables d'environnement par leurs valeurs
3. Écrit le résultat dans le fichier de configuration final
4. Démarre Alertmanager avec ce fichier généré

### Règles d'Alerte

Les alertes sont définies dans `alert_rules.yml` et sont configurées pour se déclencher lorsque la température dépasse 70°C pendant plus de 5 secondes :

```yaml
groups:
  - name: temperature_alerts
    rules:
      - alert: HighTemperature
        expr: temperature{job="metrics-app"} > 70
        for: 5s
        labels:
          severity: warning
        annotations:
          summary: "Température élevée détectée"
          description: "La température a dépassé 70°C pendant plus de 5 secondes. Température actuelle : {{ $value }}°C"
```

## Utilisation

1. Accédez à l'interface web à l'adresse [http://localhost:8080](http://localhost:8080)
2. Utilisez le curseur pour ajuster la température
3. Lorsque la température dépasse 70°C pendant plus de 5 secondes, une alerte est déclenchée
4. Une notification est envoyée à l'adresse email configurée

## Interfaces

- Application Web : [http://localhost:8080](http://localhost:8080)
- Prometheus : [http://localhost:9090](http://localhost:9090)
- Alertmanager : [http://localhost:9093](http://localhost:9093)
- Grafana : [http://localhost:3000](http://localhost:3000) (admin/admin)

## Dépannage

### Alertes non déclenchées

Si les alertes ne sont pas déclenchées :
1. Vérifiez que la température est bien supérieure à 70°C pendant plus de 5 secondes
2. Consultez les logs de Prometheus : `docker-compose logs prometheus`
3. Vérifiez que Prometheus peut accéder à l'application : `http://localhost:9090/targets`

### Notifications email non reçues

Si les emails ne sont pas reçus :
1. Vérifiez les logs d'Alertmanager : `docker-compose logs alertmanager`
2. Assurez-vous que les informations SMTP sont correctes dans le fichier `.env`
3. Vérifiez que la substitution des variables fonctionne en examinant le fichier de configuration généré : `docker-compose exec alertmanager cat /etc/alertmanager/alertmanager.yml` 