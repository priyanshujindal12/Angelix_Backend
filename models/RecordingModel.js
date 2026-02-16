const mongoose=require('mongoose');
const recordingModelSchema=new  mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
        required: true
    },
    videoUrl:{
        type: String,
        required: true
    },
    audioUrl:{
        type: String,
        required: true
    },
    location:{
        latitude: Number,
        longitude: Number,
    },
    startedAt:  Date,
    endedAt: Date
},
   {timestamps: true},
)
const recordingModel=mongoose.model("Recording", recordingModelSchema);
module.exports=recordingModel;