//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");


const app = express();
const _=require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemSchema = new mongoose.Schema(
  {
    name: String
  }
);
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your to-do list"
});
const item2 = new Item({
  name: "Hit the + button to add a new item "
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});
const defaultItems = [item1, item2, item3];

const listSchema ={
  name:String,
  items:[itemSchema]
};
const List=mongoose.model("List",listSchema);







app.get("/", function (req, res) {

  Item.find({}, function (err, founditem) {

    if (founditem.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Succesfully added items to DB");
        }
        res.redirect("/");
      })
    }
    else {
      res.render("list", { listTitle: "today", newListItems: founditem });
    }

  });
  app.get("/:customListName",function(req,res)
  {
    const customListName= _.capitalize(req.params.customListName) ;
    List.findOne({name:customListName},function(err,foundlist)
    {
      if(!err)
      {
        if(!foundlist)
        {
          //Create  a new list
          const list=new List(
            {
              name:customListName,
              items:defaultItems
            }
          )
          list.save();
          res.redirect("/"+customListName);
        }
        else
        {
          //display an existing one
          res.render("list", { listTitle:foundlist.name , newListItems: foundlist.items });
        }
      }
    })

  })



});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  });
  if(listName==="today")
  {
    item.save();
    res.redirect("/");
  
  }
  else
  {
     List.findOne({name:listName},function(err,foundList)
     {
     foundList.items.push(item);
     foundList.save();
     res.redirect("/"+listName);
     })
  }


});
app.post("/delete",function(req,res)
{
  const ans=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="today")
  {
    Item.findByIdAndRemove(ans,function(err){
      if(err)
      {
        console.log(err);
      }
      else
      {
        console.log("Deleted from DB");
      }
    })
    res.redirect("/")
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:ans}}},function(err,foundList)
    {
      if(!err)
      {
        res.redirect("/"+listName);
      }
    })
  }
 
})



app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
