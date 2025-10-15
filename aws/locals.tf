locals {
  environment = var.environment

  s3_buckets {
    cloudfront_origin = "arkad-frontend-cloudfront-origin-${local.environment}"
    cloudfront_logs   = "arkad-frontend-cloudfront-logs-${local.environment}"
    access_logs       = "arkad-frontend-access-logs-${local.environment}"
  }
}
