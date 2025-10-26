resource "aws_cloudfront_distribution" "api_distribution" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "CloudFront distribution for API Gateway"

  origin {
    domain_name = "${aws_api_gateway_rest_api.simple_api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com"
    origin_id   = var.cloudfront_distribution.origin_id
    origin_path = "/${var.api_gateway.stage_name}"
    
    custom_origin_config {
      origin_protocol_policy = "https-only"
      http_port              = 80
      https_port             = 443
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = var.cloudfront_distribution.origin_id
    viewer_protocol_policy = "redirect-to-https"

    cache_policy_id            = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # CachingDisabled
    origin_request_policy_id   = "b689b0a8-53d0-40ab-baf2-68738e2966ac" # AllViewerExceptHostHeader
    response_headers_policy_id = "eaab4381-ed33-4a86-88ca-d9558dc6cd63" # CORS-with-preflight-and-SecurityHeadersPolicy
  }

  custom_error_response {
    error_code            = 501
    error_caching_min_ttl = 0
  }

  price_class = "PriceClass_All"

  viewer_certificate {
    cloudfront_default_certificate = true
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

