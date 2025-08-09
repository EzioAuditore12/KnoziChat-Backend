import env from "../env.js";
import * as OTPAuth from "otpauth";
const createTotpInstance = ({ issuer = env.OTPAUTH_ISSUER, label, algorithm = env.OTPAUTH_ALGORITHIM, digits = 6, period = 300, secret = env.OTPAUTH_SECRET, }) => {
    return new OTPAuth.TOTP({
        issuer,
        label,
        algorithm,
        digits,
        period,
        secret,
    });
};
export const otpHelper = {
    generate: (props) => {
        const totp = createTotpInstance(props);
        const token = totp.generate();
        return { otp: token, period: props.period ?? 300 };
    },
    validate: (props) => {
        const { window = 1, token, ...totpProps } = props;
        const totp = createTotpInstance(totpProps);
        const delta = totp.validate({ token, window });
        return delta !== null;
    },
};
