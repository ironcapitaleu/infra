output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.arn
}

output "cloudfront_hosted_zone_id" {
  description = "CloudFront hosted zone ID for Route53 alias records"
  value       = aws_cloudfront_distribution.main.hosted_zone_id
}

output "s3_bucket_name" {
  description = "Name of the S3 origin bucket"
  value       = aws_s3_bucket.cloudfront_origin.id
}

output "s3_bucket_domain_name" {
  description = "Domain name of the S3 origin bucket"
  value       = aws_s3_bucket.cloudfront_origin.bucket_regional_domain_name
}
