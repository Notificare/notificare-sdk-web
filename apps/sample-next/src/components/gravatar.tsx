import { sha256 } from "js-sha256";
import Image from "next/image";

export function Gravatar({
  email,
  size = 128,
  fallbackUrl = "https://dashboard.notifica.re/assets/images/no-gravatar-blue.png",
}: GravatarProps) {
  const hash = sha256(email.trim().toLowerCase());
  const url = hash
    ? `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${fallbackUrl}`
    : fallbackUrl;

  return (
    <Image
      className="h-8 w-8 rounded-full bg-gray-50"
      src={url}
      alt="Avatar"
      width={32}
      height={32}
    />
  );
}

type GravatarProps = {
  email: string;
  size?: number;
  fallbackUrl?: string;
};
