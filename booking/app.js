const databaseManager = require('./databaseManager');

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

exports.productPurchaseHandler = async (event, context) => {
	console.log(event);

	switch (event.httpMethod) {
		case 'DELETE':
			return cancelOrder(event);
		case 'GET':
			return getOrder(event);
		case 'POST':
			return saveOrder(event, context);
		case 'PUT':
			return updateOrder(event);
		default:
			return sendResponse(404, `Unsupported method "${event.httpMethod}"`);
	}
};

function saveOrder(event, context) {
	const order = JSON.parse(event.body);
	order.orderId = context.awsRequestId;
	order.customerId = event.requestContext.authorizer.claims.sub;
	order.paymentStatus = "Pending";

	return databaseManager.saveOrder(order).then(response => {
		console.log(response);
		return sendResponse(200, order.orderId);
	});
}

function getOrder(event) {
	const orderId = event.pathParameters.orderId;

	return databaseManager.getOrder(orderId).then(response => {
		console.log(response);
		return sendResponse(200, JSON.stringify(response));
	});
}

function cancelOrder(event) {
	const orderId = event.pathParameters.orderId;

	return databaseManager.cancelOrder(orderId).then(response => {
		return sendResponse(200, 'DELETE ORDER');
	});
}

function updateOrder(event) {
	const orderId = event.pathParameters.orderId;

	const body = JSON.parse(event.body);
	const paramName = body.paramName;
	const paramValue = body.paramValue;

	return databaseManager.updateOrder(orderId, paramName, paramValue).then(response => {
		console.log(response);
		return sendResponse(200, JSON.stringify(response));
	});
}

function sendResponse(statusCode, message) {
	const response = {
		statusCode: statusCode,
		body: JSON.stringify(message)
	};
	return response
}
