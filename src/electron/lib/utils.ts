import { prisma } from "../database.js";
import { MACHINE_ID } from "../MACHINE.js";

export const onMachineStatus = async (
  status: "CONNECTED" | "RECONNECTED" | "DISCONNECTED",
) => {
  await prisma.machine.update({
    where: {
      id_machine: MACHINE_ID,
    },
    data: {
      status: status,
    },
  });
};
