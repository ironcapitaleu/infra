# -------------------------
# API Gateway (Lambda Proxy /confidence-tool)
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

resource "aws_api_gateway_integration" "confidence_tool_lambda" {
  rest_api_id             = aws_api_gateway_rest_api.simple_api.id
  resource_id             = aws_api_gateway_resource.confidence_tool_resource.id
  http_method             = aws_api_gateway_method.get_confidence_tool.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.confidence_tool.invoke_arn
}
