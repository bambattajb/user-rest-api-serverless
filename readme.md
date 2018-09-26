# A simple User REST-API
### Uses ServerLess framework.

#### Intro
This is my dive into Serverless Framework. It is a 
REST-API that creates, updates and  authenticates 
users. 

#### Dependencies
* serverless `npm install -g serverless`
* dotenv `npm install dotenv`
* mongoose `npm install mongoose`
* bcrypt `npm install bcrypt`
* email-validator `npm install email-validator`

#### Config
`dotenv` looks for file `variables.env` in root of 
the project folder. 

In there you set `DB=` with your 
MongoDB location.

#### Start
To start the serverless offline service for testing

`sls offline --skipCacheInvalidation`

Everything else to do with Serverless framework is 
[here](https://serverless.com/framework/docs/).

#### Routes
`/user/create`

Create a user

````
// POST
{
    username: [string],     // required
    email : [string],       // required
    password : [string],    // required
    active : [bool] (sets the active flag) // required   
}
````
Returns `user object`

---

`/user/update`

Update a user using more than one field at once

````
// POST 
{
     _id : [string]     // required
     username: [string],
     email : [string],
     password : [string],
     active : [bool] (sets the active flag)      
}
````

Returns `user object` with updated data

---

`/user/update/{field}`

Update a users specific field

````
// POST
{
     _id : [string],     // required
     // Any of the keys listed above. ie...
     email : [string]    
}
````

Returns `user object` with updated data

NOTE: this method is restricted to only one single field.
It's useful for updating emails and passwords.

---

`/user/authenticate`

Checks if the user credentials are correct

````
\\ POST
{
    login: [string] // required (email or username)
    password: [string] // required
}
````

Returns `user object` with `lastLogin` date recorded if
credentials authenticate

---

`/user/retrieve/{id}`

Retrieves a `user object` by `_id`

Returns `user object`
