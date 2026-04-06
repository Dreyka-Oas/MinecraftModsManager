# Plan fonctionnel du dossier `scripts`

## Regles absolues de reconstruction

Ces regles doivent etre lues comme des contraintes fortes de reconstruction du projet.

- aucun fichier ne doit depasser `100` lignes
- aucun dossier ne doit contenir plus de `5` fichiers

Consequences directes :

- le projet doit etre decoupe en petits blocs clairs
- les responsabilites doivent etre separees
- les parties repetables doivent etre mutualisees
- les comportements communs doivent passer par des fonctions, composants ou services reutilisables

Regles de conception imposees :

- ne pas creer une fonction uniquement pour un seul endroit si la meme logique peut servir ailleurs
- toute variation d'un meme comportement doit etre geree par des parametres, pas par des doublons
- toute carte d'interface repetee doit reposer sur une base commune reutilisable
- toute variation de bouton, de progression, de popup, de journal ou de liste doit etre construite a partir d'une structure commune
- tout texte d'etat doit etre centralisable ou au minimum clairement regroupable
- tout comportement de verrouillage, de changement d'onglet ou de changement d'etat doit etre pense comme mecanisme global reutilisable

Niveau de fidelite attendu :

- si un choix de reconstruction oppose simplicite technique et fidelite de comportement, la fidelite doit primer
- les textes visibles, les etats et les enchainements de comportement doivent etre reproduits le plus exactement possible
- les libertes de reconstruction doivent porter surtout sur l'organisation interne, pas sur le comportement visible

## But du document

Ce document doit permettre a une autre IA ou a un autre developpeur de reconstruire l'application le plus fidelement possible sans s'appuyer sur l'implementation actuelle.

Le document ne doit pas etre lu comme un simple resume.
Il doit etre lu comme une specification fonctionnelle de reconstruction :

- ce qui est affiche
- ce qui est cliquable
- ce qui change d'etat
- ce qui est verrouille
- ce qui est memorise
- ce qui est lance
- ce qui est attendu du projet charge
- ce qui doit apparaitre dans les journaux, listes, cartes et popups

## Objet general

Le dossier `scripts` contient une application de bureau de pilotage pour un projet organise par dossiers racine, puis par versions.

Son role est de centraliser trois besoins dans une seule fenetre :

- lancer des constructions sur des cibles choisies
- lancer des clients un par un pour les tester
- gerer la structure de publication GitHub du projet

L'application n'est pas un simple lanceur. Elle agit comme un centre de controle : elle detecte le projet courant, affiche son etat, permet de selectionner des cibles, suit les executions en direct, montre les resultats et conserve localement certains reglages utilises entre deux sessions.

## Structure de projet attendue

L'application attend un repertoire de projet qui ressemble a ceci dans son organisation generale :

- un dossier racine de projet
- a la racine, plusieurs sous-dossiers principaux
- chaque sous-dossier principal represente un groupe logique
- dans chaque sous-dossier principal, plusieurs sous-dossiers de version

Exemple d'idee de structure :

- `fabric/1.18`
- `fabric/1.19`
- `forge/1.18`
- `website/...`
- `scripts/...`

Regles importantes :

- le dossier `scripts` est ignore pour la detection des cibles de travail
- les dossiers racine sont comptes comme `loaders` dans l'interface
- le compteur `Versions` dans l'en-tete correspond au nombre total de couples `dossier/version` detectes, pas au nombre de versions uniques
- un repertoire est considere comme valide s'il contient au moins une cible detectee

Point important sur la fidelite de l'interface actuelle :

- l'en-tete compte tous les dossiers racine hors `scripts`
- en revanche, les fenetres de selection de `Build` et `Client Test` ne proposent actuellement que les cibles dont le dossier racine est `fabric`, `forge` ou `neoforge`
- un dossier comme `website` peut donc etre compte dans l'en-tete et gere par l'onglet GitHub, sans apparaitre dans les popups de build ou de test client

## Comportement au demarrage

Au lancement, l'application essaie de rouvrir automatiquement le dernier repertoire de projet choisi.

Si aucun repertoire n'a encore ete memorise, ou si le chemin memorise n'est plus valide :

