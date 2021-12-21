const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

//middleware
app.use(cors());
app.use(express.json());



//connect to mongodb
const uri = `mongodb+srv://SuperCar:RHtdAVjlDjxhKnpz@cluster0.hplqh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect((err) => {
      const db = client.db("SuperCar");
      const djiPackages = db.collection("Cars");
      const bookingsCollection = db.collection("bookings");
      const testimonialCollection = db.collection("testimonials");
      const usersCollection = db.collection("users");

      // ==============GET API ====================
      //GET API
      app.get("/", (req, res) => {
        res.send("Welcome To Super Car Lamborghini Server");
      });

      //GET API (Cars Package)
      app.get("/Cars", async (req, res) => {
        const result = await djiPackages.find({}).toArray();
        res.send(result);
      });

      //GET API (users)
      app.get("/users", async (req, res) => {
        const result = await usersCollection.find({}).toArray();
        res.send(result);
      });

      // verify admin data form database
      app.get("/users/:email", async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === "admin") {
          isAdmin = true;
        }
        // localhost:5000/users/admin@admin.com will show true
        res.json({ admin: isAdmin });
      });

      //GET API (Bookings)
      app.get("/bookings", async (req, res) => {
        let query = {};
        const email = req.query.email;
        if (email) {
          query = { email: email };
        }
        const result = await bookingsCollection.find(query).toArray();
        res.send(result);
      });

      //GET Dynamic (Bookings)
      app.get("/bookings/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await bookingsCollection.findOne(query);
        res.send(result);
      });

      //GET Dynamic (products)
      app.get("/Cars/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await djiPackages.findOne(query);
        res.send(result);
      });

      //GET (testimonials)
      app.get("/testimonials", async (req, res) => {
        const result = await testimonialCollection.find({}).toArray();
        res.send(result);
      });

      // ==========================POST API=========================
      //POST API (dji Package)
      app.post("/Cars", async (req, res) => {
        const newTours = req.body;
        const result = await djiPackages.insertOne(newTours);
        res.send(result);
      });

      //POST API (users)
      app.post("/users", async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        console.log(result);
        res.send(result);
      });

      //POST API (Bookings )
      app.post("/bookings", async (req, res) => {
        const newBooking = req.body;
        const result = await bookingsCollection.insertOne(newBooking);
        res.send(result);
      });

      //POST API (Testimonials )
      app.post("/testimonials", async (req, res) => {
        const newBooking = req.body;
        // console.log(newBooking);
        const result = await testimonialCollection.insertOne(newBooking);
        res.send(result);
      });

      // ======================DELETE API ========================
      //DELETE API(Bookings)
      app.delete("/bookings/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await bookingsCollection.deleteOne(query);
        res.send(result);
      });

      //DELETE API(drone)
      app.delete("/Cars/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await djiPackages.deleteOne(query);
        res.send(result);
      });

      // =================Update API====================
      app.put("/bookings/:id", async (req, res) => {
        const id = req.params.id;
        const newStatus = req.body;
        const query = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            data: newStatus.newData,
          },
        };
        const result = await bookingsCollection.updateOne(
          query,
          updateDoc,
          options
        );
        res.send(result);
      });

      //upsert Google user data
      app.put("/users", async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.json(result);
      });

      // add admin role
      app.put("/users/admin", async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const updateDoc = { $set: { role: "admin" } };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
      });
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

//run the server
app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
