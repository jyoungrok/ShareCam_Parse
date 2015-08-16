# ShareCam_Parse

cloud code for parse


# API 

### Parse - API

| Description | Name | parameter |Error Code |
| ------------- | ----------- | ----------- |----------- |
| send message for verifying phone number | /sm_phone_verify| phone | 200 |
| confirm verification number for phone number and save userPhone |  /sm_phone_confirm| vNumber | 201,202 |
| complete sign up process | /sign_up_completed | | | 
| find phone number which hasn't been added to friend list yet and add it to friend list    | /sync_all_contact | type (0 - 동기화 후 모든 친구목록 return / 1 - 동기화 후 추가된 친구 목록 return), syncTime(syncTime 이후의 연락처에 대해 검사) | | 
| delete all of contacts createdby user | /delete_contact | | |
| **_`deprecated`_**서버와 친구 목록 동기화 후 (추가, 수정, 삭제된 친구목록을 응답) | /sync_friend_list| | |
| local에서 아직 동기화 되지 않은 서버(수정,삭제,추가된) 테이터들을 받아온다. | /sync_data| syncDate, className||

### Description of API

#### 회원 가입
| Name | parameter |Error Code |
| ----------- | ----------- |----------- |
| /sm_phone_verify| phone | 200 |
|  /sm_phone_confirm| vNumber | 201,202 |
| /inform_new_user | | |

##### 1. 인증번호 받기 /sm_phone_verify
- Paramaeter
  - phone - [String]전화번호
- Response 
  - NULL
- Description 
  - Verify_UserPhone object 중 해당 installation으로 생성한 obejct가 1분안에 있는지 확인 -> 203 error
  - Verify_UserPhone object 생성 및 문자 전송

##### 2. 인증번호 확인 /sm_phone_confirm
- Parameter 
  - vNumber - [String]인증번호
- Response
  - null
- Description  
  - Verify_UserPhone object 중 해당 인증번호 확인
  - 해당 phone을 field에 가지고 있는 다른 user 삭제 
  - 새로운 user을 sign up 한 후 response sessionToken(클라이언트에서 이를 받아 session 설정)

##### 연락처, 친구 목록 초기화 

##### 3. 연락처로 친구 찾기 /sync_all_contact
- Parameter
  - syncTime -(Number) 마지막 동기화 시간 (new Date().getTime()) 
- Response
  - null
- Description 
  - 마지막 동기화 시간(처음일 경우 - 0) 이후에 수정 혹은 생성된 연락처에 대해 추가되지 않은 쉐어캠 친구가 있다면 찾아서 추가


##### 4. 새로운 사용자 등록을 타 사용자에게 알림 /inform_new_user
- Parameter
  - 없음
- Response
  - null
- Description 
  - User class의 completed = true 
  - 본 사용자의 연락처를 가지고 있는 타사용자의 친구 목록에 본 사용자를 추가 



# ERROR CODE

|Code|Description| 
| ------------- | ----------- |
| 1 |  invalid parameter   |
| 200 | invalid phone number |
| 201 | verification number is not matched |
| 202 | phone number already exist |
| 203 | continuous attempts are not allowed. please try after a minute |

# Class


## Field of Class 

#### _User

- before create 
  - comepleted - false
  - (friendUser) userName,phone,profile 중 하나가 바뀐 경우 friend obejct의 syncUpdatedAt 수정 (friend class 설명 참조) 
  - profile을 수정/등록 하는 경우 thumPorfile 생성 및 저장
- after delete
  -  (friendUser) friend object의 deleted = true
  -  (createdBy) contact object 모두 삭제
  -  (createdBy) session object 삭제
  

| field | description |
| ------------- | ----------- |
| name | 사용자 이름 |
| userName | 사용자 identifier(임의 생성됨) |
| phone | 사용자의 전화번호 (휴대전화 인증 시 등록됨) |
| authData | | 
| completed | 회원가입이 완료된 경우 true / 그렇지 않은 경우 false (client에서 signUp process 완료 후 설정) | 
| profile | 프로필 사진  | 
| thumProfile | thumnail 프로필 사진 |

#### Contact 

| field | type |description |
| ------------- | ----------- | ----------- |
| createdBy | Pointer<_User> | 생성 사용자 |
| phone | string | 전화번호 |
| syncUpdatedAt | Number | 클라이언트측에서 마지막으로 데이터를 수정한 시간(1970년 1월 1일 0시 0분 0초로부터의 시간 millisecond) | 
| deleted | 회원가입이 완료된 경우 true / 그렇지 않은 경우 false (client에서 signUp process 완료 후 설정) | 

#### Picture

- create
  - when you upload a picture, you should make object whose hasphoto field is "true" and photoSynched is "false".
  - And then you should try updating image field.
  - if you have done , you will have to change the field of photoSynched to "true" and thumnail image will be automatically generated

- expired (사진 저장 후 n일이 지난 경우)
  - hasPhoto = false / photoSynched = false


| field | description |
| ------------- | ----------- |
| createdBy |the user object id who create this picture|
| phoneList | the array of phone numbers which this picture should be shared with (해당 번호의 사용자가 가입 시 해당 phone number를 지우고 friendList의 friend objectId를 추가 한다)|
| groupList | the array of group objectId...| 
| friendList | the array of friend objectId | 
| image | file of a picture | 
| thumImage | thumnail  file (nX128px) |
| hasPhoto | true if this object should have a picture |
| photoSynched | true if image filed has a picture file |
| savedBy | the array of users who save the image |

#### Friend

- User의 create/update/delete(CUD)시 Friend User object 수정
  - create
    - 생성되는 user A의 phone을 user B가 가지고 있는 경우 createdBy - B / friendUser - A object가 생성됨
  - update
    -  _User의 field가 수정되는 경우 해당 user를 friendUser field로 갖는 object의 syncUpdatedAt 수정
  - delete
    - _User가 삭제되는 경우 해당 user를 friendUser field로 갖는 obejct의 deleted를 true로 수정 

| field | description |
| ------------- | ----------- |
| createdBy | |
| friendUser | 친구의 objectId |
| deleted | 기본적으로 false / friendUser의 user object가 삭제 될 경우 true |
| syncUpdatedAt | friend object가 생성된 시기 혹은 이 후에 friendUser의 object가 update된 시기 |

#### Verify_UserPhone

| field | description |
| ------------- | ----------- |
| createdBy | installation objectId |
| vNumber | 인증 번호 |
| phone | 인증번호 요청 전화번호 |
| expirationTime | 인증 처리 가능 시간 (new Date().getTime()) |
| createdTime | 인증 요청 생성 시간 (재전송 요청 방지 위해 사용)  (new Date().getTime()) | 


## ACL of Class

#### _User
- create, get, find  - public access
- update , delete - only accessed by current user
- update , delete (with phone field) - only accessed by using master key 

#### Contact

#### Friend
- create, get, find, update, delete - only accessed by current user

##### Picture



  
