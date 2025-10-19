locals {
  zone_id     = var.zone_id
  environment = var.environment


  # SSL/TLS & HTTPS Settings
  ssl_settings = {
    ssl_mode                 = "strict"
    always_use_https         = "on"
    automatic_https_rewrites = "on"
  }

  # Security & WAF Settings
  security_settings = {
    browser_check  = "on"
    security_level = "medium"
  }

  # DNS Configuration
  dns_records = {

    # www_subdomain = {
    #   name    = "www"
    #   content = "daxydpq86d1sx.cloudfront.net"
    #   type    = "CNAME"
    #   ttl     = local.environment == "production" ? 3600 : 300 # 1 hour for `production`, 5 mins for other environments like `development`, ...
    #   proxied = true
    #   comment = "CNAME record for www subdomain pointing to CloudFront distribution"
    # }

    www_subdomain = {
      name    = "www"
      content = "daxydpq86d1sx.cloudfront.net"
      type    = "CNAME"
      ttl     = 1 # 1 second for proxied records, 1 hour for `production`, 5 mins for other environments like `development`, ...
      proxied = true
      comment = "CNAME record for www subdomain pointing to CloudFront distribution"
    }
  }
}
