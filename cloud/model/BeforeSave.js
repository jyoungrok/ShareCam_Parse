/**
 * Created by Claude on 15. 6. 2..
 */
Parse.Cloud.beforeSave(Parse.User, function(request, response) {

    console.log("before Save");
    if (!request.object.get("completed")) {
        request.object.set("completed",false);
    }

    //전화번호를 클라이언트가 임의로 변경하려한 경우 response error (master key를 사용한 경우는 해당 안됨)
    if(request.object.get("phone") && !request.master)
    {
        console.log("not admitted to update phone from client");
        response.error();
    }

    else
        response.success();
});