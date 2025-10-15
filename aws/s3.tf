# CloudFront Distribution Configuration

# S3 bucket for access logs
resource "aws_s3_bucket" "access_logs" {
  #checkov:skip=CKV_AWS_144:Cross-region replication not required for access logs bucket
  bucket = local.s3_buckets.access_logs
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
      kms_master_key_id = "alias/aws/s3"
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

# S3 bucket for CloudFront origin content

resource "aws_s3_bucket" "cloudfront_origin" {
  #checkov:skip=CKV_AWS_144:Cross-region replication not required for origin content bucket
  bucket = local.s3_buckets.cloudfront_origin
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

resource "aws_s3_bucket_website_configuration" "cloudfront_origin" {
  bucket = aws_s3_bucket.cloudfront_origin.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

# Upload sample index.html to S3 bucket
resource "aws_s3_object" "index_html" {
  bucket       = aws_s3_bucket.cloudfront_origin.id
  key          = "index.html"
  content_type = "text/html"

  content = <<-EOT
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CloudFront Test Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        h1 {
            font-size: 3em;
            margin-bottom: 20px;
        }
        p {
            font-size: 1.2em;
            line-height: 1.6;
        }
        .info {
            background: rgba(255, 255, 255, 0.2);
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 CloudFront Distribution Active!</h1>
        <p>Congratulations! Your CloudFront distribution is working perfectly.</p>
        
        <div class="info">
            <h3>✅ What's Working:</h3>
            <p>✓ CloudFront Distribution: <strong>d32d85e5so8321.cloudfront.net</strong></p>
            <p>✓ S3 Origin: <strong>demir-der-boss-cloudfront-origin</strong></p>
            <p>✓ HTTPS Redirect: All traffic is encrypted</p>
            <p>✓ Global CDN: Content cached worldwide</p>
        </div>
        
        <p>This page is being served through AWS CloudFront's global content delivery network!</p>
        <p><small>Last updated: October 15, 2025</small></p>
    </div>
</body>
</html>
EOT
}

resource "aws_s3_bucket_logging" "cloudfront_origin" {
  bucket = aws_s3_bucket.cloudfront_origin.id

  target_bucket = aws_s3_bucket.access_logs.id
  target_prefix = "cloudfront-origin-access-logs/"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cloudfront_origin" {
  bucket = aws_s3_bucket.cloudfront_origin.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = "alias/aws/s3"
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

# S3 bucket for CloudFront logs
resource "aws_s3_bucket" "cloudfront_logs" {
  #checkov:skip=CKV_AWS_144:Cross-region replication not required for CloudFront logs bucket
  bucket = local.s3_buckets.cloudfront_logs
}

resource "aws_s3_bucket_versioning" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_logging" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id

  target_bucket = aws_s3_bucket.access_logs.id
  target_prefix = "cloudfront-logs-access-logs/"
}

resource "aws_s3_bucket_public_access_block" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = "alias/aws/s3"
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}