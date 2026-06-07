import { getPatientsByRoom } from "@/app/actions";
import SoapClient from "./soap-client";

export const dynamic = "force-dynamic";

export default async function SoapPage() {
  const patients = await getPatientsByRoom();
  return <SoapClient patients={patients} />;
}
