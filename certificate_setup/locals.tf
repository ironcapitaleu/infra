locals {
  zone_id     = var.zone_id
  environment = var.environment

  domains = {
    primary  = local.environment == "production" ? "iron-capital.eu" : "dev.iron-capital.eu",
    wildcard = local.environment == "production" ? "*.iron-capital.eu" : "*.dev.iron-capital.eu"
  }
}