- le titre de contenu affiche `Aucun projet`
- le chemin du repo affiche `Aucun repo`
- l'onglet GitHub affiche `Aucun repo charge`
- le bouton principal de chaque onglet reste desactive tant qu'aucun repo valide n'est choisi

Un message de chargement applicatif est ajoute dans la console de build au demarrage.

Le dernier repo choisi est memorise localement pour les prochains lancements.

Cas de figure a respecter :

- si aucun repo n'a jamais ete choisi, l'application doit rester ouvrable et lisible
- si le repo memorise n'existe plus, l'application doit retomber dans un etat vide propre
- l'interface ne doit pas sembler plantee dans ce cas
- aucun build, test client ou action GitHub ne doit pouvoir demarrer tant qu'un repo valide n'est pas charge

## Apparence generale de la fenetre

La fenetre principale porte le titre global `Project Workspace Center`.

Visuellement, l'interface suit une logique de poste de pilotage claire :

- fond clair
- cartes blanches encadrees
- titres de section avec accent bleu sur le bord gauche
- boutons d'action bleus
- boutons secondaires blancs avec bordure legere
- onglets centraux de style discret
- barres de progression rectangulaires a coins adoucis

L'application s'ouvre en grand et peut occuper l'ecran entier.

## En-tete principal

L'en-tete est fixe en haut et contient plusieurs groupes.

### Partie gauche

- le nom du projet charge
- un badge `Loaders: X`
- un badge `Versions: X`
- un statut court en italique
- un bouton `Choisir repo`
- le chemin du repo actuellement charge, ou `Aucun repo`

Le nom affiche est le nom du dossier racine du projet charge.

### Partie centrale

Trois onglets boutons sont centres dans l'en-tete :

- `Build`
- `Client Test`
- `GitHub`

L'onglet actif est visuellement marque par un fond bleu pale.

Quand une action longue est en cours :

- la navigation entre onglets est verrouillee
- le bouton `Choisir repo` est lui aussi desactive
- les onglets restent visibles, mais ne peuvent plus etre changes

### Partie droite

La partie droite contient :

- un petit indicateur de chargement utilise surtout pendant une annulation
- le bouton principal de l'onglet courant

Le texte de ce bouton depend de l'onglet :

- dans `Build` : `Lancer`, puis `Annuler` pendant l'execution
- dans `Client Test` : `Tester`, puis `Annuler test` pendant l'execution
- dans `GitHub` : `Actualiser`, ou un texte de progression temporaire selon l'action

## Regles globales de comportement

Quel que soit l'onglet :

- si aucun repo valide n'est charge, les actions principales sont bloquees
- si une operation est en cours, la navigation est verrouillee
- les consoles se remplissent au fil de l'eau
- les listes de rapport affichent des lignes colorees selon leur prefixe

Codes visuels des lignes :

- `[OK]` en vert
- `[WARN]` en orange
- `[KO]` en rouge
- `[RUN]` en bleu

Les consoles conservent uniquement la partie recente si elles deviennent trop longues.

Regles de comportement global supplementaires :

- le changement d'onglet ne doit pas casser l'etat de la vue courante
- une action longue doit toujours rendre l'etat visible a l'utilisateur
- une annulation doit avoir un etat visible distinct d'un simple arret normal
- un retour a l'etat idle doit remettre les boutons et labels dans un etat coherent
- l'utilisateur ne doit jamais perdre la vue de l'onglet actif, meme quand la navigation est verrouillee

## Matrice d'etats du bouton principal

Le bouton principal en haut a droite change selon l'onglet actif et l'etat courant.

### Onglet `Build`

- au repos : `Lancer`
- pendant une execution : `Annuler`
- pendant la phase d'annulation : `Annulation...`
- sans repo charge : bouton desactive

### Onglet `Client Test`

- au repos : `Tester`
- pendant une execution : `Annuler test`
- pendant la phase d'annulation : `Annulation...`
- sans repo charge : bouton desactive

### Onglet `GitHub`

- au repos : `Actualiser`
- pendant un rafraichissement : `Actualisation...`
- pendant un test : `Test...`
- pendant une reception : `Reception...`
- pendant un envoi : `Envoi...`
- sans repo charge : bouton desactive

## Matrice d'etats de navigation

