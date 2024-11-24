import { httpServer } from "./src/app.js";
import { connectDB } from "./src/db/connectDB.js";

connectDB().then(() => {
  httpServer.listen(process.env.PORT, () => {
    console.log("Server is running on port 4000");
  });
});
