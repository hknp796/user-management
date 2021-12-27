var db = require("./mongomodules");
const bcrypt = require("bcrypt");


module.exports = {
  insertdata: (userdata) => {
    return new Promise(async (resolve, reject) => {
      userdata.password = await bcrypt.hash(userdata.password, 10);
      db.get()
        .collection("users")
        .insertOne(userdata)
        .then((data) => {
          resolve(data);
        });
    });
  },
  login: (userdata) => {
    return new Promise(async (resolve, reject) => {
      let loginstatus = false;
      let response = {};
      let user = await db
        .get()
        .collection("users")
        .findOne({ email: userdata.email });
      if (user) {
        bcrypt.compare(userdata.password, user.password).then((status) => {
          if (status) {
            console.log("login success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("login failed");
        resolve({ status: false });
      }
    });
  },
  addUser:(userdata)=>{
return new Promise(async (resolve, reject) => {
      userdata.password = await bcrypt.hash(userdata.password, 10);
      db.get()
        .collection("users")
        .insertOne(userdata)
        
    });
  
  },
  showUser: (res) => {
    db.get()
      .collection("users")
      .find({})
      .toArray((err, result) => { 
        if(err)throw err
        else{
          res.render('index',{results:result})
        }      
      })
    },

  deleteUsers:(userdata)=>{
     db.get()
       .collection("users")
       .deleteOne(userdata);
     
  },
  findEditUsers:(id)=>{
    db.get().collection("users").findOne(id)
  },
  editUsers:(id,userdata)=>{
    
    
      db.get()
        .collection("users")
        .updateOne(id,
        
          {
            $set: {
              name: userdata.newname,
              email: userdata.newemail,
             
            }
          }
        );
        }
}
