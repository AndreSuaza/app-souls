import { getAdminSimulatorControlAction, getAdminSimulatorRoomsAction } from "@/actions/admin/simulator-admin.action";
import { SimulatorAdministration } from "@/components/admin/simulator/SimulatorAdministration";

export default async function SimulatorAdministrationPage() {
  try {
    const [control, rooms] = await Promise.all([
      getAdminSimulatorControlAction(),
      getAdminSimulatorRoomsAction(),
    ]);
    return <SimulatorAdministration initialControl={control} initialRooms={rooms} />;
  } catch (error) {
    return <SimulatorAdministration initialControl={null} initialRooms={null} initialError={error instanceof Error ? error.message : "No se pudo conectar con el simulador."} />;
  }
}
