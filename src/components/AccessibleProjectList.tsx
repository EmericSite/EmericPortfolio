// Emericfolio — created by Tomi-Tom, 2026
// Screen-reader-only list of every project, so the 3D hub stays navigable without sight
'use client';

import { projects } from '@/data/projects';
import { useHubStore } from '@/store/hub';
import { libelles } from '@/content/site';

export default function AccessibleProjectList() {
  return (
    <nav aria-label={libelles.listeProjets} className="sr-only">
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <button
              type="button"
              aria-label={`${libelles.ouvrirProjet} ${project.title} (${project.year}, ${project.tag})`}
              onClick={() => useHubStore.getState().setActive(project.id)}
            >
              {project.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
