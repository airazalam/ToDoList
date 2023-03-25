const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const  _=require("lodash");
const date = require(__dirname+"/date.js");
// var items = ["Buy Food","Cook Food","Eat Food"];
// var workItems = [];
mongoose.connect("mongodb+srv://airaz_alam:3aiMzUppp1JLADvf@cluster0.jzretlj.mongodb.net/todolistDB")
.then(() => {
    console.info('connected successfully')  
})
.catch(() => {
    console.error('connection error');
});

const itemsSchema = {
    name: String
};
const Item = mongoose.model("Item",itemsSchema);
const item1= new Item({
    name:"Welcome to your todolist!"
});
const item2= new Item({
    name:"Hit the + button to add a new item."
});
const item3= new Item({
    name:"<-- Hit this to delete an item."
});
const defaultItems = [item1,item2,item3];

const listSchema = {
    name:String,
    items: [itemsSchema]
};
const List = mongoose.model("List",listSchema);






const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));
app.listen(3000, function(){
    console.log("Server is running on port 3000");
});


app.get("/",function(req,res){
    

    async function getData () {
     
        const foundItems=await Item.find({});
        if(foundItems.length==0)
        {
            Item.insertMany(defaultItems)
            .then(() => {
                console.info('successfully saved default items to database')  
            })
            .catch(() => {
                console.error("error occured");
            });
            res.redirect("/");
        }
        else{
            res.render("list",{listTitle:date.getDate(),newListItems: foundItems});

        }

        
        
    };
    getData();
    
    
    
});

app.get("/:customListName", function(req,res){
    const customListName=_.capitalize(req.params.customListName);
    async function getData(){
        const result = await List.findOne({name: customListName});
        if (!result){
            const list = new List({
                name:customListName,
                items:defaultItems
            });
            await list.save();
            res.redirect("/"+customListName);
        } else {
            res.render("list",{listTitle:customListName,newListItems:result.items});
        }
    }
    getData();

});
// app.get("/work",function(req,res){
    
//     res.render("list",{listTitle: "Work list",newListItems: workItems});
// });
// app.post("/work", function(req ,res){
//     workItems.push(req.body.newItem);

//     res.redirect("/work");
// });


app.post("/", function(req,res){
    let itemName = req.body.newItem;
    let listName=req.body.list;

    const item = new Item({
        name: itemName
    });
    if (listName === date.getDate()){
        item.save();
        res.redirect("/");
    } else {
        async function getData(){
            const result = await List.findOne({name: listName});
            result.items.push(item);
            await result.save();
            
        }
        getData();
        res.redirect("/"+listName);


    }
    


    // console.log(req.body.list);
    // if(req.body.list === "Work" ){
    //     workItems.push(item);
    //     res.redirect("/work");
 
    // }
    // else {
    //     items.push(item);
    //     res.redirect("/");
    // }
    
});
app.post("/delete",function(req,res){

    const checkedItemId =req.body.checkbox;
    const listName = req.body.listName;
    if(listName === date.getDate()){
        async function deleteData(){
            const a= await Item.deleteOne({ _id: checkedItemId});
            console.log(a);
         
         }
         deleteData();
         res.redirect("/");


    }
    else {
        async function deleteData(){
            const a = await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}});

            console.log(a);
         
         }
         deleteData();
         res.redirect("/"+listName);
    }

    

});



app.get("/about", function(req,res){
    res.render("about");
    
});


// username: "airaz_alam"
// password: "3aiMzUppp1JLADvf"
