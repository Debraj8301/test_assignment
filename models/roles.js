import mongoose from 'mongoose';


const rolesSchema = mongoose.Schema({
   roleName: {
        type: String,
        required: true
   }
})

var Roles = mongoose.model('Roles', rolesSchema);

export default Roles;