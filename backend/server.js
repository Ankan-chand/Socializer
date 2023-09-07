const app = require('./app');  //require using filename


// connecting database

// const dataBase = require('./config/database');  //require using filename
// dataBase.connectDatabase();

// or

//it will extract the connectDatabase method from the database.js and store it in a variable with same name
const { connectDatabase } = require('./config/database');   
connectDatabase();



app.listen(process.env.PORT,()=>{
  console.log(`Server is running on port ${process.env.PORT}`);
});

