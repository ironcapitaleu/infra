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
    bucket         = "arkad-terraform-state"
    key            = "cloudflare/terraform.tfstate"
    region         = "eu-central-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# =============================================================================
# SSL/TLS & HTTPS SETTINGS
# =============================================================================

# Set SSL to strict
resource "cloudflare_zone_setting" "ssl" {
  zone_id    = var.zone_id
  setting_id = "ssl"
  value      = "strict"
}

# Always redirect HTTP to HTTPS
resource "cloudflare_zone_setting" "always_use_https" {
  zone_id    = var.zone_id
  setting_id = "always_use_https"
  value      = "on"
}

# Automatic HTTPS rewrites
resource "cloudflare_zone_setting" "automatic_https_rewrites" {
  zone_id    = var.zone_id
  setting_id = "automatic_https_rewrites"
  value      = "on"
}

# =============================================================================
# SECURITY & WAF SETTINGS
# =============================================================================

# Browser integrity check - blocks malicious browsers
resource "cloudflare_zone_setting" "browser_check" {
  zone_id    = var.zone_id
  setting_id = "browser_check"
  value      = "on"
}

# Security level - controls challenge sensitivity for bots and normal users
resource "cloudflare_zone_setting" "security_level" {
  zone_id    = var.zone_id
  setting_id = "security_level"
  value      = "medium" # Should challenge bots frequently, and minimal challenges for legitimate users
}

# =============================================================================
# PERFORMANCE & OPTIMIZATION SETTINGS
# =============================================================================
# (Future performance settings like Brotli, minification, etc.)

# =============================================================================
# DNS RECORDS
# =============================================================================

# Test A record pointing to a reliable web server
resource "cloudflare_dns_record" "test_subdomain" {
  zone_id = var.zone_id
  name    = "test"
  content = "185.199.108.153" # GitHub Pages IP - very reliable
  type    = "A"
  ttl     = 300 # For testing only, use 3600 for production
  proxied = false
  comment = "Test A record pointing to GitHub Pages for testing purposes"
}