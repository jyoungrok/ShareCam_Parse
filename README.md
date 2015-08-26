# Table of Contents

1. [API](#api)
  - [Overview Of API](#overview-of-api)
  - [Description of API](#description-of-api)
- [Class](#class)
  - [Field of Class](#field-of-class) 
  - [ACL of Class](#acl-of-class)



# API 

## Overview of API

| Name | parameter |Error Code |
| ----------- | ----------- |----------- |
| /sm_phone_verify| [String]phone | 200,203 |
|  /sm_phone_confirm| [String]vNumber | 201 |
| /inform_new_user | | |
| /fetch_contact | [Number]syncTime | |

## Description of API

### /sm_phone_verify
- Paramaeter
  - phone - [String]전화번호
- Response 
  - NULL
- Description 
  - Verify_UserPhone object 생성 및 문자 전송

### /sm_phone_confirm
- Parameter 
  - vNumber - [String]인증번호
- Response
  - [String]session token
  - ex) 8NYStOLmkPLVdEi3SxoFRWOp1
- Description  
  - Verify_UserPhone object 중 해당 인증번호 확인
  - 해당 phone을 field에 가지고 있는 다른 user 삭제 
  - 새로운 user을 sign up 한 후 response sessionToken(클라이언트에서 이를 받아 session 설정)

### /fetch_contact
- Parameter
  - syncTime - [Number] 마지막 동기화 시간
- Response
  - [JSON] {[List<Contact>]Contact - 수정된 contact List, [Number]syncTime - 갱신된 최종 동기화 시간}
  - ex) {Contact : ,syncTime : } 
  - ex) {"contact":[{"ACL":{"3dHVZVA697":{"read":true,"write":true}},"__type":"Object","className":"Contact","contactName":null,"contactPhotoUri":null,"createdAt":"2015-08-18T04:33:54.203Z","createdBy":{"__type":"Pointer","className":"_User","objectId":"3dHVZVA697"},"friendUser":{"__type":"Pointer","className":"_User","objectId":"K8fjUZNgK7"},"objectId":"KRGvOr1yuV","phone":"+821041230128","recordId":156,"syncUpdatedAt":1439872434208,"updatedAt":"2015-08-18T04:33:54.203Z"}],"syncTime":1439872442576}
- Description 
  - 마지막 동기화 시간(syncUpdatedAt과 syncTime 비교)(처음일 경우 - 0) 이후에 수정/생성된 연락처를 response

### /inform_new_user
- Parameter
  - 없음
- Response
  - null
- Description 
  - 본 사용자의 연락처를 가지고 있는 타사용자의 친구 목록에 본 사용자를 추가 (타사용자의 contact object의 friendUser field에 추가)

## ERROR CODE

|Code|Description| 
| ------------- | ----------- |
| 1 |  invalid parameter   |
| 200 | invalid phone number |
| 201 | verification number is not matched |
| 203 | continuous attempts are not allowed. please try after a minute |

## Sequence

### 회원 가입

#### 1. 인증번호 받기 
- Action
  -  [/sm_phone_verify](#/sm_phone_verify)

#### 2. 인증번호 확인 
- Action
  - [/sm_phone_confirm](#/sm_phone_confirm) 
 
#### 3. 연락처 목록 업로드 
- Action
  - save (Contact.phone, Contact.recordId)

#### 4. 연락처 동기화 
- Action
  - [/fetch_contact](#/fetch_contact)

#### 5. 새로운 사용자 등록을 타 사용자에게 알림 /inform_new_user
- Action
  - [/inform_new_user](#/inform_new_user)
  
#### 6. 이름/프로필/회원가입 완료 설정
- Action
  - save (User.name, User.completed, User.profile)


### 동기화 

#### 1. 연락처 동기화
- Action
  - custom api [/fetch_contact](#/fetch_contact)
  - 앱 실행시 주기적(5분) 혹은 사용자가 수동으로(친구 관리 페이지에서) 요청



# Class



## _User
- ACL
  - class
    - X
  - object
    - public read / only createdBy write (without phone field) ( 구현 전 )
  - field
    - phone - only master write ( 구현 전 )
- before create 
  - comepleted - false
  - username - phone
  - (Friend.friendUser = this) userName,phone,profile 중 하나가 바뀐 경우 friend obejct의 syncUpdatedAt 수정 (friend class 설명 참조)
  - profile을 수정/등록 하는 경우 thumPorfile, height, width 생성 및 저장
- after delete
  -  (Friend.friendUser = this) friend object의 deleted = true
  -  (Contact.createdBy = this) contact object 모두 삭제
  -  (_Session.createdBy = this) session object 삭제

| field | type | description |
| ------------- | ------------- | ----------- |
| name | String |사용자 이름 |
| userName | String |사용자 identifier(임의 생성됨) |
| phone | String | 사용자의 전화번호 (휴대전화 인증 시 등록됨) |
| authData | | | 
| completed | boolean | 회원가입이 완료된 경우 true / 그렇지 않은 경우 false (client에서 signUp process 완료 후 설정) | 
| profile | ParseFile | 프로필 사진| 
| thumProfile | ParseFile | thumnail 프로필 사진(자동 생성) |
| height | Number | 프로필의 height(px) (자동 생성) |
| width | Number | 프로필의 width(px) (자동 생성) |


## Verify_UserPhone
- ACL
  - class
    - only Master read/write (ACL of class)
  - object
    - X 
  
| field | type | description |
| ------------- | ------------- | ----------- |
| createdBy | Pointer<_User>| installation objectId |
| vNumber | Number | 인증 번호 |
| phone | Number | 인증번호 요청 전화번호 |
| expirationTime | Number | 인증 처리 가능 시간 (new Date().getTime()) |
| createdTime | Number | 인증 요청 생성 시간 (재전송 요청 방지 위해 사용)  (new Date().getTime()) | 

## Contact 
- ACL
  - class
    - X
  - object 
    - only createdBy read/write (ACL of object)
- sync 
  - 데이터 수정되는 경우 -> syncUpdatedAt이 갱신
    - Client에서 contact create/update 요청 시 
    - Contact의 friendUser field가 수정될 때
      - contact create시 beforeSave에서 수정
      - 다른 사용자가 가입하여 inform_new_user api에 의해 수정
      - friendUser에 연결된 user가 삭제되는 경우
    - Contact의 friendUser에 연결된 User가 수정되는 경우
  - server로 부터 데이터 동기화 (갱신된 syncUpdatedAt object들에 한해서)
    - fetch_contact API
      - 서버로 부터 Client에 저장된 마지막 동기화 시간 이후의 syncUpdateAt의 데이터들을 불러와 동기화 
    - 호출 시점
      - 앱 실행 시 / 네트워크 상태 변경시 (최종 동기화 시간으로 부터 10분 이상;'' 지난 경우)
      - 설정 - 친구관리에서 수동 동기화 요청
  
- before create/update
  - createdBy - current user 설정
  - (_User.phone = this.phone) _User중 phone을 가진 object가 있다면 friendUser에 추가하고 syncUpdatedAt 갱신
  
- createdBy/Phone은 1가지 쌍만을 가져야한다. 
  - 특정 사용자가 연락처에 같은 전화번호를 2개 이상 갖을 수 있지만 parse에서는 이 중 1개만 저장한다. 
  
| field | type |description |
| ------------- | ----------- | ----------- |
| createdBy | Pointer<_User> | (default : current user) 생성 사용자 |
| phone | string | 전화번호 |
| friendUser | Pointer<_User> | 해당 phone을 가지고 있는 사용자(contact의 before_save / inform_new_user api 에 의해 생성) |
| recordId | Number | 클라이언트에 저장된 contact ID (안드로이드 - RAW_CONTACT_ID) |
| syncUpdatedAt | Number | (default : 0) 동기화시 이용하는 마지막 데이터 수정 시간(서버에서 자동 generation) (1970년 1월 1일 0시 0분 0초로부터의 시간 millisecond / new Date().getTime) | 

## Group
- ACL
  - class
    - X
  - object
    - userList - read  / only createdBy - write ( 구현 전 )
- sync 방식
  - syncUpdatedAt이 수정 되는 경우 
    - Client에서 create/update 요청 시 syncUpdatedAt 설정
    - contact의 friendUser가 수정될 때 syncUpdatedAt 설정
    - friendUser와 연결된 _User가 수정/삭제될 시 syncUpdatedAt 설정
  - Client에서 서버와 동기화 요청 (/fetch_contact)
    - 서버로 부터 Client에 저장된 마지막 동기화 시간 이후의 syncUpdateAt의 데이터들을 불러와 동기화 

| field | type |description |
| ------------- | ----------- | ----------- |
| createdBy | Pointer<_User> | (default : current user) 생성 사용자 |
| name | String | 그룹 이름 (그룹 생성자만 수정 가능) |
| userList | Array <Pointer<_User>> | 사용자 리스트 |
| phoneList | Array<String> | 그룹에 초대된 휴대번호 목록 |
| mainPicture | Pointer<Picture> | 대문 사진 |
| syncUpdatedAt| Number | (default : 0) 동기화시 이용하는 마지막 데이터 수정 시간(서버에서 자동 generation) (1970년 1월 1일 0시 0분 0초로부터의 시간 millisecond / new Date().getTime) |


## Picture
- ACL
  - class
    - X
  - object
    - userList, userList of groupList read / public write ( 구현 전 )
  - field
    - groupList - userList of groupList write ( 구현 전 )   
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
| userList | the array of friend objectId | 
| image | file of a picture | 
| thumImage | thumnail  file (nX128px) |
| hasPhoto | true if this object should have a picture |
| photoSynched | true if image filed has a picture file |
| savedBy | the array of users who save the image |



  
