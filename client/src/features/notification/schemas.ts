import { z } from 'zod';

export const notificationSchema = z.object({
  message: z.string(),
});
