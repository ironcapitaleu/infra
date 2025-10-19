locals {
  environment = var.environment

  spa_deployment = {
    s3_buckets = {
      cloudfront_origin = "arkad-frontend-cloudfront-origin-${local.environment}"
      cloudfront_logs   = "arkad-frontend-cloudfront-logs-${local.environment}"
      access_logs       = "arkad-frontend-access-logs-${local.environment}"
    }

    cloudfront_distribution = {
      origin_id = "arkad-frontend-cloudfront-origin"
      oac_name  = "arkad-frontend-cloudfront-origin-oac"
    }

    frontend = {
      path = "${path.root}/frontend"
    }
  }
}
