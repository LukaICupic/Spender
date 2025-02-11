import { z } from "zod";

export const SessionSchema = z.object({
    session_id: z.string().uuid(),
    user_id: z.number(),
    created_at: z.date().optional(),
    expires_at: z.date(),
})

export type SessionDataWithValidation = z.infer<typeof SessionSchema>;