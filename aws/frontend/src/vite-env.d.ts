
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AWS_REGION: string;
  readonly VITE_S3_BUCKET_NAME: string;
  readonly VITE_AWS_ACCESS_KEY: string;
  readonly VITE_AWS_SECRET_KEY: string;
  readonly VITE_BEDROCK_FLOW_ID: string;
  readonly VITE_BEDROCK_FLOW_ALIAS_ID: string;
  readonly VITE_BEDROCK_CONFIDENCE_FLOW_ID: string;
  readonly VITE_BEDROCK_CONFIDENCE_FLOW_ALIAS_ID: string;
  readonly VITE_SERVER_HOST?: string;
  readonly VITE_SERVER_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
