// import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";


// const connectDB = async () => {
//     try{
//         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
//         console.log(`\n MongoDB connected !! DB host: ${connectionInstance.connection.host} \n`);
//     }
    
//     catch(error){
//         console.error("Error connecting to database", error);
//         process.exit(1);
//     }
// }

// export default connectDB;                


import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import chalk from "chalk"; // For colorful logs

const MAX_RETRIES = 5; // Max retry attempts
let retries = 0;

const connectDB = async () => {
  const connectWithRetry = async () => {
    try {
      const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
      console.log(chalk.green(`\nMongoDB connected successfully! DB host: ${connectionInstance.connection.host}\n`));
    } catch (error) {
      retries += 1;
      console.error(chalk.red(`Error connecting to MongoDB (attempt ${retries}): ${error.message}`));

      if (retries <= MAX_RETRIES) {
        console.log(chalk.yellow(`Retrying connection... (${retries}/${MAX_RETRIES})`));
        setTimeout(connectWithRetry, 5000); // Retry every 5 seconds
      } else {
        console.error(chalk.bgRed("Max retries reached. Shutting down..."));
        process.exit(1); // Exit if max retries exceeded
      }
    }
  };

  connectWithRetry();
};

export default connectDB;
