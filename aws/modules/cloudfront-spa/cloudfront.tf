# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                    CLOUDFRONT ORIGIN ACCESS CONTROL                          ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = var.cloudfront_distribution.oac_name
  description                       = "OAC for CloudFront to S3"
  origin_access_control_origin_type = "s3"
  signing_protocol                  = "sigv4"
  signing_behavior                  = "always"
}

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                          CLOUDFRONT DISTRIBUTION                             ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

resource "aws_cloudfront_distribution" "main" {
  #checkov:skip=CKV_AWS_68:No need for WAF in this setup
  #checkov:skip=CKV_AWS_310:No need for origin failover fow now, single origin is sufficient
  #checkov:skip=CKV_AWS_374:No need for Geo restriction
  #checkov:skip=CKV2_AWS_32:No need for response headers policy in this setup
  #checkov:skip=CKV2_AWS_42:No need for custom SSL certificate, using default CloudFront certificate is sufficient
  #checkov:skip=CKV2_AWS_47:No need for WAF in this setup

  comment             = "CloudFront distribution for hosting an SPA frontend"
  default_root_object = "index.html"
  enabled             = true

  origin {
    domain_name              = aws_s3_bucket.cloudfront_origin.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
    origin_id                = var.cloudfront_distribution.origin_id
  }

  default_cache_behavior {
    target_origin_id       = var.cloudfront_distribution.origin_id
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed CachingOptimized

    allowed_methods = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods  = ["GET", "HEAD"]
    compress        = true
  }

  # Client-side SPA routing
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  viewer_certificate {
    cloudfront_default_certificate = true
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # logging_config {
  #   include_cookies = false
  #   bucket          = aws_s3_bucket.cloudfront_logs.bucket_domain_name
  #   prefix          = "cloudfront-logs/"
  # }
}
