/**
 * Created by Claude on 15. 6. 1..
 */

//require('cloud/app.js');
var Response=require('cloud/services/Response.js');
var Util=require('cloud/services/Util.js');
var Constants=require('cloud/services/Constants.js');

var Contact=Parse.Object.extend(Constants.CLASS_CONTACT);
var Friend=Parse.Object.extend(Constants.CLASS_FRIEND);


/**
 *
 * @param user - Parse.User (current user)
 * @param skip - 0
 * @param next (callback function)
 *
 * delete all contacts created by user
 */
function deleteContacts (user,skip,results,next)
{


    var query=new Parse.Query(Contact);

    results=results?results:[];
    //find all contact objects createdby current user (More than 1000 is available)
    query.descending("phone");
    query.equalTo("createdBy",user);
    query.limit(1000);
    query.skip(skip);
    query.find({
        success:function(queryResults){


            results=results.concat(queryResults);

            //if there are more contacts, recall function to get more
            if(queryResults.length==1000)
            {
                console.log("more than 1000");

                deleteContacts(user,skip+1000,results,next);
            }

            //if all of contacts are retrieved
            else{
                //delete all of them
                Parse.Object.destroyAll(results, {
                    success: function() {
                        next(null);
                    },
                    error: function(error) {
                        next(error);
                    }
                });

            }

        }
    });
}
/**
 *  get all friends of user
 */
function getFriends (user,skip,results,next)
{


    //get the list of phone numbers of friends of current user
//    var friend_innerQuery=new Parse.Query(Friend);
//    var friend_query=new Parse.Query(Parse.User);

    var friend_query=new Parse.Query(Friend);
    results=results?results:[];
    // friends of current user
//    friend_innerQuery.equalTo("createdBy",user);
//    friend_query.matchesKeyInQuery("objectId","friendUser",friend_innerQuery);
//    friend_query.select("phone");
    friend_query.equalTo("createdBy",user);
    friend_query.include("friendUser");
    friend_query.skip(skip);
    friend_query.limit(1000);
    friend_query.find({
        success: function (friends) {

//            console.log("friend query");
//            console.log(friends);
            results=results.concat(friends);
            if(friends.length==1000)
            {
                getFriends(user,skip+1000,friends,next);
            }
            else
            {
                next(null,results);
            }
        }
    });
}

/**
 *   get all contacts of current user
 */
function getContacts(user,skip,results,next)
{
    results=results?results:[];
    //get the list of contacts of current user
    var contact_Query = new Parse.Query(Contact);
    contact_Query.equalTo("createdBy", user);
    contact_Query.skip(skip);
    contact_Query.limit(1000);
    contact_Query.find({
        success: function (contacts) {
            results=results.concat(contacts);
            if(contacts.length==100)
            {
                getContacts(user,skip+1000,results,next);
            }
            else{
                next(null,contacts);
            }
        }
    });
}

/**
 * sign up completed
 */
Parse.Cloud.define("sign_up_completed",function(req,res){

    console.log("sing_up_completed");
    Parse.Cloud.useMasterKey();

    var user=Parse.User.current();
    user.set("completed",true);
    user.save(null, {
        success: function(updatedUser) {
            res.success();
        },
        error: function(updatedUser, err) {
            // The save failed.  Error is an instance of Parse.Error.
            res.error(err);
        }
    });


})

/**
 * @param phone
 *
 * send phone verification message to device and set the UserPhone class
 */