La navigation centrale est soumise a des regles globales.

- au repos, les trois onglets sont cliquables
- quand un build tourne, les onglets ne doivent plus etre changeables
- quand un test client tourne, les onglets ne doivent plus etre changeables
- quand une action GitHub tourne, les onglets ne doivent plus etre changeables
- quand la navigation est verrouillee, le bouton `Choisir repo` doit aussi etre desactive
- l'onglet actif doit rester visuellement identifiable meme dans l'etat verrouille

## Onglet `Build`

L'onglet `Build` est organise en deux rangees.

### Rangee du haut

Trois cartes sont affichees :

- `Console de build`
- `JAR detectes`
- `Rapport de build`

### Rangee du bas

Deux cartes sont affichees :

- `Erreurs`
- `Progression`

### Console de build

Cette zone affiche le flux texte brut des constructions :

- lancement global
- lignes de sortie de chaque cible
- erreurs eventuelles
- messages finaux de succes, d'echec ou d'annulation

Chaque ligne de cible est prefixee par son identifiant de forme `loader/version`.

Attendus supplementaires :

- la console doit etre videe au lancement d'un nouveau lot
- elle doit afficher le message de depart global du lot
- elle doit pouvoir recevoir des lignes standard et des lignes d'erreur
- elle doit etre scrollable
- elle doit rester lisible meme si le volume de texte grossit fortement

### JAR detectes

Cette carte affiche tous les fichiers `.jar` trouves dans les sorties de construction des cibles detectees.

Chaque ligne de la liste montre :

- le nom du fichier
- en dessous, son couple `loader/version`

La selection multiple est autorisee.

Un bouton `Supprimer` est present dans l'en-tete de cette carte.

Ce bouton :

- est desactive tant qu'aucun jar n'est selectionne
- supprime les jars choisis
- rafraichit ensuite la liste

### Rapport de build

Cette liste affiche le resultat final de chaque cible lancee.

Le format visible est :

- succes : `[OK] loader/version`
- echec : `[KO] loader/version | exit X`

Le rapport doit etre mis a jour progressivement, pas uniquement a la fin.

### Erreurs

La zone `Erreurs` affiche un texte detaille pour les cibles en echec.

Chaque bloc d'erreur contient :

- le couple `loader/version`
- le code de sortie
- le detail connu de l'echec

S'il n'y a aucune erreur, le texte affiche :

- `Aucune erreur.`

Important :

- cette zone ne contient pas de filtre
- elle affiche directement le contenu final des erreurs retenues

### Progression du build

La carte `Progression` montre :

- une barre de progression avec pourcentage au centre
- `En cours: x/y`
- `Restantes: z`
- `Simultanes: a/b`

Le compteur `Simultanes` reste pertinent visuellement, meme si l'etat actuel de l'application lance les builds selectionnes avec un parallelisme fixe a `1`.

En pratique, plusieurs cibles peuvent etre choisies dans la popup, mais elles sont actuellement traitees une par une.

Regles d'etat :

- au debut, la barre part de `0%`
- a chaque cible terminee, le compteur `En cours` augmente
- pendant une annulation, l'etat visuel doit indiquer que l'arret est en cours
- a la fin, les compteurs doivent correspondre au nombre total reellement traite

### Lancement d'un build

Quand on clique sur `Lancer` :

- une fenetre de selection s'ouvre
- si rien n'est choisi ou si la fenetre est fermee, rien ne demarre
- si des cibles sont choisies, la vue reste sur l'onglet et les builds commencent

Pendant l'execution :

- le bouton principal devient `Annuler`
- le statut global passe a `Builds en cours...`
- la console est videe avant un nouveau lot
- le rapport et la progression se remplissent au fur et a mesure

En fin de traitement :

- le statut devient `Termine`
- ou `Annulation terminee`
- le bouton principal revient a `Lancer`
- la navigation est deverrouillee

Le comportement attendu en cas d'abandon de popup :

- fermer la popup ou cliquer sur `Annuler` ne doit rien lancer
- l'interface ne doit pas rester verrouillee

## Fenetre `Selection des builds`

Cette popup apparait pour le build.

Elle contient :

