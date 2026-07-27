# Modifier le contenu du site

Ce guide s'adresse à Emeric. Aucune notion de code n'est nécessaire : tout se
joue dans deux fichiers et un dossier d'images.

| Je veux… | Fichier à ouvrir |
| --- | --- |
| changer un texte (accueil, About, contact) | `src/content/site.ts` |
| ajouter ou modifier un projet | `src/data/projects.ts` |
| ajouter des images ou vidéos à un projet | dossier `public/projects/` |
| changer le logo | dossier `ASSETS_EMERIC/00_LOGO/` puis une commande |

Après chaque modification, il faut **publier** le site. Voir la dernière
section.

---

## 1. Changer un texte

Ouvrir `src/content/site.ts`. Chaque texte est entre guillemets. Il suffit de
remplacer ce qu'il y a **entre** les guillemets, sans y toucher.

```ts
export const accueil = {
  surtitre: 'Mélancolie électrique',
  titreLigne1: 'Motion · 3D ·',
  titreLigne2: 'Direction artistique.',
};
```

Trois règles à respecter :

1. Ne pas supprimer les guillemets `'` autour du texte.
2. Ne pas supprimer la virgule `,` en fin de ligne.
3. Pour une apostrophe dans un texte, écrire `’` (l'apostrophe courbe) et non
   `'`. Exemple : `'Discuter d’un projet'`. Si on écrit `'` le site casse.

### Ajouter ou retirer un réseau social

Dans la section `contact`, la liste `reseaux`. Copier un bloc, changer les
valeurs, ou supprimer un bloc entier pour le faire disparaître du site.

```ts
{
  label: 'Instagram',
  handle: '@fumir._o',
  href: 'https://www.instagram.com/fumir._o/?hl=fr',
},
```

### Ajouter un bloc « Approach » dans About

Dans la section `about`, la liste `approche`. La numérotation (#01, #02…) et
le compteur « 02 entrées » se mettent à jour tout seuls.

---

## 2. Ajouter un projet

### Étape A — la fiche

Ouvrir `src/data/projects.ts` et copier un bloc existant, du `{` au `},`, puis
changer les valeurs :

```ts
{
  id: 'mon-nouveau-projet',        // sans espace ni accent, en minuscules
  title: 'Titre complet du projet',
  shortTitle: 'Titre court',        // affiché sur la carte 3D
  year: '2026',
  tag: 'Client · Type',
  accent: '#FF2D9C',                // couleur d'accent, code hexadécimal
  blurb: 'Une phrase de résumé.',
  description: 'Le texte long qui décrit le projet.',
  role: 'Direction artistique · Motion 3D',
  credits: [
    { label: 'Client', value: 'Nom du client' },
    { label: 'Direction artistique', value: 'Emeric Ressy' },
  ],
  posterUrl: '/posters/mon-nouveau-projet.webp',
  vimeoId: '1234567890',            // l'identifiant dans l'URL Vimeo
},
```

L'ordre des projets dans ce fichier est l'ordre dans lequel ils tournent sur
le site.

### Étape B — l'image de couverture

Déposer une image dans `public/posters/` en la nommant exactement comme dans
`posterUrl`. Format conseillé : `.webp`, environ 1400 px de large.

### Étape C — les médias du projet

Créer un dossier au nom de l'`id` du projet dans `public/projects/`, puis des
sous-dossiers par catégorie. Il suffit d'y glisser les fichiers :

```
public/projects/mon-nouveau-projet/
├── motion/
├── stillframes/
├── storyboard/
├── behind-the-scene/
└── scraps-and-research/
```

Ces cinq noms de dossiers sont les seuls reconnus. Un dossier vide ou absent
n'affiche simplement pas de section.

Formats acceptés : `.webp`, `.png`, `.jpg`, `.avif` pour les images,
`.mp4`, `.webm`, `.mov` pour les vidéos.

L'ordre d'affichage à l'intérieur d'une section suit l'ordre alphabétique des
noms de fichiers. Pour maîtriser l'ordre, nommer `01-...`, `02-...`, etc.

### Étape D — lancer le scan

Dans le Terminal, à la racine du projet :

```bash
npm run scan-media
```

Le script parcourt les dossiers, mesure chaque fichier et met le site à jour.
Il affiche un récapitulatif :

```
=== mon-nouveau-projet ===
  STILLFRAMES            12
  BEHIND THE SCENE        4
```

Si un fichier est signalé `[ignoré]`, c'est qu'il n'est pas dans un des cinq
dossiers, ou que son format n'est pas géré.

> Ne jamais modifier `src/data/gallery.generated.ts` à la main : ce fichier est
> réécrit à chaque scan.

### Changer l'ordre des sections d'un projet

Par défaut, l'ordre est : MOTION, STILLFRAMES, STORYBOARD, BEHIND THE SCENE,
SCRAPS & RESEARCH. Pour un projet en particulier, ajouter une ligne
`categories` dans sa fiche :

```ts
categories: ['STORYBOARD', 'STILLFRAMES', 'MOTION'],
```

Seules les sections listées seront affichées, dans cet ordre.

---

## 3. Remplacer le logo

Déposer les nouveaux fichiers dans `ASSETS_EMERIC/00_LOGO/` en gardant les noms
`Logo_White.png` (glyphe détouré sur fond transparent) et `LOGO_DEF_NET.png`
(version définitive). Puis :

```bash
npm run build-logos
```

Cela régénère `public/logo-mark.png` (navbar et écran de chargement) et
`public/logo.png` (vignette affichée quand on partage le lien du site).

---

## 4. Le formulaire de contact

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

## 5. Publier les modifications

Une fois les changements faits, dans le Terminal :

```bash
npm run build     # vérifie que rien n'est cassé
git add -A
git commit -m "contenu: description de ce qui a changé"
git push
```

Le site se met à jour automatiquement quelques minutes après le `push`.

**Si `npm run build` affiche une erreur**, ne pas pousser : c'est en général un
guillemet ou une virgule manquante dans un des fichiers modifiés. Le message
d'erreur indique le fichier et le numéro de ligne.

---

## 6. Vérifier avant de publier

Pour voir le site en local avant de publier :

```bash
npm run dev
```

Puis ouvrir l'adresse affichée dans le Terminal (en général
`http://localhost:3000`). Les modifications de texte apparaissent
immédiatement, sans avoir à relancer.
