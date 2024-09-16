const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { type } = require("os");
const path= require('path')

app.use(express.json());
app.use(cors());

//Data base connection with Mongodb;
mongoose.connect("mongodb+srv://Arsh6622:Arsh0080@cluster0.in5hg.mongodb.net/e-commerce")

//API Creation

app.get("/",(req,res)=>{
       res.send("Express app is running");
})
app.use(express.static(path.join(__dirname,'./frontend/build')))
app.get('*',function(req,res){
    res.sendFile(path.join(__dirname,'./frontend/build/index.html'));
})
//Text image storage engine

const storage = multer.diskStorage({
    destination: './upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage:storage})

//Creating upload endpoint for images
app.use('/images',express.static('upload/images'))

app.post("/upload",upload.single('product'),(req,res)=>{
res.json({
    success:1,
    image_url:`http://localhost:${port}/images/${req.file.filename}`
})
})

//Schema for creating products

const Product = mongoose.model("Product",{
    id:{
        type:Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true,
    },

})

app.post('/addproduct',async(req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length>0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }
    else{
        id = 1;
    }
     const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
     });
     console.log(product);
     await product.save();
     console.log("Saved");
     res.json({
        success:true,
        name:req.body.name,
     })
})

//Creating API for deleting products

app.post('/removeproduct',async(req,res)=>{
      await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name
    })
})

//Creating API for getting all products

app.get('/allproducts',async(req,res)=>{
       let products = await Product.find({});
       console.log("All Products Fetched");
       res.send(products);
})

//Schema cewating for user model

const Users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

//Creating end-point for registering user
app.post('/signup',async(req,res)=>{

    let check = await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false,error:"Existing user found!"})
    }
    let cart = {};
    for(let i=0;i<300;i++){
        cart[i] = 0;
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })

    await user.save();

    const data = {
        user:{
            id:user.id
        }
    }

    const token = jwt.sign(data,'secret_ecom');
    res.json({success:true,token})
})  

//Creating endpoint for user login
app.post('/login',async(req,res)=>{
      let user = await Users.findOne({email:req.body.email});
      if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else{
            res.json({success:false,errors:"Invalid Password"});
        }
      }
      else{
        res.json({success:false,errors:"Wrong email id"});
      }
})

//Creating endpoint for new collection data
app.get('/newcollections',async(req,res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("NewCollection Fetched!");
    res.send(newcollection);
})

//Creating end point for popular in women category
app.get('/popularinwomen',async(req,res)=>{
    let products = await Product.find({category:"women"});
    let popular_in_women = products.slice(0,4);
    console.log("Popular in women fetched");
    res.send(popular_in_women)
})
//Creating middle wear to fetch user
const fetchUser = (req,res,next)=>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({errors:"Please authenticate using valid token"})
    }
    else{
        try{
           const data = jwt.verify(token,'secret_ecom');
           req.user = data.user;
           next();
        }
        catch(error){
           res.status(401).send({errors:"please authenticate using valid token"})
        }
    }
}

//Creating end point for addind products in cart data

app.post('/addtocart', fetchUser, async (req, res) => {
    try {
        let user = await Users.findOne({ _id: req.user.id });
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Check if the item exists in the cart, otherwise initialize it
        let updatedCartData = user.cartData;
        updatedCartData[req.body.itemId] = (updatedCartData[req.body.itemId] || 0) + 1;

        // Use findOneAndUpdate to update the cartData field in MongoDB
        await Users.findOneAndUpdate(
            { _id: req.user.id }, // filter
            { $set: { cartData: updatedCartData } }, // update operation
            { new: true } // return the updated document
        );

        res.json({ success: true, message: "Product added to cart" });
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

//CREATING END POINT TO REMOVE PRODUCT FROM CART DATA

app.post('/removefromcart', fetchUser, async (req, res) => {
    try {
        console.log("Removing item:", req.body.itemId);

        // Find the user by ID
        let userData = await Users.findOne({ _id: req.user.id });

        if (!userData) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Check if the item exists in the user's cart
        if (userData.cartData[req.body.itemId] === undefined) {
            return res.status(400).json({ success: false, message: "Item not in cart" });
        }

        // Ensure the item quantity is greater than zero before decrementing
        if (userData.cartData[req.body.itemId] > 0) {
            userData.cartData[req.body.itemId] -= 1;
        } else {
            return res.status(400).json({ success: false, message: "Item quantity is already zero" });
        }

        // Update the cart in the database using $set
        await Users.findOneAndUpdate(
            { _id: req.user.id }, // filter
            { $set: { cartData: userData.cartData } }, // update the cart data
            { new: true } // return the updated document
        );

        // Respond with a success message
        res.json({ success: true, message: "Product removed from cart" });
    } catch (error) {
        console.error("Error removing product from cart:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

//Creating endpoint to get cart data
app.post('/getcart',fetchUser,async(req,res)=>{
    console.log("Get Cart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})

app.listen(port,(error)=>{
   if(!error){
    console.log("Server running on port :" +port)
   }
   else{
    console.log("Error:"+error)
   }
})