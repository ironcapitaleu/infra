# Origin Access Control for S3
resource "aws_cloudfront_origin_access_control" "main" {
  name                              = "cloudfront-oac"
  description                       = "Origin Access Control for CloudFront"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "main" {
  #checkov:skip=CKV2_AWS_47:No need for WAF in this setup as it will be handled somewhere else
  #checkov:skip=CKV_AWS_68:No need for WAF in this setup as it will be handled somewhere else
  #checkov:skip=CKV2_AWS_32:No need for response headers policy in this setup since CloudFront will be replaced in the future
  #checkov:skip=CKV2_AWS_42:No need for custom SSL certificate, using default CloudFront certificate is sufficient for now
  #checkov:skip=CKV_AWS_174:No need for enforcing TLS version, default is sufficient for now
  #checkov:skip=CKV_AWS_310:No need for origin failover fow now, single origin is sufficient
  origin {
    domain_name              = aws_s3_bucket.cloudfront_origin.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.main.id
    origin_id                = "S3-${aws_s3_bucket.cloudfront_origin.id}"
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CloudFront distribution for static content"
  default_root_object = "index.html"

  # Configure logging (optional)
  logging_config {
    include_cookies = false
    bucket          = aws_s3_bucket.cloudfront_logs.bucket_domain_name
    prefix          = "cloudfront-logs/"
  }

  # Aliases (custom domains) - uncomment and configure if needed
  # aliases = ["example.com", "www.example.com"]

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.cloudfront_origin.id}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # Additional cache behaviors for API paths (optional)
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.cloudfront_origin.id}"

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Content-Type"]

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "https-only"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
  }

  price_class = "PriceClass_100" # Use only North America and Europe edge locations

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations        = ["CH", "DE"]
    }
  }

  tags = {
    Name        = "CloudFront Distribution"
    Environment = "dev"
  }

  viewer_certificate {
    cloudfront_default_certificate = true
    # Use the following for custom SSL certificate:
    # acm_certificate_arn      = aws_acm_certificate.main.arn
    # ssl_support_method       = "sni-only"
    # minimum_protocol_version = "TLSv1.2_2021"
  }

  # Custom error responses
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
}

# S3 bucket policy to allow CloudFront access
resource "aws_s3_bucket_policy" "cloudfront_origin" {
  bucket = aws_s3_bucket.cloudfront_origin.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.cloudfront_origin.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.main.arn
          }
        }
      }
    ]
  })
}

# Variables
variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
  validation {
    condition = contains([
      "PriceClass_All",
      "PriceClass_200",
      "PriceClass_100"
    ], var.cloudfront_price_class)
    error_message = "Price class must be PriceClass_All, PriceClass_200, or PriceClass_100."
  }
}
