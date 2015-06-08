/**
 * Created by Claude on 15. 5. 31..
 */
//var express = require('express');
//var app = express();
//var Response=require('cloud/services/Response.js');
//var Util=require('cloud/services/Util.js');
//var Constants=require('cloud/services/Constants.js');
//
////휴대폰 인증 번호 받기
//app.get('/sm_phone_verify', function(req, res) {
//
//    var phone = req.param("phone");
//
//    if(!phone)
//    {
//        Response.badRequest(res,Response.INVALID_PARAMETER);
//        return;
//    }
//
//    var randomNumber="";
//    //난수 발생 (6자리)
//    for(var i=0; i<6; i++)
//    {
//        randomNumber=randomNumber+(Math.floor((Math.random() * 10))).toString();
//    }
//
//    Parse.Cloud.httpRequest({
//        method: 'GET',
//        url: Util.getNexmoSMS_URL(Constants.APP_NAME,phone,"Your%20SMS%20verification%20cod%20is%20"+randomNumber)
//    }).then(function(httpResponse) {
//        console.log(httpResponse);
//        // success
//        console.log(httpResponse.text);
//        try {
//            var result=JSON.parse(httpResponse.text);
//        } catch (e) {
//            // An error has occured, handle it, by e.g. logging it
//            console.log(e);
//        }
//
//        if(result && result.messages && result.messages[0].status==0)
//        {
//            req.session.phone=phone;
//            req.session.vnumber=randomNumber;
//            res.ok({});
//        }
//        else
//        {
//            Response.badRequest(res,Response.INVALID_PHONE_NUMBER);
////                    Response.invalidPhoneNumber(res);
//        }
//    },function(httpResponse) {
//        console.error(httpResponse);
//        // error
//        console.error('Request failed with response code ' + httpResponse.status);
//    });
//
//});
//
//app.put('sm_confirm_phone',function(req,res){
//
//    var vNumber=req.param("vNumber");
//
//    if(!vNumber)
//    {
////            Response.invalidParameter(res);
//        Response.badRequest(res,Response.INVALID_PARAMETER);
//        return;
//    }
//
//    sails.log("jyr","vNumber="+vNumber);
//    sails.log("jyr","vNumber session="+req.session.vnumber);
//
//    //인증번호 일치
//    //사용자 전화번호 등록
//    if(vNumber==req.session.vnumber)
//    {
////            req.session.phone_verified=true;
//        User.update({id:req.session.user_id},{phone:req.session.phone},function(err,user){
//            if(err)
//                Response.serverError(res,err);
//            else{
//                if(user.length>0)
//                {
//                    res.ok(user[0]);
//                }
//                else{
//                    Response.badRequest(res,Response.INVALID_PARAMETER);
//                }
//
//            }
//
//        });
////            res.ok({});
//    }
//    //인증 번호 불일치
//    else{
//        Response.badRequest(res,Response.VERIFICATION_NUMBER_NOT_MATCHED);
//    }
//
//
//});
//
//// This line is required to make Express respond to http requests.
//app.listen();