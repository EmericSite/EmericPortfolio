'use client';

import { projects } from '@/data/projects';
import { useHubStore } from '@/store/hub';

export default function AccessibleProjectList() {
  return (
    <nav aria-label="Liste des projets" className="sr-only">
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <button
              type="button"
              aria-label={`Ouvrir ${project.title} (${project.year}, ${project.tag})`}
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
