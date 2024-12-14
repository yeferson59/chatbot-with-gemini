import { z } from "zod";

const { GOOGLE_API_KEY } = process.env;

const envConfig = z.object({
  googleApi: z.string(),
});

export const { googleApi } = await envConfig.parseAsync({
  googleApi: GOOGLE_API_KEY,
});
