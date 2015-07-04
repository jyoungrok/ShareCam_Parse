# ShareCam_Parse

cloud code for parse


# API 

### Parse - API

| Name | Description| parameter |Error Code |
| ------------- | ----------- | ----------- |----------- |
| send message for verifying phone number | /sm_phone_verify| phone | 200 |
| confirm verification number for phone number and save userPhone |  /sm_phone_confirm| vNumber | 201,202 |
| complete sign up process | /sign_up_completed | | | 
| synchronize contact with sharecam friend | /sync_contact | | |
| delete all of contacts createdby user | /delete_contact | | |

# ERROR CODE

|Code|Description| 
| ------------- | ----------- |
| 1 |  invalid parameter   |
| 200 | invalid phone number |
| 201 | verification number is not matched |
| 202 | phone number already exist |

# Class
## Field of Class

#### Picture

- when you upload a picture, you should make object whose hasphoto field is "true" and photoSynched is "false".
- And then you should try updating image field.
- if you have done , you will have to change the field of photoSynched to "true"

|objectId|createdBy|phoneList|groupList|friendList|image|hasPhoto|photoSynched|
| ------------- | ----------- |------------- | ----------- |------------- | ----------- |------------- | ----------- |
||the user object id who create this picture|the array of phone numbers which this picture should be shared with|the array of group objectId...|the array of friend objectId | file of a picture| true if this object should have a picture | true if image filed has a picture file|





## ACL of Class

#### _User
- create, get, find  - public access
- update , delete - only accessed by current user
- update , delete (with phone field) - only accessed by using master key 

#### Contact

#### Friend
- create, get, find, update, delete - only accessed by current user

##### Picture



  
