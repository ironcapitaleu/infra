resource "aws_api_gateway_rest_api" "simple_api" {
  name        = var.api_gateway.name
  description = "API Gateway for ${var.api_gateway.name}"
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.simple_api.id

  lifecycle {
    create_before_destroy = true
  }

  triggers = {
    redeployment = timestamp()
  }
}

resource "aws_api_gateway_stage" "stage" {
  rest_api_id   = aws_api_gateway_rest_api.simple_api.id
  deployment_id = aws_api_gateway_deployment.deployment.id
  stage_name    = var.api_gateway.stage_name
}
