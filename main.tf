terraform {
  required_version = ">= 1.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "5.9.0"
    }
  }

  # S3 backend configuration
  backend "s3" {
    key            = "cloudflare/terraform.tfstate"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}

provider "cloudflare" {
  # api_token will be read from CLOUDFLARE_API_TOKEN environment variable
}

# =============================================================================
# SSL/TLS & HTTPS SETTINGS
# =============================================================================

resource "cloudflare_zone_setting" "ssl" {
  zone_id    = local.zone_id
  setting_id = "ssl"
  value      = local.ssl_settings.ssl_mode

  lifecycle {
    precondition {
      condition = contains([
        "off", "flexible", "full", "strict"
      ], local.ssl_settings.ssl_mode)
      error_message = "SSL mode must be one of: `off`, `flexible`, `full`, `strict`"
    }
  }
}

resource "cloudflare_zone_setting" "always_use_https" {
  zone_id    = local.zone_id
  setting_id = "always_use_https"
  value      = local.ssl_settings.always_use_https

  lifecycle {
    precondition {
      condition     = contains(["on", "off"], local.ssl_settings.always_use_https)
      error_message = "always_use_https must be either `on` or `off`"
    }
  }
}

# Automatic HTTPS rewrites
resource "cloudflare_zone_setting" "automatic_https_rewrites" {
  zone_id    = local.zone_id
  setting_id = "automatic_https_rewrites"
  value      = local.ssl_settings.automatic_https_rewrites

  lifecycle {
    precondition {
      condition     = contains(["on", "off"], local.ssl_settings.automatic_https_rewrites)
      error_message = "automatic_https_rewrites must be either `on` or `off`"
    }
  }
}

# =============================================================================
# SECURITY & WAF SETTINGS
# =============================================================================

# Browser integrity check - blocks malicious browsers
resource "cloudflare_zone_setting" "browser_check" {
  zone_id    = local.zone_id
  setting_id = "browser_check"
  value      = local.security_settings.browser_check

  lifecycle {
    precondition {
      condition     = contains(["on", "off"], local.security_settings.browser_check)
      error_message = "browser_check must be either `on` or `off`"
    }
  }
}

resource "cloudflare_zone_setting" "security_level" {
  zone_id    = local.zone_id
  setting_id = "security_level"
  value      = local.security_settings.security_level

  lifecycle {
    precondition {
      condition = contains([
        "essentially_off", "low", "medium", "high", "under_attack"
      ], local.security_settings.security_level)
      error_message = "security_level must be one of: `essentially_off`, `low`, `medium`, `high`, `under_attack`"
    }
  }
}

# =============================================================================
# PERFORMANCE & OPTIMIZATION SETTINGS
# =============================================================================
# (Future performance settings like Brotli, minification, etc.)
