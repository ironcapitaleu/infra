output "rest_api_id" {
  description = "API Gateway REST API ID"
  value       = aws_api_gateway_rest_api.api_endpoint.id
}

output "api_gateway_id" {
  description = "Base invoke URL for the API Gateway"
  value       = aws_api_gateway_rest_api.api_endpoint.id
}

output "stage_name" {
  description = "API Gateway stage name"
  value       = aws_api_gateway_stage.stage.stage_name
}

output "cloudfront_url" {
  description = "CloudFront domain name exposing the API"
  value       = aws_cloudfront_distribution.api_distribution.domain_name
}