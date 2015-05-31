
require('cloud/app.js');


Parse.Cloud.define("sm_phone_verify", function(req, res) {
    var phone = req.params["phone"];

    if (req.user) {
        Parse.Cloud.useMasterKey();
        req.user.fetch({
            success: function (user) {
                console.log(user._sessionToken);
            },
            error: function (user, err) {
                response.error(err.message);
            }
        });
    } else {
        response.error("Not logged in.");
    }
});
