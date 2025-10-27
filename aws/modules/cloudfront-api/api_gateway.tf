resource "aws_api_gateway_rest_api" "api_endpoint" {
  name        = var.api_gateway.name
  description = "API Gateway for ${var.api_gateway.name}"
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.api_endpoint.id

  depends_on = [
    aws_api_gateway_resource.chatbot_resource,
    aws_api_gateway_method.get_chatbot,
    aws_api_gateway_integration.chatbot_lambda,
    aws_api_gateway_resource.confidence_tool_resource,
    aws_api_gateway_method.get_confidence_tool,
    aws_api_gateway_integration.confidence_tool_lambda,
  ]

  lifecycle {
    create_before_destroy = true
  }

  triggers = {
    redeployment = timestamp()
  }
}

resource "aws_api_gateway_stage" "stage" {
  rest_api_id   = aws_api_gateway_rest_api.api_endpoint.id
  deployment_id = aws_api_gateway_deployment.deployment.id
  stage_name    = var.api_gateway.stage_name
}
