# Modifier le contenu du site

Ce guide s'adresse à Emeric. Aucune notion de code n'est nécessaire.

Tout le contenu du site vit dans **un seul dossier : `content/`**. Rien d'autre
n'est à ouvrir.

```
content/
├── site.yml                    ← tous les textes du site
└── projets/
    ├── 01_gentle-mates/        ← un dossier = un projet
    ├── 02_dofus/
    ├── 03_douce-melancolie/
    └── 04_come-torment/
```

| Je veux… | Ce que je fais |
| --- | --- |
| changer un texte (accueil, About, contact) | j'ouvre `content/site.yml` |
| changer la vidéo du showreel | `content/site.yml`, bloc `showreel` |
| modifier un projet | j'ouvre son `projet.yml` |
| ajouter un projet | je duplique un dossier de projet |
| enlever un projet | je jette son dossier à la corbeille |
| changer l'ordre des projets | je renomme les numéros `01_`, `02_`… |
| renommer une section d'un projet | je renomme son dossier d'images |
| changer l'ordre des sections | je renomme leurs numéros `01_`, `02_`… |

Il n'y a **aucun texte ailleurs**. Tout ce qui s'affiche vient de ces fichiers,
jusqu'au titre de l'onglet du navigateur et aux messages d'erreur.

Après une modification, il faut **publier**. Voir la section 5.

---

## 1. Changer un texte

Ouvrir `content/site.yml`. Chaque ligne est de la forme `nom du champ: le
texte`. Il suffit de remplacer ce qui est écrit **après les deux-points**.

```yaml
accueil:
  surtitre: Mélancolie électrique
  titreLigne1: Motion · 3D ·
  titreLigne2: Direction artistique.
```

Deux choses seulement à respecter :

1. **Ne pas déplacer les décalages** en début de ligne. Ce sont eux qui disent
   à quel bloc appartient chaque ligne.
2. Si le texte commence par un caractère spécial (`#`, `@`, `-`, `*`, `:`),
   l'entourer de guillemets droits : `handle: "@fumir._o"`.

Les apostrophes, les accents et les caractères comme `×` ou `·` s'écrivent
normalement. Il n'y a plus rien à échapper.

### Écrire un texte long

Pour un paragraphe, utiliser `>` puis décaler les lignes en dessous. Les
retours à la ligne sont recollés automatiquement en un seul paragraphe.

```yaml
accroche: >
  Direction artistique, motion 3D, identité visuelle.
  Pour les briefs gaming/esport, anime, ou les pièces plus narratives.
```

`|-` à la place de `>` conserve les retours à la ligne dans le texte, mais un
seul champ les affiche vraiment : le `label` des `index` du bloc `about` (les
chiffres clés). Partout ailleurs, l'affichage recolle les lignes en une seule,
même avec `|-` : pour découper un texte, il faut donc des champs séparés.

### Ajouter ou retirer un réseau social

Dans `contact`, la liste `reseaux`. Copier un bloc de trois lignes, changer les
valeurs, ou supprimer un bloc entier pour le faire disparaître du site.

```yaml
  reseaux:
    - label: Instagram
      handle: "@fumir._o"
      href: https://www.instagram.com/fumir._o/?hl=fr
```

### Ajouter un bloc « Approach » dans About

