import json
import os


def lambda_handler(event, context):
    """
    AWS Lambda handler for the '/confidence-tool' API Gateway endpoint.

    Returns a simple JSON response for confidence tool testing.
    """
    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": os.environ.get('SPA_DOMAIN', '*')},
        "body": json.dumps({"message": "Hello from the Confidence Tool Lambda!"}),
    }
