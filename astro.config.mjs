import { defineConfig } from 'astro/config';
import node from "@astrojs/node";
import react from '@astrojs/react';

export default defineConfig({
  output: 'server',
  integrations: [react()],
  adapter: node({
    mode: "standalone"
  }),
  server: {
    port: process.env.PORT || 4321,
    host: '0.0.0.0'
  }
});
