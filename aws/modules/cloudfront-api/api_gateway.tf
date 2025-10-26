# -------------------------
# API Gateway (Mock /chatbot)
# -------------------------

resource "aws_api_gateway_rest_api" "simple_api" {
  name        = var.api_gateway.name
  description = "API Gateway for ${var.api_gateway.name}"
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_resource" "chatbot_resource" {
  rest_api_id = aws_api_gateway_rest_api.simple_api.id
  parent_id   = aws_api_gateway_rest_api.simple_api.root_resource_id
  path_part   = "chatbot"
}

resource "aws_api_gateway_method" "get_chatbot" {
  rest_api_id      = aws_api_gateway_rest_api.simple_api.id
  resource_id      = aws_api_gateway_resource.chatbot_resource.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_integration" "mock_integration" {
  rest_api_id          = aws_api_gateway_rest_api.simple_api.id
  resource_id          = aws_api_gateway_resource.chatbot_resource.id
  http_method          = aws_api_gateway_method.get_chatbot.http_method
  type                 = "MOCK"
  passthrough_behavior = "WHEN_NO_MATCH"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "mock_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.simple_api.id
  resource_id = aws_api_gateway_resource.chatbot_resource.id
  http_method = aws_api_gateway_method.get_chatbot.http_method
  status_code = "200"

  response_templates = {
    "application/json" = "{\"message\": \"Hello from the Chatbot!\"}"
  }

  # Return CORS header for all responses
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.mock_integration]
}

resource "aws_api_gateway_method_response" "get_chatbot_response" {
  rest_api_id = aws_api_gateway_rest_api.simple_api.id
  resource_id = aws_api_gateway_resource.chatbot_resource.id
  http_method = aws_api_gateway_method.get_chatbot.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.simple_api.id

  # Ensure deployment is recreated when integration response changes
  depends_on = [aws_api_gateway_integration_response.mock_integration_response]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "stage" {
  rest_api_id   = aws_api_gateway_rest_api.simple_api.id
  deployment_id = aws_api_gateway_deployment.deployment.id
  stage_name    = var.api_gateway.stage_name
}
