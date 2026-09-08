const mongoose = require("mongoose")

const connectTODB = () =>{
    mongoose.connect(process.env.DB_CONNECTION_STRING)
    .then(()=>{
        console.log("DB connected Successfully");
    })
    .catch((err)=>{
        console.log("DB connection failed",err);
        process.exit(1)
    })
}

module.exports = connectTODB