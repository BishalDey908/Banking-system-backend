const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
if (!process.env.DB_CONNECTION_STRING) {
    require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
}
const app = require('./src/app');

const connectToDB = require("./src/config/db");
connectToDB();


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;