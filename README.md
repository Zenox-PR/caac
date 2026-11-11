# Une surprise pour Rose

Un site d’anniversaire personnel qui réunit une invitation animée, des souvenirs en images et un livre d’or partagé. Conçu en HTML, CSS et JavaScript, il fonctionne sans compilation et utilise Firebase pour conserver les messages en ligne.

## L’expérience

- **Une entrée interactive** : un cadeau à ouvrir et des boutons Oui/Non animés.
- **Deux carrousels** : les souvenirs du couple et les photos entre amis, avec navigation par flèches et glissement.
- **Des photos entières** : un affichage qui préserve le cadrage des images, notamment lorsque plusieurs personnes sont présentes.
- **Un livre d’or en temps réel** : les messages sont enregistrés dans Cloud Firestore et partagés entre les visiteurs.
- **Une modération par compte** : chaque auteur peut supprimer ses propres nouveaux messages ; le compte administrateur Google peut supprimer tous les messages, selon les règles Firestore.
- **Une présentation adaptative** : navigation et mise en page adaptées aux téléphones comme aux ordinateurs.

## Technologies

| Élément | Technologie |
| --- | --- |
| Pages et interactions | HTML5, CSS3, JavaScript natif |
| Identification des auteurs | Firebase Authentication anonyme |
| Administration | Firebase Authentication avec Google |
| Livre d’or | Cloud Firestore et écoute en temps réel |
| Publication du site | GitHub Pages |

Le SDK Firebase est chargé depuis le CDN officiel. Aucune installation de dépendances n’est nécessaire pour afficher le site ; une connexion Internet est requise pour Firebase.

## Démarrer en local

Avec Python 3 installé, depuis le dossier du projet :

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Ouvrir ensuite [http://localhost:8000](http://localhost:8000). Utiliser un serveur HTTP local plutôt qu’une ouverture directe des fichiers, car le site charge des modules JavaScript.

## Organisation du projet

```text
index.html                 Invitation et cadeau animé
annive_rose.html            Page principale et livre d’or
revers/
  style_debut.css          Présentation de l’invitation
  script_debut.js          Interactions Oui/Non
Projet PR/
  stylePR.css              Présentation de la page principale
  script.js                Carrousels, connexion et commentaires
photo pr/                  Photographies du projet
firebase.json              Configuration du déploiement des règles
firestore-messages.rules   Droits d’accès à la collection messages
```

## Configurer son propre Firebase

Pour adapter ce projet, créer son propre projet Firebase et renseigner sa configuration web dans `Projet PR/script.js`.

1. Activer **Authentication → Sign-in method → Anonyme** pour identifier les auteurs sans formulaire d’inscription.
2. Activer **Google** pour la connexion administrateur.
3. Ajouter le domaine du site dans **Authentication → Paramètres → Domaines autorisés**. Pour les tests, autoriser `localhost` et, si utilisé, `127.0.0.1`.
4. Créer une base Cloud Firestore. Les messages utilisent la collection `messages` et les champs `name`, `text`, `ownerId` et `createdAt`.
5. Remplacer l’adresse du compte administrateur **dans le script et dans les règles Firestore**. L’administration exige un compte Google avec une adresse vérifiée.
6. Publier les règles avec la CLI Firebase, en indiquant explicitement son projet :

```sh
firebase login
firebase deploy --only firestore:rules --project VOTRE_PROJECT_ID
```

Les règles permettent la lecture publique, vérifient l’identité de l’auteur à la création et réservent la suppression à l’auteur ou à l’administrateur. Elles refusent la modification des messages. Masquer un bouton dans le navigateur ne remplace pas ces règles côté serveur.

L’identité anonyme reste liée aux données du navigateur : un auteur qui change d’appareil ou efface ces données peut perdre la possibilité de supprimer ses anciens messages. Les messages historiques sans `ownerId` restent visibles et peuvent être modérés par l’administrateur.

## Publier le site

Dans les paramètres du dépôt GitHub, configurer **Pages** pour publier la branche choisie depuis sa racine. `index.html` constitue la page d’entrée. La publication des pages et celle des règles Firestore sont deux opérations distinctes : un commit ne déploie pas automatiquement les règles Firebase.

Pour personnaliser les galeries, modifier les chemins des images dans `annive_rose.html` et conserver la structure des carrousels. Respecter exactement les noms et la casse des fichiers.

## Photographies et contenu personnel

Le site est public et ne comporte pas d’espace privé ni de code d’accès. Les photographies, textes et messages personnels appartiennent à leurs auteurs ; leur présence dans ce dépôt ne constitue pas une autorisation de réutilisation. Pour votre propre version, utilisez vos contenus et votre projet Firebase.

## Documentation

- [Firebase Authentication : connexion anonyme](https://firebase.google.com/docs/auth/web/anonymous-auth)
- [Firebase Authentication : connexion Google](https://firebase.google.com/docs/auth/web/google-signin)
- [Règles de sécurité Cloud Firestore](https://firebase.google.com/docs/firestore/security/get-started)
- [GitHub Pages](https://docs.github.com/en/pages)