Dans `about`, la liste `approche`. La numérotation (#01, #02…) et le compteur
« 02 entrées » se mettent à jour tout seuls.

### Les autres blocs de `site.yml`

| Bloc | Ce qu'il pilote |
| --- | --- |
| `identite` | le nom et le métier affichés dans la barre du haut |
| `loader` | le texte affiché pendant le chargement du site |
| `navigation` | les trois onglets du haut (Work, About, Contact) |
| `showreel` | la vidéo qui tourne en fond et se lance au centre du hub |
| `marquee` | le texte répété en très grand derrière la page |
| `formulaire` | les textes du formulaire de contact |
| `partage` | le titre de l'onglet, et la vignette quand on partage le lien |
| `interface` | les libellés lus par les lecteurs d'écran (rarement utile) |
| `erreur` | les deux pages affichées si le site rencontre un problème |

Dans `navigation`, on peut renommer un libellé ou retirer une ligne, mais pas
toucher au `mode` : il indique quel écran ouvrir et ne peut valoir que `hub`,
`about` ou `contact`.

Le bloc `showreel` a cinq lignes, toutes obligatoires. Changer le showreel,
c'est remplacer le numéro Vimeo, les titres et l'année :

```yaml
showreel:
  vimeoId: 1172501942
  titre: Showreel 2025
  titreCourt: Showreel · 2025
  annee: 2025
  accent: "#F4D8E2"                # couleur d'accent, avec les guillemets
```

`accent` est la couleur qui teinte la carte du showreel dans le hub. Elle
s'écrit comme celle des projets : un dièse suivi de six caractères, entre
guillemets. Si cette ligne manque, rien n'est publié.

L'image de la carte showreel dans le hub est `public/showreel-poster.webp`.

---

## 2. Ajouter un projet

### Étape A — le dossier

Dupliquer un dossier de projet existant dans `content/projets/`, et le renommer
avec **le numéro suivant** et un nom court :

```
content/projets/05_mon-nouveau-projet/
```

Le numéro donne la position du projet sur le site. Le nom après le `_` sert
d'adresse : uniquement des lettres minuscules, des chiffres et des tirets, sans
espace ni accent.

> **Le renommage n'est pas facultatif.** Deux dossiers ne peuvent pas avoir le
> même nom après le numéro : `01_gentle-mates` et `05_gentle-mates` sont en
> conflit, parce que c'est cette partie qui sert d'adresse. Tant que ce n'est
> pas corrigé, rien n'est publié et `npm run dev` refuse de démarrer en
> l'indiquant. Renommer le dossier suffit, et tout repart tout seul.

### Étape B — la fiche

Ouvrir le `projet.yml` du dossier dupliqué et remplacer les valeurs :

```yaml
title: Titre complet du projet
shortTitle: Titre court           # affiché sur la carte 3D
year: 2026
tag: Client · Type
accent: "#FF2D9C"                 # couleur d'accent, avec les guillemets
vimeoId: 1234567890               # le numéro à la fin de l'adresse Vimeo
role: Direction artistique · Motion 3D
kind: personal                    # personal ou client

blurb: >
  Une phrase de résumé.

description: >
  Le texte long qui décrit le projet.

credits:
  Client: Nom du client
  Direction artistique: Emeric Ressy
```

`kind` dit si la pièce est personnelle (`personal`) ou une commande (`client`).
Elle s'affiche sur la fiche, ligne « Nature ». Toute autre valeur est refusée.

Dans `credits`, chaque ligne est un `Rôle: Nom`. En ajouter ou en retirer
autant que nécessaire.

### Étape C — l'image de couverture

Remplacer le fichier **`poster`** à la racine du dossier du projet. Il peut être
en `.png`, `.jpg` ou `.webp`, à n'importe quelle taille : il sera redimensionné
tout seul. Le nom doit rester `poster`.

### Étape D — les médias

Ranger les fichiers dans des sous-dossiers. **Chaque dossier devient une section
du projet sur le site**, et son nom devient le titre de la section :

```
content/projets/05_mon-nouveau-projet/
├── projet.yml
├── poster.png
├── 01_motion/              → section MOTION
├── 02_stillframes/         → section STILLFRAMES
├── 03_storyboard/          → section STORYBOARD
├── 04_behind-the-scene/    → section BEHIND THE SCENE
└── 05_scraps-and-research/ → section SCRAPS & RESEARCH
```

Les noms ne sont pas imposés : un dossier `06_essais-de-couleur` crée une
section ESSAIS DE COULEUR. Comme pour les projets, **le numéro donne l'ordre**
et disparaît du titre. Un dossier sans numéro passe après les autres.

Trois règles de nommage, et c'est tout :

- les tirets et les underscores deviennent des espaces ;
- le mot `et` ou `and` devient `&` : `scraps-and-research` donne
  SCRAPS & RESEARCH ;
- le titre s'affiche toujours en majuscules.

Renommer un dossier renomme donc la section, et la déplacer dans l'ordre est
une affaire de numéro. Un dossier vide, ou jeté à la corbeille, fait disparaître
sa section du site à la publication suivante.

> Deux dossiers ne peuvent pas porter le même nom une fois le numéro retiré :
> `02_motion` et `07_motion` sont en conflit. Le Terminal le dit et ne publie
> rien tant que ce n'est pas corrigé.

Formats acceptés : `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.tif` pour les
images, `.mp4`, `.mov`, `.webm` pour les vidéos, et `.gif`. Un fichier dans un
autre format est laissé de côté, et le Terminal le signale.

Pas besoin de préparer les fichiers : ils peuvent être en pleine résolution et
peser plusieurs mégaoctets. Ils sont redimensionnés et allégés automatiquement
pour le site, et les originaux restent intacts dans `content/`.

> Une exception : un fichier `.webp` est publié tel quel, sans retouche. C'est
> voulu, pour les cas où on veut maîtriser soi-même la compression.

L'ordre d'affichage dans une section suit l'ordre alphabétique des noms de
fichiers. Pour maîtriser l'ordre, nommer `01-...`, `02-...`, etc.

### Étape E — publier

Voir la section 5.

### Changer l'ordre des sections d'un projet

Le plus simple est de renuméroter les dossiers : `03_storyboard` devient
`01_storyboard` et sa section passe en premier. Les fichiers publiés ne bougent
pas, seul l'ordre change.

L'autre façon, sans rien renommer, est une ligne `categories` dans la fiche du
projet :

```yaml
categories: [storyboard, stillframes, motion]
```

Les noms s'écrivent sans le numéro. Seules les sections listées sont affichées,
dans cet ordre : c'est aussi le moyen de masquer une section sans la supprimer.
Un nom qui ne correspond à aucun dossier du projet arrête la publication, et le
Terminal rappelle les sections existantes.

---

## 3. Enlever ou déplacer un projet

**Enlever** : jeter le dossier du projet à la corbeille, puis publier. Ses
images sont retirées du site automatiquement.

**Déplacer** : renommer les numéros au début des dossiers. Par exemple, pour
faire passer DOFUS en premier, renommer `02_dofus` en `01_dofus` et
`01_gentle-mates` en `02_gentle-mates`.

---

## 4. Remplacer le logo

Déposer les nouveaux fichiers dans `ASSETS_EMERIC/00_LOGO/` en gardant les noms
`Logo_White.png` (glyphe détouré sur fond transparent) et `LOGO_DEF_NET.png`
(version définitive). Puis, dans le Terminal :

```bash
npm run build-logos
```

Cela régénère `public/logo-mark.png` (navbar et écran de chargement) et
`public/logo.png` (vignette affichée quand on partage le lien du site).

---

## 5. Publier les modifications

Dans le Terminal, à la racine du projet :

```bash
npm run contenu     # prépare les images et vérifie que tout est correct
git add -A
git commit -m "contenu: description de ce qui a changé"
git push
```

Le site se met à jour automatiquement quelques minutes après le `push`.

**Si on n'a changé que du texte**, `npm run contenu` n'est pas obligatoire :
les textes sont relus à chaque publication. Il ne sert que quand on touche à
des images ou à des vidéos. Dans le doute, le lancer ne coûte rien.

### Si la commande signale un problème

Rien n'est publié tant qu'il reste une erreur. Le message indique le fichier,
la ligne et ce qu'il faut corriger :

```
✗ content/projets/02_dofus/projet.yml  ligne 7
  « bleu » n'est pas une couleur valide
  il faut un dièse suivi de six caractères, entre guillemets : accent: "#FF2D9C".
```

Corriger, relancer la commande, recommencer jusqu'à voir la ligne verte :

```
✓ site à jour — 4 projet(s), 83 média(s), 14081 Ko
```

---

## 6. Vérifier avant de publier

Pour voir le site en local avant de publier :

```bash
npm run dev
```

Puis ouvrir **l'adresse affichée dans le Terminal**. C'est en général
`http://localhost:3000`, mais si ce port est déjà pris, Next en choisit un
autre et l'annonce :

```
⚠ Port 3000 is in use, using available port 3001 instead.
- Local:   http://localhost:3001
```

Toute modification de `content/` est reprise aussitôt : textes, fiches projet
et images comprises. Il n'y a rien à relancer, et le Terminal confirme chaque
prise en compte :

```
✓ contenu rechargé — 4 projet(s), 83 média(s)
```

Si une saisie est incorrecte, l'erreur s'affiche dans le Terminal et le site
reste sur sa dernière version valide. Dès que c'est corrigé, il repart.

Pour tout arrêter : `Ctrl+C`.

---

## 7. Le formulaire de contact

Les messages arrivent par mail via le service **Resend**. Trois réglages sont
nécessaires, à déclarer une seule fois sur Vercel :

| Réglage | À quoi ça sert |
| --- | --- |
| `RESEND_API_KEY` | la clé du compte Resend |
| `CONTACT_TO_EMAIL` | l'adresse qui reçoit les messages |
| `CONTACT_FROM_EMAIL` | l'adresse expéditrice, sur un domaine vérifié chez Resend |

Le modèle est dans le fichier `.env.example`. Sans ces réglages, le formulaire
affiche un message d'indisponibilité et le lien mail direct reste utilisable.

Protections en place : trois envois maximum toutes les dix minutes par
visiteur, et un champ invisible qui piège les robots.

---

## Pour les curieux : ce qui se passe côté technique

`content/` est la seule source. `npm run contenu` en tire cinq fichiers dans
`src/`, marqués « GÉNÉRÉ AUTOMATIQUEMENT » :

| Fichier | Ce qu'il contient |
| --- | --- |
| `src/content/site.generated.ts` | tous les textes de `site.yml` |
| `src/data/projects.generated.ts` | les fiches `projet.yml` |
| `src/data/gallery.generated.ts` | le pont vers la liste des médias |
| `src/data/gallery.generated.json` | la liste des médias publiés |
| `src/data/categories.generated.ts` | les noms et l'ordre des sections |

Ces fichiers ne doivent jamais être édités à la main : ils sont réécrits à
chaque publication.

Les médias déposés dans `content/` sont eux aussi envoyés sur le dépôt : un
clone suffit ainsi à tout republier, rien ne vit uniquement sur une machine. Ce
sont leurs versions allégées, dans `public/`, qui sont affichées en ligne.

Mieux vaut donc y déposer des fichiers déjà raisonnables, quelques mégaoctets
au plus. Les rushes bruts, eux, n'ont pas leur place ici : ils restent en
dehors du dépôt.
