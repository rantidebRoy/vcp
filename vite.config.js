import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site from a subpath when the repo is not at the root
// domain (e.g. https://<user>.github.io/<repo>/). If your repo is at the root,
// set base to '/'. Otherwise, set it to '/<repo-name>/'.
const repoName = 'vcp';

export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,
});
