resource "aws_api_gateway_rest_api" "api_endpoint" {
  name        = var.api_gateway.name
  description = "API Gateway for ${var.api_gateway.name}"
  endpoint_configuration {
    types = ["REGIONAL"]
  }

  lifecycle {
    create_before_destroy = true
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
  #checkov:skip=CKV_AWS_73:No need for XRay Tracing in simple Proxy API Gateway Stage.
  #checkov:skip=CKV_AWS_120:No need for caching since requests are expected to be dynamic.
  #checkov:skip=CKV2_AWS_4:Disable execution logging for simple Proxy API Gateway Stage for now.
  #checkov:skip=CKV2_AWS_29:Any WAF should be applied at CloudFront level which is in front of API Gateway.
  #checkov:skip=CKV2_AWS_51:No need for client certificate validation, standard authentication mechanisms should be sufficient.

  rest_api_id   = aws_api_gateway_rest_api.api_endpoint.id
  deployment_id = aws_api_gateway_deployment.deployment.id
  stage_name    = var.api_gateway.stage_name

}