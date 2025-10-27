module "cloudfront-api" {
  source = "./modules/cloudfront-api"

  api_gateway = local.api_backend.api_gateway

  cloudfront_distribution = local.api_backend.cloudfront_distribution

  spa_domain = module.cloudfront-spa.cloudfront_url
}
