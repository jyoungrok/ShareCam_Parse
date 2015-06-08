/**
 * Created by Claude on 15. 3. 19..
 */

//var AWS = require("aws-sdk");
//AWS.config.loadFromPath('./assets/aws/config.json');

var Constants=require("cloud/services/Constants.js");

module.exports = {





    getNexmoSMS_URL:function(from,to,text){
        return Constants.NEXMO_URL+"?api_key="+Constants.NEXMO_API_KEY+"&api_secret="+Constants.NEXMO_API_SECRET+"&from="+from+"&to="+to+"&text="+text;
    },

    getDate:function(after)
    {

        var loadDt = new Date();
        console.log(new Date(Date.parse(loadDt) + parseInt(after)*1000));
        return new Date(Date.parse(loadDt) + parseInt(after)*1000);
    }




}