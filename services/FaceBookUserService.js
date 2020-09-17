const {getFaceBookUserById, createFacebookUser} = require('../repository/usersRepository')

const findOrCreateFacebookUser = async (profile) =>{
    try{
        let user = await getFaceBookUserById(profile.id)
        if(user) return user
        createFacebookUser(profile)
        user = await  getFaceBookUserById(profile.id)
        return user

    }catch (e) {
        console.log(e)
    }
}

module.exports.findOrCreateFacebookUser = findOrCreateFacebookUser