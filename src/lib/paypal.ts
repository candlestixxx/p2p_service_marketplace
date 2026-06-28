import { Client, Environment, LogLevel } from "@paypal/paypal-server-sdk";

export const paypalClient = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.PAYPAL_CLIENT_ID || "mock_paypal_client_id",
        oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET || "mock_paypal_client_secret"
    },
    timeout: 0,
    environment: Environment.Sandbox,
    logging: {
        logLevel: LogLevel.Info,
        logRequest: { logBody: true },
        logResponse: { logHeaders: true },
    },
});
