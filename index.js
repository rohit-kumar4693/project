let express = require("express");
let app = express();
let path = require("path");
let {MongoClient,ObjectId}=require("mongodb");
let client = new MongoClient("mongodb+srv://rk0418813:123%40rohit@cluster0.oo8dtsy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use("/static",express.static(path.join(__dirname,"public")));
let session=require("express-session");
const e = require("express");
app.use(session({
    secret:"rohit123",
    resave:false,
    saveUninitialized:false
}));

app.get("/",async(req,res)=>{

    await client.connect();
    let db = client.db("rohit_db");
    let coll = db.collection("products_1");
    let coll1 = db.collection("category");

    let products = await coll.find().toArray();
    let cats = await coll1.find().toArray();

    let login_status=false;
    let user="";
    let cart_item="";

    if(req.session.user){
        login_status=true;
        user=req.session.user;
        let cart=db.collection("cart");
        cart_item = await cart.find({email:req.session.user.email}).toArray();
    }


    res.render("home",{products:products,cats:cats,login_status:login_status,user:user,user:user,cart_item:cart_item});
});

app.get("/product_details/:id",async(req,res)=>{

    let id = parseInt(req.params.id);

     await client.connect();
    let db = client.db("rohit_db");
    let coll = db.collection("products_1");
    let coll1 = db.collection("category");    

    let products = await coll.find({id:id}).toArray();
    let cats = await coll1.find().toArray();

   let login_status=false;
    let user="";
    let cart_item="";

    if(req.session.user){
        login_status=true;
        user=req.session.user;
        let cart=db.collection("cart");
        cart_item = await cart.find({email:req.session.user.email}).toArray();
    }

    res.render("product_details",{product:products[0],cats:cats,login_status:login_status,user:user,cart_item:cart_item});
});

app.get("/cat_filter/:id",async(req,res)=>{

    let id=parseInt(req.params.id);


     await client.connect();
    let db = client.db("rohit_db");
    let coll = db.collection("products_1");
    let coll1 = db.collection("category");    

    let products = await coll.find({cat_id:id}).toArray();
    let cats = await coll1.find().toArray();

   let login_status=false;
    let user="";
    let cart_item="";

    if(req.session.user){
        login_status=true;
        user=req.session.user;
        let cart=db.collection("cart");
        cart_item = await cart.find({email:req.session.user.email}).toArray();
    }

    res.render("cat_filter",{products:products,cats:cats,login_status:login_status,user:user,cart_item:cart_item});
});

app.get("/sign_up",(req,res)=>{
    res.render("sign_up",{msg:""});
});

app.get("/do_signup",async(req,res)=>{

    let username = req.query.username;
    let email = req.query.email;
    let password = req.query.password;

    await client.connect();
    let db=client.db("rohit_db");
    let users = db.collection("emp");

    let record = await users.find({email:email}).toArray();

    if(record==0){
    await users.insertOne({

        username:username,
        email:email,
        password:password

    });

    res.redirect("/");

    }else{  
     res.render("sign_up",{msg:"* User Already Exist."})
    }

});

app.get("/sign_in",(req,res)=>{

    res.render("sign_in",{msg:""});
});

app.get("/do_signin",async(req,res)=>{

    let email = req.query.email;
    let password = req.query.password;
    await client.connect();
    let db = client.db("rohit_db");
    let user= db.collection("emp");
    let record=await user.find({email:email,password:password}).toArray();
    if(record.length==0){
        res.render("sign_in",{msg:"*Invalid Email or Password."});
    }
    else{
        req.session.user={email:email,username:record[0].username}
        res.redirect("/");
    }
    
});

app.get("/logout",(req,res)=>{

    req.session.user=null;

    res.redirect("/");
});

app.get("/add_cart/:id",async(req,res)=>{

    let id = parseInt(req.params.id);
    await client.connect();
    let db = client.db("rohit_db");
    let products = db.collection("products_1");
    let resp = await products.find({id:id}).toArray();
    
    let user = req.session.user;
    let email = user.email;

    let cart_item = {
        pr_name:resp[0].pr_name,
        pr_image:resp[0].pr_image,
        pr_sale_price:resp[0].pr_sale_price,
        email:email
    }

    let cart = db.collection("cart");
    await cart.insertOne(cart_item);


    let wishlist = db.collection("wishlist");
    
    await wishlist.find({id:id}).toArray();

    await wishlist.deleteOne({id:id});


    res.redirect("/");

});

app.get("/remove_cart/:id",async(req,res)=>{

    let id = req.params.id;

    client.connect();
    let db = client.db("rohit_db");
    let coll = db.collection("cart");
    await coll.deleteOne({_id:ObjectId.createFromHexString(id)});

    res.redirect("/");
});

app.get("/view_cart",async(req,res)=>{

    await client.connect();
    let db = client.db("rohit_db");
    let coll = db.collection("category");

    let cats = await coll.find().toArray();

  let login_status=false;
    let user="";
    let cart_item="";

    if(req.session.user){
        login_status=true;
        user=req.session.user;
        let cart=db.collection("cart");
        cart_item = await cart.find({email:req.session.user.email}).toArray();
    }

    res.render("viewcart",{cats:cats,login_status:login_status,user:user,cart_item:cart_item});
});

app.get("/check_out",async(req,res)=>{

    await client.connect();
    let db = client.db("rohit_db");
    let coll = db.collection("category");
    let cats = await coll.find().toArray();

     let login_status=false;
    let user="";
    let cart_item="";

    if(req.session.user){
        login_status=true;
        user=req.session.user;
        let cart=db.collection("cart");
        cart_item = await cart.find({email:req.session.user.email}).toArray();
    }

    res.render("checkout",{cats:cats,login_status:login_status,user:user,cart_item:cart_item});
});


app.get("/proceed_order",async(req,res)=>{

    let email=req.session.user.email;
    let date = new Date().getTime(); //1jan 1970  00:00:00
    let amount=req.query.amount;
    let firstName=req.query.firstName;
    let lastName=req.query.lastName;
    let address=req.query.address;
    let town=req.query.town;
    let country=req.query.country;
    let phone=req.query.phone;

    await client.connect();
    let db = client.db("rohit_db");
    let coll= db.collection("order");
    let resp =await coll.insertOne({email:email,date:date,amount:amount,firstName:firstName,lastName:lastName,address:address,
        town:town,country:country,phone:phone});
    
    let order_number = resp.insertedId;

    let cart = db.collection("cart");
    let cart_item= await cart.find({email:email}).toArray();
    let order_items = db.collection("order_item"); 

    for(let i=0;i<cart_item.length;i++){
        item = cart_item[i];
        await order_items.insertOne({pr_name:item.pr_name,pr_sale_price:item.pr_sale_price,pr_image:item.pr_image,
            email:email,order_number:order_number});
    }

    await cart.deleteMany({email:email});
    res.redirect("/");

});


app.get("/my_account",async(req,res)=>{

    await client.connect();
    let db = client.db("rohit_db");
    let coll = db.collection("category");

    let cats = await coll.find().toArray();

    let login_status=false;
    let user="";
    let cart_item="";

    if(req.session.user){
        login_status=true;
        user=req.session.user;
        let cart=db.collection("cart");
        cart_item = await cart.find({email:req.session.user.email}).toArray();
        let ord = db.collection("order");
        let orders = await ord.find({email:user.email}).toArray();
        res.render("my_account",{cats:cats,login_status:login_status,user:user,cart_item:cart_item,orders:orders});
    }else{
        redirect("/");
    }

});


app.get("/view_order/:id",async(req,res)=>{
    let id = req.params.id;
    await client.connect();
    let db = client.db("rohit_db");

    let coll2 = db.collection("order_item");
    let resp = await coll2.find({order_number:ObjectId.createFromHexString(id)}).toArray();

    let coll = db.collection("category");

    let cats = await coll.find().toArray();

    let login_status=false;
    let user="";
    let cart_item="";

    if(req.session.user){
        login_status=true;
        user=req.session.user;
        let cart=db.collection("cart");
        cart_item = await cart.find({email:req.session.user.email}).toArray();
        
    }
    res.render("view_order_items",{products:resp,cats:cats,login_status:login_status,user:user,cart_item:cart_item});

});


app.get("/do_password_change" ,async(req,res)=>{

    let old_password = req.query.old_password;
    let new_password = req.query.new_password;

    await client.connect();

    let db = client.db("rohit_db");
    let user = db.collection("emp");

    let email = req.session.user.email;

    let resp = await user.find({email : email , password : old_password}).toArray();

    if(resp.length > 0){

        await user.updateOne({email : email} , {$set : { password : new_password }});

        res.redirect("/")

    }

    else{
       

        
    }

});


app.get("/add_wishlist/:id" , async(req,res)=>{


    let id = parseInt(req.params.id);

    let email = req.session.user.email;

    await client.connect();

    let db = client.db("rohit_db");

    let products = db.collection("products_1");

    let reps = await products.find({id:id}).toArray();

    let prd = reps[0];

    let wishlist = db.collection("wishlist");

    await wishlist.insertOne({id:id, pr_name : prd.pr_name , pr_sale_price : prd.pr_sale_price , pr_image : prd.pr_image,email:email});
 

    res.redirect("/");

});


app.get("/view_wishlist" ,async(req,res)=>{

    await client.connect();
    let db = client.db("rohit_db");
    
    let coll1 = db.collection("category");

    
    let cats = await coll1.find().toArray();

    let login_status=false;
    let user="";
    let cart_item="";

    let wishlist_item = "";

    if(req.session.user){
        login_status=true;
        user=req.session.user;
        let cart=db.collection("cart");

        let wishlist = db.collection("wishlist")

        cart_item = await cart.find({email:req.session.user.email}).toArray();
        wishlist_item = await wishlist.find({email:req.session.user.email}).toArray();
    }


    res.render("view_wishlist",{cats:cats,login_status:login_status,user:user,user:user,cart_item:cart_item , wishlist :wishlist_item}); 


});


app.get("/remove_wishlist/:id",async(req,res)=>{

    let id = req.params.id;

    client.connect();
    let db = client.db("rohit_db");
    let coll = db.collection("wishlist");
    await coll.deleteOne({_id:ObjectId.createFromHexString(id)});

    res.redirect("/view_wishlist");
});







app.listen(7000,()=> console.log("server started at port 7000"));