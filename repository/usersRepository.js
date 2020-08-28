if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config({path: '.env'})

}
const mySql = require('mysql')
const bcrypt = require('bcrypt')

const dbConfig = {
    host: process.env.DATA_BASE_HOST,
    user: process.env.DATA_BASE_USER,
    password: process.env.DATA_BASE_PASSWORD,
    database: process.env.DATA_BASE_CURRENT,
    debug : 'false'

}


let db = mySql.createConnection(dbConfig)
mySql.createPool

var connection;

const handleDisconnect = () => {
    console.log("disconneting happening")

    db = mySql.createConnection(dbConfig); // Recreate the connection, since
    // the old one cannot be reused.

    db.connect(function (err) {              // The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    db.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}
handleDisconnect()


const createUserDb = async (body) => {

    try {
        if (await checkIfUserNameExist(body.userName)) {
            return {action: {status: 403, message: "Username Already Taken!"}}
        }
        if (await checkIfEmailExist(body.email)) {
            return {action: {status: 403, message: "Email Already in use"}}
        }


        // const rom_date = new Date(body.date).toLocaleString("en-US", {timeZone: "Europe/Bucharest"})
        //console.log(rom_date)

        const user = {
            first_name: body.firstName,
            last_name: body.lastName,
            email: body.email,
            user_name: body.userName,
            password: await bcrypt.hash(body.password, 10),
            regist_date: new Date(body.date).toJSON().slice(0, 19).replace('T', ' ')
        }
        let sql = 'Insert into tb_users set ?'

        db.query(sql, user, (err, result) => {
            if (err) throw e
            console.log('inserted done')
            console.log(result)
        })

        return {action: {status: 200, message: "Account Created"}}
    } catch (e) {
        if (e) throw e

    }
}

const checkIfUserNameExist = async (username) => {
    try {
        let sql = `select * from tb_users where user_name ='${username}'`;
        const data = await dbQuery(sql)
        const user = data[0]
        if (user) return true
        return false

    } catch (e) {
        throw e
    }
}

const checkIfEmailExist = async (email) => {
    try {
        let sql = `select * from tb_users where email ='${email}'`;
        const data = await dbQuery(sql)
        const user = data[0]
        if (user) return true
        return false

    } catch (e) {
        throw e
    }
}


const getUserDb = async (body) => {
    try {
        let sql = `select * from tb_users where user_name ='${body.userName}'`;
        const data = await dbQuery(sql)
        const user = data[0]
        if (!user) return {error: {status: 404, message: "no user found"}}
        if (await bcrypt.compare(body.password, user.password)) return {user}
        return {error: {status: 401, message: "wrong password"}}
    } catch (e) {

    }
}

const getUserByUserName = async (userName) => {
    try {
        let sql = `select * from tb_users where user_name ='${userName}'`;
        const data = await dbQuery(sql)
        const user = data[0]
        return user

    } catch (e) {
        throw e
    }
}


const dbQuery = (databaseQuery) => {
    return new Promise(data => {
        db.query(databaseQuery, (error, result) => {
            if (error) {

                console.log(error);
                //throw error;
            }
            try {
                console.log(result);

                data(result);

            } catch (error) {
                data({});
               // throw error;
            }

        });
    });

}



module.exports.createUserDb = createUserDb

module.exports.getUserDb = getUserDb
module.exports.getUserDbByUserName = getUserByUserName
module.exports.handleDisconnect = handleDisconnect