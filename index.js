const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

// Middleware
app.use(cors(""));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const { MongoClient, ObjectId } = require("mongodb");

// URL koneksi MongoDB
const uri = "mongodb://localhost:27017";

// Nama database
const dbName = "book_store";

// mongodb configuration
async function run() {
  const client = new MongoClient(uri);

  try {
    // Connect the client to the server
    await client.connect();

    // create a collection of documents
    const bookCollections = client.db("BookInventory").collection("books");

    // inster a book into the db || post
    app.post("/upload-book", async (req, res) => {
      const data = req.body;
      const result = await bookCollections.insertOne(data);
      res.send(result);
    });

    // update a book data || patch
    app.patch("/book/:id", async (req, res) => {
      const id = req.params.id;
      //   console.log(id);
      const updateBookData = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          ...updateBookData,
        },
      };

      // update
      const result = await bookCollections.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // delete a book data || delete
    app.delete("/book/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await bookCollections.deleteOne(filter);
      res.send(result);
    });

    // find by Category || gett
    app.get("/all-book", async (req, res) => {
      let query = {};
      if (req.query?.category) {
        query = { category: req.query.category };
      }
      const result = await bookCollections.find(query).toArray();
      res.send(result);
    });

    // get single a book data || get
    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await bookCollections.findOne(filter);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server success run on port ${port}`);
});