Parse.Cloud.define("sm_phone_verify", function(req, res) {
    var phone = req.params.phone;


//    console.log(phone);
    if(!phone)
    {
        res.error(Response.INVALID_PARAMETER);
        return;
    }

    Parse.Cloud.useMasterKey();



    //find UserPhone createdBy parse User
    var UserPhone = Parse.Object.extend(Constants.CLASS_USER_PHONE);
    var query=new Parse.Query(UserPhone);

    //find data not expired and createdy by user
    query.equalTo("phone", phone);

    // check whethere the phone number was already registered  or not
    query.find().then(function(userPhone) {
        if(userPhone.length>0)
            res.error(Response.PHONE_ALEADY_EXIST);
        else{
            var randomNumber="";
            //난수 발생 (6자리)
            for(var i=0; i<6; i++)
            {
                randomNumber=randomNumber+(Math.floor((Math.random() * 10))).toString();
            }

            Parse.Cloud.httpRequest({
                method: 'GET',
                url: Util.getNexmoSMS_URL(Constants.APP_NAME,phone,"Your%20SMS%20verification%20cod%20is%20"+randomNumber)
            }).then(function(httpResponse) {
                console.log(httpResponse);
                // success
                console.log(httpResponse.text);
                try {
                    var result=JSON.parse(httpResponse.text);
                } catch (e) {
                    // An error has occured, handle it, by e.g. logging it
                    console.log(e);
                }

                if(result && result.messages && result.messages[0].status==0)
                {
                    var Verify_UserPhone = Parse.Object.extend(Constants.CLASS_VERIFY_USER_PHONE);
                    var verify_userPhone=new Verify_UserPhone();


                    verify_userPhone.set("phone",phone);
                    verify_userPhone.set("vNumber",randomNumber);
                    verify_userPhone.set("createdBy",req.user);
                    verify_userPhone.set("expirationDate",Util.getDate(Constants.EXPIRATION_SECOND_PHONE_VERIFICATION));
                    verify_userPhone.save();

                    res.success();
                }
                else
                {

                    res.error(Response.INVALID_PHONE_NUMBER);
//                    Response.invalidPhoneNumber(res);
                }
            },function(httpResponse) {
                console.error(httpResponse);
                // error
                console.error('Request failed with response code ' + httpResponse.status);
            });
        }
    });


});

/**
 * @param - vNumber
 *
 * verify phone number
 */
Parse.Cloud.define("sm_phone_confirm",function(req,res){

    var vNumber=req.params.vNumber;

    Parse.Cloud.useMasterKey();


    if(!vNumber)
    {
        res.error(Response.INVALID_PARAMETER);
        return;
    }

    //find UserPhone createdBy parse User
    var Verify_UserPhone = Parse.Object.extend(Constants.CLASS_VERIFY_USER_PHONE);
    var query=new Parse.Query(Verify_UserPhone);

    //find data not expired and createdy by user
    query.greaterThan("expirationDate",Util.getDate(0));
    query.equalTo("createdBy", Parse.User.current());
    query.descending("createdAt");


    query.first({
        success: function(object) {


            //verification success
            if(object && object.get("vNumber")==vNumber)
            {
                //save userPhone
                var user=Parse.User.current();
                user.set("phone",object.get("phone"));
                user.save();

                //destroy temporary value for user phone verification
                object.destroy();

                res.success();

            }

            //vNumber is not matched
            else {
                res.error(Response.VERIFICATION_NUMBER_NOT_MATCHED);
            }
        },
        error: function(error) {
            console.error("Error: " + error.code + " " + error.message);
            res.error();
        }
    });
});

/**
 * delete all contacts createdby user
 */
Parse.Cloud.define("delete_contact", function(req, res) {

    Parse.Cloud.useMasterKey();

    deleteContacts(Parse.User.current(),0,null,function(err){

        if(err==null)
        {
            console.log("all destroyed");
            res.success();
        }
        else
            res.error(err);
    });




});


/**
 * synchronize contacts with sharecam friends
 */
