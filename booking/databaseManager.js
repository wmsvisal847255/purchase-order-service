'use strict';

const TABLE_NAME = process.env.TABLE_NAME;
const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();

module.exports.initializateDynamoClient = newDynamo => {
	dynamo = newDynamo;
};

module.exports.saveOrder = order => {
	const params = {
		TableName: TABLE_NAME,
		Item: order
	};

	return dynamo
		.put(params)
		.promise()
		.then(() => {
			return order.orderId;
		});
};

module.exports.getOrder = orderId => {
	const params = {
		Key: {
			orderId: orderId
		},
		TableName: TABLE_NAME
	};

	return dynamo
		.get(params)
		.promise()
		.then(result => {
			return result.Item;
		});
};

module.exports.cancelOrder = orderId => {
	const params = {
		Key: {
			orderId: orderId
		},
		TableName: TABLE_NAME
	};

	return dynamo.delete(params).promise();
};

module.exports.updateOrder = (orderId, paramsName, paramsValue) => {
	const params = {
		TableName: TABLE_NAME,
		Key: {
			orderId
		},
		ConditionExpression: 'attribute_exists(orderId)',
		UpdateExpression: 'set ' + paramsName + ' = :v',
		ExpressionAttributeValues: {
			':v': paramsValue
		},
		ReturnValues: 'ALL_NEW'
	};

	return dynamo
		.update(params)
		.promise()
		.then(response => {
			return response.Attributes;
		});
};
