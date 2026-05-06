export const appConfig = () => ({
  app: {
    env: process.env.APP_ENV ?? "local",
    port: Number(process.env.PORT ?? 4000)
  }
});
