import {QRCodeSVG} from "qrcode.react";

type QRCodeProps = {
  value: string;
};

export function QRCode({ value }: QRCodeProps) {
  return (
    <QRCodeSVG className="rounded-2xl" bgColor="#F3F3FF" marginSize={3} size={160} value={value} />
  )
}