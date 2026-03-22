import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evaluateManualLampCommand } from "./table_status_wss_protocol.js";

describe("table_status_wss manual lamp integration scenarios", () => {
  it("success scenario: delivered 1 + ack ok", () => {
    const decision = evaluateManualLampCommand({
      payload: {
        type: "manual_lamp_command",
        command: "on 01",
        action: "on",
        target: "01",
        floorCode: "FLOOR_1",
      },
      cashierFloorCode: "FLOOR_1",
      isCashierOnline: true,
    });

    assert.equal(decision.kind, "execute");
    assert.equal(decision.status, "ok");
    assert.equal(decision.delivered, 1);
    assert.equal(decision.parsed.command, "on 01");
  });

  it("no cashier online scenario: delivered 0", () => {
    const decision = evaluateManualLampCommand({
      payload: {
        type: "manual_lamp_command",
        command: "on 01",
        floorCode: "FLOOR_1",
      },
      cashierFloorCode: "FLOOR_1",
      isCashierOnline: false,
    });

    assert.equal(decision.kind, "no_cashier_online");
    assert.equal(decision.status, "error");
    assert.equal(decision.delivered, 0);
  });

  it("invalid command scenario", () => {
    const decision = evaluateManualLampCommand({
      payload: {
        type: "manual_lamp_command",
        command: "foo 01",
        floorCode: "FLOOR_1",
      },
      cashierFloorCode: "FLOOR_1",
      isCashierOnline: true,
    });

    assert.equal(decision.kind, "invalid");
    assert.equal(decision.status, "error");
    assert.equal(decision.delivered, 0);
  });

  it("floor mismatch scenario", () => {
    const decision = evaluateManualLampCommand({
      payload: {
        type: "manual_lamp_command",
        command: "off 01",
        floorCode: "FLOOR_2",
      },
      cashierFloorCode: "FLOOR_1",
      isCashierOnline: true,
    });

    assert.equal(decision.kind, "floor_mismatch");
    assert.equal(decision.status, "error");
    assert.equal(decision.delivered, 0);
  });
});
