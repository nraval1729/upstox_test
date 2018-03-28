const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const MLAB_URL = 'mongodb://nisarg:nisarg@ds121299.mlab.com:21299/nraval1729test'
const dbName = 'nraval1729test';
const PARENT_PAYBACK = 30;
const AMBASSADOR_PAYBACK = 10; 

// To generate unique integer customer id
const uniqueRandom = require('unique-random');
const customerId = uniqueRandom(1, Number.MAX_SAFE_INTEGER);

let db;
let dbClient;
let dbCollection;

// Use connect method to connect to the server
const connect = () => {
	console.log("Establishing database conection")
	MongoClient.connect(MLAB_URL, (err, db) =>  {
		assert.equal(null, err);
	  console.log("Database connection established");

	  db = db;
	  dbCollection = db.collection('test_customers');
		});
}

const addCustomer = (email, isAmbassador, referralId) => {
	// Create new customer object to be added
	const currDate = new Date();
	const id = customerId();
	customer = {
		"customer_id": id,
		"email": email,
		"referral_id": referralId,
		"payback": 0,
		"isAmbassador": isAmbassador,
		"joiningDate": currDate,
		"lastUpdated": currDate
	};

	return new Promise((resolve, reject) => {
		dbCollection.insertOne(customer, (err, result) => {
			if(err !== null) reject(new Error(err));
			resolve(id);
		})
	});
}

const getCustomerById = (id) => {
	return new Promise((resolve, reject) => {
		dbCollection.find({"customer_id":id}).toArray((err, customer) => {
			if(err !== null) reject(new Error(err));
			resolve(customer);
		});
	});
}

const fetchAllChildren = (id) => {
	return new Promise((resolve, reject) => {
		dbCollection.find({"referral_id":id}).toArray((err, children) => {
			if(err !== null) reject(new Error(err));
			resolve(children);
		});
	});
}

const fetchAllCustomersWithReferralCount = () => {
	return new Promise((resolve, reject) => {
		dbCollection.aggregate([
			{'$group': {_id:"$referral_id", referrals:{$sum:1}}},
			{'$sort': {referrals:-1}}
			], (err, results) => {
				if(err !== null) reject(new Error(err));
				resolve(results.filter(result => result._id !== null));
			});
	});
}

const convertCustomerToAmbassador = (id) => {
	return new Promise((resolve, reject) => {
		dbCollection.updateOne(
				{"customer_id": id},
				{"$set": {"isAmbassador":true, "lastUpdated":new Date()}},
				(err, result) => {
					if(err !== null) reject(new Error(err));
					resolve(result);
				}
			)
	});
}

const updateParentPayback = (parentId) => {
	return new Promise((resolve, reject) => {
		dbCollection.updateOne(
			{"customer_id":parentId},
			{
				"$set":{"lastUpdated":new Date()},
				"$inc":{"payback":PARENT_PAYBACK}
			},
			(err, result) => {
				if(err !== null) reject(new Error(err));
				resolve(result)
			}
			);
	});
}

const updateAmbassadorPayback = (id) => {
	return new Promise((resolve, reject) => {

		fetchAmbassadorsOf(id)
		.then(ambassadorIds => {
			if(ambassadorIds.len == 0) resolve(ambassadorIds)

			dbCollection.updateMany(
				{"customer_id": {"$in":ambassadorIds}},
				{
					"$set":{"lastUpdated":new Date()},
					"$inc": {"payback":AMBASSADOR_PAYBACK}
				},
				(err, result) => {
					if(err !== null) reject(new Error(err));
					resolve(result);
				}
				);
		});
	});
}

const fetchAmbassadorsOf = (id) => {
	return new Promise((resolve, reject) => {
		dbCollection.aggregate([
			{'$match': {"customer_id":id}},
			{
				'$graphLookup': {
					from: "test_customers",
					startWith: "$referral_id",
					connectFromField: "referral_id",
					connectToField: "customer_id",
					as: "ancestors"
				}
			}
			], (err, results) => {
				if(err !== null) reject(new Error(err));

				if (results[0].ancestors.length > 0) {
					parentAmbassadors = results[0].ancestors
					.filter(ancestor => ancestor.isAmbassador)
					.map(ambassador => ambassador.customer_id);
					resolve(parentAmbassadors);
				} else {
					resolve([]);
				}
			});
	});
}

const fetchAllAmbassadorChildren = (id) => {
	return new Promise((resolve, reject) => {
		dbCollection.aggregate([
			{'$match': {"customer_id": id}},
			{
				'$graphLookup': { 
				from: "test_customers",
				startWith: "$customer_id",
				connectFromField: "customer_id",
				connectToField: "referral_id",
				as: "children"
				}
			}
			], (err, results) => {
				if(err !== null) reject(new Error(err));
				resolve(results[0].children);
			});
	});
}

const fetchChildrenAtNthLevel = (id, level) => {
	return new Promise((resolve, reject) => {
		dbCollection.aggregate([
			{'$match': {"customer_id": id}},
			{
				'$graphLookup': { 
					from: "test_customers",
					startWith: "$customer_id",
					connectFromField: "customer_id",
					connectToField: "referral_id",
					as: "children",
					depthField:"level"
				}
			}
			], (err, results) => {
				if(err !== null) reject(new Error(err));

				// Filter out non level children
				// Note levels are 0 indexed, hence level-1
				const childrenAtNthLevel = results[0].children.filter(child => child.level == level-1)
				resolve(childrenAtNthLevel);
			});
	});
}

const disconnect = () => {
	console.log("Disconnecting from database...");
	db.close();
	console.log("Successfully disconnected.");
}

exports.connect = connect;
exports.addCustomer = addCustomer;
exports.getCustomerById = getCustomerById;
exports.fetchAllChildren = fetchAllChildren;
exports.convertCustomerToAmbassador = convertCustomerToAmbassador;
exports.updateParentPayback = updateParentPayback;
exports.updateAmbassadorPayback = updateAmbassadorPayback;
exports.fetchAllAmbassadorChildren = fetchAllAmbassadorChildren;
exports.fetchChildrenAtNthLevel = fetchChildrenAtNthLevel;
exports.fetchAllCustomersWithReferralCount = fetchAllCustomersWithReferralCount;
exports.disconnect = disconnect;

