variable "environment" {
  description = "Environment (e.g., `development`, `production`, ...)"
  type        = string

  validation {
    condition = contains([
      "development",
      "production"
    ], var.environment)
    error_message = "Environment must be one of: `development`, `production`. Got `${var.environment}` instead."
  }
}
