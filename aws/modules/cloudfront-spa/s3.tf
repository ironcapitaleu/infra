# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                           S3 ACCESS LOGS BUCKET                              ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
resource "aws_s3_bucket" "access_logs" {
  #checkov:skip=CKV_AWS_144:Cross-region replication not required for access logs bucket
  #checkov:skip=CKV2_AWS_62:Event notifications not required for access logs bucket
  #checkov:skip=CKV_AWS_145:Buckets are currently not encrypted with KMS for lower complexity
  bucket        = var.s3_buckets.access_logs
  force_destroy = true
}

resource "aws_s3_bucket_versioning" "access_logs" {
  bucket = aws_s3_bucket.access_logs.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "access_logs" {
  bucket = aws_s3_bucket.access_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "access_logs" {
  bucket = aws_s3_bucket.access_logs.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "access_logs" {
  bucket = aws_s3_bucket.access_logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Lifecycle configuration for access_logs bucket
resource "aws_s3_bucket_lifecycle_configuration" "access_logs" {
  bucket = aws_s3_bucket.access_logs.id

  rule {
    id     = "access_logs_lifecycle"
    status = "Enabled"

    filter {}

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 60
      storage_class = "GLACIER"
    }

    expiration {
      days = 90
    }
  }
}

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                           CLOUDFRONT ORIGIN BUCKET                           ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

resource "aws_s3_bucket" "cloudfront_origin" {
  #checkov:skip=CKV_AWS_144:Cross-region replication not required for origin content bucket
  #checkov:skip=CKV2_AWS_61:Lifecycle configuration not needed for static content bucket
  #checkov:skip=CKV2_AWS_62:Event notifications not required for static content bucket
  #checkov:skip=CKV_AWS_145:Buckets are currently not encrypted with KMS for lower complexity
  bucket        = var.s3_buckets.cloudfront_origin
  force_destroy = true
}

resource "aws_s3_bucket_versioning" "cloudfront_origin" {
  bucket = aws_s3_bucket.cloudfront_origin.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "cloudfront_origin" {
  bucket = aws_s3_bucket.cloudfront_origin.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "cloudfront_origin" {
  bucket = aws_s3_bucket.cloudfront_origin.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_logging" "cloudfront_origin" {
  bucket = aws_s3_bucket.cloudfront_origin.id

  target_bucket = aws_s3_bucket.access_logs.id
  target_prefix = "cloudfront-origin-logs/"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cloudfront_origin" {
  bucket = aws_s3_bucket.cloudfront_origin.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                           CLOUDFRONT LOGS BUCKET                             ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# S3 bucket for CloudFront logs
resource "aws_s3_bucket" "cloudfront_logs" {
  #checkov:skip=CKV_AWS_144:Cross-region replication not required for CloudFront logs bucket
  #checkov:skip=CKV2_AWS_62:Event notifications not required for CloudFront logs bucket
  #checkov:skip=CKV_AWS_145:Buckets are currently not encrypted with KMS for lower complexity
  bucket        = var.s3_buckets.cloudfront_logs
  force_destroy = true
}

resource "aws_s3_bucket_versioning" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "cloudfront_logs" {
  #checkov:skip=CKV2_AWS_65:Access control lists are needed for the logging bucket
  bucket = aws_s3_bucket.cloudfront_logs.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_logging" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id

  target_bucket = aws_s3_bucket.access_logs.id
  target_prefix = "cloudfront-general-logs/"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Lifecycle configuration for cloudfront_logs bucket
resource "aws_s3_bucket_lifecycle_configuration" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id

  rule {
    id     = "cloudfront_logs_lifecycle"
    status = "Enabled"

    filter {}

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 60
      storage_class = "GLACIER"
    }

    expiration {
      days = 90
    }
  }
}

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                           SPA CONTENT UPLOAD                                 ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# Build and upload the React app
resource "null_resource" "build_and_upload_spa" {
  depends_on = [
    aws_s3_bucket.cloudfront_origin,
    aws_s3_bucket.access_logs,
    aws_s3_bucket.cloudfront_logs
  ]

  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    working_dir = var.frontend.path
    command     = <<EOT
      npm install
      npm run build -- --outDir ./dist
      aws s3 sync "./dist" "s3://${aws_s3_bucket.cloudfront_origin.bucket}" --delete
    EOT
  }
}
