# -------------------------
# API Gateway (Mock /chatbot)
# -------------------------

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

# Proxy integration with Lambda
resource "aws_api_gateway_integration" "chatbot_lambda" {
  rest_api_id             = aws_api_gateway_rest_api.simple_api.id
  resource_id             = aws_api_gateway_resource.chatbot_resource.id
  http_method             = aws_api_gateway_method.get_chatbot.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.chatbot.invoke_arn
}


