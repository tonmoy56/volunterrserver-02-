
const express = require('express')
const app = express()
const port = 5000
const cors= require('cors')
app.use(cors())
const jwt=require('jsonwebtoken')

app.use(express.json());



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

require('dotenv').config()



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tam2izj.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const dbCollections=client.db('Charity').collection('Events')
const dbCollections1=client.db('Charity').collection('Selected')
const dbCollections2=client.db('Charity').collection('Member')


function VerifyJwt(req,res,next){
  const authHeader=req.headers.authorization
  // console.log(authHeader)
  if(!authHeader){
  return res.status(403).send({message:'unauthorized acceses12'})
  }

  const token=authHeader.split(" ")[1]
  // console.log(token)

  jwt.verify(token,process.env.ACCSES_TOKEN_SECRET,function(err,decoded){


    if(err){
     return res.status(403).send({message:'unauthorized acceses'})
    }

    req.decoded=decoded
    next()
  })
  
  
  
  
}


async function run() {


    app.get('/events',async(req,res)=>{

        const query={}
        const cursor= await dbCollections.find(query).toArray()
        res.send(cursor)
        


    })

    app.post('/create-event',async(req,res)=>{
      const data=req.body
      // console.log(data)


      
   
     
        const result= await dbCollections1.insertOne(data)
         res.send(result)
       

    
       
    
     
      
    
      
      
    })

    app.get('/adedevent',VerifyJwt,async(req,res)=>{
      // console.log(req.headers.authorization,'down')

      const decoded=req.decoded

    //  if(req.query.email  !==decoded.email){
    //         res.send({message:'unauthorized acceses'})

    //  }
let query={}
      if(req.query.email){
        query={
          email:req.query.email
          
        }
      }
    
      const cursor=  dbCollections1.find(query)
      const event= await cursor.toArray()
      res.send(event)

    })
   
    app.post('/jwt',(req,res)=>{
      const user=req.body
      //  console.log(user,'user data')
      const token=jwt.sign(user,process.env.ACCSES_TOKEN_SECRET,{expiresIn:'1h'})
      res.send({token})

    })

    app.delete('/event/:id',async(req,res)=>{
      const id=req.params.id
      const query={_id: new ObjectId(id)}
      const result= await dbCollections1.deleteOne(query)
      res.send(result)
    })

    app.post('/addmember',async(req,res)=>{
      const member=req.body
      const data = await dbCollections2.insertOne(member)
      res.send(data)
    })


    app.get('/newmember',async(req,res)=>{
      const query={}
      const cursor= dbCollections2.find(query)
      const data=  await cursor.toArray()
      res.send(data)
    })

    

    app.delete('/newmember/:id',async(req,res)=>{
      const id=req.params.id
      const query={_id:new ObjectId(id)}

      const data= await dbCollections2.deleteOne(query)
      res.send(data)
    })

    app.get('/newmember/:id',async(req,res)=>{
      const id=req.params.id
      const query={_id:new ObjectId(id)}
      const data= await dbCollections2.findOne(query)
      res.send(data)
    })

    app.put('/member/:id',async(req,res)=>{
      const id=req.params.id
      // console.log(id)
      const filter={_id:new ObjectId(id)}
      const data=req.body
      const options = { upsert: true };

      const updatedData={
      $set: {
        name: data.name,
        email:data.email,
        date: data.date

      }
    }

    const result= await dbCollections2.updateOne(filter,updatedData,options)
    res.send(result)

    })



    
}
run()



