# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                         CLOUDFRONT DISTRIBUTION                              ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# CloudFront Distribution Domain Name
output "cloudfront_domain_name" {
  description = "The domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.domain_name
}

# CloudFront Distribution URL
output "cloudfront_url" {
  description = "The full HTTPS URL of the CloudFront distribution"
  value       = "https://${aws_cloudfront_distribution.main.domain_name}"
}

# CloudFront Distribution ID
output "cloudfront_distribution_id" {
  description = "The ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.id
}

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                               S3 BUCKETS                                     ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# S3 Bucket Name 
output "cloudfront_origin_bucket_name" {
  description = "The name of the S3 bucket used as CloudFront origin for hosting the SPA content"
  value       = aws_s3_bucket.cloudfront_origin.bucket
}

# TODO: Remove before merging
output "spa_files_found" {
  value = fileset("${path.module}/dist", "**")
}