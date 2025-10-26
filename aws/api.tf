module "cloudfront-api" {
  source = "./modules/cloudfront-api"

  s3_buckets = local.spa_deployment.s3_buckets

  cloudfront_distribution = local.spa_deployment.cloudfront_distribution

  frontend = local.spa_deployment.frontend

}
