/// <reference path="./.sst/platform/config.d.ts" />

const stageConfig = {
  dev: {
    apiUrl: "http://localhost:5000",
    socketUrl: "http://localhost:5000",
    cloudfrontUrl: "https://d2rxrksscpnnty.cloudfront.net",
  },
  uat: {
    apiUrl: "https://hospitaltokenapi.ratnamstaging.in",
    socketUrl: "https://hospitaltokenapi.ratnamstaging.in",
    cloudfrontUrl: "https://d2rxrksscpnnty.cloudfront.net",
  },
  production: {
    apiUrl: "https://hospitaltokenapi.ratnamstaging.in", // replace with prod URL
    socketUrl: "https://hospitaltokenapi.ratnamstaging.in", // replace with prod URL
    cloudfrontUrl: "https://d2rxrksscpnnty.cloudfront.net",
  },
};

export default $config({
  app(input) {
    const stage = (input?.stage ?? "dev") as keyof typeof stageConfig;

    return {
      name: "token-hospital",
      removal: stage === "production" ? "retain" : "remove",
      protect: stage === "production",
      home: "aws",
    };
  },

  async run() {
    const stage = $app.stage as keyof typeof stageConfig;
    const config = stageConfig[stage] ?? stageConfig.dev;

    const site = new sst.aws.Nextjs("TokenHospitalClient", {
      path: "client",
      environment: {
        NODE_ENV: "production",
        NEXT_PUBLIC_API_URL: config.apiUrl,
        NEXT_PUBLIC_SOCKET_URL: config.socketUrl,
        NEXT_PUBLIC_CLOUDFRONT_URL: config.cloudfrontUrl,
      },
      transform: {
        // Custom Lambda function name per stage
        server: {
          name: `token-hospital-${stage}-server`,
        },
      },
    });

    return {
      url: site.url,
    };
  },
});
