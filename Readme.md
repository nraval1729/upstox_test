	
**Running the application**
`git clone`
`cd upstox_test`
`npm install`
`node index.js`

----------


**API documentation**
----------

 1. **/customer** - Add a new customer
- *Endpoint*: `/customer`
- *Type*: `POST`
- *Request body*: `{"email":"example@example.com"}`, where `email` is the customer's email.
- *Response body*: `{"Customer created with id: <customer_id>"}`

2) **/customers/:id** - Fetch a customer by id
- *Endpoint*: `/customers/:id`, where id is a customer's `customer_id`
- *Type*: `GET`
- *Request body*: `null`, there is no request body for this GET request
- *Response body*: A customer JSON object, like so
						 ` {
						    "_id": "5ab8ee53809586ac52cdc1d5",
						    "customer_id": 8,
						    "email": "h@h.com",
						    "referral_id": null,
						    "payback": 40,
						    "isAmbassador": true,
						    "joiningDate" : ISODate("2018-03-28T07:56:44.571Z"),
						    "lastUpdated": "2018-03-28T07:50:05.050Z"
						  }`

3) **/referral** - Add a referral under a customer
- *Endpoint*: `/referral`
- *Type*: `POST`
- *Request Body*: `{"parentId":13, "childEmail":"test@test.com"}`, where `parentId` is the `customer_id` of the *referring* customer, and `child_email` is the `email` of the *referred* customer.
- *Response body*: `{"Successfully added referral"}`

4) **/customers/:id/children** - Fetch all children of a customer
- *Endpoint*: `/customers/:id/children`
- *Type*: `GET`
- *Request body*: `null`, there is no request body for this GET request.
- *Response body*: A list of customer objects, like so `[
  {
    "_id": "5ab8d9be734d1d57bac5846a",
    "customer_id": 6,
    "email": "f@f.com",
    "referral_id": 3,
    "payback": 0,
    "isAmbassador": false
  },
  {
    "_id": "5ab8dcd5734d1d57bac58668",
    "customer_id": 7,
    "email": "g@g.com",
    "referral_id": 3,
    "payback": 0,
    "isAmbassador": false
  }
]`

5) **/referrals** - Fetch all customers with their referral counts in descending order
- *Endpoint*: `/referrals`
- *Type*: `GET`
- *Request body*: `null`, there is no request body for this GET request
- *Response body*: A list of `customer_id`s and corresponding `referrals` sorted in descending order, like so: `[
  {
    "_id": 10,
    "referrals": 3
  },
  {
    "_id": 1,
    "referrals": 3
  },
  {
    "_id": 11,
    "referrals": 2
  },
  {
    "_id": 8,
    "referrals": 2
  },
  {
    "_id": 3,
    "referrals": 2
  },
  {
    "_id": 13,
    "referrals": 1
  },
  {
    "_id": 2,
    "referrals": 1
  }
]`


6) **/ambassador** - Add an ambassador
- *Endpoint*: `/ambassador`
- *Type*: `POST`
- *Request body*: `{"email":"example@example.com"}`, where `email` is the ambassador's email.
- *Response body*: `{"Ambassador created with id: <customer_id>"}`

7)  **/customer-to-ambassador** - Convert a customer to an ambassador
- *Endpoint*: `/customer-to-ambassador`
- *Type*: `POST`
- *Request body*: `{"customerId":1}`, where `customerId` is the customer's `customer_id`.
- *Response body*: `{"Customer with id <customerId> is now an ambassador"}`

8) **/ambassadors/:id/children** - Fetch all children of an ambassador
- *Endpoint*: `/ambassadors/:id/children`where `id` is the ambassador's `customer_id`.
- *Type*: `GET`
- *Request body*: `null`, there is no request body for this GET request.
- *Response body*: A list of customer objects, like so `[
  {
    "_id": "5ab8d9be734d1d57bac5846a",
    "customer_id": 6,
    "email": "f@f.com",
    "referral_id": 3,
    "payback": 0,
    "isAmbassador": false
  },
  {
    "_id": "5ab8dcd5734d1d57bac58668",
    "customer_id": 7,
    "email": "g@g.com",
    "referral_id": 3,
    "payback": 0,
    "isAmbassador": false
  }
]`

9)  **/ambassadors/:id/children/:level** - Fetch all children of an ambassador at a given level
- *Endpoint*: `/ambassadors/:id/children/:level`, where `id` is the ambassador's `customer_id` and `level` is the level for which the children are requested.
- *Type*: `GET`
- *Request body*: `null`, there is no request body for this GET request.
- *Response body*: A list of customer objects, like so `[
  {
    "_id": "5ab8d9be734d1d57bac5846a",
    "customer_id": 6,
    "email": "f@f.com",
    "referral_id": 3,
    "payback": 0,
    "isAmbassador": false
  },
  {
    "_id": "5ab8dcd5734d1d57bac58668",
    "customer_id": 7,
    "email": "g@g.com",
    "referral_id": 3,
    "payback": 0,
    "isAmbassador": false
  }
]`
