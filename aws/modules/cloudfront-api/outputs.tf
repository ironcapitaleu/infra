output "rest_api_id" {
  description = "API Gateway REST API ID"
  value       = aws_api_gateway_rest_api.simple_api.id
}

output "api_invoke_url" {
  description = "Direct API Gateway invoke URL for GET /hello"
  value       = "https://${aws_api_gateway_rest_api.simple_api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/v1/hello"
}

output "cloudfront_url" {
  description = "CloudFront domain name exposing the API"
  value       = aws_cloudfront_distribution.api_distribution.domain_name
}