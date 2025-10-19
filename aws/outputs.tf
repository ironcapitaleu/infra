output "cloudfront_distribution_id" {
  description = "The ID of the CloudFront distribution"
  value       = module.cloudfront-spa.cloudfront_distribution_id
}

output "cloudfront_domain_name" {
  description = "The domain name of the CloudFront distribution"
  value       = module.cloudfront-spa.cloudfront_domain_name
}

output "cloudfront_url" {
  description = "The full HTTPS URL of the CloudFront distribution"
  value       = module.cloudfront-spa.cloudfront_url
}

output "cloudfront_origin_bucket_name" {
  description = "The name of the S3 bucket used as CloudFront origin for hosting the SPA content"
  value       = module.cloudfront-spa.cloudfront_origin_bucket_name
}
