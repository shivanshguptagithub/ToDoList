
const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
const _= require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//conneting mongodb
//1. with local mongodb
//mongoose.connect("mongodb://localhost:27017/toDoListDB");

//2. with mongodb atlas online
mongoose.connect("mongodb+srv://guptashivansh28121999:FcQBbBeTVaRg2jC1@cluster0.xakvdsx.mongodb.net/toDoListDB");

//creating itemSchema
const itemSchema = mongoose.Schema({
  name:String
});

//creating Item model
const Item= mongoose.model("Item",itemSchema);

//creating items
const item1= new Item({
  name:"cook food"
});
const item2= new Item({
  name:"cook2 food"
});
const item3= new Item({
  name:"cook3 food"
});

let items;

//creating listSchema
const listSchema = mongoose.Schema({
  name:String,
  list:[itemSchema]
});

//creating List model
const List= mongoose.model("List",listSchema);

//get home request
app.get("/", function(req, res) {
  
  Item.find().then(function(items){
  if(items.length===0){
    Item.insertMany([item1,item2,item3]);
    res.redirect("/");
  }
  else{
    res.render("list", {listTitle: "Today", newListItems: items});
  }
  });
});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listTitle=req.body.list;
  const newItem=new Item({
    name:item
  });
  if (listTitle==="Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name:listTitle}).then(function(listFound){
      listFound.list.push(newItem);
      listFound.save();
      res.redirect("/"+listTitle);
    });
  }
});

app.post("/delete",function(req,res){
  const itemDelete=req.body.checkbox;
  const listTitle=req.body.listTitle;
  if(listTitle==="Today"){
    Item.deleteOne({_id:itemDelete}).then();
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listTitle},{$pull:{list:{_id:itemDelete}}}).then();
    res.redirect("/"+listTitle);
  }
  
  
});

app.get("/:list",function(req,res){
  const customList = _.capitalize(req.params.list);
  List.findOne({name:customList}).then(function(data){
    if(data)
    {
      res.render("list",{listTitle: data.name, newListItems: data.list});
    }
    else
    {
      const list= new List({
        name:customList,
        list:[item1,item2,item3]
      });
      list.save();
      res.redirect("/"+customList);
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
