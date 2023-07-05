const connect = require('./config/db')
const app = require('./app')

app.listen(process.env.PORT||2000, async function (){
await connect();
console.log("Server Running Succesfully");
});