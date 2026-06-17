import { ProfileChangePasswordForm } from "./ProfileChangePasswordForm";

type Props = {
  hasSession: boolean;
};

export const ProfileSecuritySection = ({ hasSession }: Props) => {
  return <ProfileChangePasswordForm disabled={!hasSession} />;
};
