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

}