- un titre `Selection des builds`
- une phrase d'aide : `Selectionne les loaders et versions a compiler.`
- un arbre a cocher
- un bouton d'action `Lancer`
- un bouton `Annuler`

L'arbre :

- masque sa racine technique
- affiche un noeud par loader
- garde les loaders replies par defaut
- affiche dessous les versions detectees

La selection repose sur les cases a cocher.

La sortie de la fenetre est une liste unique de cibles selectionnees.

Il n'y a pas de controle visible pour choisir le nombre de taches en parallele dans cette fenetre.

## Onglet `Client Test`

L'onglet `Client Test` est organise en grille 2 x 2.

### Haut de l'ecran

- `Console de test`
- `Rapport de test`

### Bas de l'ecran

- `Resultats de test`
- `Progression`

La disposition par defaut donne :

- le haut partage en deux moities egales
- le bas avec une zone de resultats plus large a gauche
- une carte `Progression` plus compacte a droite

### Console de test

Cette zone affiche le flux texte brut des lancements clients :

- messages de depart
- lignes du processus de chaque client
- messages d'annulation ou d'erreur

Chaque ligne est prefixee par la cible concernee au format `loader/version`.

### Rapport de test

Cette liste resume l'etat de chaque client teste.

L'ordre logique des etats est :

- `[RUN] loader/version | fermeture attendue`
- puis `[OK] loader/version`
- ou `[KO] loader/version | exit X`

Le rapport doit etre remplace ou complete au fur et a mesure de l'avancement de la serie.

### Resultats de test

Cette grande zone affiche le detail final de chaque test.

Pour chaque client, on retrouve :

- la ligne de resultat
- un detail court du comportement final

Messages de detail actuellement utilises :

- succes : `Client ferme proprement.`
- annulation : `Test annule.`
- echec : `Client termine avec une erreur.`

Si aucun test n'a encore tourne, la zone affiche :

- `Aucun test lance.`

### Progression des tests

Cette carte affiche :

- une barre de progression et son pourcentage
- `Tests: x/y`
- `Restants: z`
- `Actif: ...`

Le champ `Actif` montre :

- la cible en cours
- `en attente` entre deux lancements
- `aucun` quand rien ne tourne

Regles d'etat a respecter :

- `Actif` ne doit pas rester bloque sur un ancien loader apres une annulation ou une fin normale
- la carte doit revenir a un etat propre en fin de session
- le compteur de tests doit toujours rester coherent avec le nombre total de cibles choisies

### Lancement d'une session client

Quand on clique sur `Tester` :

- une popup de selection s'ouvre
- si rien n'est choisi, rien ne demarre
- si des cibles sont choisies, les tests commencent

Pendant l'execution :

- le bouton principal devient `Annuler test`
- le statut global passe a `Tests clients en cours...`
- les tests sont lances un par un
- le suivant ne commence qu'apres la fin du precedent

En fin de session :

- le statut devient `Tests clients termines`
- ou `Tests annules`
- le bouton principal revient a `Tester`
- la navigation est deverrouillee
- le bloc de progression est remis dans un etat propre avec `Actif: aucun`

Le comportement attendu en cas d'abandon de popup :

- fermer la popup ou cliquer sur `Annuler` ne doit rien lancer
- l'interface ne doit pas rester verrouillee

Point important de fidelite :

- il n'y a pas de carte `Clients disponibles` dans cet onglet
- la selection des cibles se fait uniquement dans la popup

## Fenetre `Selection des clients`

Cette popup apparait pour les tests clients.

Elle contient :

- un titre `Selection des clients`
- une phrase d'aide : `Selectionne les clients a tester. Ils seront lances un par un.`
- le meme arbre a cocher que pour le build
- une ligne `RAM max (Go)`
- un selecteur de valeur de `1` a `64`
- une valeur par defaut de `3`
- un bouton `Tester`
- un bouton `Annuler`

Cette valeur de RAM est appliquee a toute la serie de clients lances dans la session.

Comme pour le build :

- seuls les loaders `fabric`, `forge` et `neoforge` apparaissent dans la popup
- les loaders sont replies par defaut

## Onglet `GitHub`

L'onglet `GitHub` est structure en deux zones principales sur le haut, puis un grand journal en bas.

### Haut gauche : `Connexion GitHub`

