resource "aws_api_gateway_rest_api" "simple_api" {
  name        = var.api_gateway.name
  description = "API Gateway for ${var.api_gateway.name}"
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}
