// Emericfolio — created by Tomi-Tom, 2026
// The images and videos of every project, sorted by section, as the gallery shows them

// GÉNÉRÉ AUTOMATIQUEMENT — NE PAS ÉDITER À LA MAIN.
// Source : les médias rangés dans content/projets/
// Régénérer avec : npm run contenu

import type { GalleryItem } from './projects';
import donnees from './gallery.generated.json';

export const generatedGallery = donnees as Record<string, GalleryItem[]>;
