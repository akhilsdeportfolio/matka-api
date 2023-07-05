const connect = require('./config/db')
const app = require('./app')

app.listen(2000, async function (){
await connect();
console.log("Server Running Succesfully");
});