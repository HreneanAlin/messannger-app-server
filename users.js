const users = []

const addUser = ({id, name, room, generatedId, verified, googleId}) => {
    name = name.trim().toLowerCase()
    room = room.trim().toLowerCase()

    const user = {id,name,room,generatedId,verified, googleId}
    users.push(user)

    return {user}

}

const removeUser = (id) => {
  const index = users.findIndex((user)=> user.id === id)

  if(index !== -1)
      return users.splice(index,1)[0]
}

const getUser = (id) => {
  return users.find(user => user.id === id)
}

const getUsersInRoom = (room) => {
  return users.filter(user => user.room === room)
}

module.exports = {addUser,removeUser,getUser,getUsersInRoom}