import "dotenv/config"
import config from 'config';
import db from "./config/db";
import { app } from "./index"
import { data } from "./config/data"

let port: any = data.PORT_DEVELOPMENT || 3010


module.exports = app.listen(port, async () => {
    await db();
    console.log(`Server is running on ${port}...`);
    
})
