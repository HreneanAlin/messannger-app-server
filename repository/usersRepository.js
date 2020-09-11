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
    debug: 'false'

}


let db = mySql.createConnection(dbConfig)
mySql.createPool




const handleDisconnect = () => {
    console.log("Connectig to db..")

    db = mySql.createConnection(dbConfig);
    // the old one cannot be reused.

    db.connect(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log('MySql Connected')
        }
    });

    db.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect()


const createUserDb = async (tempUser) => {

    try {
        if (await checkIfUserNameExist(tempUser.user_name, 'tb_users')) {
            return {errordb: "Account Allready Activated"}
        }


        // const rom_date = new Date(body.date).toLocaleString("en-US", {timeZone: "Europe/Bucharest"})
        //console.log(rom_date)

        const user = {
            first_name: tempUser.first_name,
            last_name: tempUser.last_name,
            email: tempUser.email,
            user_name: tempUser.user_name,
            password: tempUser.password,
            regist_date: tempUser.regist_date
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

const verifyUser = async (body) => {
    try {
        if (await checkIfUserNameExist(body.userName, 'tb_users') || await checkIfUserNameExist(body.userName, 'tb_users_temp')) {
            return {exist: {status: 403, message: "Username Already Taken!"}}
        }
        if (await checkIfEmailExist(body.email, 'tb_users') || await checkIfEmailExist(body.email, 'tb_users_temp')) {
            return {exist: {status: 403, message: "Email Already in use"}}
        }
        return {exist: null}

    } catch (e) {
        return {exist: {status: 403, message: "An error occured"}}

    }
}


const createTempUser = async (body) => {

    try {


        const user = {
            first_name: body.firstName,
            last_name: body.lastName,
            email: body.email,
            user_name: body.userName,
            password: await bcrypt.hash(body.password, 10),
            regist_date: new Date(body.date).toJSON().slice(0, 19).replace('T', ' '),
            verification_id: body.verificationId

        }
        let sql = 'Insert into tb_users_temp set ?'

        db.query(sql, user, (err, result) => {
            if (err) throw e
            console.log('inserted done to temporary table')
            console.log(result)
        })

        return {action: {status: 200, message: "Request send!"}}
    } catch (e) {
        if (e) throw e

    }
}


const checkIfUserNameExist = async (username, table) => {
    try {
        let sql = `select * from ${table} where user_name ='${username}'`;
        const data = await dbQuery(sql)
        const user = data[0]
        if (user) return true
        return false

    } catch (e) {
        throw e
    }
}

const checkIfEmailExist = async (email, table) => {
    try {
        let sql = `select * from ${table} where email ='${email}'`;
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

const getUserByDbId = async (id) => {
    try {
        let sql = `select * from tb_users where id =${id}`;
        const data = await dbQuery(sql)
        const user = data[0]
        return user

    } catch (e) {
        throw e
    }
}

const pullUserFromTemp = async (verificationId) => {
    try {
        let sql = `select * from tb_users_temp where verification_id ='${verificationId}'`;
        const data = await dbQuery(sql);
        if (!data[0]) return {error: "It looks like you followed a broken link"}
        return {user: data[0]}

    } catch (e) {
        throw e

    }
}

const deleteUserFromTemp = (verificationId) => {
    const sql = `delete from tb_users_temp where verification_id='${verificationId}'`

    db.query(sql, (err, result) => {
        if (err) throw e
        console.log('user deleted from temporary table')
        console.log(result)
    })
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

const checkIfVerifiedIdExists = async (verifiedId) => {
    try {
        let sql = `select verification_id from tb_users_temp where verification_id='${verifiedId}'`;
        const data = await dbQuery(sql)
        if (data[0]) return true
        return false


    } catch (e) {
        throw e
    }
}


const getUserDbByEmail = async (email) => {
    try {
        let sql = `select first_name, last_name, user_name from tb_users where email='${email}'`;
        const data = await dbQuery(sql)
        return data[0]
    } catch (e) {
        throw e
    }
}

const getInfoById = async (id) => {
    try {
        let sql = `select email from tb_info_for_recover where info_id='${id}'`;
        const data = await dbQuery(sql)
        return data[0]
    } catch (e) {
        throw e
    }
}

const insertInfoForPasswordRecover = (info) => {
    const procesedInfo = {
        first_name: info.firstName,
        last_name: info.lastName,
        email: info.email,
        user_name: info.userName,
        info_id: info.id
    }

    let sql = 'Insert into tb_info_for_recover set ?'

    db.query(sql, procesedInfo, (err, result) => {
        if (err) throw e
        console.log('inserted done to info for recover')
        console.log(result)
    })


}

const updatePassword = async (password, email) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        let sql = `update tb_users set password ='${hashedPassword}' where email='${email}'`
        db.query(sql, (err, result) => {
            if (err) throw e
            console.log('password update done')
            console.log(result)
        })
        return {action: {status: 200, message: "Password was reset!"}}

    } catch (e) {
        console.log(e)
        throw e
    }

}

const deleteByIdFromInfoTable = (id) => {
    try {

        let sql = `delete from tb_info_for_recover where info_id='${id}'`
        db.query(sql, (err, result) => {
            if (err) throw e
            console.log('deleted from info table')
            console.log(result)
        })


    } catch (e) {
        console.log(e)
        throw e
    }

}


const createGoogleUser =(profile)=>{
    const proccedUser = {
        first_name:profile.name.givenName,
        last_name:profile.name.familyName,
        email:profile.emails[0].value,
        user_name:profile.displayName,
        google_id:profile.id
    }

    let sql = 'Insert into tb_google_users set ?'

    db.query(sql, proccedUser, (err, result) => {
        if (err) throw err
        console.log('inserted done to google users table')
       // console.log(result)
    })
}

const getGoogleUserById = async (googleId) => {
    try{
        let sql = `select * from tb_google_users where google_id='${googleId}'`;
        const data = await dbQuery(sql)
        if(data.length !== 0){
            return data[0]
        }
        return null
    }catch (e) {
        console.log(e)

    }
}



module.exports.createUserDb = createUserDb
module.exports.getUserDb = getUserDb
module.exports.getUserDbByUserName = getUserByUserName
module.exports.handleDisconnect = handleDisconnect
module.exports.createTempUser = createTempUser
module.exports.pullUserFromTemp = pullUserFromTemp
module.exports.deleteUserFromTemp = deleteUserFromTemp
module.exports.checkIfVerifiedIdExists = checkIfVerifiedIdExists
module.exports.verifyUser = verifyUser
module.exports.checkIfEmailExist = checkIfEmailExist
module.exports.getUserDbByEmail = getUserDbByEmail
module.exports.insertInfoForPasswordRecover = insertInfoForPasswordRecover
module.exports.getInfoById = getInfoById
module.exports.updatePassword = updatePassword
module.exports.deleteByIdFromInfoTable = deleteByIdFromInfoTable
module.exports.createGoogleUser = createGoogleUser
module.exports.getGoogleUserById = getGoogleUserById
module.exports.getUserByDbId = getUserByDbId
