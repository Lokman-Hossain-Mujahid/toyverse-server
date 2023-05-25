const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uhtjylk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await 
    // client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db = client.db("Toys");
    const ToysCollection = db.collection("addedToys");

    // const indexKeys = { name: 1 };
    // const indexOptions = { name: "toyName" }

    // const result = await ToysCollection.createIndex(indexKeys, indexOptions);

    // SEARCH API
    app.get("/toySearchByName/:text", async (req, res) => {
      const searchText = req.params.text;

      const result = await ToysCollection.find({
        $or: [
          { name: { $regex: searchText, $options: "i" } },
        ]
      }).toArray()
      res.send(result)
    })



    // ALL TOYS API
    app.get("/alltoys", async (req, res) => {
      const result = await ToysCollection.find({}).limit(20).toArray();
      res.send(result);
    })

    // TOYS ACCORDING TO EMAIL API
    app.get("/mytoys/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await ToysCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result)
    })

    // SPECIFIC TOY DETAIL FOR VIEW DETAILS
    app.get('/alltoys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await ToysCollection.findOne(query);
      res.send(result)
    })

    // ADD TOYS API
    app.post("/addedToys", async (req, res) => {
      const body = req.body;
      const result = await ToysCollection.insertOne(body)
      console.log(result);
      res.send(result)
    })

    // UPDATE SPECIFIC TOY DETAIL
    app.put('/updatetoys/:id', async (req, res) => {
      const id = req.params.id;
      const body = req.body
      const filter = { _id: new ObjectId(id) }
      const toy = {
        $set: {
          price: body.price,
          quantity: body.quantity,
          description: body.description
        }
      }
      const result = await ToysCollection.updateOne(filter, toy)
      res.send(result)
    })

    // DELETE API
    app.delete('/deletetoys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await ToysCollection.deleteOne(query)
      res.send(result)
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
})