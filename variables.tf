variable "environment" {
  description = "Environment (e.g., `development`, `production`, ...)"
  type        = string

  validation {
    condition = contains([
      "development",
      "production"
    ], var.environment)
    error_message = "Environment must be one of: `development`, `production`"
  }
}

variable "zone_id" {
  description = "Cloudflare Zone ID"
  type        = string

  validation {
    condition     = can(regex("^[a-f0-9]{32}$", var.zone_id))
    error_message = "Zone ID must be a valid 32-character hexadecimal string"
  }
}