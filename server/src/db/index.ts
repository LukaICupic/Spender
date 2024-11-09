import 'dotenv/config'; // Ensure this is at the top
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

async function main() {
    try {
        await pool.connect();
        console.log('Database connected successfully');
    } catch (err) {
        console.error('Database connection error:', err);
    }
}

main().catch((err) => {
    console.error('Main function error:', err);
});
