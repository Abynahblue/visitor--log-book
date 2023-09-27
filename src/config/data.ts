import "dotenv/config";

const data = {
    DB_URL_DEVELOPMENT: process.env.DATABASE,
    DB_PASSWORD: process.env.DATABASE_PASSWORD,
    PORT_DEVELOPMENT: "5010"
}

export { data };