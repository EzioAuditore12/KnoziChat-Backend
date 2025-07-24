import env from "@/env";
import * as OTPAuth from "otpauth";

interface OTPAuthProps {
	issuer?: string;
	label: string;
	algorithm?: "SHA1" | "SHA224" | "SHA256" | "SHA384" | "SHA512";
	digits?: number;
	period?: number;
	secret?: string;
}

interface ValidateOtpProps extends OTPAuthProps {
	window?: number;
	token: string;
}

const createTotpInstance = ({
	issuer = env.OTPAUTH_ISSUER,
	label,
	algorithm = env.OTPAUTH_ALGORITHIM,
	digits = 6,
	period = 300,
	secret = env.OTPAUTH_SECRET,
}: OTPAuthProps) => {
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
	generate: (props: OTPAuthProps) => {
		const totp = createTotpInstance(props);
		const token = totp.generate();
		return { otp: token, period: props.period ?? 300 };
	},
	validate: (props: ValidateOtpProps) => {
		const { window = 1, token, ...totpProps } = props;
		const totp = createTotpInstance(totpProps);
		const delta = totp.validate({ token, window });
		return delta !== null;
	},
};
