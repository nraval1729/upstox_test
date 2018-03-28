const express = require('express');
const app = express();

// To parse incoming post requests
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const repository = require('./repository');
repository.connect();

// Add a customer
app.post("/customer", (req, res, next) => {
	const customerEmail = req.body.email;
	const isAmbassador = false;
	const referralId = null;
	repository.addCustomer(customerEmail, isAmbassador, referralId)
	.then(id => res.send("Customer created with id: "+id))
	.catch(err => next(err));
})

// Add an ambassador
app.post("/ambassador", (req, res, next) => {
	const customerEmail = req.body.email;
	const isAmbassador = true;
	const referralId = null;
	repository.addCustomer(customerEmail, isAmbassador, referralId)
	.then(id => res.send("Ambassador created with id: "+id))
	.catch(err => next(err));
})

// Add a referral customer under a customer
app.post("/referral", (req, res, next) => {
	const parentId = parseInt(req.body.parentId);
	const childEmail = req.body.childEmail;
	const isAmbassador = false;

	repository.addCustomer(childEmail, isAmbassador, parentId)
	.then(repository.updateParentPayback(parentId))
	.then(repository.updateAmbassadorPayback(parentId))
	.then(res.send("Successfully added referral"))
	.catch(err => next(err))
})

// Convert a customer to ambassador
app.post("/customer-to-ambassador", (req, res, next) => {
	const customerId = parseInt(req.body.customerId);
	repository.convertCustomerToAmbassador(customerId)
	.then(res.send("Customer with id " +customerId +" is now an ambassador"))
	.catch(err => next(err));
})

// Get customer with customer_id = id
app.get("/customers/:id", (req, res, next) => {
	const customerId = parseInt(req.params.id);
	repository.getCustomerById(customerId)
	.then(customer => res.send(customer))
	.catch(err => next(err));
})

// Get all children of customer with customer_id = id
app.get("/customers/:id/children", (req, res) => {
	const customerId = parseInt(req.params.id);
	repository.fetchAllChildren(customerId)
	.then(children => res.send(children))
	.catch(err => next(err));
})

// Get all customers with descending referral counts
app.get("/referrals", (req, res) => {
	repository.fetchAllCustomersWithReferralCount()
	.then(customers => res.send(customers))
	.catch(err => next(err));
})

// Get all children of ambassador with customer_id = id
app.get("/ambassadors/:id/children", (req, res) => {
	const customerId = parseInt(req.params.id);
	repository.fetchAllAmbassadorChildren(customerId)
	.then(children => res.send(children))
	.catch(err => next(err));
})

// Get all children of ambassador with customer_id = id at level = level
app.get("/ambassadors/:id/children/:level", (req, res) => {
	const customerId = parseInt(req.params.id);
	const level = parseInt(req.params.level);
	repository.fetchChildrenAtNthLevel(customerId, level)
	.then(children => res.send(children))
	.catch(err => next(err));
})

app.get("*", (req, res, next) => {
	next(new Error("No such path found!"));
})

app.post("*", (req, res, next) => {
	next(new Error("No such path found!"));
})

// Error handler
app.use((error, req, res, next) => {
	res.json({ErrorMessage:error.message});
})

app.listen(8080, () => console.log("Server is ready for handling requests!"));

