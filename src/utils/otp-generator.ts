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

export const generateOtp = ({
	issuer = env.OTPAUTH_ISSUER,
	label,
	algorithm = "SHA1",
	digits = 6,
	period = 300,
	secret = env.OTPAUTH_SECRET,
}: OTPAuthProps) => {
	const totp = new OTPAuth.TOTP({
		issuer,
		label,
		algorithm,
		digits,
		period,
		secret,
	});
	const token = totp.generate();
	return { otp: token, period };
};

type validateOtpProps = OTPAuthProps & { window: number; token: string };

export const validateOTP = ({
	issuer = env.OTPAUTH_ISSUER,
	label,
	token,
	algorithm = "SHA1",
	digits = 6,
	period = 300,
	secret = env.OTPAUTH_SECRET,
	window = 1,
}: validateOtpProps) => {
	const totp = new OTPAuth.TOTP({
		issuer,
		label: label,
		algorithm,
		digits,
		period,
		secret,
	});
	const delta = totp.validate({ token, window });
	return delta !== null;
};
