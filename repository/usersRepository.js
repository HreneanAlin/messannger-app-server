if(process.env.NODE_ENV !== 'production'){
require("dotenv").config({path:'.env'})

}
const mySql = require('mysql')
const bcrypt = require('bcrypt')

const db = mySql.createConnection({
    host:process.env.DATA_BASE_HOST,
    user:process.env.DATA_BASE_USER,
    password:process.env.DATA_BASE_PASSWORD,
    database:process.env.DATA_BASE_CURRENT
})

db.connect(err =>{
    if(err) {

        throw err
    }
    console.log('MySql Connected')
})

 const createUserDb = async (body) => {
  // const rom_date = new Date(body.date).toLocaleString("en-US", {timeZone: "Europe/Bucharest"})
     //console.log(rom_date)

       const user = {
           first_name: body.firstName,
           last_name: body.lastName,
           email: body.email,
           user_name: body.userName,
           password: await bcrypt.hash(body.password,10),
           regist_date:new Date(body.date).toJSON().slice(0, 19).replace('T', ' ')
   }
    let sql = 'Insert into tb_users set ?'

    db.query(sql,user,(err,result)=>{
        if (err) throw err
        console.log('inserted done')
        console.log(result)
    })
}


const getUserDb = async (body) =>{
    try {
        let sql = `select * from tb_users where user_name ='${body.userName}'`;
        const data = await dbQuery(sql)
        const user = data[0]
        if (!user) return {error: {status: 404, message: "no user found"}}
        if(await bcrypt.compare(body.password,user.password)) return {user}
        return {error:{status:401, message:"wrong password"}}
    }catch (e) {
        
    }
}


const dbQuery = (databaseQuery) => {
    return new Promise(data => {
        db.query(databaseQuery,  (error, result) => {
            if (error) {
                console.log(error);
                throw error;
            }
            try {
                console.log(result);

                data(result);

            } catch (error) {
                data({});
                throw error;
            }

        });
    });

}

module.exports.createUserDb = createUserDb

module.exports.getUserDb = getUserDb