Cette carte contient :

- un champ masque `Token de connexion`
- un champ texte `Remote GitHub`
- un bloc `Etat local`
- une rangee de boutons d'action

Le bloc `Etat local` affiche une ligne de forme :

- `Branche: main | propre`
- ou `Branche: main | modifications locales`
- ou une autre branche courante

Les boutons disponibles sont :

- `Enregistrer`
- `Setup .gitignore`
- `Tester connexion`
- `Recevoir`
- `Envoyer`

### Haut droit : `Branches attendues`

Cette liste montre l'etat attendu de la structure distante et locale.

Chaque ligne suit le format :

- niveau d'etat
- nom de branche
- presence locale et/ou distante
- commentaire de conformite

Exemples de portee :

- `local+remote`
- `local`
- `remote`
- `absente`

Exemples de details :

- `docs racine conformes`
- `contenu du dossier conforme`
- `branche absente`
- `attendu: contenu racine du dossier X`

### Bas : `Rapport GitHub`

Cette console affiche les actions et les retours des operations GitHub :

- actualisation
- test de connexion
- reception
- publication
- regeneration du `.gitignore`

## Regles exactes gerees par l'onglet `GitHub`

L'onglet ne se contente pas d'afficher des branches existantes. Il valide une structure cible precise.

### Branches attendues

Les branches attendues sont :

- `main`
- puis une branche par dossier racine du projet

Regles de detection :

- tous les dossiers racine hors `scripts` peuvent produire une branche attendue
- les dossiers racine commencant par un point ne sont pas ajoutes a la liste attendue

La liste de droite ne doit donc pas afficher une liste libre de toutes les branches du remote.
Elle doit afficher la liste des branches attendues selon les regles du projet.

### Regle speciale pour `main`

La branche `main` est consideree conforme seulement si sa racine contient exactement :

- `CURSEFORGE.md`
- `MODRINTH.md`
- `plan.md`

### Regle pour les branches de dossier

Pour une branche comme `forge`, `fabric` ou `website`, la branche est consideree conforme seulement si :

- son contenu racine correspond directement au contenu du dossier local du meme nom
- il ne doit pas y avoir un sous-dossier enveloppe du meme nom dans la branche

Autrement dit :

- la branche `forge` doit contenir directement ce qu'il y a dans le dossier local `forge`
- pas un dossier `forge/` contenant lui-meme ces fichiers

### Fichiers et dossiers ignores lors de la publication

La publication ecarte volontairement plusieurs categories de contenu local non souhaite.

Sont ignores notamment :

- sorties de build
- caches
- dossiers de lancement local
- journaux
- rapports de crash
- `node_modules`
- contenu d'IDE
- fichiers temporaires
- certains fichiers locaux de profil ou de monde

L'objectif est de publier uniquement le contenu utile, pas les artefacts locaux.

## Actions de l'onglet `GitHub`

### `Enregistrer`

Cette action :

- valide les champs courants
- applique l'URL du remote `origin`
- memorise localement le token et le remote pour les prochaines sessions

Attendu de comportement :

- un remote vide doit etre considere comme invalide
- l'utilisateur doit voir un retour d'etat si la configuration est refusee

### `Setup .gitignore`

Cette action reecrit le `.gitignore` du projet avec une base standard adaptee a l'application.

Le contenu couvre au minimum :

- sorties et caches
- donnees de lancement local
- journaux
- fichiers temporaires
- fichiers d'environnement local
- contenu sensible de configuration locale
- espace de travail du dossier `scripts`

### `Tester connexion`

Cette action teste la connexion au remote en utilisant les informations saisies.

Elle journalise le resultat dans `Rapport GitHub`.

### `Recevoir`

Cette action :

- recupere l'etat distant
- supprime les references obsoletes
- cree localement les branches de suivi manquantes lorsqu'elles existent deja a distance

L'action doit se terminer par un rafraichissement de l'etat GitHub affiche.

### `Envoyer`

Cette action republie la structure attendue vers le remote.

Concretement :

- `main` est synchronisee a partir des trois fichiers documentaires attendus
- chaque branche de dossier est synchronisee a partir du contenu du dossier local du meme nom
- si rien n'a change pour une branche, le journal l'indique explicitement

