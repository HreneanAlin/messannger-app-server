const {createGoogleUser, getGoogleUserById} = require('../repository/usersRepository')


const findOrCreateGoogleUser = async (profile) =>{
    try{
        let user = await getGoogleUserById(profile.id)
        if(user) return user
        createGoogleUser(profile)
        user = await  getGoogleUserById(profile.id)
        return user

    }catch (e) {
        console.log(e)
    }
}

module.exports.findOrCreateGoogleUser = findOrCreateGoogleUser