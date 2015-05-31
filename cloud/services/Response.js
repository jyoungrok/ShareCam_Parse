/**
 * Created by Claude on 15. 3. 19..
 */
module.exports = {

    INVALID_PARAMETER:{error_message:"invalid parameter",code:10},
    PERMISSION_DENIED:{error_message:"You are not permitted to perform this action.",code:11},
    PERMISSION_DENIED_NOT_MY_INF:{error_message:"You are not permitted to access other user's data",code:12},
//    ADMIN_LOGIN_FAIL:{error:{message:"admin login fail",code:11}},
//    NO_DATA:{error:{message:"no data",code:12}},
//    USER_INFORMATION_NOT_MATCHED:{error:{message:"user name and phone number are not matched",code:200}},
//    PAGE_LIMIT:{error:{message:"the number of page you send through parameter is over than the maximum of pages",code:201}},
//    PERMISSION_DENIED_NOT_ADMIN:{error:{message:"this action is allowed only to admin",code:202}},
//    PERMISSION_DENIED_NOT_MY_INF:{error:{message:"You are not permitted to access other user's data",code:203}},
    INVALID_PHONE_NUMBER:{error_message:"invalid phone number",code:"200"},
    VERIFICATION_NUMBER_NOT_MATCHED:{error_message:"verification number is not matched",code:"201"},
    INVAILD_ACCESS_TOKEN:{error_message:"invalid access token",code:"202"},
    INVALID_ACCOUNT:{error_message:"invalid account",code:"203"},

  //
//    adminLoginFail:function(res){
//        sails.log.warn(Response.ADMIN_LOGIN_FAIL);
//        res.badRequest(Response.ADMIN_LOGIN_FAIL);
//    },
//
//    permissionDenied:function(res){
//        sails.log.warn(Response.PERMISSION_DENIED);
//        res.forbidden(Response.PERMISSION_DENIED);
//    },
//
//    permissionDeniedNotMyInf:function(res){
//        sails.log.warn(Response.PERMISSION_DENIED_NOT_MY_INF);
//        res.forbidden(Response.PERMISSION_DENIED_NOT_MY_INF);
//    },
//
//
//    permissionDeniedNotAdmin:function(res){
//        sails.log.warn(Response.PERMISSION_DENIED_NOT_ADMIN);
//        res.forbidden(Response.PERMISSION_DENIED_NOT_ADMIN);
//    },
//    noData:function(res){
//        sails.log.warn(Response.NO_DATA);
//        res.badRequest(Response.NO_DATA);
//    },

    badRequest:function(res,error)
    {
        sails.log.warn(error);
        res.badRequest(error);
    },
    forbidden:function(res,error){
        sails.log.warn(error);
        res.forbidden(error);
    },
    serverError:function(res,error){
        sails.log.error(error);
        res.serverError();
    },

    invalidParameter:function(res){
//        var Reponse=require("./Response");
        sails.log.warn(Response.INVALID_PARAMETER);
        res.badRequest(Response.INVALID_PARAMETER);
    },
    invalidPhoneNumber:function(res){
        sails.log.warn(Response.INVALID_PHONE_NUMBER);
        res.badRequest(Response.INVALID_PHONE_NUMBER);
    },
    verificationNumberNotMatched:function(res){
        sails.log.warn(Response.VERIFICATION_NUMBER_NOT_MATCHED);
        res.badRequest(Response.VERIFICATION_NUMBER_NOT_MATCHED);
    }
//    userInformationNotMatched:function(res){
//        sails.log.warn(Response.USER_INFORMATION_NOT_MATCHED);
//        res.badRequest(Response.USER_INFORMATION_NOT_MATCHED);
//    },
//    pageLimit:function(res){
//        sails.log.warn(Response.PAGE_LIMIT);
//        res.badRequest(Response.PAGE_LIMIT);
//    }

}