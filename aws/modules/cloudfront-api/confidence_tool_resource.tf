# -------------------------
# API Gateway (Mock /confidence-tool)
# -------------------------

resource "aws_api_gateway_resource" "confidence_tool_resource" {
  rest_api_id = aws_api_gateway_rest_api.simple_api.id
  parent_id   = aws_api_gateway_rest_api.simple_api.root_resource_id
  path_part   = "confidence-tool"
}

resource "aws_api_gateway_method" "get_confidence_tool" {
  rest_api_id      = aws_api_gateway_rest_api.simple_api.id
  resource_id      = aws_api_gateway_resource.confidence_tool_resource.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_integration" "confidence_tool_mock_integration" {
  rest_api_id          = aws_api_gateway_rest_api.simple_api.id
  resource_id          = aws_api_gateway_resource.confidence_tool_resource.id
  http_method          = aws_api_gateway_method.get_confidence_tool.http_method
  type                 = "MOCK"
  passthrough_behavior = "WHEN_NO_MATCH"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "confidence_tool_mock_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.simple_api.id
  resource_id = aws_api_gateway_resource.confidence_tool_resource.id
  http_method = aws_api_gateway_method.get_confidence_tool.http_method
  status_code = "200"

  response_templates = {
    "application/json" = "{\"message\": \"Hello from the Confidence Tool!\"}"
  }

  # Return CORS header for all responses
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.mock_integration]
}

resource "aws_api_gateway_method_response" "get_confidence_tool_response" {
  rest_api_id = aws_api_gateway_rest_api.simple_api.id
  resource_id = aws_api_gateway_resource.confidence_tool_resource.id
  http_method = aws_api_gateway_method.get_confidence_tool.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}
