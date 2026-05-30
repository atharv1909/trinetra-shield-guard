export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    // @ts-ignore
    nitro: {
      preset: "vercel",
    },
  },
});