Le journal doit annoncer chaque branche preparee avant publication.

## Etats, verrouillages et retour utilisateur

Pendant une action longue de build, de test ou de GitHub :

- le changement d'onglet est bloque
- le changement de repo est bloque
- les boutons associes a l'action en cours changent d'etat

Pendant une annulation :

- un petit indicateur apparait a cote du bouton principal
- le statut textuel passe en mode annulation

Les boutons internes a l'onglet GitHub sont aussi bloques pendant une tache GitHub.

Le retour utilisateur attendu doit toujours repondre a trois questions :

- qu'est-ce qui est en train de se passer
- sur quelle vue ou quelle cible cela agit
- est-ce termine, annule ou en erreur

## Donnees memorisees localement

L'application garde localement plusieurs informations pour retrouver le contexte d'une session a l'autre.

Sont memorises :

- le dernier repertoire de projet choisi
- le token GitHub saisi
- le remote GitHub saisi

Ces informations sont stockees dans la configuration locale du dossier `scripts`.

L'application doit donc reouvrir dans un contexte proche de la session precedente, sans demander a chaque fois les memes informations.

## Contraintes de reconstruction de l'interface

Pour qu'une autre IA puisse la refaire fidelement, plusieurs invariants visuels et comportementaux doivent etre conserves :

- une seule fenetre principale
- un en-tete fixe
- trois onglets centraux
- un bouton principal d'action a droite
- des cartes blanches a contour fin
- des titres de section courts, avec accent visuel bleu a gauche
- une logique de split vertical et horizontal, pas une pile de blocs independants
- des consoles distinctes pour `Build`, `Client Test` et `GitHub`
- des listes distinctes pour les rapports
- des popups de selection separees pour le build et le test client

## Contraintes de reconstruction du code

Si cette specification est donnee a une autre IA pour reconstruire l'application, le code doit respecter les principes suivants :

- extraire les mecanismes repetes de section, split, bouton, progression, popup et journal
- ne pas dupliquer la logique de verrouillage d'onglets dans plusieurs endroits
- ne pas dupliquer la logique de changement d'etat des boutons dans plusieurs endroits
- ne pas dupliquer la logique de rendu des lignes `[OK]`, `[WARN]`, `[KO]`, `[RUN]`
- ne pas coder une popup unique en dur pour un seul usage si une base generique de popup de selection peut servir aux deux cas
- ne pas coder une carte unique en dur pour un seul onglet si une base parametrable peut servir ailleurs
- toute fonction commune doit etre rendue suffisamment parametrable pour etre reutilisable dans d'autres vues du projet
- la reutilisation doit primer sur les fonctions jetables ou les constructions a usage unique

## Parcours utilisateur typique

### Parcours 1 : ouvrir et charger un projet

- ouvrir l'application
- cliquer sur `Choisir repo`
- selectionner un repertoire qui contient des dossiers racine puis des dossiers de version
- verifier les compteurs `Loaders` et `Versions`

### Parcours 2 : lancer des builds

- aller sur `Build`
- cliquer sur `Lancer`
- cocher plusieurs cibles
- lancer
- suivre la console, le rapport, les erreurs et la progression
- supprimer eventuellement des jars detectes

### Parcours 3 : tester des clients

- aller sur `Client Test`
- cliquer sur `Tester`
- choisir les clients dans la popup
- regler la RAM max commune
- lancer
- attendre la fermeture de chaque client avant le suivant
- lire le rapport et les resultats finaux

### Parcours 4 : gerer GitHub

- aller sur `GitHub`
- verifier ou saisir le token et le remote
- enregistrer la configuration
- tester la connexion
- actualiser l'etat des branches
- recevoir ou envoyer selon le besoin
- regenarer le `.gitignore` si necessaire

## Resume tres court

Le dossier `scripts` contient un centre de controle de projet a trois usages :

- construire des cibles de type `loader/version`
- lancer des clients un par un avec une RAM commune
- imposer et piloter une organisation GitHub par branche principale et branches de dossiers

L'interface est entierement centree sur une seule fenetre, avec un en-tete fixe, trois onglets, des cartes de suivi, des consoles de journalisation, des listes de resultat et des popups de selection tree-view.