Parse.Cloud.define("sync_contact", function(req, res) {

    console.log("sync_contact");
    // Set up to modify user data
    Parse.Cloud.useMasterKey();

    //get all friends of current user
    getFriends(Parse.User.current(),0,null,function(err,friends){
        console.log("friends "+friends.length);
        console.log(friends);

        //get all contacts of curret user
        getContacts(Parse.User.current(),0,null,function(err,contacts){
            console.log("contacts "+contacts.length);
            console.log(contacts);

            //find the list of contacts not added to friend class
            var newContact = [];

            for (var i = 0; i < contacts.length; i++) {

                var addedFriend=false;
                for (var j = 0; j < friends.length; j++) {


                    //remove contact already added to friend
                    if (contacts[i].get("phone") == friends[j].get("friendUser").get("phone")) {
                        console.log(contacts[i].get("phone") + " is already friend");
                        addedFriend=true;
                        break;
                    }
                }

                //add contact not added to friend
                if(!addedFriend)
                    newContact.push(contacts[i].get("phone"));
            }

            console.log("newContact "+newContact.length);
            console.log(newContact);

            //find the user not added to friend list in the newContract
            var user_query = new Parse.Query(Parse.User);
            user_query.containedIn("phone", newContact);
            user_query.find({
                success: function (newUser) {


                    console.log("find contact not added to friend "+newUser.length);
                    var newFriendList=[];
                    for(var i=0; i<newUser.length; i++)
                    {

                        //shoud not add current user to friend
                        if(newUser[i].id==Parse.User.current().id)
                            continue;

                        console.log("new Friend "+newUser[i].id);
                        var newFriend=new Friend();
                        newFriend.set("createdBy",Parse.User.current());
                        newFriend.set("friendUser",newUser[i]);
                        newFriend.setACL(new Parse.ACL(Parse.User.current()));
                        newFriendList.push(newFriend);
                    }

                    //add friends
                    Parse.Object.saveAll(newFriendList, {
                        success: function(list) {

                            //친구 목록 전부 response
                            var final_query=new Parse.Query(Friend);
                            final_query.equalTo("createdBy",Parse.User.current());
                            final_query.find({
                                success:function(allFriends)
                                {
                                    console.log("All Friends");
                                    console.log(allFriends);
                                    res.success(allFriends);
                                }
                            });


                        },
                        error: function(error) {
                            console.log(error);
                            res.error(error);
                        }
                    });


                }
            });

        });
    });

/*

    var userPhone=Parse.Object.extend(Constants.CLASS_USER_PHONE);
    var friend=Parse.Object.extend(Constants.CLASS_FRIEND);
    var contact=Parse.Object.extend(Constants.CLASS_CONTACT);

    //get the list of phone numbers of friends of current user
    var friend_innerQuery=new Parse.Query(friend);
    var friend_query=new Parse.Query(Parse.User);
    // friends of current user
    friend_innerQuery.equalTo("createdBy",Parse.User.current());
    friend_query.matchesKeyInQuery("objectId","friendUser",friend_innerQuery);
    friend_query.select("phone");
    friend_query.find({
        success: function(friends) {

            //phone numbers of friends
            console.log("friend list");
            console.log(friends);


            //get the list of contacts of current user
            var contact_Query = new Parse.Query(contact);
            contact_Query.equalTo("createdBy", Parse.User.current());
            contact_Query.find({
                success: function (contacts) {

                    console.log("contacts");
                    console.log(contacts.length);
                    console.log(contacts);


                    //find the list of contacts not added to friend class
                    var newContact = [];

                    for (var i = 0; i < contacts.length; i++) {

                        var addedFriend=false;
                        for (var j = 0; j < friends.length; j++) {


                            //remove contact already added to friend
                            if (contacts[i].get("phone") == friends[j].get("phone")) {
                                console.log(contacts[i].get("phone") + " is already friend");
                                addedFriend=true;
                                break;
                            }
                        }

                        //add contact not added to friend
                        if(!addedFriend)
                            newContact.push(contacts[i].get("phone"));
                    }

                    console.log("newContact");
                    console.log(newContact.length);
                    console.log(newContact);


                    //find the user not added to friend list in the newContract
                    var user_query = new Parse.Query(Parse.User);
                    user_query.containedIn("phone", newContact);
                    user_query.find({
                        success: function (newUser) {


                            console.log("find contact not added to friend");
                            var newFriendList=[];
                            for(var i=0; i<newUser.length; i++)
                            {
                                console.log("new Friend"+newUser[i]);
                                var newFriend=new friend();
                                newFriend.set("createdBy",Parse.User.current());
                                newFriend.set("friendUser",newUser[i]);
                                newFriend.setACL(new ParseACL(ParseUser.getCurrentUser()));
                                newFriendList.push(newFriend);
                            }

                            //add friends
                            Parse.Object.saveAll(newFriendList, {
                                success: function(list) {

                                    //친구 목록 전부 response
                                    var final_query=new Parse.Query(friend);
                                    final_query.equalTo("createdBy",Parse.User.current());
                                    final_query.find({
                                        success:function(allFriends)
                                        {
                                            console.log("All Friends");
                                            console.log(allFriends);
                                            res.success(allFriends);
                                        }
                                    });


                                },
                                error: function(error) {
                                    console.log(error);
                                    res.error(error);
                                }
                            });


                        }
                    });
                }
            });


        }
    });
*/


});


/**
 * delete userPhone every 5 minutes
 */
Parse.Cloud.job("delete_userPhone", function(request, status) {
    console.log("delete user phone job executing ");

    // Set up to modify user data
    Parse.Cloud.useMasterKey();

    var UserPhone = Parse.Object.extend(Constants.CLASS_VERIFY_USER_PHONE);
    var query = new Parse.Query(UserPhone);

    query.lessThan("expirationDate",Util.getDate(0));

    query.find({
        success: function(results) {
            Parse.Object.destroyAll(results, {
                success: function() {        status.success(); },
                error: function(error) {
                    console.error("Error deleting related comments " + error.code + ": " + error.message);
                    status.error(error);
                }
            });
        },
        error: function(error) {
            console.error("Error: " + error.code + " " + error.message);
            status.error(error);
        }
    });

});