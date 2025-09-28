locals {
  zone_id = var.zone_id
  # TODO: Will be used for environment-specific configurations
  # tflint-ignore: terraform_unused_declarations
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
    test_subdomain = {
      name    = "test"
      content = "185.199.108.153" # GitHub Pages IP - very reliable
      type    = "A"
      ttl     = var.environment == "production" ? 3600 : 300 # 1 hour for prod, 5 min for other envs (dev, ...)
      proxied = false
      comment = "Test A record pointing to GitHub Pages for testing purposes"
    }
  }

}
