const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xak6ecy.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();
    const toyCollection = client.db('toyUser').collection('toy');

    app.get('/toy', async(req, res) =>{
        const cursor = toyCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })
    app.get('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }

      const options = {
          // Include only the `title` and `imdb` fields in the returned document
          projection: { price: 1, img: 1, name: 1, seller_name: 1, seller_email: 1, rating: 1, available_quantity: 1, description: 1},
      };

      const result = await toyCollection.findOne(query, options);
      res.send(result);
  })
    app.post('/toy', async(req, res) =>{
      const newToy = req.body;
      console.log(newToy);
      const result = await toyCollection.insertOne(newToy);
      res.send(result);
    })
    app.get("/mytoy/:email", async(req, res)=> {
      console.log(req.params.id);
      const toys = await toyCollection.find({
        seller_email : req.params.email,
      })
      .toArray();
      res.send(toys)
    })

    app.get('/mytoy/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.findOne(query);
      res.send(result);
  })

  app.put('/toy/:id', async(req, res) => {
    const id = req.params.id;
    const updateToy = req.body;
    console.log(id, updateToy);

    const filter = {_id: new ObjectId(id)}
    const options = {upsert: true}
    const updateToyData = {
      $set: {
        price: updateToy.price,
        description: updateToy.description,
        available_quantity: updateToy.available_quantity
      }
    }

    const result = await toyCollection.updateOne(filter, updateToyData, options);
    res.send(result)

  })

    app.delete("/mytoy/:id", async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server is running')
})

app.listen(port, () => {
    console.log(`Toys Server is running on port ${port}`)
})